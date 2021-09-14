# OSCC FLASK Server
from flask import Flask, request, make_response
from flask_cors import CORS, cross_origin
from flask_restful import Resource, Api
from flask_jsonpify import jsonify

# from json import dumps

# INSTALL INSTRUCTIONS
# pipInstall flask flask_cors flask_restful flask_jsonpify

# RUN INSTRUCTIONS
# FLASK_APP=<filename>.py FLASK_ENV=development flask run --port 5002

from fragment_handling import Fragment_handler
from user_handling import User_handler

app = Flask(__name__)
api = Api(app)

CORS(app)

# Instantiate the fragment handler and user handler at server startup
frag_db = Fragment_handler()
user_db = User_handler()

'''
TODO: App routes for Angular to take
'''

@app.route("/authors")
def authors():
    result = frag_db.Retrieve_all_authors()
    response = jsonify(Create_JSON_object(result, 'name'))
    return response

@app.route("/books")
def books():
    result = frag_db.Retrieve_all_titles(request.args.get('author', ''))
    return jsonify(Create_JSON_object(result, 'name'))

@app.route("/editors")
def editors():
    result = frag_db.Retrieve_all_editors(request.args.get('author', ''), request.args.get('book', ''))
    return jsonify(Create_JSON_object(result, 'name'))

@app.route("/fragments")
def fragments():

    result = frag_db.Retrieve_all_fragments(ReqArg('author'), ReqArg('book'), ReqArg('editor'))
    
    result_list = []

    for fragment in result:
        fragment_entry = {
            'id' : fragment.id,
            'author' : fragment['author'],
            'book' : fragment['title'],
            'editor' : fragment['editor'],
            'fragment_name' : fragment['fragment_name'],
            'lines' : fragment['lines'],
            'status' : fragment['status'],
        }
        result_list.append(fragment_entry)    
    
    return jsonify(result_list)

@app.route("/fcontext")
def fcontext():
    result = frag_db.Retrieve_fragment_data(ReqArg('fragment_id'), 'context')

    result_list = []
    for context in result:
        context_entry = {
            'author' : context['author'],
            'location' : context['location'],
            'context' : context['text'],
        }
        result_list.append(context_entry)    
    
    return jsonify(result_list)

@app.route("/ftranslation")
def ftranslation():
    result = frag_db.Retrieve_fragment_data(ReqArg('fragment_id'), 'translation')
    return jsonify(Create_JSON_object([result], 'translation')) #Note! I put the result in a list

@app.route("/fcommentary")
def fcommentary():
    result = frag_db.Retrieve_fragment_data(ReqArg('fragment_id'), 'commentary')
    return jsonify(Create_JSON_object([result], 'commentary')) #Note! I put the result in a list

@app.route("/fapparatus")
def fapparatus():    
    result = frag_db.Retrieve_fragment_data(ReqArg('fragment_id'), 'apparatus')
    return jsonify(Create_JSON_object([result], 'apparatus')) #Note! I put the result in a list

@app.route("/fdifferences")
def fdifferences():
    result = frag_db.Retrieve_fragment_data(ReqArg('fragment_id'), 'differences')
    return jsonify(Create_JSON_object([result], 'differences')) #Note! I put the result in a list

@app.route("/freconstruction")
def freconstruction():
    result = frag_db.Retrieve_fragment_data(ReqArg('fragment_id'), 'reconstruction')
    return jsonify(Create_JSON_object([result], 'reconstruction')) #Note! I put the result in a list

@app.route("/completefragment")
def completefragment():
    result = frag_db.Retrieve_complete_fragment(ReqArg('fragment_id'))
    return jsonify(result)

@app.route("/create_fragment", methods=['POST'])
def create_fragment():
    received_json = request.get_json()
    result = frag_db.Create_fragment(received_json)

    return result

@app.route("/revise_fragment", methods=['POST'])
def revise_fragment():

    received_json = request.get_json()
    result = frag_db.Revise_fragment(received_json)

    return result

@app.route("/delete_fragment", methods=['POST'])
def delete_fragment():

    received_json = request.get_json()
    result = frag_db.Delete_fragment(received_json)

    return result

'''
User interface
'''
@app.route("/retrieve_users")
def retrieve_users():
    result = user_db.Retrieve_all_users()
    # response = jsonify(Create_JSON_object(result, 'name'))
    # response.headers.add('Access-Control-Allow-Origin', '*')
    return jsonify(result)

@app.route("/login_user", methods=['POST'])
def login_user():
    post_data = request.get_json()
    return user_db.Login_user(post_data['username'], post_data['password'])

@app.route("/create_user", methods=['POST'])
def create_user():
    post_data = request.get_json()
    return user_db.Create_user(post_data['username'], post_data['password'])

@app.route("/delete_user", methods=['POST'])
def delete_user():
    post_data = request.get_json()
    return user_db.Delete_user(post_data['username'])

@app.route("/change_password", methods=['POST'])
def change_password():
    post_data = request.get_json()
    return user_db.Change_password(post_data['username'], post_data['new_password'])

@app.route("/change_role", methods=['POST'])
def change_role():
    post_data = request.get_json()
    return user_db.Change_role(post_data['username'], post_data['new_role'])

@app.route("/set_fragment_lock",  methods=['POST'])
def set_fragment_lock():
    print('hello')
    
    post_data = request.get_json()

    print(post_data['fragment_id'], post_data['lock_status'])

    return frag_db.Set_fragment_lock(post_data['fragment_id'], post_data['lock_status'])

# @app.route("/")
# def ():

def Create_JSON_object(given_list, denominator):
    result_list = []
    [result_list.append({denominator: x}) for x in given_list]
    return result_list

def ReqArg(arg):
    return request.args.get(arg, '')   

# MAIN
if __name__ == '__main__':
    context = ('/etc/letsencrypt/live/oscc.nolden.biz/cert.pem', '/etc/letsencrypt/live/oscc.nolden.biz/privkey.pem')
    app.run(host='0.0.0.0', port=5003, ssl_context = context)
