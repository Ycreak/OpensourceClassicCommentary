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
#   python3 server.py                                                   #
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
from endpoints.testimonium import get_author_testimonium, get_title_testimonium, get_witness_testimonium, get_testimonium, get_name_testimonium, create_testimonium, update_testimonium, delete_testimonium
from endpoints.broader_context import get_author_broader_context, get_title_broader_context, get_broader_context, create_broader_context, update_broader_context, delete_broader_context
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
app.add_url_rule("/fragment/get/list_display", view_func=get_list_display, methods=["POST"])

#####
# TESTIMONIUMS
#####
app.add_url_rule("/testimoniums/get/author", view_func=get_author_testimonium, methods=["POST"])
app.add_url_rule("/testimoniums/get/title", view_func=get_title_testimonium, methods=["POST"])
app.add_url_rule("/testimoniums/get/witness", view_func=get_witness_testimonium, methods=["POST"])
app.add_url_rule("/testimoniums/get", view_func=get_testimonium, methods=["POST"])
app.add_url_rule("/testimoniums/get/name", view_func=get_name_testimonium, methods=["POST"])
app.add_url_rule("/testimoniums/create", view_func=create_testimonium, methods=["POST"])
app.add_url_rule("/testimoniums/update", view_func=update_testimonium, methods=["POST"])
app.add_url_rule("/testimoniums/delete", view_func=delete_testimonium, methods=["POST"])

#####
# BROADER CONTEXTS
#####
app.add_url_rule("/broader_contexts/get/author", view_func=get_author_broader_context, methods=["POST"])
app.add_url_rule("/broader_contexts/get/title", view_func=get_title_broader_context, methods=["POST"])
app.add_url_rule("/broader_contexts/get", view_func=get_broader_context, methods=["POST"])
app.add_url_rule("/broader_contexts/create", view_func=create_broader_context, methods=["POST"])
app.add_url_rule("/broader_contexts/update", view_func=update_broader_context, methods=["POST"])
app.add_url_rule("/broader_contexts/delete", view_func=delete_broader_context, methods=["POST"])

app.add_url_rule("/bibliography/get", view_func=get_bibliography, methods=["POST"])
app.add_url_rule("/bibliography/sync", view_func=sync_bibliography, methods=["POST"])


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

# @app.route("/revise_fragment", methods=['POST'])
# def revise_fragment():
#     # Route to allow for the revision of the given fragment
#     received_fragment = Fragment(request.get_json())
#     response = frag_db.revise_fragment(received_fragment)
#     return response

# @app.route("/delete_fragment", methods=['POST'])
# def delete_fragment():
#     # Route to allow for the deletion of the given fragment
#     response = frag_db.delete_fragment(Fragment(request.get_json()))
#     return response


# MAIN
if __name__ == '__main__':
    # we run a debugging session whenever this file is invoked directly
    app.run(host='0.0.0.0', port=5003, debug=True)
