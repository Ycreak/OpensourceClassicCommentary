'''
To retrieve data, we use the pyzotero library.
'''


from flask import make_response
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
    
    def test(self) -> None:
        # self.zotero_api.add_parameters(format='json')
        self.zotero_api.add_parameters(content='bib')
        temp = self.zotero_api.item('CWAUHGKR')
        # temp = self.zotero_api.top(limit=1)
        print(temp) 

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


    def _update_cached_bibliography(self) -> None:
        """
        Removes entries from cache that have been removed from Zotero. Also updates the 
        cached bibliography by matching the latest version in cache to the latest
        version known on the server. Will update all items that are new or updated.
        """        
        self._remove_deleted_entries_from_cache()

        latest_cached_version = self.get_latest_cached_version()
        # Now get a key list of all items that have changes since the last known change to the cache
        keys_dictionary = self.zotero_api.item_versions(since=latest_cached_version)

        keys = keys_dictionary.keys()
        if (len(keys) == 0): print('Nothing to upate.')
        for key in keys:
            # Retrieve the zotero item data blob
            bib_item = self.zotero_api.item(key)
            # Retrieve the zotero item bib blob 
            self.zotero_api.add_parameters(content='bib')
            bib_item['citation'] = self.zotero_api.item(key)[0]
            # Delete the old key from the bibliography and append the updated one
            self.bibliography = [d for d in self.bibliography if d['key'] != key]
            self.bibliography.append(bib_item)
            # Zotero really likes to stop working after a few api calls. We therefore save the cache
            # file after every update. It is quite wasteful, but at least we wont lose any progress
            util.write_json(self.bibliography, self.cache_file)

    def _remove_deleted_entries_from_cache(self) -> None:
        """
        Deletes items from the cache that have been deleted in Zotero
        """
        cached_keys: list = [x['key'] for x in self.bibliography]
        online_keys: list = list(self.zotero_api.item_versions().keys())

        deleted_keys: list = list(set(cached_keys) - set(online_keys))

        if len(deleted_keys) > 0:
            for key in deleted_keys:
                self.bibliography: list = [d for d in self.bibliography if d['key'] != key]
        
        util.write_json(self.bibliography, self.cache_file)
    
    def _update_citations(self) -> None:
        """
        Dumb function to update citations in sources that do not yet have a citation.
        """
        self.bibliography = util.read_json(self.cache_file) 
        counter = 0
        for bib_item in self.bibliography:
            if counter == 15:
                # Write the changes every 15 citations to prevent the API getting angry
                util.write_json(self.bibliography, self.cache_file)
                exit(0)
            if not "citation" in bib_item or bib_item['citation'] == "":
                counter += 1
                key = bib_item['key']
                print(f'not {bib_item["key"]}')
                # Retrieve the zotero item data blob
                bib_item = self.zotero_api.item(bib_item['key'])
                # Retrieve the zotero item bib blob 
                self.zotero_api.add_parameters(content='bib')
                bib_item['citation'] = self.zotero_api.item(key)[0]
                self.bibliography = [d for d in self.bibliography if d['key'] != key]
                self.bibliography.append(bib_item)


    def _update_citations(self) -> None:
        """
        Dumb function to update citations in sources that do not yet have a citation.
        """
        self.bibliography = util.read_json(self.cache_file) 
        counter = 0
        for bib_item in self.bibliography:
            if counter == 15:
                # Write the changes every 15 citations to prevent the API getting angry
                util.write_json(self.bibliography, self.cache_file)
                exit(0)
            if not "citation" in bib_item or bib_item['citation'] == "":
                counter += 1
                key = bib_item['key']
                print(f'not {bib_item["key"]}')
                # Retrieve the zotero item data blob
                bib_item = self.zotero_api.item(bib_item['key'])
                # Retrieve the zotero item bib blob 
                self.zotero_api.add_parameters(content='bib')
                bib_item['citation'] = self.zotero_api.item(key)[0]
                self.bibliography = [d for d in self.bibliography if d['key'] != key]
                self.bibliography.append(bib_item)

def get_bibliography():
    zotero = Zotero()
    return jsonify(zotero.bibliography), 200 

def sync_bibliography():
    zotero = Zotero()
    try:
        zotero._update_cached_bibliography()
        return jsonify(zotero.bibliography), 200
    except:
        return make_response("Problems with Zotero", 408)

if __name__ == '__main__':
    # Run with "python3 -m endpoints.zotero"
    zotero = Zotero()
    # zotero._update_citations()
