"""
This migration adds document types to all documents. Next, it moves all documents
from their own databases to the new all-purpose database called "documents".
"""
import couchdb

class Migration:
    def __init__(self):
        self.couch = couchdb.Server('http://admin:secret@localhost:5984/')
        self.db = self.couch['documents']

    def change_db(self, db: str) -> None:
        self.db = self.couch[db]

    def print_all_documents(self, db):
        for id in db:
            doc = db[id]
            print(doc)    

    def add_sandbox(self) -> None:
        """
        Adds the sandbox property to all documents in the current database
        """
        for id in self.db:
            doc = self.db[id]

            try:
                print(doc['_id'])
                doc['sandbox'] = "admin" 

                doc_id, doc_rev = self.db.save(doc)
            except:
                pass
            print('#####################')
    
if __name__ == "__main__":
    migration = Migration()

    migration.change_db('documents')
    migration.add_sandbox()
