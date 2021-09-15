# OSCC FLASK Server
from flask import Flask, request
from flask_cors import CORS
from flask_restful import Api
from flask_jsonpify import jsonify

import jsonpickle

# RUN INSTRUCTIONS
# FLASK_APP=<filename>.py FLASK_ENV=development flask run --port 5002

from fragment_handling import Fragment_handler
from user_handling import User_handler
from Models.fragment import Fragment
from Models.user import User

app = Flask(__name__)
api = Api(app)

# Only allow requests from these specific origins
CORS(app, origins = ["http://localhost:4200", "https://oscc.lucdh.nl"])

# Instantiate the fragment handler and user handler at server startup
frag_db = Fragment_handler()
user_db = User_handler()

'''
TODO: App routes for Angular to take
'''

@app.route("/authors")
def authors():
    result = frag_db.Retrieve_all_authors()
    return jsonify(Create_simple_JSON_list(result, 'name'))

@app.route("/books")
def books():
    result = frag_db.Retrieve_all_titles(request.args.get('author', ''))
    return jsonify(Create_simple_JSON_list(result, 'name'))

@app.route("/editors")
def editors():
    result = frag_db.Retrieve_all_editors(request.args.get('author', ''), request.args.get('book', ''))
    return jsonify(Create_simple_JSON_list(result, 'name'))

@app.route("/fragments")
def fragments():
    fragments_list = frag_db.Retrieve_all_fragments(ReqArg('author'), ReqArg('book'), ReqArg('editor'))
    return jsonify(fragments_list)

@app.route("/fragment_content")
def fragment_content():
    result = frag_db.Retrieve_fragment_content(Fragment({'_id':ReqArg('fragment_id')}))
    return jsonpickle.encode(result)

@app.route("/complete_fragment")
def complete_fragment():
    result = frag_db.Retrieve_complete_fragment(ReqArg('fragment_id'))
    return jsonify(result)

@app.route("/create_fragment", methods=['POST'])
def create_fragment():
    received_fragment = Fragment(request.get_json())
    response = frag_db.Create_fragment(received_fragment)
    return response

@app.route("/revise_fragment", methods=['POST'])
def revise_fragment():
    received_fragment = Fragment(request.get_json())
    response = frag_db.Revise_fragment(received_fragment)
    return response

@app.route("/delete_fragment", methods=['POST'])
def delete_fragment():
    received_fragment = Fragment(request.get_json())
    response = frag_db.Delete_fragment(received_fragment)
    return response

@app.route("/set_fragment_lock",  methods=['POST'])
def set_fragment_lock():   
    received_fragment = Fragment(request.get_json())
    response = frag_db.Set_fragment_lock(received_fragment)
    return response

'''
User interface
'''
@app.route("/retrieve_users")
def retrieve_users():
    return jsonify(user_db.Retrieve_all_users())

@app.route("/login_user", methods=['POST'])
def login_user():
    received_user = User(request.get_json())
    return user_db.Login_user(received_user)

@app.route("/create_user", methods=['POST'])
def create_user():
    received_user = User(request.get_json())
    return user_db.Create_user(received_user)

@app.route("/delete_user", methods=['POST'])
def delete_user():
    received_user = User(request.get_json())
    return user_db.Delete_user(received_user)

@app.route("/change_password", methods=['POST'])
def change_password():
    received_user = User(request.get_json())
    return user_db.Change_password(received_user)

@app.route("/change_role", methods=['POST'])
def change_role():
    received_user = User(request.get_json())
    return user_db.Change_role(received_user)

# @app.route("/")
# def ():

def Create_simple_JSON_list(given_list, denominator):
    result_list = []
    [result_list.append({denominator: x}) for x in given_list]
    return result_list

def ReqArg(arg):
    return request.args.get(arg, '')   

# MAIN
if __name__ == '__main__':
    context = ('/etc/letsencrypt/live/oscc.nolden.biz/cert.pem', '/etc/letsencrypt/live/oscc.nolden.biz/privkey.pem')
    app.run(host='0.0.0.0', port=5003, ssl_context = context)
