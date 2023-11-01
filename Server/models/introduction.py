"""
                      _      _         ___       _                 _            _   _                           
                     | |    | |       / (_)     | |               | |          | | (_)                          
  _ __ ___   ___   __| | ___| |___   / / _ _ __ | |_ _ __ ___   __| |_   _  ___| |_ _  ___  _ __    _ __  _   _ 
 | '_ ` _ \ / _ \ / _` |/ _ \ / __| / / | | '_ \| __| '__/ _ \ / _` | | | |/ __| __| |/ _ \| '_ \  | '_ \| | | |
 | | | | | | (_) | (_| |  __/ \__ \/ /  | | | | | |_| | | (_) | (_| | |_| | (__| |_| | (_) | | | |_| |_) | |_| |
 |_| |_| |_|\___/ \__,_|\___|_|___/_/   |_|_| |_|\__|_|  \___/ \__,_|\__,_|\___|\__|_|\___/|_| |_(_) .__/ \__, |
                                                                                                   | |     __/ |
                                                                                                   |_|    |___/ 
"""

# TODO: This needs some proper testing!

from dataclasses import dataclass, asdict
import logging
from uuid import uuid4

import Server.config as conf

class IntroductionFormField(object):
    # Container for field names
    ID = '_id'
    AUTHOR = 'author'
    TITLE = 'title'
    TEXT = 'text'

@dataclass
class IntroductionForm:
    # Data container. Corresponds to the IntroductionForm on the dashboard.
    _id: str = None
    author: str = None
    title: str = None
    text: str = None

class IntroductionModel:
    def __init__(self, server):
        self.db = server[conf.COUCH_INTRODUCTIONS]
    
    def __get_introductions(self, introduction_lst):
        result = list()
        for doc in introduction_lst:
            introduction = Introduction(_id=doc.id)
            if IntroductionField.AUTHOR in doc:
                introduction.AUTHOR = doc[IntroductionField.AUTHOR]
            if IntroductionField.TITLE in doc:
                introduction.TITLE = doc[IntroductionField.TITLE]
            if IntroductionField.TEXT in doc:
                introduction.TEXT = doc[IntroductionField.TEXT]
            result.append(introduction)
        return result

    def all(self, sorted=False):
        result = self.db.find({
            "selector": dict(),
            "limit": conf.COUCH_LIMIT
        })
        result = self.__get_introductions(result)
        if sorted:
            result.sort(key=lambda Introduction: Introduction.author)
        return result
        
    def filter(self, introduction, sorted=False):
        introduction = {key: value for key, value in introduction.__dict__.items() if value}
        mango = {
            "selector": introduction,
            "limit": conf.COUCH_LIMIT
        }
        print(mango)
        result = self.db.find(mango)
        result = self.__get_introductions(result)
        if sorted:
            result.sort(key=lambda Introduction: Introduction.name)
        return result

    def create(self, introduction):
        introduction = {key: value for key, value in introduction.__dict__.items() if value}
        # @deprecated because of refactoring
        # introduction[introductionField.ID] = introduction.pop("_id") # MongoDB uses "_id" instead of "id"
        # introduction[introductionField.NAME] = introduction.pop("name")
        
        doc_id, _ = self.db.save(introduction)
        if not doc_id:
            logging.error("create(): failed to create introduction")
            return None
        return introduction

    def update(self, introduction):
        try:
            doc = self.db[introduction._id]
            for key, value in asdict(introduction).items():
                if value != None:
                    doc[key] = value
            print(f'doc: {doc}')
            self.db.save(doc)
            return True
        except Exception as e:
            logging.error(e)
        return False

    def delete(self, introduction):
        introduction = self.get(introduction)
    
        if introduction == None:
            logging.error("delete(): introduction could not be found")
            return False
        try:
            doc = self.db[introduction._id]
            self.db.delete(doc)
            return True
        except Exception as e:
            logging.error(e)
        return False

    def get(self, introduction):
        introduction = {key: value for key, value in introduction.__dict__.items() if value}
        mango = {
            "selector": introduction,
            "limit": conf.COUCH_LIMIT
        }
        result = self.db.find(mango)

        result = self.__get_introductions(result)

        if result:
            if len(result) > 1:
                logging.warning("get(): function returned more than 1 object!")
            return result[0]
        return None
