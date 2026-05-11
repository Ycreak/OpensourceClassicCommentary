"""
This migration fixes the linked fragments. Not all of them have sandbox and document_type fields.
"""

import couchdb


class Migration:
    def __init__(self):
        self.couch = couchdb.Server("http://admin:rqgQCPYSUGdC35qt@192.168.1.13:5984/")
        self.db = self.couch["documents"]

    def change_db(self, db: str) -> None:
        self.db = self.couch[db]

    def print_all_documents(self, db):
        for id in db:
            doc = db[id]
            print(doc)

    def fix_linked_fragments(self) -> None:
        """
        Fixes missing meta data in linked fragments
        """
        self.db = self.couch["documents"]

        for id in self.db:
            doc = self.db[id]

            if doc['document_type'] == 'fragment':

                try:
                    for linked_fragment in doc["linked_fragments"]:
                        linked_fragment["sandbox"] = "admin"
                        linked_fragment["document_type"] = "fragment"

                    doc_id, doc_rev = self.db.save(doc)
                    if doc_id:
                        print(f"Updated {doc_id}")

                except Exception:
                    pass
                print("#####################")

            else:
                print('Not a fragment')
                continue


if __name__ == "__main__":
    migration = Migration()

    migration.fix_linked_fragments()
