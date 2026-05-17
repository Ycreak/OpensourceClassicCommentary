"""
This endpoint handles all document types. At the moment, we support the following:
    introductions
    fragments
    testimonia
    playgrounds
"""

import logging
import os
from flask import Blueprint, request, make_response, Response
from flask_jsonpify import jsonify

import common.utilities as util
from common.couch import CouchConnection
from common.validation import DocumentRequest, parse_document_request

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


def _model_for(parsed: DocumentRequest):
    """Pick the model handler for the parsed request's document_type."""
    return {
        "introduction": introduction,
        "fragment": fragment,
        "playground": playground,
        "testimonium": testimonium,
    }[parsed.document_type]


@document_blueprint.route("/index", methods=["POST"])
def get_index() -> Response:
    """
    Retrieve a filtered index of documents.
    ---
    tags:
      - Documents
    parameters:
      - in: body
        name: body
        schema:
          type: object
          required:
            - sandbox
          properties:
            sandbox:
              type: string
              example: "my_project_sandbox"
    responses:
      200:
        description: A list of documents belonging to the specified sandbox.
        schema:
          type: array
          items:
            type: object
      422:
        description: No sandbox parameter received.
      500:
        description: Internal server error while reading index cache.
    """
    try:
        parsed = parse_document_request(request.get_json(), require=("sandbox",))
    except ValueError as e:
        return make_response(str(e), 422)

    try:
        if not os.path.exists(index_file):
            logging.info(f"get_index(): {index_file} missing — rebuilding")
            combined_index: list = []
            combined_index.extend(introduction.index())
            combined_index.extend(fragment.index())
            combined_index.extend(playground.index())
            combined_index.extend(testimonium.index())
            util.write_json(combined_index, index_file)

        full_index: list = util.read_json(index_file)
        filtered_index = [
            obj for obj in full_index if obj.get("sandbox") == parsed.sandbox
        ]
        return jsonify(filtered_index)

    except Exception as e:
        logging.error(f"get_index(): {e}")
        return make_response("Server error", 500)


@document_blueprint.route("/update_index", methods=["POST"])
def update_index() -> Response:
    """
    Rebuild the document index cache.
    ---
    tags:
      - Documents
    description: Aggregates index data from all models and saves it to the local cache file.
    responses:
      200:
        description: Index updated successfully.
      500:
        description: Failed to write to index cache.
    """
    try:
        combined_index: list = []
        combined_index.extend(introduction.index())
        combined_index.extend(fragment.index())
        combined_index.extend(playground.index())
        combined_index.extend(testimonium.index())

        util.write_json(combined_index, index_file)

        logging.info(f"Index updated successfully with {len(combined_index)} documents.")
        return make_response("Index Updated", 200)

    except Exception as e:
        logging.error(f"update_index(): Failed to update index file. Error: {e}")
        return make_response("Internal Server Error", 500)


@document_blueprint.route("/get", methods=["POST"])
def get_document():
    """
    Fetch a document by type.
    ---
    tags:
      - Documents
    parameters:
      - in: body
        name: body
        schema:
          type: object
          required:
            - document_type
          properties:
            document_type:
              type: string
              enum: [introduction, fragment, playground, testimonium]
    responses:
      200:
        description: Document data retrieved successfully.
      422:
        description: Invalid or missing document_type.
    """
    try:
        parsed = parse_document_request(
            request.get_json(), require=("document_type",)
        )
    except ValueError as e:
        logging.error(e)
        return make_response(str(e), 422)

    list_with_documents = _model_for(parsed).get(parsed.payload)
    return jsonify(list_with_documents), 200


@document_blueprint.route("/create", methods=["POST"])
def create_document() -> Response:
    """
    Create a new document.
    ---
    tags:
      - Documents
    description: Creates a document of the specified type and triggers an index update.
    parameters:
      - in: body
        name: body
        schema:
          type: object
          required:
            - document_type
          properties:
            document_type:
              type: string
              enum: [introduction, fragment, playground, testimonium]
    responses:
      200:
        description: Document created and index updated.
      422:
        description: Missing document_type or creation failed.
    """
    try:
        parsed = parse_document_request(
            request.get_json(), require=("document_type",)
        )
    except ValueError as e:
        logging.error(e)
        return make_response(str(e), 422)

    doc_id: str = _model_for(parsed).create(parsed.payload)

    update_index()
    return (
        make_response("Create success", 200)
        if doc_id
        else make_response("Unprocessable entity", 422)
    )


@document_blueprint.route("/delete", methods=["POST"])
def delete_document() -> Response:
    """
    Delete a document.
    ---
    tags:
      - Documents
    parameters:
      - in: body
        name: body
        schema:
          type: object
          required:
            - document_type
          properties:
            document_type:
              type: string
              enum: [introduction, fragment, playground, testimonium]
    responses:
      200:
        description: Document deleted and index updated.
      422:
        description: Missing document_type or deletion failed.
    """
    try:
        parsed = parse_document_request(
            request.get_json(), require=("document_type",)
        )
    except ValueError as e:
        logging.error(e)
        return make_response(str(e), 422)

    success: bool = _model_for(parsed).delete(parsed.payload)

    update_index()
    return (
        make_response("Delete success", 200)
        if success
        else make_response("Unprocessable entity", 422)
    )


@document_blueprint.route("/update", methods=["POST"])
def update_document() -> Response:
    """
    Update an existing document.
    ---
    tags:
      - Documents
    parameters:
      - in: body
        name: body
        schema:
          type: object
          required:
            - document_type
          properties:
            document_type:
              type: string
              enum: [introduction, fragment, playground, testimonium]
    responses:
      200:
        description: Document updated and index updated.
      422:
        description: Missing document_type or update failed.
    """
    try:
        parsed = parse_document_request(
            request.get_json(), require=("document_type",)
        )
    except ValueError as e:
        logging.error(e)
        return make_response(str(e), 422)

    success: bool = _model_for(parsed).update(parsed.payload)

    update_index()
    return (
        make_response("Update success", 200)
        if success
        else make_response("Unprocessable entity", 422)
    )
