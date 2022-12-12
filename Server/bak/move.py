import couchdb

couch = couchdb.Server('http://admin:yVu4DES8qzajPCy@localhost:5984/')
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

"""
Migration towards the new linked_fragments layout
"""
# for id in db:
#     doc = db[id]
#     try:
#         new_linked_fragments = []
#         print(
#             doc['author'],
#             doc['title'],
#             doc['editor'], 
#             doc['fragment_name'],
#             doc['_id']
#             )
#         for linked_fragment_id in doc['linked_fragments']:
#             my_dict = {
#                 'linked_fragment_id':linked_fragment_id, 
#                 'author':db[linked_fragment_id]['author'],
#                 'title':db[linked_fragment_id]['title'],
#                 'editor':db[linked_fragment_id]['editor'],
#                 'name':db[linked_fragment_id]['fragment_name'],
#             }
#             new_linked_fragments.append(my_dict)

#         if new_linked_fragments:
#             doc['linked_fragments'] = new_linked_fragments
#             doc_id, doc_rev = db.save(doc)
#         print('######################')
#     except:
#         pass

"""
Rafactoring fragment_name to name
"""
for id in db:
    doc = db[id]

    try:
        print(doc['author'], doc['title'], doc['editor'], doc['_id'])
        doc['name'] = doc.pop('fragment_name')
        doc_id, doc_rev = db.save(doc)
    except:
        pass

    print('#####################')