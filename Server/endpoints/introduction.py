import copy

from flask import request, make_response
import logging
from flask_jsonpify import jsonify
from uuid import uuid4

from couch import CouchAuthenticator
import utilities as util
from models.playground import Introduction, IntroductionModel, IntroductionField

introductions = IntroductionModel(CouchAuthenticator().couch)

def get_introductions():
    try:
        author = request.get_json()[IntroductionField.AUTHOR]
        if IntroductionField.title in request.get_json():
            title = request.get_json()[IntroductionField.title]
        else:
            title = '';
    except KeyError as e:
        logging.error(e)
        return make_response("Unprocessable entity", 422)
    introduction_lst = introductions.filter(Introduction(author=author, title=title), sorted=True)
    if not introduction_lst:
        return make_response("Not found", 401)
    return jsonify(introduction_lst), 200

# def get_playground():
    # owner = None
    # name = None
    # try:
        # if PlaygroundField.OWNER in request.get_json():
            # owner = request.get_json()[PlaygroundField.OWNER]
        # if PlaygroundField.NAME in request.get_json():
            # name = request.get_json()[PlaygroundField.NAME]
    # except KeyError as e:
        # logging.error(e)
        # return make_response("Unprocessable entity", 422)

    # playground_lst = playgrounds.filter(Playground(name=name, owner=owner), sorted=True)
    # if not playground_lst:
        # return make_response("Not found", 401)

    # print(playground_lst)

    # return jsonify(playground_lst), 200

# def create_playground():    
    # try:
        # owner = request.get_json()[PlaygroundField.OWNER]
        # name = request.get_json()[PlaygroundField.NAME]
        # canvas = request.get_json()[PlaygroundField.CANVAS]

        # if PlaygroundField.NAME in request.get_json():
            # name = request.get_json()[PlaygroundField.NAME]
        # if PlaygroundField.OWNER in request.get_json():
            # owner = request.get_json()[PlaygroundField.OWNER]
        # if PlaygroundField.CANVAS in request.get_json():
            # canvas = request.get_json()[PlaygroundField.CANVAS]

    # except KeyError as e:
        # logging.error(e)
        # return make_response("Unprocessable entity", 422)
    
    # if playgrounds.filter(Playground(name=name,owner=owner)):
        # logging.error("create_playground(): duplicate playground")
        # return make_response("Forbidden", 403)

    # playground = playgrounds.create(Playground(_id=uuid4().hex, name=name, owner=owner, canvas=canvas))
    # if playground == None:
        # return make_response("Server error", 500)
    
    # return make_response("Created", 200)

# def update_playground():    
    # try:
        # _id = request.get_json()[PlaygroundField.ID]
        # canvas = request.get_json()[PlaygroundField.CANVAS]

        # if PlaygroundField.ID in request.get_json():
            # _id = request.get_json()[PlaygroundField.ID]
        # if PlaygroundField.CANVAS in request.get_json():
            # canvas = request.get_json()[PlaygroundField.CANVAS]
    
    # except KeyError as e:
        # logging.error(e)
        # return make_response("Unprocessable entity", 422)

    # playground = playgrounds.update(Playground(_id=_id, canvas=canvas))
    # if playground == None:
        # return make_response("Server error", 500)

    # return make_response("Revised", 200)

# def delete_playground():
    # try:
        # _id = request.get_json()[PlaygroundField.ID]
    # except KeyError as e:
        # logging.error(e)
        # return make_response("Unprocessable entity", 422)
    # playground = playgrounds.delete(Playground(_id=_id))

    # if playground:
        # return make_response("OK", 200)
    # else:
        # return make_response("Not found", 401)
