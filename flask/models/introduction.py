"""
Model to handle introductions and database persistence.
"""

import logging
from dataclasses import dataclass, asdict, fields
from uuid import uuid4
from typing import Optional, Any, List

from common.couch import Couch


class IntroductionFields:
    """Container for field name constants to avoid magic strings."""

    ID = "_id"
    AUTHOR = "author"
    TITLE = "title"
    EDITOR = "editor"
    TEXT = "text"
    SANDBOX = "sandbox"
    DOC_TYPE = "document_type"


@dataclass
class IntroductionModel:
    """
    Data container representing an Introduction document.
    """

    _id: Optional[str] = None
    document_type: str = "introduction"
    author: Optional[str] = None
    title: Optional[str] = None
    editor: Optional[str] = None
    text: Optional[str] = None
    sandbox: Optional[str] = None

    @classmethod
    def from_dict(cls, data: dict) -> "IntroductionModel":
        """Creates a model instance from a dictionary, ignoring extra keys."""
        # Only take keys that exist in the dataclass definition
        class_fields = {f.name for f in fields(cls)}
        filtered_data = {k: v for k, v in data.items() if k in class_fields}
        return cls(**filtered_data)

    def to_dict(self, exclude_none: bool = False) -> dict:
        """Converts the model to a dictionary."""
        data = asdict(self)
        if exclude_none:
            return {k: v for k, v in data.items() if v is not None}
        return data


class Introduction:
    """
    Handles CRUD operations for Introduction documents in the database.
    """

    def __init__(self, server: Any):
        """
        Initializes the Introduction handler with a database connection.

        Args:
            server (Any): The CouchDB server instance.
        """
        self.database = Couch(server, "documents")

    def index(self) -> list:
        """
        Retrieves a summarized list of all introduction documents.

        Returns:
            list: A list of dictionaries containing basic metadata for each document.
        """
        documents: list = self.database.filter({"document_type": "introduction"})

        return [
            {
                "document_type": "introduction",
                "author": doc.get(IntroductionFields.AUTHOR, ""),
                "title": doc.get(IntroductionFields.TITLE, ""),
                "editor": doc.get(IntroductionFields.EDITOR, ""),
                "sandbox": doc.get(IntroductionFields.SANDBOX, ""),
            }
            for doc in documents
        ]

    def get(self, query_filter: dict) -> List[IntroductionModel]:
        """
        Retrieves introductions matching the provided filter.

        Args:
            query_filter (dict): Dictionary containing filter criteria.

        Returns:
            List[IntroductionModel]: A list of matching IntroductionModel instances.
        """
        # Clean the filter to only include provided values
        search_criteria = {k: v for k, v in query_filter.items() if v}
        search_criteria[IntroductionFields.DOC_TYPE] = "introduction"

        logging.info(f"Retrieving introductions for filter: {search_criteria}")
        document_list = self.database.filter(search_criteria)

        return [IntroductionModel.from_dict(doc) for doc in document_list]

    def create(self, document_data: dict) -> Optional[str]:
        """
        Creates a new introduction document with a unique UUID.

        Args:
            document_data (dict): The data for the new introduction.

        Returns:
            Optional[str]: The new document ID, or None/empty string if creation fails.
        """
        if self.get(document_data):
            logging.warning("create(): Document already exists.")
            return ""

        model = IntroductionModel.from_dict(document_data)
        model._id = uuid4().hex

        return self.database.create(model.to_dict())

    def delete(self, document_data: dict) -> bool:
        """
        Deletes an introduction by its ID.

        Args:
            document_data (dict): Data containing at least the '_id'.

        Returns:
            bool: True if deleted successfully, False otherwise.
        """
        doc_id = document_data.get(IntroductionFields.ID)
        if not doc_id:
            logging.error("delete(): No identifier provided.")
            return False
        return self.database.delete(doc_id)

    def update(self, document_data: dict) -> bool:
        """
        Updates an existing introduction. Requires an '_id'.

        Args:
            document_data (dict): Updated data fields.

        Returns:
            bool: True if updated successfully, False otherwise.
        """
        model = IntroductionModel.from_dict(document_data)

        if not model._id:
            logging.error("update(): Missing document _id.")
            return False

        # Convert to dict, excluding None values so we don't overwrite with nulls
        return self.database.update(model.to_dict(exclude_none=True))
