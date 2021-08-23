# http://localhost:5984/_utils/
from fragments import *
import couchdb

# couch = couchdb.Server()

class CouchDB:
    def __init__(self):

        couch = couchdb.Server('http://admin:mysecretpassword@localhost:5984/')
        # Load Database
        self.db = couch['fragments'] # existing       

    # GET FUNCTIONS
    def Retrieve_data(self, selector, fields):
        
        return self.db.find({
                'selector': selector,
                'fields': fields,
            })

    def Retrieve_all_authors(self):

        # self.db.save(fragment1)
        # self.db.save(fragment2)
        # self.db.save(fragment3)
        # self.db.save(fragment4)

        data = self.Retrieve_data({}, ['author'])
        return sorted(set([x['author'] for x in data]))

    def Retrieve_all_titles(self, author):

        data = self.Retrieve_data({'author': author}, ['title'])
        return sorted(set([x['title'] for x in data]))

    def Retrieve_all_editors(self, author, title):
        
        data = self.Retrieve_data({'author': author, 'title': title}, ['editor'])
        return sorted(set([x['editor'] for x in data]))

    def Retrieve_all_fragments(self, author, title, editor):

        return self.Retrieve_data({'author': author, 'title': title, 'editor': editor}, [])


    def Retrieve_fragment_numbers(self, author, title, editor):

        data = self.Retrieve_data({'author': author, 'title': title, 'editor': editor}, ['fragment_name'])

        
        return sorted(set([x['fragment_name'] for x in data]))
        
    def Retrieve_fragment_data(self, fragment, field):
        return self.db[fragment][field]   

    # POST FUNCTIONS
    def Create_fragment(self, author, title, editor, fragment_name):
        
        new_fragment = fragment_empty

        new_fragment['author'] = author
        new_fragment['title'] = title
        new_fragment['editor'] = editor

        new_fragment['fragment_name'] = fragment_name

        return new_fragment          

    def Revise_fragment_field(self, fragment, field, text):
        fragment[field] = text
        return fragment

    def Revise_fragment_lines(self, fragment, line_number, content):
        # Find the context author first
        dicts = fragment['lines']

        # Search for the context author
        found_dict = next((item for item in dicts if item["line_number"] == line_number), False)

        # If he is found, change its data
        if found_dict:
            found_dict['text'] = content

        # If he is not here, create an entry
        else:
            new_dict_entry = {'line_number': line_number, 'text': content}
            context_dicts.append(new_dict_entry)
            fragment['lines'] = context_dicts

        return fragment


    def Delete_fragment_line(self, fragment, line_number):

        line_dicts = fragment['lines']

        # Only save the entries that are not the given entry
        result = [i for i in line_dicts if not (i['line_number'] == line_number)]

        fragment['line'] = result

        return fragment

    def Revise_fragment_context(self, fragment, context_author, context):
        
        # Find the context author first
        context_dicts = fragment['context']

        # Search for the context author
        found_dict = next((item for item in context_dicts if item["author"] == context_author), False)

        # If he is found, change its data
        if found_dict:
            found_dict['text'] = context

        # If he is not here, create an entry
        else:
            new_dict_entry = {'author': context_author, 'text': context}
            context_dicts.append(new_dict_entry)
            fragment['context'] = context_dicts

        return fragment

    def Delete_fragment_context_author(self, fragment, context_author):

        context_dicts = fragment['context']

        # Only save the entries that are not the given entry
        result = [i for i in context_dicts if not (i['author'] == context_author)]

        fragment['context'] = result

        return fragment

    # author = 'Ennius'
    # title = 'Thyestes'
    # editor = 'TRF'

    # fragment_id = '618fc880b451d992e9764584d8009e22'
    # fragment = db[fragment_id]

    # revised_text = 'Hello mommy'

# print(Retrieve_fragment_numbers(author, title, editor))

# data = Retrieve_fragment_data(fragment, 'commentary')
# data = Retrieve_fragment_data(fragment, 'lines')

# print(data)

# fragment = Revise_fragment_field(fragment, 'apparatus', revised_text)
# fragment = Revise_fragment_context(fragment, 'Gracchus', "Free the people!")
# fragment = Delete_fragment_context_author(fragment, 'Gracchus')
# fragment = Delete_fragment_line(fragment, '2')

# print(fragment)

    # db.save(fragment1)
    # db.save(fragment2)
    # db.save(fragment3)
    # db.save(fragment4)

# print(db[doc_id])
# authors = Retrieve_all_authors()
# titles = Retrieve_all_titles(author)
# editors = Retrieve_all_editors(author, title)

# print(authors)
# print(titles)
# print(editors)

# print(Retrieve_fragment_lines(author, title, editor))

# print(Retrieve_fragment_apparatus(author, title, editor))
# print(Retrieve_fragment_reconstruction(author, title, editor))
# print(Retrieve_fragment_context(author, title, editor))


# print(Retrieve_fragment_numbers(author, title, editor))


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

