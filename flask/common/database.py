"""
Class to handle all communication with the database
"""

import logging
from typing import Any, Optional


class Database:
    """
    A wrapper class for CouchDB operations.

    Provides high-level methods to perform CRUD (Create, Read, Update, Delete)
    operations and Mango queries against our CouchDB database.
    """

    def __init__(self, server: Any, database: str):
        """
        Initializes the Database instance.

        Args:
            server (Any): The CouchDB server instance used to access
                the document collection.
        """
        self.db = server[database]
        self.LIMIT = 1000

    def all(self) -> Any:
        """
        Returns all documents in the database up to the configured limit.

        Returns:
            Any: A result set containing all documents matching the empty selector.
        """
        return self.db.find({"selector": dict(), "limit": self.LIMIT})

    def filter(self, selector: dict) -> Any:
        """
        Filters documents using a Mango selector.

        Args:
            selector (dict): A dictionary defining the search
                criteria (Mango query).

        Returns:
            Any: A result set containing documents that match the selector.
        """
        mango = {"selector": selector, "limit": self.LIMIT}
        return self.db.find(mango)

    def create(self, document: dict) -> Optional[str]:
        """
        Creates a new document in the database.

        Args:
            document (dict): The document data to store.

        Returns:
            Optional[str]: The unique document ID if successful,
                None if the creation failed.
        """
        doc_id, _ = self.db.save(document)
        if not doc_id:
            logging.error(f"create(): failed to create document: {document}")
            return None
        return doc_id

    def update(self, document: dict) -> bool:
        """
        Updates an existing document using its '_id' field.

        This method performs a partial update by merging non-None values
        from the provided document into the existing record.

        Args:
            document (dict): The document data containing at
                least an '_id' and the fields to update.

        Returns:
            bool: True if the update was successful, False otherwise.
        """
        try:
            doc = self.db[document["_id"]]
            for key, value in document.items():
                if value is not None:
                    doc[key] = value

            self.db.save(doc)
            logging.info(f"Updated document: {document.get('_id')}")
            return True
        except Exception as e:
            logging.error(
                f"update(): Failed to update document {document.get('_id')}: {e}"
            )
            return False

    def delete(self, identifier: str) -> bool:
        """
        Deletes a document from the database by its ID.

        Args:
            identifier (str): The unique ID of the document to remove.

        Returns:
            bool: True if the deletion was successful, False if the document
                was not found or an error occurred.
        """
        try:
            doc = self.db[identifier]
            self.db.delete(doc)
            return True
        except Exception as e:
            logging.error(f"delete(): Failed to delete document {identifier}: {e}")
            return False
