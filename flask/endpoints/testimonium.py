from flask import request, make_response
import logging
from flask_jsonpify import jsonify
from uuid import uuid4

from couch import CouchAuthenticator
from models.testimonium import Testimonium, TestimoniumModel, TestimoniumField

testimoniums = TestimoniumModel(CouchAuthenticator().couch)

def get_author_testimonium():
    author = None
    title = None
    witness = None
    name = None
    try:
        if TestimoniumField.AUTHOR in request.get_json():
            author = request.get_json()[TestimoniumField.AUTHOR]
        if TestimoniumField.TITLE in request.get_json():
            title = request.get_json()[TestimoniumField.TITLE]
        if TestimoniumField.WITNESS in request.get_json():
            witness = request.get_json()[TestimoniumField.WITNESS]
        if TestimoniumField.NAME in request.get_json():
            name = request.get_json()[TestimoniumField.NAME]
    except KeyError as e:
        logging.error(e)
        return make_response("Unprocessable entity", 422)
    testimonium_lst = testimoniums.filter(Testimonium(author=author, title=title, witness=witness, name=name), sorted=True)
    if not testimonium_lst:
        return make_response("Not found", 401)
    return jsonify(sorted(set([testimonium.author for testimonium in testimonium_lst]))), 200

def get_title_testimonium():
    author = None
    title = None
    witness = None
    name = None

    try:
        if TestimoniumField.AUTHOR in request.get_json():
            author = request.get_json()[TestimoniumField.AUTHOR]
        if TestimoniumField.TITLE in request.get_json():
            title = request.get_json()[TestimoniumField.TITLE]
        if TestimoniumField.WITNESS in request.get_json():
            witness = request.get_json()[TestimoniumField.WITNESS]
        if TestimoniumField.NAME in request.get_json():
            name = request.get_json()[TestimoniumField.NAME]
    except KeyError as e:
        logging.error(e)
        return make_response("Unprocessable entity", 422)
    testimonium_lst = testimoniums.filter(Testimonium(author=author, title=title, witness=witness, name=name), sorted=True)
    if not testimonium_lst:
        return make_response("Not found", 401)
    return jsonify(sorted(set([testimonium.title for testimonium in testimonium_lst]))), 200

def get_witness_testimonium():
    author = None
    title = None
    witness = None
    name = None

    try:
        if TestimoniumField.AUTHOR in request.get_json():
            author = request.get_json()[TestimoniumField.AUTHOR]
        if TestimoniumField.TITLE in request.get_json():
            title = request.get_json()[TestimoniumField.TITLE]
        if TestimoniumField.WITNESS in request.get_json():
            witness = request.get_json()[TestimoniumField.WITNESS]
        if TestimoniumField.NAME in request.get_json():
            name = request.get_json()[TestimoniumField.NAME]
    except KeyError as e:
        logging.error(e)
        return make_response("Unprocessable entity", 422)
    testimonium_lst = testimoniums.filter(Testimonium(author=author, title=title, witness=witness, name=name), sorted=True)
    if not testimonium_lst:
        return make_response("Not found", 401)
    return jsonify(sorted(set([testimonium.witness for testimonium in testimonium_lst]))), 200

def get_name_testimonium():
    author = None
    title = None
    witness = None
    name = None

    try:
        if TestimoniumField.AUTHOR in request.get_json():
            author = request.get_json()[TestimoniumField.AUTHOR]
        if TestimoniumField.TITLE in request.get_json():
            title = request.get_json()[TestimoniumField.TITLE]
        if TestimoniumField.WITNESS in request.get_json():
            witness = request.get_json()[TestimoniumField.WITNESS]
        if TestimoniumField.NAME in request.get_json():
            name = request.get_json()[TestimoniumField.NAME]
    except KeyError as e:
        logging.error(e)
        return make_response("Unprocessable entity", 422)
    testimonium_lst = testimoniums.filter(Testimonium(author=author, title=title, witness=witness, name=name), sorted=True)
    if not testimonium_lst:
        return make_response("Not found", 401)
    return jsonify(list(set([testimonium.name for testimonium in testimonium_lst]))), 200

def get_testimonium():
    author = None
    title = None
    witness = None
    name = None

    try:
        if TestimoniumField.AUTHOR in request.get_json():
            author = request.get_json()[TestimoniumField.AUTHOR]
        if TestimoniumField.TITLE in request.get_json():
            title = request.get_json()[TestimoniumField.TITLE]
        if TestimoniumField.WITNESS in request.get_json():
            witness = request.get_json()[TestimoniumField.WITNESS]
        if TestimoniumField.NAME in request.get_json():
            name = request.get_json()[TestimoniumField.NAME]
    except KeyError as e:
        logging.error(e)
        return make_response("Unprocessable entity", 422)
    
    testimonium_lst = testimoniums.filter(Testimonium(author=author, title=title, witness=witness, name=name), sorted=True)
    if not testimonium_lst:
        return make_response("Not found", 401)

    return jsonify(testimonium_lst), 200

def create_testimonium():    
    try:
        author = request.get_json()[TestimoniumField.AUTHOR]
        title = request.get_json()[TestimoniumField.TITLE]
        witness = request.get_json()[TestimoniumField.WITNESS]
        name = request.get_json()[TestimoniumField.NAME]

        translation = None
        text = None

        if TestimoniumField.TEXT in request.get_json():
            text = request.get_json()[TestimoniumField.TEXT]
        if TestimoniumField.TRANSLATION in request.get_json():
            translation = request.get_json()[TestimoniumField.TRANSLATION]

    except KeyError as e:
        logging.error(e)
        return make_response("Unprocessable entity", 422)
    
    if testimoniums.filter(Testimonium(author=author, title=title, witness=witness, name=name)):
        logging.error("create_testimonium(): duplicate testimonium")
        return make_response("Forbidden", 403)

    testimonium = testimoniums.create(Testimonium(_id=uuid4().hex, author=author, title=title, witness=witness, name=name,
                                         translation=translation, text=text))
    if testimonium == None:
        return make_response("Server error", 500)
    
    return make_response("Created", 200)


def update_testimonium():    
    try:
        _id = request.get_json()[TestimoniumField.ID]
        author = request.get_json()[TestimoniumField.AUTHOR]
        title = request.get_json()[TestimoniumField.TITLE]
        witness = request.get_json()[TestimoniumField.WITNESS]
        name = request.get_json()[TestimoniumField.NAME]

        translation = None
        text = None

        if TestimoniumField.TEXT in request.get_json():
            text = request.get_json()[TestimoniumField.TEXT]
        if TestimoniumField.TRANSLATION in request.get_json():
            translation = request.get_json()[TestimoniumField.TRANSLATION]
       
       
    except KeyError as e:
        logging.error(e)
        return make_response("Unprocessable entity", 422)
    
    testimonium = testimoniums.update(Testimonium(_id=_id, author=author, title=title, witness=witness, name=name, translation=translation, 
                                       text=text))
    if testimonium == None:
        return make_response("Server error", 500)

    return make_response("Revised", 200)

def delete_testimonium():

    try:
        author = request.get_json()[TestimoniumField.AUTHOR]
        title = request.get_json()[TestimoniumField.TITLE]
        witness = request.get_json()[TestimoniumField.WITNESS]
        name = request.get_json()[TestimoniumField.NAME]
    except KeyError as e:
        logging.error(e)
        return make_response("Unprocessable entity", 422)
    testimonium = testimoniums.delete(Testimonium(author=author, title=title, witness=witness, name=name))


    if testimonium:
        return make_response("OK", 200)
    else:
        return make_response("Not found", 401)
