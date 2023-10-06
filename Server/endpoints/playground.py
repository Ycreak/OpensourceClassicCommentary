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

def get_playgrounds():
    owner = None
    try:
        if PlaygroundField.OWNER in request.get_json():
            name = request.get_json()[PlaygroundField.OWNER]
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
        if PlaygroundField.OWNER in request.get_json():
            owner = request.get_json()[PlaygroundField.OWNER]
        if PlaygroundField.NAME in request.get_json():
            name = request.get_json()[PlaygroundField.NAME]
    except KeyError as e:
        logging.error(e)
        return make_response("Unprocessable entity", 422)

    playground_lst = playgrounds.filter(Playground(name=name, owner=owner), sorted=True)
    if not playground_lst:
        return make_response("Not found", 401)

    return jsonify(playground_lst), 200

def create_playground():    
    try:
        owner = request.get_json()[PlaygroundField.OWNER]
        name = request.get_json()[PlaygroundField.NAME]
        canvas = request.get_json()[PlaygroundField.CANVAS]

        if PlaygroundField.NAME in request.get_json():
            name = request.get_json()[PlaygroundField.NAME]
        if PlaygroundField.OWNER in request.get_json():
            owner = request.get_json()[PlaygroundField.OWNER]
        if PlaygroundField.CANVAS in request.get_json():
            canvas = request.get_json()[PlaygroundField.CANVAS]

    except KeyError as e:
        logging.error(e)
        return make_response("Unprocessable entity", 422)
    
    if playgrounds.filter(Playground(name=name,owner=owner,canvas=canvas)):
        logging.error("create_playground(): duplicate playground")
        return make_response("Forbidden", 403)

    playground = playgrounds.create(Playground(_id=uuid4().hex, name=name, owner=owner, canvas=canvas))
    if playground == None:
        return make_response("Server error", 500)
    
    return make_response("Created", 200)

def update_playground():    
    try:
        owner = request.get_json()[PlaygroundField.OWNER]
        name = request.get_json()[PlaygroundField.NAME]
        canvas = request.get_json()[PlaygroundField.CANVAS]

        if PlaygroundField.NAME in request.get_json():
            name = request.get_json()[PlaygroundField.NAME]
        if PlaygroundField.OWNER in request.get_json():
            owner = request.get_json()[PlaygroundField.OWNER]
        if PlaygroundField.CANVAS in request.get_json():
            canvas = request.get_json()[PlaygroundField.CANVAS]
    
    except KeyError as e:
        logging.error(e)
        return make_response("Unprocessable entity", 422)

    # FIXME: Given the id, we must make sure the fragment exists.
    # if not fragments.filter(Fragment(author=author, title=title, editor=editor, name=name)):
    #     logging.error("revise_fragment(): fragment does not exist")
    #     return make_response("Forbidden", 403)

    playground = playgrounds.update(Playground(owner=owner, name=name, canvas=canvas))
    if playground == None:
        return make_response("Server error", 500)

    return make_response("Revised", 200)

def delete_playground():
    try:
        owner = request.get_json()[PlaygroundField.OWNER]
        name = request.get_json()[PlaygroundField.NAME]
    except KeyError as e:
        logging.error(e)
        return make_response("Unprocessable entity", 422)
    playground = playgrounds.delete(Playground(owner=owner, name=name))

    if playground:
        return make_response("OK", 200)
    else:
        return make_response("Not found", 401)
