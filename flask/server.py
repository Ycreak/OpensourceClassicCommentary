# # # # # #
# OSCC FLASK Server. Handles requests from the OSCC Angular Front end
#                                                                       #
#                        RUN INSTRUCTIONS                               #
#   docker compose up                                                   #
# # # # # #
from flask import Flask
from flask_cors import CORS
from flask_restful import Api
from flasgger import Swagger
import logging
from common.couch import CouchConnection

from endpoints.user import user_blueprint
from endpoints.document import document_blueprint
from endpoints.zotero import zotero_blueprint

import os
from dotenv import load_dotenv

load_dotenv(".env")

app = Flask(__name__)
api = Api(app)
swagger = Swagger(app)  # localhost:5003/apidocs/#/

# Only allow requests from these specific origins
TRUSTED_ORIGINS = [
    "http://127.0.0.1:4200",
    "http://localhost:4200",
    os.getenv("REMOTE_HOST"),
    os.getenv("STAGING_HOST"),
]
CORS(app, origins=TRUSTED_ORIGINS)

# Initialize logging
LOG_FILE = "server.log"
logging.basicConfig(filename=LOG_FILE, level=logging.INFO)

# Connect to the database server
couch_server = CouchConnection.connect()

# Update the document index such that we always have an up-to-date list of documents
# update_index()

# Paths
app.register_blueprint(user_blueprint, url_prefix="/user")
app.register_blueprint(zotero_blueprint, url_prefix="/bibliography")
app.register_blueprint(document_blueprint, url_prefix="/document")


# MAIN
if __name__ == "__main__":
    # we run a debugging session whenever this file is invoked directly
    app.run(host="0.0.0.0", port=5003, debug=True)
