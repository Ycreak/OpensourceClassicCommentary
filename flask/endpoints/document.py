"""
This endpoint handles all document types. At the moment, we support the following:
    introductions
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

from database import Database
from models.introduction import Introduction
from models.fragment import Fragment
from models.testimonium import Testimonium
from models.playground import Playground

index_file: str = "cache/index.json"
index: list = []

# Initialize all document types
database = Database(CouchAuthenticator().couch)
introduction = Introduction(CouchAuthenticator().couch)
fragment = Fragment(CouchAuthenticator().couch)
playground = Playground(CouchAuthenticator().couch)
testimonium = Testimonium(CouchAuthenticator().couch)

def get_index() -> object:
    """ Reads the cache file and returns it """
    return jsonify(util.read_json(index_file))

def update_index() -> None:
    """ Updates the index file and writes it to the cache """
    documents: list = database.filter({})
    index: list = []
    for doc in documents:
        try:
            match doc["document_type"]:
                case "introduction":
                    index.append({
                        "document_type": "introduction", 
                        "author": doc["author"], 
                        "title": doc["title"],
                        "sandbox": doc["sandbox"]
                    })
                case "fragment":
                    index.append({
                        "document_type": "fragment", 
                        "author": doc["author"], 
                        "title": doc["title"], 
                        "editor": doc["editor"], 
                        "name": doc["name"],
                        "sandbox": doc["sandbox"]
                    })
                case "playground":
                    index.append({
                        "document_type": "playground", 
                        "_id": doc["_id"], 
                        "name": doc["name"], 
                        "created_by": doc["created_by"], 
                        "users": doc["users"],
                        "sandbox": doc["sandbox"]
                    })
                case "testimonium":
                    index.append({
                        "document_type": "testimonium", 
                        "author": doc["author"], 
                        "title": doc["title"], 
                        "editor": doc["editor"], 
                        "name": doc["name"], 
                        "witness": doc["witness"],
                        "sandbox": doc["sandbox"]
                    })
                case _:
                    logging.error(f"Unknown document type: {doc}")
        except Exception as e:
            logging.error(f"Cannot index document. Error in document: {doc.id}")
    util.write_json(index, index_file)

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
        case "introduction":
            list_with_documents: list = introduction.get(request.get_json())
        case "fragment":
            list_with_documents: list = fragment.get(request.get_json())
        case "playground":
            list_with_documents: list = playground.get(request.get_json())
        case "testimonium":
            list_with_documents: list = testimonium.get(request.get_json())
        case _:
            logging.error(f"Unknown document type provided: {document_type}")
            return make_response("Unprocessable entity", 422)

    logging.error(f"Returning documents: {list_with_documents}")

    return jsonify(list_with_documents), 200
# if list_with_documents else make_response("Not found", 401)

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
        case "introduction":
            doc_id: str = introduction.create(request.get_json())
        case "fragment":
            doc_id: str = fragment.create(request.get_json())
        case "playground":
            doc_id: str = playground.create(request.get_json())
        case "testimonium":
            doc_id: str = testimonium.create(request.get_json())
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
        case "introduction":
            success: bool = introduction.delete(request.get_json())
        case "fragment":
            success: bool = fragment.delete(request.get_json())
        case "playground":
            success: bool = playground.delete(request.get_json())
        case "testimonium":
            success: bool = testimonium.delete(request.get_json())
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
        case "introduction":
            success: bool = introduction.update(request.get_json())
        case "fragment":
            success: bool = fragment.update(request.get_json())
        case "playground":
            success: bool = playground.update(request.get_json())
        case "testimonium":
            success: bool = testimonium.update(request.get_json())
        # If an exact match is not confirmed, this last case will be used if provided
        case _:
            logging.error(f"Unknown document type provided: {document_type}")
            return make_response("Unprocessable entity", 422)

    update_index()
    return make_response("Update success", 200) if success else make_response("Unprocessable entity", 422)

