"""
This endpoint handles all document types. At the moment, we support the following:
    fragments
    testimonia
    playgrounds
These are differentiated via the 'type' parameter. This endpoint checks the incoming
document type and redirects the document to the correct endpoint.
"""
import logging
from flask import request, make_response
from flask_jsonpify import jsonify

from couch import CouchAuthenticator
import utilities as util
from models.introduction import Introduction
from models.fragment import Fragment
from models.testimonium import Testimonium

list_display_cache_file: str = "cache/list_display.json"

def get_index():
    result = util.read_json(list_display_cache_file)
    return jsonify(result)

def update_index():
    #TODO:
    pass

def get_document():
    """
    Get the given document. First we check what document type we received. Based on the type,
    different documents can be retrieved. This is handled by the switch statement.
    """
    try:
        document_type: str = request.get_json()["document_type"]
    except KeyError as e:
        logging.error(e)
        return make_response("Unprocessable entity", 422)
   
    match document_type:
        case "fragment":
            fragment = Fragment(CouchAuthenticator().couch)
            list_with_documents: list = fragment.get(request.get_json())
        case "testimonium":
            testimonium = Testimonium(CouchAuthenticator().couch)
            list_with_documents: list = testimonium.get(request.get_json())
        case "introduction":
            introduction = Introduction(CouchAuthenticator().couch)
            list_with_documents: list = introduction.get(request.get_json())
        # If an exact match is not confirmed, this last case will be used if provided
        case _:
            logging.error(f"Unknown document type provided: {document_type}")
            return make_response("Unprocessable entity", 422)

    return jsonify(list_with_documents), 200 if list_with_documents else make_response("Not found", 401)
    

def create_document() -> make_response:    
    """
    Create the given document. First we check what document type we received. Based on the type,
    different documents can be created. This is handled by the switch statement.
    """
    try:
        document_type: str = request.get_json()["document_type"]
    except KeyError as e:
        logging.error(e)
        return make_response("Unprocessable entity", 422)
   
    match document_type:
        case "fragment":
            fragment = Fragment(CouchAuthenticator().couch)
            doc_id: str = fragment.create(request.get_json())
        case "testimonium":
            testimonium = Testimonium(CouchAuthenticator().couch)
            doc_id: str = testimonium.create(request.get_json())
        case "introduction":
            introduction = Introduction(CouchAuthenticator().couch)
            doc_id: str = introduction.create(request.get_json())
        # If an exact match is not confirmed, this last case will be used if provided
        case _:
            logging.error(f"Unknown document type provided: {document_type}")
            return make_response("Unprocessable entity", 422)

    update_index()
    return make_response("Create success", 200) if doc_id else make_response("Unprocessable entity", 422)


def delete_document() -> make_response:
    """
    Delete the given document. First we check what document type we received. Based on the type,
    different documents can be deleted. This is handled by the switch statement.
    """
    try:
        document_type: str = request.get_json()["document_type"]
    except KeyError as e:
        logging.error(e)
        return make_response("Unprocessable entity", 422)
   
    match document_type:
        case "fragment":
            fragment = Fragment(CouchAuthenticator().couch)
            success: bool = fragment.delete(request.get_json())
        case "testimonium":
            testimonium = Testimonium(CouchAuthenticator().couch)
            success: bool = testimonium.delete(request.get_json())
        case "introduction":
            introduction = Introduction(CouchAuthenticator().couch)
            success: bool = introduction.delete(request.get_json())
        # If an exact match is not confirmed, this last case will be used if provided
        case _:
            logging.error(f"Unknown document type provided: {document_type}")
            return make_response("Unprocessable entity", 422)

    update_index()
    return make_response("Delete success", 200) if success else make_response("Unprocessable entity", 422)


def update_document() -> make_response:
    """
    Update the given document. First we check what document type we received. Based on the type,
    different documents can be updated. This is handled by the switch statement.
    """
    try:
        document_type: str = request.get_json()["document_type"]
    except KeyError as e:
        logging.error(e)
        return make_response("Unprocessable entity", 422)
   
    match document_type:
        case "fragment":
            fragment = Fragment(CouchAuthenticator().couch)
            success: bool = fragment.update(request.get_json())
        case "testimonium":
            return "Not found"
        case "introduction":
            introduction = Introduction(CouchAuthenticator().couch)
            success: bool = introduction.update(request.get_json())
        # If an exact match is not confirmed, this last case will be used if provided
        case _:
            logging.error(f"Unknown document type provided: {document_type}")
            return make_response("Unprocessable entity", 422)

    update_index()
    return make_response("Update success", 200) if success else make_response("Unprocessable entity", 422)

