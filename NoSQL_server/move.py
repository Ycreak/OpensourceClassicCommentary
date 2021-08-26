from fragments import *
from temp import *
import couchdb
from uuid import uuid4
import copy

couch = couchdb.Server('http://admin:mysecretpassword@localhost:5984/')
db = couch['fragments'] # existing       

# new_fragment = fragment_empty

# print(new_fragment)

for item in x:

    # new_fragment = {}
    # new_fragment = fragment_empty[:]
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

    # exit(0)

