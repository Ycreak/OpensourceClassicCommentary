from flask import request, make_response
import logging
from flask_jsonpify import jsonify
from uuid import uuid4

from couch import CouchAuthenticator
from models.text import Text, TextModel, TextField

texts = TextModel(CouchAuthenticator().couch)

def get_author_text():
    author = None
    title = None

    try:
        if TextField.AUTHOR in request.get_json():
            author = request.get_json()[TextField.AUTHOR]
        if TextField.TITLE in request.get_json():
            title = request.get_json()[TextField.TITLE]

    except KeyError as e:
        logging.error(e)
        return make_response("Unprocessable entity", 422)
    text_lst = texts.filter(Text(author=author, title=title), sorted=True)
    if not text_lst:
        return make_response("Not found", 401)
    return jsonify(sorted(set([text.author for text in text_lst]))), 200

def get_title_text():
    author = None
    title = None

    try:
        if TextField.AUTHOR in request.get_json():
            author = request.get_json()[TextField.AUTHOR]
        if TextField.TITLE in request.get_json():
            title = request.get_json()[TextField.TITLE]

    except KeyError as e:
        logging.error(e)
        return make_response("Unprocessable entity", 422)
    text_lst = texts.filter(Text(author=author, title=title), sorted=True)
    if not text_lst:
        return make_response("Not found", 401)
    return jsonify(sorted(set([text.title for text in text_lst]))), 200

def get_text():
    author = None
    title = None

    try:
        if TextField.AUTHOR in request.get_json():
            author = request.get_json()[TextField.AUTHOR]
        if TextField.TITLE in request.get_json():
            title = request.get_json()[TextField.TITLE]

    except KeyError as e:
        logging.error(e)
        return make_response("Unprocessable entity", 422)
    
    text_lst = texts.filter(Text(author=author, title=title), sorted=True)
    if not text_lst:
        return make_response("Not found", 401)

    return jsonify(text_lst), 200

def create_text():    
    try:
        author = request.get_json()[TextField.AUTHOR]
        title = request.get_json()[TextField.TITLE]

        translation = None
        text = None
        apparatus = None
        linked_documents = None

        if TextField.TEXT in request.get_json():
            text = request.get_json()[TextField.TEXT]
        if TextField.TRANSLATION in request.get_json():
            translation = request.get_json()[TextField.TRANSLATION]
        if TextField.APPARATUS in request.get_json():
            apparatus = request.get_json()[TextField.APPARATUS]
        if TextField.LINKED_DOCUMENTS in request.get_json():
            linked_documents = request.get_json()[TextField.LINKED_DOCUMENTS]

    except KeyError as e:
        logging.error(e)
        return make_response("Unprocessable entity", 422)
    
    if texts.filter(Text(author=author, title=title)):
        logging.error("create_text(): duplicate text")
        return make_response("Forbidden", 403)

    text = texts.create(Text(_id=uuid4().hex, author=author, title=title, apparatus=apparatus, linked_documents=linked_documents,
                                         translation=translation, text=text))
    if text == None:
        return make_response("Server error", 500)
    
    return make_response("Created", 200)


def update_text():    
    try:
        _id = request.get_json()[TextField.ID]
        author = request.get_json()[TextField.AUTHOR]
        title = request.get_json()[TextField.TITLE]

        translation = None
        text = None
        apparatus = None
        linked_documents = None

        if TextField.TEXT in request.get_json():
            text = request.get_json()[TextField.TEXT]
        if TextField.TRANSLATION in request.get_json():
            translation = request.get_json()[TextField.TRANSLATION]
        if TextField.APPARATUS in request.get_json():
            apparatus = request.get_json()[TextField.APPARATUS]
        if TextField.LINKED_DOCUMENTS in request.get_json():
            linked_documents = request.get_json()[TextField.LINKED_DOCUMENTS]
       
       
    except KeyError as e:
        logging.error(e)
        return make_response("Unprocessable entity", 422)
    
    text = texts.update(Text(_id=_id, author=author, title=title, apparatus=apparatus, linked_documents=linked_documents, translation=translation, 
                                       text=text))
    if text == None:
        return make_response("Server error", 500)

    return make_response("Revised", 200)

def delete_text():

    try:
        author = request.get_json()[TextField.AUTHOR]
        title = request.get_json()[TextField.TITLE]

    except KeyError as e:
        logging.error(e)
        return make_response("Unprocessable entity", 422)
    text = texts.delete(Text(author=author, title=title))


    if text:
        return make_response("OK", 200)
    else:
        return make_response("Not found", 401)
