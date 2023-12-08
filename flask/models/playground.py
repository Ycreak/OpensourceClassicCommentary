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


from dataclasses import dataclass, asdict
import logging

from config import COUCH_PLAYGROUNDS, COUCH_LIMIT
from constants import PlaygroundMappingField


@dataclass
class Playground:
    _id: str = None
    name: str = None
    owner: str = None
    canvas: object = None
    shared_with: list = None
    user: str = None

class PlaygroundModel:
    def __init__(self, server):
        self.db = server[COUCH_PLAYGROUNDS]
    
    def __get_playgrounds(self, playground_lst, canvas=True):
        result = list()
        for doc in playground_lst:
            playground = Playground(_id=doc.id)
            if PlaygroundMappingField.NAME in doc:
                playground.name = doc[PlaygroundMappingField.NAME]
            if PlaygroundMappingField.OWNER in doc:
                playground.owner = doc[PlaygroundMappingField.OWNER]
            if PlaygroundMappingField.SHARED_WITH in doc:
                playground.shared_with = doc[PlaygroundMappingField.SHARED_WITH]
            if (canvas):
                if PlaygroundMappingField.CANVAS in doc:
                    playground.canvas = doc[PlaygroundMappingField.CANVAS]
            result.append(playground)
        return result

    def all(self, sorted=False):
        result = self.db.find({
            "selector": dict(),
            "limit": COUCH_LIMIT
        })
        result = self.__get_playgrounds(result)
        if sorted:
            result.sort(key=lambda Playground: Playground.name)
        return result
        
    def filter(self, playground, sorted=False):
        playground = {key: value for key, value in playground.__dict__.items() if value}
        mango = {
            "selector": playground,
            "limit": COUCH_LIMIT
        }
        result = self.db.find(mango)
        result = self.__get_playgrounds(result)
        if sorted:
            #FIXME:
            # result.sort(key=lambda Playground: Playground.name)
            pass
        return result

    def create(self, playground):
        playground = {key: value for key, value in playground.__dict__.items() if value}
        doc_id, _ = self.db.save(playground)
        if not doc_id:
            logging.error("create(): failed to create playground")
            return None
        return playground

    def update(self, playground):
        try:
            doc = self.db[playground._id]
            for key, value in asdict(playground).items():
                if value != None:
                    doc[key] = value
            print(f'doc: {doc}')
            self.db.save(doc)
            return True
        except Exception as e:
            logging.error(e)
        return False

    def delete(self, playground):
        playground = self.get(playground)
    
        if playground == None:
            logging.error("delete(): playground could not be found")
            return False
        try:
            doc = self.db[playground._id]
            self.db.delete(doc)
            return True
        except Exception as e:
            logging.error(e)
        return False

    def get(self, playground):
        playground = {key: value for key, value in playground.__dict__.items() if value}
        mango = {
            "selector": playground,
            "limit": COUCH_LIMIT
        }
        result = self.db.find(mango)
        result = self.__get_playgrounds(result)

        if result:
            if len(result) > 1:
                logging.warning("get(): function returned more than 1 object!")
            return result[0]
        return None

    def get_shared_playgrounds(self, playground, sorted=False):
        print(playground)
        # TODO: it would be nice to make this function drier
        playground = {key: value for key, value in playground.__dict__.items() if value}
        # We check whether the requesting user is in any of the shared_with object arrays of the playground.
        # If so, we return the playground metadata to the frontend for the requester to pick from.
        mango = {
           "selector": {
              "shared_with": {
                 "$elemMatch": {
                    "name": playground["user"]
                 }
              }
           },
            "limit": COUCH_LIMIT
        }
        print('lets go')
        result = self.db.find(mango)
        # Do not add the canvas to this request: we only want meta data
        result = self.__get_playgrounds(result, canvas=False)
        if sorted:
            result.sort(key=lambda Playground: Playground.name)
        return result
