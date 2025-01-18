"""
This migration adds document types to all documents. Next, it moves all documents
from their own databases to the new all-purpose database called "documents".
"""
import couchdb

class Migration:
    def __init__(self):
        self.couch = couchdb.Server('http://admin:secret@localhost:5984/')
        self.db = self.couch['playgrounds']

    def change_db(self, db: str) -> None:
        self.db = self.couch[db]

    def print_all_documents(self, db):
        for id in db:
            doc = db[id]
            print(doc)    

    def add_document_type(self, given_type: str) -> None:
        """
        Adds the given type to all documents in the current database
        """
        for id in self.db:
            doc = self.db[id]

            try:
                print(doc['_id'])
                doc['document_type'] = given_type 

                doc_id, doc_rev = self.db.save(doc)
            except:
                pass
            print('#####################')
    
    def add_document_type_to_linked_fragments(self) -> None:
        """
        Adds the fragment type to linked fragments
        """
        self.db = self.couch['fragments']

        for id in self.db:
            doc = self.db[id]

            try:

                for linked_fragment in doc['linked_fragments']:
                    linked_fragment['document_type'] = 'fragment'

                doc_id, doc_rev = self.db.save(doc)
                if(doc_id):
                    print(f"Updateded {doc_id}")

            except:
                pass
            print('#####################')

if __name__ == "__main__":
    migration = Migration()

    migration.change_db('playgrounds')
    migration.add_document_type(
        'playground', 
    )
    
    migration.change_db('testimonia')
    migration.add_document_type(
        'testimonium', 
    )
    
    migration.change_db('fragments')
    migration.add_document_type(
        'fragment', 
    )
    migration.add_document_type_to_linked_fragments()
