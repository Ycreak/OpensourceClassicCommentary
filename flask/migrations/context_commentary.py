"""
This migration migrates the context.text to context.commentary, so that we can use the text field for
broad context information.
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

    def migrate_context(self) -> None:
        """
        Adds the sandbox property to all documents in the current database
        """
        for id in self.db:
            doc = self.db[id]

            if doc["document_type"] == "fragment":
                if "context" in doc and doc["context"]:
                    for context in doc["context"]:
                        context["commentary"] = context["text"]
                        context["text"] = ""
                    print(doc["_id"])
                    # print(doc['context'])
                    doc_id, doc_rev = self.db.save(doc)


if __name__ == "__main__":
    migration = Migration()

    migration.change_db("documents")
    migration.migrate_context()
