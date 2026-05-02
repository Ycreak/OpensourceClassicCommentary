"""
Logic to handle Zotero library synchronization and citation caching.
Uses the pyzotero library to communicate with the Zotero API.
"""

from flask import make_response, Response
from flask_jsonpify import jsonify
from models.zotero import Zotero


def get_bibliography() -> Response:
    """
    Endpoint to retrieve the current cached bibliography.

    Returns:
        Response: JSON representation of the bibliography.
    """
    zotero = Zotero()
    return jsonify(zotero.bibliography), 200


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


def test_bibliography() -> Response:
    """
    Endpoint to manually trigger the test/update_citations logic.
    """
    zotero = Zotero()
    zotero.test()
    return jsonify({"status": "test triggered"}), 200
