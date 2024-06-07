"""
                 _             _       _           ____                                      _                 
                | |           (_)     | |         / / _|                                    | |                
   ___ _ __   __| |_ __   ___  _ _ __ | |_ ___   / / |_ _ __ __ _  __ _ _ __ ___   ___ _ __ | |_   _ __  _   _ 
  / _ \ '_ \ / _` | '_ \ / _ \| | '_ \| __/ __| / /|  _| '__/ _` |/ _` | '_ ` _ \ / _ \ '_ \| __| | '_ \| | | |
 |  __/ | | | (_| | |_) | (_) | | | | | |_\__ \/ / | | | | | (_| | (_| | | | | | |  __/ | | | |_ _| |_) | |_| |
  \___|_| |_|\__,_| .__/ \___/|_|_| |_|\__|___/_/  |_| |_|  \__,_|\__, |_| |_| |_|\___|_| |_|\__(_) .__/ \__, |
                  | |                                              __/ |                          | |     __/ |
                  |_|                                             |___/                           |_|    |___/ 
"""

from flask import request, make_response
import logging
from flask_jsonpify import jsonify
from uuid import uuid4

from couch import CouchAuthenticator
import utilities as util
from models.playground import Playground, PlaygroundModel, PlaygroundField

playgrounds = PlaygroundModel(CouchAuthenticator().couch)

def get_playgrounds_list():
    """
    Returns a list of playgrounds the user has access to. The canvas is not included and has to be 
    retrieved separately with the function get_playground().
    """
    user = None
    try:
        if PlaygroundField.USER in request.get_json():
            user = request.get_json()[PlaygroundField.USER]
    except KeyError as e:
        logging.error(e)
        return make_response("Unprocessable entity", 422)
    playground_lst = playgrounds.list(Playground(user=user), sorted=True)

    if not playground_lst:
        return make_response("Not found", 401)
    
    return jsonify(playground_lst), 200

def get_playground():
    _id= None
    user = None
    try:
        _id = request.get_json()[PlaygroundField.ID]
        user = request.get_json()[PlaygroundField.USER]
    except KeyError as e:
        logging.error(e)
        return make_response("Unprocessable entity", 422)

    playground = playgrounds.get(Playground(_id=_id), user)
    if not playground:
        return make_response("Not found", 401)
        
    return jsonify(playground), 200

def get_shared_playgrounds():
    user = None
    try:
        if PlaygroundField.USER in request.get_json():
            user = request.get_json()[PlaygroundField.USER]
    except KeyError as e:
        logging.error(e)
        return make_response("Unprocessable entity", 422)
    playground_lst = playgrounds.get_shared_playgrounds(Playground(user=user), sorted=True)

    if not playground_lst:
        return make_response("Not found", 401)
    
    return jsonify(playground_lst), 200

def create_playground():    
    try:
        users = request.get_json()[PlaygroundField.USERS]
        name = request.get_json()[PlaygroundField.NAME]
        canvas = request.get_json()[PlaygroundField.CANVAS]

    except KeyError as e:
        logging.error(e)
        return make_response("Unprocessable entity", 422)
  
    playground = playgrounds.create(Playground(_id=uuid4().hex, name=name, users=users, canvas=canvas))
    if playground == None:
        return make_response("Server error", 500)
    
    return make_response("Created", 200)

def update_playground():    
    try:
        _id = request.get_json()[PlaygroundField.ID]
        canvas = request.get_json()[PlaygroundField.CANVAS]

    except KeyError as e:
        logging.error(e)
        return make_response("Unprocessable entity", 422)

    playground = playgrounds.update(Playground(_id=_id, canvas=canvas))
    if playground == None:
        return make_response("Server error", 500)

    return make_response("Revised", 200)

def delete_playground():
    try:
        _id = request.get_json()[PlaygroundField.ID]
    except KeyError as e:
        logging.error(e)
        return make_response("Unprocessable entity", 422)
    playground = playgrounds.delete(Playground(_id=_id))

    if playground:
        return make_response("OK", 200)
    else:
        return make_response("Not found", 401)
