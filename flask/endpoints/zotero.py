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
    Endpoint to retrieve the current cached bibliography.

    Returns:
        Response: JSON representation of the bibliography.
    """
    zotero = Zotero()
    return jsonify(zotero.bibliography), 200


@zotero_blueprint.route("/sync", methods=["POST"])
def sync_bibliography() -> Response:
    """
    Endpoint to trigger a synchronization between Zotero and the local cache.

    Returns:
        Response: Updated JSON bibliography or an error message.
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
    Endpoint to manually trigger the test/update_citations logic.
    """
    zotero = Zotero()
    zotero.test()
    return jsonify({"status": "test triggered"}), 200
