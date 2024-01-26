from flask import request, make_response
import logging
from flask_jsonpify import jsonify
from uuid import uuid4

from couch import CouchAuthenticator
from models.broader_context import BroaderContext, BroaderContextModel, BroaderContextField

broader_contexts = BroaderContextModel(CouchAuthenticator().couch)

def get_author_broader_context():
    author = None
    title = None

    try:
        if BroaderContextField.AUTHOR in request.get_json():
            author = request.get_json()[BroaderContextField.AUTHOR]
        if BroaderContextField.TITLE in request.get_json():
            title = request.get_json()[BroaderContextField.TITLE]

    except KeyError as e:
        logging.error(e)
        return make_response("Unprocessable entity", 422)
    broader_context_lst = broader_contexts.filter(BroaderContext(author=author, title=title), sorted=True)
    if not broader_context_lst:
        return make_response("Not found", 401)
    return jsonify(sorted(set([broader_context.author for broader_context in broader_context_lst]))), 200

def get_title_broader_context():
    author = None
    title = None

    try:
        if BroaderContextField.AUTHOR in request.get_json():
            author = request.get_json()[BroaderContextField.AUTHOR]
        if BroaderContextField.TITLE in request.get_json():
            title = request.get_json()[BroaderContextField.TITLE]

    except KeyError as e:
        logging.error(e)
        return make_response("Unprocessable entity", 422)
    broader_context_lst = broader_contexts.filter(BroaderContext(author=author, title=title), sorted=True)
    if not broader_context_lst:
        return make_response("Not found", 401)
    return jsonify(sorted(set([broader_context.title for broader_context in broader_context_lst]))), 200

def get_broader_context():
    author = None
    title = None

    try:
        if BroaderContextField.AUTHOR in request.get_json():
            author = request.get_json()[BroaderContextField.AUTHOR]
        if BroaderContextField.TITLE in request.get_json():
            title = request.get_json()[BroaderContextField.TITLE]

    except KeyError as e:
        logging.error(e)
        return make_response("Unprocessable entity", 422)
    
    broader_context_lst = broader_contexts.filter(BroaderContext(author=author, title=title), sorted=True)
    if not broader_context_lst:
        return make_response("Not found", 401)

    return jsonify(broader_context_lst), 200

def create_broader_context():    
    try:
        author = request.get_json()[BroaderContextField.AUTHOR]
        title = request.get_json()[BroaderContextField.TITLE]

        translation = None
        text = None
        apparatus = None
        linked_documents = None

        if BroaderContextField.TEXT in request.get_json():
            text = request.get_json()[BroaderContextField.TEXT]
        if BroaderContextField.TRANSLATION in request.get_json():
            translation = request.get_json()[BroaderContextField.TRANSLATION]
        if BroaderContextField.APPARATUS in request.get_json():
            apparatus = request.get_json()[BroaderContextField.APPARATUS]
        if BroaderContextField.LINKED_DOCUMENTS in request.get_json():
            linked_documents = request.get_json()[BroaderContextField.LINKED_DOCUMENTS]

    except KeyError as e:
        logging.error(e)
        return make_response("Unprocessable entity", 422)
    
    if broader_contexts.filter(BroaderContext(author=author, title=title)):
        logging.error("create_broader_context(): duplicate broader_context")
        return make_response("Forbidden", 403)

    broader_context = broader_contexts.create(BroaderContext(_id=uuid4().hex, author=author, title=title, apparatus=apparatus, linked_documents=linked_documents,
                                         translation=translation, text=text))
    if broader_context == None:
        return make_response("Server error", 500)
    
    return make_response("Created", 200)


def update_broader_context():    
    try:
        _id = request.get_json()[BroaderContextField.ID]
        author = request.get_json()[BroaderContextField.AUTHOR]
        title = request.get_json()[BroaderContextField.TITLE]

        translation = None
        text = None
        apparatus = None
        linked_documents = None

        if BroaderContextField.TEXT in request.get_json():
            text = request.get_json()[BroaderContextField.TEXT]
        if BroaderContextField.TRANSLATION in request.get_json():
            translation = request.get_json()[BroaderContextField.TRANSLATION]
        if BroaderContextField.APPARATUS in request.get_json():
            apparatus = request.get_json()[BroaderContextField.APPARATUS]
        if BroaderContextField.LINKED_DOCUMENTS in request.get_json():
            linked_documents = request.get_json()[BroaderContextField.LINKED_DOCUMENTS]
       
       
    except KeyError as e:
        logging.error(e)
        return make_response("Unprocessable entity", 422)
    
    broader_context = broader_contexts.update(BroaderContext(_id=_id, author=author, title=title, apparatus=apparatus, linked_documents=linked_documents, translation=translation, 
                                       text=text))
    if broader_context == None:
        return make_response("Server error", 500)

    return make_response("Revised", 200)

def delete_broader_context():

    try:
        author = request.get_json()[BroaderContextField.AUTHOR]
        title = request.get_json()[BroaderContextField.TITLE]

    except KeyError as e:
        logging.error(e)
        return make_response("Unprocessable entity", 422)
    broader_context = broader_contexts.delete(BroaderContext(author=author, title=title))


    if broader_context:
        return make_response("OK", 200)
    else:
        return make_response("Not found", 401)
