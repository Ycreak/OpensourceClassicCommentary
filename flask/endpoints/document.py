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
from flask import Blueprint, request, make_response, Response
from flask_jsonpify import jsonify

import common.utilities as util
from common.couch import CouchConnection

from models.introduction import Introduction
from models.fragment import Fragment
from models.testimonium import Testimonium
from models.playground import Playground

# Initialize the Blueprint
document_blueprint = Blueprint("document_blueprint", __name__)

index_file: str = "cache/index.json"
index: list = []

couch_server = CouchConnection.connect()
introduction = Introduction(couch_server)
fragment = Fragment(couch_server)
playground = Playground(couch_server)
testimonium = Testimonium(couch_server)


@document_blueprint.route("/index", methods=["POST"])
def get_index() -> Response:
    """
    Reads the cached index file and returns items filtered by the requested sandbox.
    """
    try:
        data = request.get_json()
        target_sandbox = data.get("sandbox")

        if not target_sandbox:
            return make_response("No sandbox received.", 422)

        full_index: list = util.read_json(index_file)

        # Filter the index based on the provided sandbox string
        filtered_index = [
            obj for obj in full_index if obj.get("sandbox") == target_sandbox
        ]

        return jsonify(filtered_index)

    except Exception as e:
        logging.error(f"get_index(): {e}")
        return make_response("Server error", 500)


@document_blueprint.route("/update_index", methods=["POST"])
def update_index() -> Response:
    """
    Updates the index file by gathering index data from all model handlers
    and writing the consolidated list to the cache.

    Returns:
        Response: 200 OK on successful write, or 500 on server error.
    """
    try:
        combined_index: list = []

        combined_index.extend(introduction.index())
        combined_index.extend(fragment.index())
        combined_index.extend(playground.index())
        combined_index.extend(testimonium.index())

        # Write the consolidated list to your JSON cache file
        util.write_json(combined_index, index_file)

        logging.info(
            f"Index updated successfully with {len(combined_index)} documents."
        )
        return make_response("Index Updated", 200)

    except Exception as e:
        logging.error(f"update_index(): Failed to update index file. Error: {e}")
        return make_response("Internal Server Error", 500)


@document_blueprint.route("/get", methods=["POST"])
def get_document():
    """
    Get the given document based on the 'document_type' parameter.
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

    return jsonify(list_with_documents), 200


@document_blueprint.route("/create", methods=["POST"])
def create_document() -> Response:
    """
    Create the given document.
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
        case _:
            logging.error(f"Unknown document type provided: {document_type}")
            return make_response("Unprocessable entity", 422)

    update_index()
    return (
        make_response("Create success", 200)
        if doc_id
        else make_response("Unprocessable entity", 422)
    )


@document_blueprint.route("/delete", methods=["POST"])
def delete_document() -> Response:
    """
    Delete the given document.
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
        case _:
            logging.error(f"Unknown document type provided: {document_type}")
            return make_response("Unprocessable entity", 422)

    update_index()
    return (
        make_response("Delete success", 200)
        if success
        else make_response("Unprocessable entity", 422)
    )


@document_blueprint.route("/update", methods=["POST"])
def update_document() -> Response:
    """
    Update the given document.
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
        case _:
            logging.error(f"Unknown document type provided: {document_type}")
            return make_response("Unprocessable entity", 422)

    update_index()
    return (
        make_response("Update success", 200)
        if success
        else make_response("Unprocessable entity", 422)
    )
