"""
Model to handle playground logic and database persistence.
"""

import logging
from dataclasses import dataclass, asdict, fields, field
from uuid import uuid4
from typing import Optional, Any, List

from common.couch import Couch


class PlaygroundFields:
    """Container for field name constants to avoid magic strings."""

    ID = "_id"
    CANVAS = "canvas"
    CREATED_BY = "created_by"
    NAME = "name"
    USERS = "users"
    SANDBOX = "sandbox"
    DOC_TYPE = "document_type"


@dataclass
class PlaygroundModel:
    """
    Data container representing a Playground document.
    """

    _id: Optional[str] = None
    document_type: str = "playground"
    canvas: Optional[dict] = None
    created_by: Optional[str] = None
    name: Optional[str] = None
    # Use default_factory for mutable types like lists
    users: List[dict] = field(default_factory=list)
    sandbox: Optional[str] = None

    @classmethod
    def from_dict(cls, data: dict) -> "PlaygroundModel":
        """Creates a model instance from a dictionary, filtering out extra keys."""
        class_fields = {f.name for f in fields(cls)}
        filtered_data = {k: v for k, v in data.items() if k in class_fields}
        return cls(**filtered_data)

    def to_dict(self, exclude_none: bool = False) -> dict:
        """Converts the model to a dictionary for database storage."""
        data = asdict(self)
        if exclude_none:
            return {k: v for k, v in data.items() if v is not None}
        return data


class Playground:
    """
    Handles CRUD operations for Playground documents.
    """

    def __init__(self, server: Any):
        """Initializes the Playground handler with a database connection."""
        self.database = Couch(server, "documents")

    def index(self) -> list:
        """
        Retrieves a summarized list of all playgrounds.

        Returns:
            list: List of dictionaries containing playground metadata.
        """
        documents = self.database.filter({"document_type": "playground"})

        return [
            {
                "document_type": "playground",
                "_id": doc.get(PlaygroundFields.ID, ""),
                "name": doc.get(PlaygroundFields.NAME, ""),
                "created_by": doc.get(PlaygroundFields.CREATED_BY, ""),
                "users": doc.get(PlaygroundFields.USERS, []),
                "sandbox": doc.get(PlaygroundFields.SANDBOX, ""),
            }
            for doc in documents
        ]

    def get(self, query_filter: dict) -> List[dict]:
        """
        Retrieves playgrounds matching the filter and returns them as dictionaries.

        Args:
            query_filter (dict): Dictionary containing filter criteria.

        Returns:
            List[dict]: A list of matching playground dictionaries.
        """
        # Build search criteria, filtering out empty values
        search_criteria = {k: v for k, v in query_filter.items() if v}
        search_criteria[PlaygroundFields.DOC_TYPE] = "playground"

        document_list = self.database.filter(search_criteria)

        # Convert to model first (to ensure data integrity) then back to dict as per your requirement
        return [PlaygroundModel.from_dict(doc).to_dict() for doc in document_list]

    def create(self, document_data: dict) -> Optional[str]:
        """
        Creates a new playground document with a unique UUID.

        Args:
            document_data (dict): The data for the new playground.

        Returns:
            Optional[str]: The new document ID if successful.
        """
        model = PlaygroundModel.from_dict(document_data)
        model._id = uuid4().hex

        return self.database.create(model.to_dict(exclude_none=True))

    def delete(self, document_data: dict) -> bool:
        """
        Deletes a playground by its identifier.

        Args:
            document_data (dict): Data containing the '_id'.
        """
        doc_id = document_data.get(PlaygroundFields.ID)
        if not doc_id:
            return False
        return self.database.delete(doc_id)

    def update(self, document_data: dict) -> bool:
        """
        Updates an existing playground. Requires an '_id'.

        Args:
            document_data (dict): Updated data fields.
        """
        model = PlaygroundModel.from_dict(document_data)

        if not model._id:
            logging.error("update(): Missing document _id.")
            return False

        return self.database.update(model.to_dict(exclude_none=True))

    def find_user_role(self, user_name: str, users_list: List[dict]) -> str:
        """
        Returns the role of a specific user within a list of user dictionaries.

        Args:
            user_name (str): The name of the user to find.
            users_list (List[dict]): List of users (containing 'name' and 'role' keys).

        Returns:
            str: The user's role, or an empty string if not found.
        """
        for user in users_list:
            if user.get("name") == user_name:
                return user.get("role", "")
        return ""
