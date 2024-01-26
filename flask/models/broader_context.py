from dataclasses import dataclass, asdict
import logging

import config as conf

class BroaderContextField(object):
    ID = "_id"
    AUTHOR = "author"
    TITLE = "title"
    TRANSLATION = "translation"
    APPARATUS = "apparatus"
    TEXT = "text"
    LINKED_DOCUMENTS = "linked_documents"

@dataclass
class BroaderContext:
    _id: str = None
    author: str = None
    title: str = None
    translation: str = None
    apparatus: str = None
    text: str = None
    linked_documents: list = None

class BroaderContextModel:
    def __init__(self, server):
        self.db = server[conf.COUCH_BROADER_CONTEXTS]
    
    def __get_broader_contexts(self, broader_context_lst):
        result = list()
        for doc in broader_context_lst:
            broader_context = BroaderContext(_id=doc.id)
            if BroaderContextField.AUTHOR in doc:
                broader_context.author = doc[BroaderContextField.AUTHOR]
            if BroaderContextField.TITLE in doc:
                broader_context.title = doc[BroaderContextField.TITLE]
            if BroaderContextField.TRANSLATION in doc:
                broader_context.translation = doc[BroaderContextField.TRANSLATION]
            if BroaderContextField.APPARATUS in doc:
                broader_context.apparatus = doc[BroaderContextField.APPARATUS]
            if BroaderContextField.TEXT in doc:
                broader_context.text = doc[BroaderContextField.TEXT]
            if BroaderContextField.LINKED_DOCUMENTS in doc:
                broader_context.text = doc[BroaderContextField.LINKED_DOCUMENTS]
            result.append(broader_context)

        return result

    def all(self, sorted=False):
        result = self.db.find({
            "selector": dict(),
            "limit": conf.COUCH_LIMIT
        })
        result = self.__get_broader_contexts(result)
        if sorted:
            result.sort(key=lambda BroaderContext: BroaderContext.name)
        return result
        
    def filter(self, broader_context, sorted=False):
        broader_context = {key: value for key, value in broader_context.__dict__.items() if value}
        # @deprecated because of refactoring
        # if "_id" in broader_context: 
        #     broader_context[BroaderContextField.ID] = broader_context.pop("_id")
        # if "name" in broader_context:
        #     broader_context[BroaderContextField.NAME] = broader_context.pop("name")
        mango = {
            "selector": broader_context,
            "limit": conf.COUCH_LIMIT
        }
        print(mango)
        result = self.db.find(mango)
        result = self.__get_broader_contexts(result)
        if sorted:
            result.sort(key=lambda BroaderContext: BroaderContext.title)
        return result

    def create(self, broader_context):
        broader_context = {key: value for key, value in broader_context.__dict__.items() if value}
        # @deprecated because of refactoring
        # broader_context[BroaderContextField.ID] = broader_context.pop("_id") # MongoDB uses "_id" instead of "id"
        # broader_context[BroaderContextField.NAME] = broader_context.pop("name")
        
        doc_id, _ = self.db.save(broader_context)
        if not doc_id:
            logging.error("create(): failed to create broader_context")
            return None
        return broader_context

    def update(self, broader_context):
        # we update broader_contexts via their _id, so no need for get.
        # FIXME: is this correct BORS?
        # broader_context = self.get(broader_context)

        # if broader_context == None:
        #     logging.error("update(): broader_context could not be found")
        #     return False
        try:
            doc = self.db[broader_context._id]
            for key, value in asdict(broader_context).items():
                if value != None:
                    doc[key] = value
            print(f'doc: {doc}')
            self.db.save(doc)
            return True
        except Exception as e:
            logging.error(e)
        return False

    def delete(self, broader_context):
        broader_context = self.get(broader_context)
    
        if broader_context == None:
            logging.error("delete(): broader_context could not be found")
            return False
        try:
            doc = self.db[broader_context._id]
            self.db.delete(doc)
            return True
        except Exception as e:
            logging.error(e)
        return False

    def get(self, broader_context):
        broader_context = {key: value for key, value in broader_context.__dict__.items() if value}
        mango = {
            "selector": broader_context,
            "limit": conf.COUCH_LIMIT
        }
        result = self.db.find(mango)
        result = self.__get_broader_contexts(result)

        if result:
            if len(result) > 1:
                logging.warning("get(): function returned more than 1 object!")
            return result[0]
        return None