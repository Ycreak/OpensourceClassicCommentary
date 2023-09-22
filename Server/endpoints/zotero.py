import json
from pyzotero import zotero as pyzotero

class Zotero:
    zotero_api: pyzotero.Zotero
    
    library_id: str = "5089557"
    library_type: str = "group"
    cache_file: str = "cache/zotero.json"

    bibliography: list = []

    def __init__(self) -> None:
        self.zotero_api = pyzotero.Zotero(self.library_id, self.library_type)
        # Opening JSON file
        with open(self.cache_file, 'r') as openfile:
            # Reading from json file
            self.bibliography = json.load(openfile)

        
    def write_cache(self, bibliography: object) -> None:
        """Writes the given bibliography to the cache

        Args:
            bibliography (list): with zotero items
        """        
        # Serializing json
        json_object = json.dumps(bibliography, indent=2)
        # Writing to sample.json
        with open(self.cache_file, "w") as outfile:
            outfile.write(json_object)

    def renew(self) -> None:
        """Renews the complete zotero bibliography. Expensive operation
        """        
        bibliography = self.zotero_api.everything(self.zotero_api.items())
        self.write_cache(bibliography)

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

        self.write_cache(self.bibliography)

def get_bibliography():
    zotero = Zotero()
    return jsonify(zotero.bibliography), 200
    
def sync_bibliography():
    zotero = Zotero()
    zotero.update_cached_bibliography()
    return jsonify(zotero.bibliography), 200

