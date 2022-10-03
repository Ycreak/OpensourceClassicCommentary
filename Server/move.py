from models import *
from temp import *
import couchdb
from uuid import uuid4
import copy

couch = couchdb.Server('http://admin:password@localhost:5984/')
db = couch['fragments'] # existing       

# new_fragment = fragment_empty

# print(new_fragment)




def change_field_fragments(field, replacement):
    for id in db:

        doc = db[id]

        print(doc[field])

        if doc[field] == '':
            doc[field] = replacement

        doc_id, doc_rev = db.save(doc)

def print_all_documents():
    for id in db:
        doc = db[id]
        print(doc)    

def add_field_to_fragments(field, data):
    for id in db:

        doc = db[id]

        doc[field] = 0

        doc_id, doc_rev = db.save(doc)

        print(doc)

def migrate_fragments(item):
    new_fragment = copy.deepcopy(fragment_empty)

    new_fragment['fragment_name'] = item['fragmentName']
    new_fragment['author'] = item['author']
    new_fragment['editor'] = item['editor']
    new_fragment['title'] = item['text']
    new_fragment['status'] = item['status']

    for line in item['content']:
        # print(line)
        new_line = {'line_number': line['lineName'], 'text': line['lineContent']}
        new_fragment['lines'].append(new_line)

    new_fragment['_id'] = uuid4().hex

    doc_id, doc_rev = db.save(new_fragment)
    print('############')
    print(new_fragment)

    exit(0)

########
# MAIN #
########
add_field_to_fragments('lock', 0)
# Print_all_documents()
