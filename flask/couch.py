import couchdb
import logging
import time
from typing import Any
import config as conf


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
        not_connected: bool = True

        # Updated to f-string as requested
        self.url: str = f"http://{conf.COUCH_USER}:{conf.COUCH_PASSWORD}@{conf.COUCH_HOST}:{conf.COUCH_PORT}/"

        logging.info("CouchDB initialization started.")

        # Version check for availability
        while not_connected:
            try:
                # Try to connect
                self.couch: Any = couchdb.Server(self.url)
                request = self.couch.version()

                if not str(request).startswith(conf.COUCH_VERSION):
                    logging.error("Wrong Couch server version. Stopping...")
                    exit(1)

                not_connected = False

            except Exception:
                logging.error(
                    "Couch server not (yet) available or out of sync. Retrying..."
                )
                time.sleep(3)

        logging.info(
            f"CouchDB initialization completed. {len(self.couch)} tables found."
        )
