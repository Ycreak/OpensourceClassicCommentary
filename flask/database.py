"""
Class to handle all communication with the database
"""
import logging
import config as conf

class Database:
    def __init__(self, server):
        self.db = server[conf.COUCH_DOCUMENTS]
    
    def all(self):
        """
        Returns all documents in the database
        """
        return self.db.find({
            "selector": dict(),
            "limit": conf.COUCH_LIMIT
        })
        
    def filter(self, selector: dict):
        """
        Filters all documents using the given selector, which is a dictionary with must have values.
        """
        mango = {
            "selector": selector,
            "limit": conf.COUCH_LIMIT
        }
        return self.db.find(mango)

    def create(self, document: dict) -> str:
        """
        Creates the given document in the database
        """
        #TODO: check if the given _id is already in the database.

        doc_id, _ = self.db.save(document)
        if not doc_id:
            logging.error(f"create(): failed to create document: {document}")
            return None
        return doc_id

    def update(self, document: dict) -> bool:
        """
        Updates the document using its document id
        """
        try:
            doc = self.db[document["_id"]]
            for key, value in document.items():
                if value != None:
                    doc[key] = value
            logging.info(f'Updated document: {doc}')
            self.db.save(doc)
            return True
        except Exception as e:
            logging.error(e)
        return False

    def delete(self, identifier: str) -> bool:
        """
        Deletes a document given its document id
        """
        try:
            doc = self.db[identifier]
            self.db.delete(doc)
            return True
        except Exception as e:
            logging.error(e)
        return False
