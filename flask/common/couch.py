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
            # Optionally create the database if it doesn't exist
            logger.error(f"Database {db_name} not found")

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
