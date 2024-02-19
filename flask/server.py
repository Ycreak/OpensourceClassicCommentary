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
from endpoints.fragment import get_author, get_title, get_editor, get_fragment, get_name, create_fragment, update_fragment, delete_fragment
from endpoints.testimonium import get_author_testimonium, get_title_testimonium, get_witness_testimonium, get_testimonium, get_name_testimonium, create_testimonium, update_testimonium, delete_testimonium, get_index
from endpoints.text import get_author_text, get_title_text, get_text, create_text, update_text, delete_text
from endpoints.fragment import link_fragment, get_list_display
from endpoints.zotero import get_bibliography, sync_bibliography
from endpoints.playground import create_playground, update_playground, delete_playground, get_playgrounds, get_playground, get_shared_playgrounds

app = Flask(__name__)
api = Api(app)

# Only allow requests from these specific origins
CORS(app, origins=conf.TRUSTED_ORIGINS)

# Initialize logging
logging.basicConfig(filename=conf.LOG_FILE, level=logging.INFO)

# Authenticate database server
server = CouchAuthenticator()

#####
# USERS
#####
app.add_url_rule("/user/get", view_func=get_user, methods=["POST"])
app.add_url_rule("/user/login", view_func=login_user, methods=["POST"])
app.add_url_rule("/user/create", view_func=create_user, methods=["POST"])
app.add_url_rule("/user/delete", view_func=delete_user, methods=["POST"])
app.add_url_rule("/user/update", view_func=update_user, methods=["POST"])

#####
# FRAGMENTS
#####
app.add_url_rule("/fragment/get/author", view_func=get_author, methods=["POST"])
app.add_url_rule("/fragment/get/title", view_func=get_title, methods=["POST"])
app.add_url_rule("/fragment/get/editor", view_func=get_editor, methods=["POST"])
app.add_url_rule("/fragment/get", view_func=get_fragment, methods=["POST"])
app.add_url_rule("/fragment/get/name", view_func=get_name, methods=["POST"])
app.add_url_rule("/fragment/create", view_func=create_fragment, methods=["POST"])
app.add_url_rule("/fragment/update", view_func=update_fragment, methods=["POST"])
app.add_url_rule("/fragment/delete", view_func=delete_fragment, methods=["POST"])

app.add_url_rule("/fragment/link", view_func=link_fragment, methods=["POST"])
app.add_url_rule("/fragment/get/index", view_func=get_list_display, methods=["POST"])

#####
# TESTIMONIA
#####
app.add_url_rule("/testimonium/get/author", view_func=get_author_testimonium, methods=["POST"])
app.add_url_rule("/testimonium/get/title", view_func=get_title_testimonium, methods=["POST"])
app.add_url_rule("/testimonium/get/witness", view_func=get_witness_testimonium, methods=["POST"])
app.add_url_rule("/testimonium/get", view_func=get_testimonium, methods=["POST"])
app.add_url_rule("/testimonium/get/name", view_func=get_name_testimonium, methods=["POST"])
app.add_url_rule("/testimonium/get/index", view_func=get_index, methods=["POST"])
app.add_url_rule("/testimonium/create", view_func=create_testimonium, methods=["POST"])
app.add_url_rule("/testimonium/update", view_func=update_testimonium, methods=["POST"])
app.add_url_rule("/testimonium/delete", view_func=delete_testimonium, methods=["POST"])

#####
# TEXTS
#####
app.add_url_rule("/texts/get/author", view_func=get_author_text, methods=["POST"])
app.add_url_rule("/texts/get/title", view_func=get_title_text, methods=["POST"])
app.add_url_rule("/texts/get", view_func=get_text, methods=["POST"])
app.add_url_rule("/texts/create", view_func=create_text, methods=["POST"])
app.add_url_rule("/texts/update", view_func=update_text, methods=["POST"])
app.add_url_rule("/texts/delete", view_func=delete_text, methods=["POST"])

#####
# BIBLIOGRAPHY
#####
app.add_url_rule("/bibliography/get", view_func=get_bibliography, methods=["POST"])
app.add_url_rule("/bibliography/sync", view_func=sync_bibliography, methods=["POST"])

#####
# PLAYGROUND
#####
app.add_url_rule("/playground/get", view_func=get_playground, methods=["POST"])
app.add_url_rule("/playground/get/shared", view_func=get_shared_playgrounds, methods=["POST"])
app.add_url_rule("/playground/get/name", view_func=get_playgrounds, methods=["POST"])
app.add_url_rule("/playground/create", view_func=create_playground, methods=["POST"])
app.add_url_rule("/playground/update", view_func=update_playground, methods=["POST"])
app.add_url_rule("/playground/delete", view_func=delete_playground, methods=["POST"])
# @app.route("/automatic_fragment_linker", methods=['POST'])
# def automatic_fragment_linker():
#     # Route to allow for the creation of the given fragment
#     response = frag_db.automatic_fragment_linker(Fragment(request.get_json()))
#     return response  

# MAIN
if __name__ == '__main__':
    # we run a debugging session whenever this file is invoked directly
    app.run(host='0.0.0.0', port=5003, debug=True)
