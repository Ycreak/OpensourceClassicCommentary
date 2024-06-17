from flask import request, make_response
import logging
from flask_jsonpify import jsonify
from uuid import uuid4

from couch import CouchAuthenticator
from models.introduction import Introduction, IntroductionModel, IntroductionField

introductions = IntroductionModel(CouchAuthenticator().couch)

def get_author_introduction():
    author = None
    title = None
    text = None

    try:
        if IntroductionField.AUTHOR in request.get_json():
            author = request.get_json()[IntroductionField.AUTHOR]
        if IntroductionField.TITLE in request.get_json():
            title = request.get_json()[IntroductionField.TITLE]
        if IntroductionField.TEXT in request.get_json():
            text = request.get_json()[IntroductionField.TEXT]

    except KeyError as e:
        logging.error(e)
        return make_response("Unprocessable entity", 422)
    introduction_lst = introductions.filter(Introduction(author=author, title=title, text=text), sorted=True)
    if not introduction_lst:
        return make_response("Not found", 401)
    return jsonify(sorted(set([introduction.author for introduction in introduction_lst]))), 200

def get_title_introduction():
    author = None
    title = None
    text = None

    try:
        if IntroductionField.AUTHOR in request.get_json():
            author = request.get_json()[IntroductionField.AUTHOR]
        if IntroductionField.TITLE in request.get_json():
            title = request.get_json()[IntroductionField.TITLE]
        if IntroductionField.TEXT in request.get_json():
            text = request.get_json()[IntroductionField.TEXT]

    except KeyError as e:
        logging.error(e)
        return make_response("Unprocessable entity", 422)
    introduction_lst = introductions.filter(Introduction(author=author, title=title, text=text), sorted=True)
    if not introduction_lst:
        return make_response("Not found", 401)
    return jsonify(sorted(set([introduction.title for introduction in introduction_lst]))), 200

def get_text_introduction():
    author = None
    title = None
    text = None

    try:
        if IntroductionField.AUTHOR in request.get_json():
            author = request.get_json()[IntroductionField.AUTHOR]
        if IntroductionField.TITLE in request.get_json():
            title = request.get_json()[IntroductionField.TITLE]
        if IntroductionField.TEXT in request.get_json():
            text = request.get_json()[IntroductionField.text]

    except KeyError as e:
        logging.error(e)
        return make_response("Unprocessable entity", 422)
    introduction_lst = introductions.filter(Introduction(author=author, title=title, text=text), sorted=True)
    if not introduction_lst:
        return make_response("Not found", 401)
    return jsonify(sorted(set([introduction.text for introduction in introduction_lst]))), 200

def get_introduction():
    author = None
    title = None
    text = None

    try:
        if IntroductionField.AUTHOR in request.get_json():
            author = request.get_json()[IntroductionField.AUTHOR]
        if IntroductionField.TITLE in request.get_json():
            title = request.get_json()[IntroductionField.TITLE]

    except KeyError as e:
        logging.error(e)
        return make_response("Unprocessable entity", 422)
    
    introduction_lst = introductions.filter(Introduction(author=author, title=title), sorted=True)
    if not introduction_lst:
        return make_response("Not found", 401)

    return jsonify(introduction_lst[0]), 200

def create_introduction():    
    try:
        author = request.get_json()[IntroductionField.AUTHOR]
        title = request.get_json()[IntroductionField.TITLE]
        text = request.get_json()[IntroductionField.TEXT]

    except KeyError as e:
        logging.error(e)
        return make_response("Unprocessable entity", 422)
    
    if introductions.filter(Introduction(author=author, title=title, text=text)):
        logging.error("create_introduction(): duplicate introduction")
        return make_response("Forbidden", 403)

    introduction = introductions.create(Introduction(_id=uuid4().hex, author=author, title=title, text=text))
    if introduction == None:
        return make_response("Server error", 500)
   
    return make_response("Created", 200)


def update_introduction():    
    try:
        _id = request.get_json()[IntroductionField.ID]
        author = request.get_json()[IntroductionField.AUTHOR]
        title = request.get_json()[IntroductionField.TITLE]
        text = request.get_json()[IntroductionField.TEXT]
       
    except KeyError as e:
        logging.error(e)
        return make_response("Unprocessable entity", 422)
    
    introduction = introductions.update(Introduction(_id=_id, author=author, title=title, text=text))
    if introduction == None:
        return make_response("Server error", 500)
    
    return make_response("Revised", 200)

def delete_introduction():
    try:
        author = request.get_json()[IntroductionField.AUTHOR]
        title = request.get_json()[IntroductionField.TITLE]
        text = request.get_json()[IntroductionField.TEXT]
    except KeyError as e:
        logging.error(e)
        return make_response("Unprocessable entity", 422)
    introduction = introductions.delete(Introduction(author=author, title=title, text=text))


    if introduction:
        return make_response("OK", 200)
    else:
        return make_response("Not found", 401)
