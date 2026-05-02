"""
Model to handle fragment logic and database persistence.
"""

import logging
from dataclasses import dataclass, asdict, fields, field
from uuid import uuid4
from typing import Optional, Any, List

from common.database import Database


class FragmentFields:
    """Container for field name constants to avoid magic strings."""

    ID = "_id"
    NAME = "name"
    AUTHOR = "author"
    TITLE = "title"
    EDITOR = "editor"
    STATUS = "status"
    LOCK = "lock"
    VISIBLE = "visible"
    TRANSLATION = "translation"
    POPULAR_TRANSLATION = "popular_translation"
    DIFFERENCES = "differences"
    APPARATUS = "apparatus"
    COMMENTARY = "commentary"
    RECONSTRUCTION = "reconstruction"
    METRICAL_ANALYSIS = "metrical_analysis"
    CONTEXT = "context"
    LINES = "lines"
    LINKED_FRAGMENTS = "linked_fragments"
    SANDBOX = "sandbox"
    DOC_TYPE = "document_type"


@dataclass
class FragmentModel:
    """
    Data container representing a Fragment document.
    """

    _id: Optional[str] = None
    document_type: str = "fragment"
    name: Optional[str] = None
    author: Optional[str] = None
    title: Optional[str] = None
    editor: Optional[str] = None
    status: Optional[str] = None
    lock: Optional[int] = None
    visible: Optional[int] = None
    translation: Optional[str] = None
    popular_translation: Optional[str] = None
    differences: Optional[str] = None
    apparatus: Optional[str] = None
    commentary: Optional[str] = None
    reconstruction: Optional[str] = None
    metrical_analysis: Optional[str] = None
    context: List[Any] = field(default_factory=list)
    lines: List[Any] = field(default_factory=list)
    linked_fragments: List[Any] = field(default_factory=list)
    sandbox: Optional[str] = None

    @classmethod
    def from_dict(cls, data: dict) -> "FragmentModel":
        """
        Creates a model instance from a dictionary, ignoring extra keys.

        Args:
            data (dict): The raw dictionary from the database or request.

        Returns:
            FragmentModel: An initialized instance of the dataclass.
        """
        class_fields = {f.name for f in fields(cls)}
        filtered_data = {k: v for k, v in data.items() if k in class_fields}
        return cls(**filtered_data)

    def to_dict(self, exclude_none: bool = False) -> dict:
        """
        Converts the model to a dictionary for database storage.

        Args:
            exclude_none (bool): If True, keys with None values will be removed.

        Returns:
            dict: The dictionary representation of the model.
        """
        data = asdict(self)
        if exclude_none:
            return {k: v for k, v in data.items() if v is not None}
        return data


class Fragment:
    """
    Handles CRUD operations for Fragment documents in the database.
    """

    def __init__(self, server: Any):
        """
        Initializes the Fragment handler with a database connection.

        Args:
            server (Any): The CouchDB server instance.
        """
        self.database = Database(server, "documents")

    def get(self, query_filter: dict) -> List[FragmentModel]:
        """
        Retrieves fragments matching the provided filter criteria.

        Args:
            query_filter (dict): Dictionary containing filter criteria like
                author, name, or visibility.

        Returns:
            List[FragmentModel]: A list of matching FragmentModel instances.
        """
        # Build search criteria, filtering out None values
        search_criteria = {k: v for k, v in query_filter.items() if v is not None}
        search_criteria[FragmentFields.DOC_TYPE] = "fragment"

        logging.info(f"Retrieving fragments for filter: {search_criteria}")
        document_list = self.database.filter(search_criteria)

        return [FragmentModel.from_dict(doc) for doc in document_list]

    def create(self, document_data: dict) -> Optional[str]:
        """
        Creates a new fragment document with a unique identifier.

        Args:
            document_data (dict): The raw data for the new fragment.

        Returns:
            Optional[str]: The new document ID if successful,
                or an empty string if a match already exists.
        """
        if self.get(document_data):
            logging.warning("create(): Fragment already exists.")
            return ""

        model = FragmentModel.from_dict(document_data)
        model._id = uuid4().hex

        return self.database.create(model.to_dict(exclude_none=True))

    def delete(self, document_data: dict) -> bool:
        """
        Deletes a fragment document by its unique identifier.

        Args:
            document_data (dict): Dictionary containing the '_id' to delete.

        Returns:
            bool: True if deletion was successful, False otherwise.
        """
        doc_id = document_data.get(FragmentFields.ID)
        if not doc_id:
            return False
        return self.database.delete(doc_id)

    def update(self, document_data: dict) -> bool:
        """
        Updates an existing fragment. Requires an '_id' in the input data.

        Args:
            document_data (dict): Dictionary containing the fields to update
                and the mandatory '_id'.

        Returns:
            bool: True if the update was successful, False otherwise.
        """
        model = FragmentModel.from_dict(document_data)

        if not model._id:
            logging.error("update(): Missing document _id.")
            return False

        return self.database.update(model.to_dict(exclude_none=True))
