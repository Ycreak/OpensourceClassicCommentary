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
from models.playground import Playground, PlaygroundModel
from constants import PlaygroundMappingField

playgrounds = PlaygroundModel(CouchAuthenticator().couch)

def get_playgrounds():
    owner = None
    try:
        if PlaygroundMappingField.OWNER in request.get_json():
            owner = request.get_json()[PlaygroundMappingField.OWNER]
    except KeyError as e:
        logging.error(e)
        return make_response("Unprocessable entity", 422)
    playground_lst = playgrounds.filter(Playground(owner=owner), sorted=True)
    if not playground_lst:
        return make_response("Not found", 401)
    return jsonify(sorted(set([playground.name for playground in playground_lst]))), 200

def get_playground():
    owner = None
    name = None
    try:
        if PlaygroundMappingField.OWNER in request.get_json():
            owner = request.get_json()[PlaygroundMappingField.OWNER]
        if PlaygroundMappingField.NAME in request.get_json():
            name = request.get_json()[PlaygroundMappingField.NAME]
    except KeyError as e:
        logging.error(e)
        return make_response("Unprocessable entity", 422)

    playground_lst = playgrounds.filter(Playground(name=name, owner=owner), sorted=True)
    if not playground_lst:
        return make_response("Not found", 401)

    return jsonify(playground_lst), 200

def get_shared_playgrounds():
    user = None
    try:
        if PlaygroundMappingField.USER in request.get_json():
            user = request.get_json()[PlaygroundMappingField.USER]
    except KeyError as e:
        logging.error(e)
        return make_response("Unprocessable entity", 422)
    playground_lst = playgrounds.get_shared_playgrounds(Playground(user=user), sorted=True)

    if not playground_lst:
        return make_response("Not found", 401)
    
    return jsonify(playground_lst), 200

def create_playground():    
    try:
        owner = request.get_json()[PlaygroundMappingField.OWNER]
        name = request.get_json()[PlaygroundMappingField.NAME]
        canvas = request.get_json()[PlaygroundMappingField.CANVAS]

    except KeyError as e:
        logging.error(e)
        return make_response("Unprocessable entity", 422)
  
    if playgrounds.filter(Playground(name=name,owner=owner)):
        logging.error("create_playground(): duplicate playground")
        return make_response("Forbidden", 403)

    playground = playgrounds.create(Playground(_id=uuid4().hex, name=name, owner=owner, canvas=canvas))
    if playground == None:
        return make_response("Server error", 500)
    
    return make_response("Created", 200)

def update_playground():    
    try:
        _id = request.get_json()[PlaygroundMappingField.ID]
        canvas = None 
        shared_with = None 

        if PlaygroundMappingField.CANVAS in request.get_json():
            canvas = request.get_json()[PlaygroundMappingField.CANVAS]
        if PlaygroundMappingField.SHARED_WITH in request.get_json():
            shared_with = request.get_json()[PlaygroundMappingField.SHARED_WITH]
    
    except KeyError as e:
        logging.error(e)
        return make_response("Unprocessable entity", 422)

    playground = playgrounds.update(Playground(_id=_id, canvas=canvas, shared_with=shared_with))
    if playground == None:
        return make_response("Server error", 500)

    return make_response("Revised", 200)

def delete_playground():
    try:
        _id = request.get_json()[PlaygroundMappingField.ID]
    except KeyError as e:
        logging.error(e)
        return make_response("Unprocessable entity", 422)
    playground = playgrounds.delete(Playground(_id=_id))

    if playground:
        return make_response("OK", 200)
    else:
        return make_response("Not found", 401)
