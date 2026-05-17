"""
Logic to handle CouchDB connection and CRUD operations.
"""

import os
import time
import logging
import couchdb
from typing import Any, Optional, List
from dotenv import load_dotenv

load_dotenv(".env")


class CouchConnection:
    """
    Handles the physical connection to the CouchDB server.
    This should be initialized once.
    """

    server: Optional[couchdb.Server] = None

    @classmethod
    def connect(cls) -> couchdb.Server:
        """
        Establishes a connection to the CouchDB server with retry logic.
        """
        if cls.server is not None:
            return cls.server

        user = os.getenv("COUCH_USER", "admin")
        password = os.getenv("COUCH_PASSWORD", "password")
        host = os.getenv("COUCH_HOST", "localhost")
        port = os.getenv("COUCH_PORT", "5984")
        version = os.getenv("COUCH_VERSION", "3")

        url = f"http://{user}:{password}@{host}:{port}/"
        logging.info(f"Connecting to CouchDB at {host}:{port}...")

        while True:
            try:
                server = couchdb.Server(url)
                # Verify connection and version
                if not str(server.version()).startswith(version):
                    logging.error(f"Wrong CouchDB version. Expected {version}")
                    exit(1)

                cls.server = server
                logging.info("Successfully connected to CouchDB.")
                return cls.server
            except Exception as e:
                logging.error(f"CouchDB connection failed: {e}. Retrying in 3s...")
                time.sleep(3)


class Couch:
    """
    Handles CRUD operations for a specific CouchDB database (table).
    """

    def __init__(self, server: couchdb.Server, db_name: str):
        """
        Args:
            server (couchdb.Server): The active server connection.
            db_name (str): Name of the database (e.g., 'documents' or 'users').
        """
        try:
            self.db = server[db_name]
        except couchdb.ResourceNotFound:
            logging.info(f"Database {db_name} not found, creating it")
            self.db = server.create(db_name)

        self.LIMIT = 1000

    def filter(self, selector: dict) -> List[dict]:
        """
        Filters documents using a Mango selector.

        Args:
            selector (dict): Mongo-style query.

        Returns:
            List[dict]: Matching documents.
        """
        results = self.db.find({"selector": selector, "limit": self.LIMIT})
        return [doc for doc in results]

    def filter_by_type(
        self,
        doc_type: str,
        selector: Optional[dict] = None,
        *,
        remove_none: bool = True,
    ) -> List[dict]:
        """
        Filters documents of a specific document_type.

        Strips None-valued keys from ``selector`` (when ``remove_none`` is
        True) and injects ``document_type`` as a required field before
        querying. The effective selector is logged at INFO so query shape
        can be debugged at the seam rather than in every model.

        Args:
            doc_type (str): Value to enforce for the ``document_type`` field.
            selector (dict | None): Mongo-style query. Defaults to ``{}``.
            remove_none (bool): When True, drop keys whose value is ``None``.

        Returns:
            List[dict]: Matching documents.
        """
        effective: dict = dict(selector) if selector else {}
        if remove_none:
            effective = {k: v for k, v in effective.items() if v is not None}
        effective["document_type"] = doc_type

        logging.info(f"filter_by_type({doc_type}) selector: {effective}")
        return self.filter(effective)

    def find_one(self, selector: dict) -> Optional[dict]:
        """
        Returns the first document matching the selector, or None.

        Use sparingly — only where a single result is genuinely expected.

        Args:
            selector (dict): Mongo-style query.

        Returns:
            dict | None: The first matching document, or ``None`` when
                nothing matches.
        """
        results = self.filter(selector)
        return results[0] if results else None

    def all(self) -> List[dict]:
        """Returns all documents."""
        return self.filter({})

    def create(self, document: dict) -> Optional[str]:
        """Creates a document and returns the new ID."""
        try:
            doc_id, _ = self.db.save(document)
            return doc_id
        except Exception as e:
            logging.error(f"create() error: {e}")
            return None

    def update(self, document: dict) -> bool:
        """Updates an existing document by merging fields."""
        if "_id" not in document:
            return False
        try:
            doc = self.db[document["_id"]]
            for k, v in document.items():
                if v is not None:
                    doc[k] = v
            self.db.save(doc)
            return True
        except Exception as e:
            logging.error(f"update() error: {e}")
            return False

    def delete(self, identifier: str) -> bool:
        """Deletes a document by ID."""
        try:
            doc = self.db[identifier]
            self.db.delete(doc)
            return True
        except Exception as e:
            logging.error(f"delete() error: {e}")
            return False
