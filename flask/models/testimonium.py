from dataclasses import dataclass, asdict
import logging

import config as conf

class TestimoniumField(object):
    ID = "_id"
    NAME = "name"
    AUTHOR = "author"
    TITLE = "title"
    TRANSLATION = "translation"
    WITNESS = "witness"
    TEXT = "text"

@dataclass
class Testimonium:
    _id: str = None
    name: str = None
    author: str = None
    title: str = None
    translation: str = None
    witness: str = None
    text: str = None

class TestimoniumModel:
    def __init__(self, server):
        self.db = server[conf.COUCH_TESTIMONIUMS]
    
    def __get_testimoniums(self, testimonium_lst):
        result = list()
        for doc in testimonium_lst:
            testimonium = Testimonium(_id=doc.id)
            if TestimoniumField.NAME in doc:
                testimonium.name = doc[TestimoniumField.NAME]
            if TestimoniumField.AUTHOR in doc:
                testimonium.author = doc[TestimoniumField.AUTHOR]
            if TestimoniumField.TITLE in doc:
                testimonium.title = doc[TestimoniumField.TITLE]
            if TestimoniumField.TRANSLATION in doc:
                testimonium.translation = doc[TestimoniumField.TRANSLATION]
            if TestimoniumField.WITNESS in doc:
                testimonium.witness = doc[TestimoniumField.WITNESS]
            if TestimoniumField.TEXT in doc:
                testimonium.text = doc[TestimoniumField.TEXT]
            result.append(testimonium)

        return result

    def all(self, sorted=False):
        result = self.db.find({
            "selector": dict(),
            "limit": conf.COUCH_LIMIT
        })
        result = self.__get_testimoniums(result)
        if sorted:
            result.sort(key=lambda Testimonium: Testimonium.name)
        return result
        
    def filter(self, testimonium, sorted=False):
        testimonium = {key: value for key, value in testimonium.__dict__.items() if value}
        # @deprecated because of refactoring
        # if "_id" in testimonium: 
        #     testimonium[TestimoniumField.ID] = testimonium.pop("_id")
        # if "name" in testimonium:
        #     testimonium[TestimoniumField.NAME] = testimonium.pop("name")
        mango = {
            "selector": testimonium,
            "limit": conf.COUCH_LIMIT
        }
        print(mango)
        result = self.db.find(mango)
        result = self.__get_testimoniums(result)
        if sorted:
            result.sort(key=lambda Testimonium: Testimonium.title)
        return result

    def create(self, testimonium):
        testimonium = {key: value for key, value in testimonium.__dict__.items() if value}
        # @deprecated because of refactoring
        # testimonium[TestimoniumField.ID] = testimonium.pop("_id") # MongoDB uses "_id" instead of "id"
        # testimonium[TestimoniumField.NAME] = testimonium.pop("name")
        
        doc_id, _ = self.db.save(testimonium)
        if not doc_id:
            logging.error("create(): failed to create testimonium")
            return None
        return testimonium

    def update(self, testimonium):
        # we update testimoniums via their _id, so no need for get.
        # FIXME: is this correct BORS?
        # testimonium = self.get(testimonium)

        # if testimonium == None:
        #     logging.error("update(): testimonium could not be found")
        #     return False
        try:
            doc = self.db[testimonium._id]
            for key, value in asdict(testimonium).items():
                if value != None:
                    doc[key] = value
            print(f'doc: {doc}')
            self.db.save(doc)
            return True
        except Exception as e:
            logging.error(e)
        return False

    def delete(self, testimonium):
        testimonium = self.get(testimonium)
    
        if testimonium == None:
            logging.error("delete(): testimonium could not be found")
            return False
        try:
            doc = self.db[testimonium._id]
            self.db.delete(doc)
            return True
        except Exception as e:
            logging.error(e)
        return False

    def get(self, testimonium):
        testimonium = {key: value for key, value in testimonium.__dict__.items() if value}
        mango = {
            "selector": testimonium,
            "limit": conf.COUCH_LIMIT
        }
        result = self.db.find(mango)
        result = self.__get_testimoniums(result)

        if result:
            if len(result) > 1:
                logging.warning("get(): function returned more than 1 object!")
            return result[0]
        return None