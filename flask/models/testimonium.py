"""
Model to handle testimonia and database persistence.
"""

import logging
from dataclasses import dataclass, asdict, fields
from uuid import uuid4
from typing import Optional, Any, List

from common.database import Database


class TestimoniumFields:
    """Container for field name constants to avoid magic strings."""

    ID = "_id"
    NAME = "name"
    AUTHOR = "author"
    TITLE = "title"
    TRANSLATION = "translation"
    WITNESS = "witness"
    TEXT = "text"
    EDITOR = "editor"
    SANDBOX = "sandbox"
    LOCK = "lock"
    VISIBLE = "visible"
    DOC_TYPE = "document_type"


@dataclass
class TestimoniumModel:
    """
    Data container representing a Testimonium document.
    """

    _id: Optional[str] = None
    document_type: str = "testimonium"
    name: Optional[str] = None
    author: Optional[str] = None
    title: Optional[str] = None
    translation: Optional[str] = None
    witness: Optional[str] = None
    text: Optional[str] = None
    editor: Optional[str] = None
    sandbox: Optional[str] = None
    lock: Optional[int] = None
    visible: Optional[int] = None

    @classmethod
    def from_dict(cls, data: dict) -> "TestimoniumModel":
        """
        Creates a model instance from a dictionary, ignoring extra keys.

        Args:
            data (dict): The raw dictionary from the database or request.

        Returns:
            TestimoniumModel: An instance of this dataclass.
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


class Testimonium:
    """
    Handles CRUD operations for Testimonium documents.
    """

    def __init__(self, server: Any):
        """
        Initializes the Testimonium handler with a database connection.

        Args:
            server (Any): The CouchDB server instance.
        """
        self.database = Database(server, "documents")

    def get(self, query_filter: dict) -> List[TestimoniumModel]:
        """
        Retrieves testimonia matching the filter.

        Args:
            query_filter (dict): Dictionary containing search criteria like
                author, title, or editor.

        Returns:
            List[TestimoniumModel]: A list of matching TestimoniumModel instances.
        """
        search_criteria = {k: v for k, v in query_filter.items() if v is not None}
        search_criteria[TestimoniumFields.DOC_TYPE] = "testimonium"

        logging.info(f"Retrieving testimonia for filter: {search_criteria}")
        document_list = self.database.filter(search_criteria)

        return [TestimoniumModel.from_dict(doc) for doc in document_list]

    def create(self, document_data: dict) -> Optional[str]:
        """
        Creates a new testimonium with a unique UUID.

        Args:
            document_data (dict): The dictionary containing the testimonium
                data to be stored.

        Returns:
            Optional[str]: The new document ID string if successful,
                or an empty string if it already exists.
        """
        if self.get(document_data):
            logging.warning("create(): Testimonium already exists.")
            return ""

        model = TestimoniumModel.from_dict(document_data)
        model._id = uuid4().hex

        return self.database.create(model.to_dict(exclude_none=True))

    def delete(self, document_data: dict) -> bool:
        """
        Deletes a testimonium by its identifier.

        Args:
            document_data (dict): A dictionary containing at least the
                '_id' key of the document to delete.

        Returns:
            bool: True if deletion was successful, False otherwise.
        """
        doc_id = document_data.get(TestimoniumFields.ID)
        if not doc_id:
            return False
        return self.database.delete(doc_id)

    def update(self, document_data: dict) -> bool:
        """
        Updates an existing testimonium. Requires an '_id' in the input data.

        Args:
            document_data (dict): Updated data fields, including the
                mandatory '_id' field.

        Returns:
            bool: True if updated successfully, False if '_id' is missing
                or update failed.
        """
        model = TestimoniumModel.from_dict(document_data)

        if not model._id:
            logging.error("update(): Missing document _id.")
            return False

        return self.database.update(model.to_dict(exclude_none=True))
