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

import config as conf


class PlaygroundField(object):
    NAME = "name"
    OWNER = "owner"
    CANVAS = "canvas"

@dataclass
class Playground:
    _id: str = None
    name: str = None
    owner: str = None
    canvas: object = None

class PlaygroundModel:
    def __init__(self, server):
        self.db = server[conf.COUCH_PLAYGROUNDS]
    
    def __get_playgrounds(self, playground_lst):
        result = list()
        for doc in playground_lst:
            playground = Playground(_id=doc.id)
            if PlaygroundField.NAME in doc:
                playground.name = doc[PlaygroundField.NAME]
            if PlaygroundField.OWNER in doc:
                playground.owner = doc[PlaygroundField.OWNER]
            if PlaygroundField.CANVAS in doc:
                playground.canvas = doc[PlaygroundField.CANVAS]
            result.append(playground)
        return result

    def all(self, sorted=False):
        result = self.db.find({
            "selector": dict(),
            "limit": conf.COUCH_LIMIT
        })
        result = self.__get_playgrounds(result)
        if sorted:
            result.sort(key=lambda Playground: Playground.name)
        return result
        
    def filter(self, playground, sorted=False):
        playground = {key: value for key, value in playground.__dict__.items() if value}
        mango = {
            "selector": playground,
            "limit": conf.COUCH_LIMIT
        }
        print(mango)
        result = self.db.find(mango)
        result = self.__get_playgrounds(result)
        if sorted:
            result.sort(key=lambda Playground: Playground.name)
        return result

    def create(self, playground):
        playground = {key: value for key, value in playground.__dict__.items() if value}
        # @deprecated because of refactoring
        # playground[playgroundField.ID] = playground.pop("_id") # MongoDB uses "_id" instead of "id"
        # playground[playgroundField.NAME] = playground.pop("name")
        
        doc_id, _ = self.db.save(playground)
        if not doc_id:
            logging.error("create(): failed to create playground")
            return None
        return playground

    def update(self, playground):
        # we update playgrounds via their _id, so no need for get.
        # FIXME: is this correct BORS?
        # playground = self.get(playground)

        # if playground == None:
        #     logging.error("update(): playground could not be found")
        #     return False
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
            "limit": conf.COUCH_LIMIT
        }
        result = self.db.find(mango)
        result = self.__get_playgrounds(result)

        if result:
            if len(result) > 1:
                logging.warning("get(): function returned more than 1 object!")
            return result[0]
        return None
