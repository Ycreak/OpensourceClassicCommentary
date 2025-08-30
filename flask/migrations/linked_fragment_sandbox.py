"""
This migration adds document types to all documents. Next, it moves all documents
from their own databases to the new all-purpose database called "documents".
"""

import couchdb


class Migration:
    def __init__(self):
        self.couch = couchdb.Server("http://admin:secret@localhost:5984/")
        self.db = self.couch["documents"]

    def change_db(self, db: str) -> None:
        self.db = self.couch[db]

    def print_all_documents(self, db):
        for id in db:
            doc = db[id]
            print(doc)

    def add_sandbox_to_linked_fragments(self) -> None:
        """
        Adds the admin sandbox to linked fragments
        """
        self.db = self.couch["documents"]

        for id in self.db:
            doc = self.db[id]

            try:
                for linked_fragment in doc["linked_fragments"]:
                    linked_fragment["sandbox"] = "admin"

                doc_id, doc_rev = self.db.save(doc)
                if doc_id:
                    print(f"Updated {doc_id}")

            except Exception:
                pass
            print("#####################")


if __name__ == "__main__":
    migration = Migration()

    migration.add_sandbox_to_linked_fragments()
