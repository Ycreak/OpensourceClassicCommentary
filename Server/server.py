# OSCC FLASK Server. Handles requests from the OSCC Angular Front end.
# As of now is able to handle fragments and users.

# Library Imports
from flask import Flask, request
from flask_cors import CORS
from flask_restful import Api
from flask_jsonpify import jsonify

import jsonpickle

# RUN INSTRUCTIONS
# FLASK_APP=<filename>.py FLASK_ENV=development flask run --port 5002

# Class Impots
from fragment_handling import Fragment_handler
from bibliography_handling import Bibliography_handler
from user_handling import User_handler
from Models.fragment import Fragment
from Models.user import User, UserSchema
from Models.bib_entry import Bib_entry

app = Flask(__name__)
api = Api(app) # TODO: Deprecated?

# Only allow requests from these specific origins
CORS(app, origins = ["http://localhost:4200", "https://oscc.lucdh.nl"])

# Instantiate the fragment handler and user handler at server startup
frag_db = Fragment_handler()
user_db = User_handler()
bib_db = Bibliography_handler()

'''
Fragment interfacing
'''
# The following routes are GET methods
@app.route("/authors")
def authors():
    # Route to retrieve a list of all authors in the fragment database
    result = frag_db.retrieve_all_authors()
    return jsonify(Create_simple_JSON_list(result, 'name'))

@app.route("/books")
def books():
    # Route to retrieve a list of all books given an author
    result = frag_db.retrieve_all_titles(request_arguments('author'))
    return jsonify(Create_simple_JSON_list(result, 'name'))

@app.route("/editors")
def editors():
    # Route to retrieve a list of all editors given an author and editor
    result = frag_db.retrieve_all_editors(request_arguments('author'), request_arguments('book'))
    return jsonify(Create_simple_JSON_list(result, 'name'))

@app.route("/fragments")
def fragments():
    # Route to retrieve all fragments given an author, book and editor
    fragments_list = frag_db.retrieve_all_fragments(request_arguments('author'), request_arguments('book'), request_arguments('editor'))
    return jsonify(fragments_list)

@app.route("/fragment_content")
def fragment_content():
    # Route to retrieve the content of the given fragment
    result = frag_db.retrieve_fragment_content(Fragment({'_id':request_arguments('fragment_id')}))
    return jsonpickle.encode(result)

@app.route("/complete_fragment")
def complete_fragment():
    # Route to retrieve a fragment in full. Used by the dashboard
    result = frag_db.retrieve_complete_fragment(request_arguments('fragment_id'))
    return jsonify(result)

# The following routes are POST methods
@app.route("/create_fragment", methods=['POST'])
def create_fragment():
    # Route to allow for the creation of the given fragment
    received_fragment = Fragment(request.get_json())
    response = frag_db.create_fragment(received_fragment)
    return response

@app.route("/automatic_fragment_linker", methods=['POST'])
def automatic_fragment_linker():
    # Route to allow for the creation of the given fragment
    received_fragment = Fragment(request.get_json())
    response = frag_db.automatic_fragment_linker(received_fragment)
    return response  

@app.route("/revise_fragment", methods=['POST'])
def revise_fragment():
    # Route to allow for the revision of the given fragment
    received_fragment = Fragment(request.get_json())
    response = frag_db.revise_fragment(received_fragment)
    return response

@app.route("/delete_fragment", methods=['POST'])
def delete_fragment():
    # Route to allow for the deletion of the given fragment
    received_fragment = Fragment(request.get_json())
    response = frag_db.delete_fragment(received_fragment)
    return response

@app.route("/set_fragment_lock",  methods=['POST'])
def set_fragment_lock():
    # Route to allow the user to lock or unlock a specific fragment
    received_fragment = Fragment(request.get_json())
    response = frag_db.set_fragment_lock(received_fragment)
    return response

'''
Bibliography interface
'''
@app.route("/get_bibliography_authors")
def get_bibliography_authors():
    # Route to retrieve a list of all authors in the bibliography database
    result = bib_db.retrieve_all_authors()
    return jsonify(create_simple_JSON_list(result, 'name'))

@app.route("/get_bibliography_from_author")
def get_bibliography_from_author():
    # Route to retrieve the complete bibliography for a given author
    result = bib_db.retrieve_bibliography_from_author(request_arguments('author'))
    return jsonpickle.encode(result)

@app.route("/get_bibliography_from_id")
def get_bibliography_from_id():
    # Route to retrieve the complete bibliography for a given id
    result = bib_db.retrieve_bibliography_from_id(request_arguments('_id'))
    return jsonpickle.encode(result)
    

@app.route("/create_bibliography_entry",  methods=['POST'])
def create_bibliography_entry():
    # Route to allow the user to create a specific bibliography item
    received_bibliography = Bib_entry(request.get_json())
    response = bib_db.add_entry(received_bibliography)
    return response

@app.route("/revise_bibliography_entry",  methods=['POST'])
def revise_bibliography_entry():
    # Route to allow the user to revise a specific bibliography item
    received_bibliography = Bib_entry(request.get_json())
    response = bib_db.revise_entry(received_bibliography)
    return response

@app.route("/delete_bibliography_entry",  methods=['POST'])
def delete_bibliography_entry():
    # Route to allow the user to delete a specific bibliography item
    received_bibliography = Bib_entry(request.get_json())
    response = bib_db.delete_entry(received_bibliography)
    return response

'''
User interface
'''
# The following routes are GET methods
@app.route("/retrieve_users")
def retrieve_users():
    # Route to retrieve all a list of all unique users in the database
    return jsonify(user_db.retrieve_all_users())

# The following routes are POST methods
@app.route("/login_user", methods=['POST'])
def login_user():
    # Route to allow a user to login
    received_user = User(request.get_json())
    return user_db.login_user(received_user)

@app.route("/create_user", methods=['POST'])
def create_user():
    # Route to allow for the creation of a user
    result = UserSchema().load(request.get_json())
    # result = schema.load(user_data)  
    # import pprint
    print(result.username)
    print(result.role)


    # received_user = User(request.get_json())
    # return user_db.create_user(received_user)

@app.route("/delete_user", methods=['POST'])
def delete_user():
    # Route to allow for the deletion of a user
    received_user = User(request.get_json())
    return user_db.delete_user(received_user)

@app.route("/change_password", methods=['POST'])
def change_password():
    # Route to allow for a user to change their password
    received_user = User(request.get_json())
    return user_db.change_password(received_user)

@app.route("/change_role", methods=['POST'])
def change_role():
    # Route to change the role of the given user
    received_user = User(request.get_json())
    return user_db.change_role(received_user)

'''
Utility functions
'''
def create_simple_JSON_list(given_list, key):
    # This function creates a json object from the given list and the given key
    result_list = []
    [result_list.append({key: x}) for x in given_list]
    return result_list

def request_arguments(arg):
    # Alias for the function below
    return request.args.get(arg, '')   

# MAIN
if __name__ == '__main__':
    context = ('/etc/letsencrypt/live/oscc.nolden.biz/cert.pem', '/etc/letsencrypt/live/oscc.nolden.biz/privkey.pem')
    app.run(host='0.0.0.0', port=5003, ssl_context = context)
