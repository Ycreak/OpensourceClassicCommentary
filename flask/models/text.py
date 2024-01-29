from dataclasses import dataclass, asdict
import logging

import config as conf

class TextField(object):
    ID = "_id"
    AUTHOR = "author"
    TITLE = "title"
    TRANSLATION = "translation"
    APPARATUS = "apparatus"
    TEXT = "text"
    LINKED_DOCUMENTS = "linked_documents"

@dataclass
class Text:
    _id: str = None
    author: str = None
    title: str = None
    translation: str = None
    apparatus: str = None
    text: str = None
    linked_documents: list = None

class TextModel:
    def __init__(self, server):
        self.db = server[conf.COUCH_TEXTS]
    
    def __get_texts(self, text_lst):
        result = list()
        for doc in text_lst:
            text = Text(_id=doc.id)
            if TextField.AUTHOR in doc:
                text.author = doc[TextField.AUTHOR]
            if TextField.TITLE in doc:
                text.title = doc[TextField.TITLE]
            if TextField.TRANSLATION in doc:
                text.translation = doc[TextField.TRANSLATION]
            if TextField.APPARATUS in doc:
                text.apparatus = doc[TextField.APPARATUS]
            if TextField.TEXT in doc:
                text.text = doc[TextField.TEXT]
            if TextField.LINKED_DOCUMENTS in doc:
                text.linked_documents = doc[TextField.LINKED_DOCUMENTS]
            result.append(text)

        return result

    def all(self, sorted=False):
        result = self.db.find({
            "selector": dict(),
            "limit": conf.COUCH_LIMIT
        })
        result = self.__get_texts(result)
        if sorted:
            result.sort(key=lambda Text: Text.name)
        return result
        
    def filter(self, text, sorted=False):
        text = {key: value for key, value in text.__dict__.items() if value}
        # @deprecated because of refactoring
        # if "_id" in text: 
        #     text[TextField.ID] = text.pop("_id")
        # if "name" in text:
        #     text[TextField.NAME] = text.pop("name")
        mango = {
            "selector": text,
            "limit": conf.COUCH_LIMIT
        }
        print(mango)
        result = self.db.find(mango)
        result = self.__get_texts(result)
        if sorted:
            result.sort(key=lambda Text: Text.title)
        return result

    def create(self, text):
        text = {key: value for key, value in text.__dict__.items() if value}
        # @deprecated because of refactoring
        # text[TextField.ID] = text.pop("_id") # MongoDB uses "_id" instead of "id"
        # text[TextField.NAME] = text.pop("name")
        
        doc_id, _ = self.db.save(text)
        if not doc_id:
            logging.error("create(): failed to create text")
            return None
        return text

    def update(self, text):
        # we update texts via their _id, so no need for get.
        # FIXME: is this correct BORS?
        # text = self.get(text)

        # if text == None:
        #     logging.error("update(): text could not be found")
        #     return False
        try:
            doc = self.db[text._id]
            for key, value in asdict(text).items():
                if value != None:
                    doc[key] = value
            print(f'doc: {doc}')
            self.db.save(doc)
            return True
        except Exception as e:
            logging.error(e)
        return False

    def delete(self, text):
        text = self.get(text)
    
        if text == None:
            logging.error("delete(): text could not be found")
            return False
        try:
            doc = self.db[text._id]
            self.db.delete(doc)
            return True
        except Exception as e:
            logging.error(e)
        return False

    def get(self, text):
        text = {key: value for key, value in text.__dict__.items() if value}
        mango = {
            "selector": text,
            "limit": conf.COUCH_LIMIT
        }
        result = self.db.find(mango)
        result = self.__get_texts(result)

        if result:
            if len(result) > 1:
                logging.warning("get(): function returned more than 1 object!")
            return result[0]
        return None