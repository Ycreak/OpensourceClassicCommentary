"""
                      _      _         ____                                      _                 
                     | |    | |       / / _|                                    | |                
  _ __ ___   ___   __| | ___| |___   / / |_ _ __ __ _  __ _ _ __ ___   ___ _ __ | |_   _ __  _   _ 
 | '_ ` _ \ / _ \ / _` |/ _ \ / __| / /|  _| '__/ _` |/ _` | '_ ` _ \ / _ \ '_ \| __| | '_ \| | | |
 | | | | | | (_) | (_| |  __/ \__ \/ / | | | | | (_| | (_| | | | | | |  __/ | | | |_ _| |_) | |_| |
 |_| |_| |_|\___/ \__,_|\___|_|___/_/  |_| |_|  \__,_|\__, |_| |_| |_|\___|_| |_|\__(_) .__/ \__, |
                                                       __/ |                          | |     __/ |
                                                      |___/                           |_|    |___/ 
"""


from dataclasses import asdict, dataclass
import logging
import builtins

from config import COUCH_FRAGMENTS, COUCH_LIMIT
from mixins import SetFieldsetToNoneMixin
from constants import fragment_mapping

@dataclass
class Fragment(SetFieldsetToNoneMixin):
    _id: str
    name: str
    author: str
    title: str
    editor: str
    status: str
    lock: int
    translation: str
    differences: str
    apparatus: str
    commentary: str
    reconstruction: str
    context: list
    lines: list
    linked_fragments: list
    witness: str
    text: str
    document_type: str

class FragmentModel:
    def __init__(self, server):
        self.db = server[COUCH_FRAGMENTS]
    
    def __get_fragments(self, frag_lst):
        """ Helper function to store a query result as a list of fragments """
        result = []

        for doc in frag_lst:
            fragment = Fragment(_id=doc.id)
            for field_name, field_key in fragment_mapping.items():
                if field_key in doc:
                    setattr(fragment, field_name.lower(), doc[field_key])
            result.append(fragment)

        return result

    def all(self, sorted=False):
        """ Returns all fragments (no filter) within the COUCH_LIMIT, optional sorting on name"""

        result = self.db.find({
            "selector": {},
            "limit": COUCH_LIMIT
        })
        result = self.__get_fragments(result)

        if sorted:
            result = builtins.sorted(builtins.filter(lambda fragment: fragment.name is not None, result), key=lambda fragment: fragment.name)

        return result
        
    def filter(self, fragment, sorted=False):
        """ Returns those fragments that match the values of the fragment paramater, optional sorting on title """

        fragment = {key: value for key, value in fragment.__dict__.items() if value}
        result = self.db.find({
            "selector": fragment,
            "limit": COUCH_LIMIT
        })
        result = self.__get_fragments(result)
        
        if sorted:
            result = builtins.sorted(builtins.filter(lambda fragment: fragment.title is not None, result), key=lambda fragment: fragment.title)

        return result

    def create(self, fragment):
        """ Creates a fragment equal to the fragment parameter """

        fragment = {key: value for key, value in fragment.__dict__.items() if value}
        doc_id, _ = self.db.save(fragment)

        if not doc_id:
            logging.error("create(): failed to create fragment")
            return None
        
        return fragment

    def update(self, fragment):
        """ Update a fragment via the _id for lookup """

        try:
            doc = self.db[fragment._id]

            for key, value in asdict(fragment).items():
                if value is not None:
                    doc[key] = value
            
            self.db.save(doc)
            return True
        except Exception as e:
            logging.error(e)

        return False

    def delete(self, fragment):
        """ Delete a fragment via the _id for lookup """

        try:
            doc = self.db[fragment._id]

            if doc is not None:
                self.db.delete(doc)
                return True
        
        except Exception as e:
            logging.error(e)

        return False

    def get(self, fragment):
        """ Gets a specific fragment. If more than one are returned, a warning is given """

        fragment = {key: value for key, value in fragment.__dict__.items() if value}
        
        result = self.db.find({
            "selector": fragment,
            "limit": COUCH_LIMIT
        })
        result = self.__get_fragments(result)

        if result:
            if len(result) > 1:
                logging.warning("get(): function returned more than 1 object!")
            return result[0]
        
        return None