"""
 ___  ___ _ ____   _____ _ __ _ __  _   _
/ __|/ _ \ '__\ \ / / _ \ '__| '_ \| | | |
\__ \  __/ |   \ V /  __/ |_ | |_) | |_| |
|___/\___|_|    \_/ \___|_(_)| .__/ \__, |
                             | |     __/ |
                             |_|    |___/
"""

# # # # # #
# OSCC FLASK Server. Handles requests from the OSCC Angular Front end
#      -- As of now is able to handle fragments and users --
#                                                                       #
#                        RUN INSTRUCTIONS                               #
#   docker compose up                                                   #
# # # # # #

# TODO Token authentication between server and front-end
# TODO Input sanitation
# TODO Dont send passwords in plain text to the server

# Library imports
from flask import Flask
from flask_cors import CORS
from flask_restful import Api
import logging

# Class imports
import config as conf
from couch import CouchAuthenticator

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

app = Flask(__name__)
api = Api(app)

# Only allow requests from these specific origins
CORS(app, origins=conf.TRUSTED_ORIGINS)

# Initialize logging
logging.basicConfig(filename=conf.LOG_FILE, level=logging.INFO)

# Authenticate database server
server = CouchAuthenticator()

update_index()

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
