from flask import request, make_response
import logging
from flask_jsonpify import jsonify
from uuid import uuid4

from Server.couch import CouchAuthenticator
import Server.utilities as util
from Server.models.user import User, UserField, UserModel, Role

users = UserModel(CouchAuthenticator().couch)

def get_user():
    try:
        username = request.get_json()[UserField.USERNAME]
    except KeyError as e:
        logging.error(e)
        return make_response("Unprocessable entity", 422)

    user = users.get(User(username=username))
    if not user:
        return make_response("User not found", 404)

    if (user.role == Role.STUDENT) or (user.role == Role.GUEST):
        user.password = None
        user.id = None
        return make_response(jsonify(user), 200)
    elif user.role == Role.TEACHER:
        all_users = users.all(sorted=True)
        for i in all_users:
            i.password = None
            i.id = None
        return make_response(jsonify(all_users), 200)
    else:
        print(user)
        return make_response("Not found", 404)

def login_user():
    try:
        username = request.get_json()[UserField.USERNAME]
        password = request.get_json()[UserField.PASSWORD]
    except KeyError as e:
        logging.error(e)
        return make_response("Unprocessable entity", 422)
    
    user = users.filter(User(username=username))
    if not user:
        logging.error("User does not exist: {}".format(user.username))
        return make_response("Not found", 401)
    try:
        user = user[0]
    except KeyError as e:
        logging.error("Error during fetching user: " + str(e))
        return make_response("Server error", 500)

    if util.verify_password(stored_pwd=user.password, provided_pwd=password):
        return make_response("OK", 200)
    else:
        return make_response("Unauthorized", 403)

def create_user():
    user = User().from_json(request.get_json())

    if users.get(User(username=user.username)) != None:
        return make_response("Forbidden", 403)

    user = users.create(User(id=uuid4().hex, username=user.username, password=util.hash_password(user.password)))
    if user == None:
        return make_response("Server error", 500)

    return make_response("Created", 201)

def delete_user():
    try:
        username = request.get_json()[UserField.USERNAME]
    except KeyError as e:
        logging.error(e)
        return make_response("Unprocessable entity", 422)
    
    if users.delete(User(username=username)):
        return make_response("OK", 200)
    else:
        return make_response("Not found", 401)

def update_user():
    try:
        username = request.get_json()[UserField.USERNAME]
    except KeyError as e:
        logging.error(e)
        return make_response("Unprocessable entity", 422)

    user = User(username=username)

    if UserField.ROLE in request.get_json():
        user.role = request.get_json()[UserField.ROLE]
    if UserField.PASSWORD in request.get_json():
        user.password = util.hash_password(request.get_json()[UserField.PASSWORD])

    if users.update(user):
        return make_response("OK", 200)
    else:
        return make_response("Not found", 401)
