"""
Logic to handle Zotero library synchronization and citation caching.
Uses the pyzotero library to communicate with the Zotero API.
"""

import logging
from typing import List
from flask import make_response, Response
from flask_jsonpify import jsonify
from pyzotero import zotero as pyzotero

import utilities as util


class Zotero:
    """
    Handles communication with the Zotero API and manages a local JSON cache.
    """

    zotero_api: pyzotero.Zotero
    library_id: str = "5089557"
    library_type: str = "group"
    cache_file: str = "cache/zotero.json"
    bibliography: List[dict] = []
    # Retrieve citations in the apa format
    bibliography_style: str = "apa"

    def __init__(self) -> None:
        """
        Initializes the Zotero API client and loads the local bibliography cache.
        """
        self.zotero_api = pyzotero.Zotero(self.library_id, self.library_type)
        self.zotero_api.add_parameters(content="bib", style=self.bibliography_style)
        self.bibliography = util.read_json(self.cache_file)

    def test(self) -> None:
        """
        Triggers a citation update test.
        """
        self._update_citations()

    def renew(self) -> None:
        """
        Completely refreshes the local cache by downloading the entire library.
        Warning: This is an expensive operation.
        """
        logging.info("Renewing entire Zotero bibliography...")
        bibliography = self.zotero_api.everything(self.zotero_api.items())
        util.write_json(bibliography, self.cache_file)
        self.bibliography = bibliography

    def get_latest_cached_version(self) -> int:
        """
        Finds the highest version number currently stored in the local cache.

        Returns:
            int: The latest version number (defaults to 0 if cache is empty).
        """
        highest = 0
        for item in self.bibliography:
            version = item.get("version", 0)
            if version > highest:
                highest = version
        return highest

    def _update_cached_bibliography(self) -> None:
        """
        Synchronizes the local cache with the Zotero server.
        Removes deleted entries and fetches items that are new or changed.
        """
        self._remove_deleted_entries_from_cache()

        latest_cached_version = self.get_latest_cached_version()
        # Get a dictionary of all items changed since our last sync
        keys_dictionary = self.zotero_api.item_versions(since=latest_cached_version)
        keys = keys_dictionary.keys()

        if not keys:
            logging.info("Nothing to update.")
            return

        for key in keys:
            try:
                logging.info(f"Syncing updated key: {key}")
                # Set parameters to get the bib content
                self.zotero_api.add_parameters(
                    content="bib", style=self.bibliography_style
                )

                # Fetch the item (returns a list where [0] is the bib HTML/string)
                full_item_data = self.zotero_api.item(key)

                # Create a record that includes both data and the formatted citation
                # Note: Depending on pyzotero settings, you might need to fetch data and bib separately
                # if you want the full JSON data blob AND the citation string.
                bib_item = full_item_data

                # Update local list: remove old version, add new version
                self.bibliography = [
                    d for d in self.bibliography if d.get("key") != key
                ]
                self.bibliography.append(bib_item)

                # Save after every key to prevent data loss on API timeouts
                util.write_json(self.bibliography, self.cache_file)
            except Exception as e:
                logging.error(f"Failed to update key {key}: {e}")

    def _remove_deleted_entries_from_cache(self) -> None:
        """
        Compares local keys with server keys and removes items that no longer exist online.
        """
        cached_keys = {x["key"] for x in self.bibliography if "key" in x}
        online_keys = set(self.zotero_api.item_versions().keys())

        deleted_keys = cached_keys - online_keys

        if deleted_keys:
            logging.info(f"Removing {len(deleted_keys)} deleted items from cache.")
            self.bibliography = [
                d for d in self.bibliography if d.get("key") not in deleted_keys
            ]
            util.write_json(self.bibliography, self.cache_file)

    def _update_citations(self) -> None:
        """
        Identifies cached items missing a 'citation' field and fetches them from the API.
        """
        self.bibliography = util.read_json(self.cache_file)
        for bib_item in self.bibliography:
            if not bib_item.get("citation"):
                key = bib_item.get("key")
                try:
                    self.zotero_api.add_parameters(
                        content="bib", style=self.bibliography_style
                    )
                    citation = self.zotero_api.item(key)[0]

                    bib_item["citation"] = citation

                    # Update bibliography list
                    self.bibliography = [
                        d for d in self.bibliography if d.get("key") != key
                    ]
                    self.bibliography.append(bib_item)

                    util.write_json(self.bibliography, self.cache_file)
                    logging.info(f"Added citation for key: {key}")
                except Exception as e:
                    logging.error(f"Could not retrieve citation for {key}: {e}")


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
