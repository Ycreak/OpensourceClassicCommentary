from dataclasses import dataclass, asdict
import logging

import config as conf

class IntroductionField(object):
    ID = "_id"
    AUTHOR = "author"
    TITLE = "title"
    TEXT = "text"

@dataclass
class Introduction:
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
                introduction.author = doc[IntroductionField.AUTHOR]
            if IntroductionField.TITLE in doc:
                introduction.title = doc[IntroductionField.TITLE]
            if IntroductionField.TEXT in doc:
                introduction.text = doc[IntroductionField.TEXT]
            result.append(introduction)

        return result

    def all(self, sorted=False):
        result = self.db.find({
            "selector": dict(),
            "limit": conf.COUCH_LIMIT
        })
        result = self.__get_introductions(result)
        if sorted:
            result.sort(key=lambda Introduction: Introduction.title)
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
            result.sort(key=lambda Introduction: Introduction.title)
        return result

    def create(self, introduction):
        introduction = {key: value for key, value in introduction.__dict__.items() if value}
        
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
