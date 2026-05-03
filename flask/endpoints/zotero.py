"""
Logic to handle Zotero library synchronization and citation caching.
Uses the pyzotero library to communicate with the Zotero API.
"""

from flask import Blueprint, make_response, Response
from flask_jsonpify import jsonify
import logging
from models.zotero import Zotero

# Initialize the Blueprint
zotero_blueprint = Blueprint("zotero_blueprint", __name__)


@zotero_blueprint.route("/get", methods=["POST"])
def get_bibliography() -> Response:
    """
    Retrieve the current cached bibliography.
    ---
    tags:
      - Zotero
    description: Returns the bibliography currently stored in the local server cache.
    responses:
      200:
        description: A JSON object containing the cached bibliography.
        schema:
          type: object
    """
    zotero = Zotero()
    return jsonify(zotero.bibliography), 200


@zotero_blueprint.route("/sync", methods=["POST"])
def sync_bibliography() -> Response:
    """
    Trigger a synchronization with Zotero.
    ---
    tags:
      - Zotero
    description: Forces the server to fetch the latest citations from the Zotero API and update the local cache.
    responses:
      200:
        description: Synchronization successful. Returns the updated bibliography.
        schema:
          type: object
      408:
        description: Request Timeout or Connection Error with Zotero API.
    """
    zotero = Zotero()
    try:
        zotero._update_cached_bibliography()
        return jsonify(zotero.bibliography), 200
    except Exception as e:
        logging.error(f"Sync failed: {e}")
        return make_response(f"Problems with Zotero: {e}", 408)


@zotero_blueprint.route("/test", methods=["GET"])
def test_bibliography() -> Response:
    """
    Manually trigger citation test logic.
    ---
    tags:
      - Zotero
    description: Utility endpoint to manually invoke the citation testing and update internal logic.
    responses:
      200:
        description: Test logic triggered successfully.
        schema:
          type: object
          properties:
            status:
              type: string
              example: test triggered
    """
    zotero = Zotero()
    zotero.test()
    return jsonify({"status": "test triggered"}), 200
