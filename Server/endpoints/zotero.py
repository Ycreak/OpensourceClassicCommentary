import json
from pyzotero import zotero as pyzotero
from flask_jsonpify import jsonify

import utilities as util

class Zotero:
    zotero_api: pyzotero.Zotero
    
    library_id: str = "5089557"
    library_type: str = "group"
    cache_file: str = "cache/zotero.json"

    bibliography: list = []

    def __init__(self) -> None:
        self.zotero_api = pyzotero.Zotero(self.library_id, self.library_type)
        self.bibliography = util.read_json(self.cache_file) 
        
    def renew(self) -> None:
        """Renews the complete zotero bibliography. Expensive operation
        """        
        bibliography = self.zotero_api.everything(self.zotero_api.items())
        util.write_json(bibliography, self.cache_file)

    def get_latest_cached_version(self) -> int:
        """Gets latest version known to the cache

        Returns:
            _type_: _description_
        """        
        highest = 0
        for item in self.bibliography:
            if item['version'] > highest:
                highest = item['version']
        return highest

    def update_cached_bibliography(self) -> None:
        """Updates the cached bibliography by matching the latest version in cache to the latest
        version known on the server. Will update all items that are new or updated.
        """        
        latest_cached_version = self.get_latest_cached_version()
        keys_dictionary = self.zotero_api.item_versions(since=latest_cached_version)
        keys = keys_dictionary.keys()
        if (len(keys) == 0): print('Nothing to upate.')
        for key in keys:
            print('Updating:', key)
            bib_item = self.zotero_api.item(key)
            self.bibliography = [d for d in self.bibliography if d['key'] != key]
            self.bibliography.append(bib_item)

        # Delete from the cache those entries that are deleted from Zotero
        cached_keys = [x['key'] for x in self.bibliography]
        online_keys = list(self.zotero_api.item_versions().keys())

        deleted_keys = list(set(cached_keys) - set(online_keys))

        if len(deleted_keys) > 0:
            print(deleted_keys)
            for key in deleted_keys:
                print('Removing deleted item:', key)
                self.bibliography = [d for d in self.bibliography if d['key'] != key]

        util.write_json(self.bibliography, self.cache_file)

def get_bibliography():
    zotero = Zotero()
    return jsonify(zotero.bibliography), 200
    
def sync_bibliography():
    zotero = Zotero()
    zotero.update_cached_bibliography()
    return jsonify(zotero.bibliography), 200

