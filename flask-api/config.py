import os
from dotenv import load_dotenv  
load_dotenv('.env') 

# Trusted origins for CORS purposes
LOCAL_HOST_RESOLVED = "http://localhost:4200"
LOCAL_HOST = "http://127.0.0.1:4200"
REMOTE_HOST: str = os.getenv("REMOTE_HOST")
STAGING_HOST: str = os.getenv("STAGING_HOST")

TRUSTED_ORIGINS = [
    LOCAL_HOST,
    LOCAL_HOST_RESOLVED,
    REMOTE_HOST,
    STAGING_HOST,
]

COUCH_USER=os.getenv("COUCH_USER")
COUCH_PASSWORD=os.getenv("COUCH_PASSWORD")
COUCH_HOST=os.getenv("COUCH_HOST")
COUCH_PORT=int(os.getenv("COUCH_PORT"))

# List the databases here
COUCH_DOCUMENTS = "documents"
COUCH_USERS = "users"
COUCH_TABLES = [
    COUCH_USERS,
    COUCH_DOCUMENTS
]

PWD_HASH_NAME=os.getenv("PWD_HASH_NAME")
PWD_HASH_ITERATIONS=int(os.getenv("PWD_HASH_ITERATIONS"))
COUCH_LIMIT = 1000
COUCH_VERSION = os.getenv("COUCH_VERSION") # Keep up-to-date. Used for authentication

# Name of our log file
LOG_FILE = "server.log"

# Unique identifier for the opensourceclassicscommentary zotero library
ZOTERO_LIBRARY_ID = "5089557"
