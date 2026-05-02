import couchdb
import logging
import time
from typing import Any

import os
from dotenv import load_dotenv

load_dotenv(".env")


class CouchAuthenticator:
    """
    Handles authentication and connection persistence for a CouchDB server.

    This class manages the initial handshake with CouchDB, performs a version
    integrity check, and retries the connection until the server is available.
    """

    def __init__(self) -> None:
        """
        Initializes the CouchAuthenticator and establishes a server connection.

        The initialization process will block until a connection is successful.
        It verifies that the server version matches the expected version
        defined in the configuration.
        """
        COUCH_USER = os.getenv("COUCH_USER")
        COUCH_PASSWORD = os.getenv("COUCH_PASSWORD")
        COUCH_HOST = os.getenv("COUCH_HOST")
        COUCH_PORT = int(os.getenv("COUCH_PORT"))
        COUCH_VERSION = os.getenv(
            "COUCH_VERSION"
        )  # Keep up-to-date. Used for authentication

        not_connected: bool = True

        # Updated to f-string as requested
        self.url: str = (
            f"http://{COUCH_USER}:{COUCH_PASSWORD}@{COUCH_HOST}:{COUCH_PORT}"
        )

        logging.info("CouchDB initialization started.")

        # Version check for availability
        while not_connected:
            try:
                # Try to connect
                self.couch: Any = couchdb.Server(self.url)
                request = self.couch.version()

                if not str(request).startswith(COUCH_VERSION):
                    logging.error("Wrong Couch server version. Stopping...")
                    exit(1)

                not_connected = False

            except Exception as e:
                logging.error(f"Couch server error: {e} {self.url}. Retrying...")
                time.sleep(3)

        logging.info(
            f"CouchDB initialization completed. {len(self.couch)} tables found."
        )
