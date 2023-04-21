
LOCAL_HOST_RESOLVED = "http://localhost:4200"
LOCAL_HOST = "http://127.0.0.1:4200"
REMOTE_HOST = "https://oscc.lucdh.nl"

TRUSTED_ORIGINS = [
    LOCAL_HOST,
    LOCAL_HOST_RESOLVED,
    REMOTE_HOST
]

COUCH_USER = "admin"
COUCH_PASSWORD = "ledenpas"
COUCH_HOST = "192.168.1.42"
COUCH_PORT = "5984"

# List the databases here
COUCH_FRAGMENTS = "fragments"
COUCH_USERS = "users"

COUCH_TABLES = [
    COUCH_FRAGMENTS, 
    COUCH_USERS
]

COUCH_LIMIT = 1000
COUCH_VERSION = "3" # Keep up-to-date. Used for authentication

# Do not touch!
PWD_HASH_NAME = "sha512"
PWD_HASH_ITERATIONS = 100000

LOG_FILE = "server.log"



