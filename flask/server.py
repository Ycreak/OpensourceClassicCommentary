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

from endpoints.user import get_user, login_user, create_user, delete_user, update_user
from endpoints.document import (
    get_document,
    get_index,
    update_index,
    create_document,
    delete_document,
    update_document,
)
from endpoints.zotero import get_bibliography, sync_bibliography, test_bibliography

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

#########
# USERS #
#########
app.add_url_rule("/user/get", view_func=get_user, methods=["POST"])
app.add_url_rule("/user/login", view_func=login_user, methods=["POST"])
app.add_url_rule("/user/create", view_func=create_user, methods=["POST"])
app.add_url_rule("/user/delete", view_func=delete_user, methods=["POST"])
app.add_url_rule("/user/update", view_func=update_user, methods=["POST"])

#############
# DOCUMENTS #
#############
app.add_url_rule("/document/get", view_func=get_document, methods=["POST"])
app.add_url_rule("/document/create", view_func=create_document, methods=["POST"])
app.add_url_rule("/document/update", view_func=update_document, methods=["POST"])
app.add_url_rule("/document/delete", view_func=delete_document, methods=["POST"])
app.add_url_rule("/document/index", view_func=get_index, methods=["POST"])

################
# BIBLIOGRAPHY #
################
app.add_url_rule("/bibliography/get", view_func=get_bibliography, methods=["POST"])
app.add_url_rule("/bibliography/sync", view_func=sync_bibliography, methods=["POST"])
app.add_url_rule("/bibliography/test", view_func=test_bibliography, methods=["POST"])

# MAIN
if __name__ == "__main__":
    # we run a debugging session whenever this file is invoked directly
    app.run(host="0.0.0.0", port=5003, debug=True)
