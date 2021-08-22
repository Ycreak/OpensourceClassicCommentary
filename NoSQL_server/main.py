# http://localhost:5984/_utils/

from fragments import *

import couchdb
# couch = couchdb.Server()

couch = couchdb.Server('http://admin:mysecretpassword@localhost:5984/')

# Create Database
# db = couch.create('fragments')

# Load Database
db = couch['fragments'] # existing

# doc_id, doc_rev = db.save(fragment1)          
# doc_id, doc_rev = db.save(fragment2)          
# doc_id, doc_rev = db.save(fragment4)          

# GET FUNCTIONS
def Retrieve_data(selector, fields):
    
    return db.find({
            'selector': selector,
            'fields': fields,
        })

def Retrieve_all_authors():

    data = Retrieve_data({}, ['author'])
    return sorted(set([x['author'] for x in data]))

def Retrieve_all_titles(author):

    data = Retrieve_data({'author': author}, ['title'])
    return sorted(set([x['title'] for x in data]))

def Retrieve_all_editors(author, title):
    
    data = Retrieve_data({'author': author, 'title': title}, ['editor'])
    return sorted(set([x['editor'] for x in data]))

def Retrieve_fragment_lines(author, title, editor):

    data = Retrieve_data({'author': author, 'title': title, 'editor': editor}, ['lines'])
    return [x['lines'] for x in data]

def Retrieve_fragment_commentary(author, title, editor):

    data = Retrieve_data({'author': author, 'title': title, 'editor': editor}, ['commentary'])
    return [x['commentary'] for x in data]    

def Retrieve_fragment_differences(author, title, editor):

    data = Retrieve_data({'author': author, 'title': title, 'editor': editor}, ['differences'])
    return [x['differences'] for x in data]    

def Retrieve_fragment_context(author, title, editor):

    data = Retrieve_data({'author': author, 'title': title, 'editor': editor}, ['context'])
    return [x['context'] for x in data]   

def Retrieve_fragment_translation(author, title, editor):

    data = Retrieve_data({'author': author, 'title': title, 'editor': editor}, ['translation'])
    return [x['translation'] for x in data]    

def Retrieve_fragment_apparatus(author, title, editor):

    data = Retrieve_data({'author': author, 'title': title, 'editor': editor}, ['apparatus'])
    return [x['apparatus'] for x in data]   

def Retrieve_fragment_reconstruction(author, title, editor):

    data = Retrieve_data({'author': author, 'title': title, 'editor': editor}, ['reconstruction'])
    return [x['reconstruction'] for x in data]   

def Retrieve_fragment_numbers(author, title, editor):
    data = Retrieve_data({'author': author, 'title': title, 'editor': editor}, ['fragment_name'])
    return [x['fragment_name'] for x in data]   

# POST FUNCTIONS
def Create_fragment():
    
    new_fragment = fragment_empty

    new_fragment['author'] = 'Ennius'
    new_fragment['title'] = 'Thyestes'
    new_fragment['editor'] = 'Jocelyn'

    new_fragment['fragment_name'] = 142

def Revise_fragment_translation(fragment, translation):
    fragment['translation'] = translation

def Revise_fragment_apparatus(fragment, apparatus):
    fragment['apparatus'] = apparatus

def Revise_fragment_differences(fragment, differences):
    fragment['differences'] = differences

def Revise_fragment_commentary(fragment, commentary):
    fragment['commentary'] = commentary

def Revise_fragment_reconstruction(fragment, reconstruction):
    fragment['reconstruction'] = reconstruction


def Revise_fragment_lines(fragment, lines):

    fragment['lines'] = lines

def Revise_fragment_context(fragment, context_author, context):
    
    # Find the context author first

    # Revise its context
    fragment['reconstruction'] = reconstruction

def Delete_fragment_context_author(fragment, context_author):

    # Delete the context author
    pass

author = 'Ennius'
title = 'Thyestes'
editor = 'TRF'

authors = Retrieve_all_authors()
titles = Retrieve_all_titles(author)
editors = Retrieve_all_editors(author, title)

print(authors)
print(titles)
print(editors)

print(Retrieve_fragment_lines(author, title, editor))

print(Retrieve_fragment_apparatus(author, title, editor))
print(Retrieve_fragment_reconstruction(author, title, editor))
print(Retrieve_fragment_context(author, title, editor))


print(Retrieve_fragment_numbers(author, title, editor))

Create_fragment()

    # print(data)

# # Load document using ID
# doc = db[doc_id]

# # Get specific field from the selected document
# print(doc['type'])
# print(doc['name'])

# # Update a field from the selected dccument
# doc['name'] = 'Mary Jane' 

# # doc = {'foo': 'bar'}
# # db.save(doc)

# # print(doc)
# # print(db['e0658cab843b59e63c8779a9a5000b01'])

# # doc['name'] = 'Mary Jane'
# # db[doc.id] = doc

# # db['JohnDoe'] = {'type': 'person', 'name': 'John Doe'}

# for id in db:
#     print(id)

