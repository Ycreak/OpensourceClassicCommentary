# http://localhost:5984/_utils/
from fragments import *
import couchdb
from uuid import uuid4
import copy
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


    # def Retrieve_fragment_numbers(self, author, title, editor):

    #     data = self.Retrieve_data({'author': author, 'title': title, 'editor': editor}, ['fragment_name'])

        
    #     return sorted(set([x['fragment_name'] for x in data]))
        
    def Retrieve_fragment_data(self, fragment, field):
        return self.db[fragment][field]   

    def Retrieve_complete_fragment(self, fragment_id):
        return self.db[fragment_id]

    # POST FUNCTIONS
    def Create_fragment(self, created_fragment):
        
        # Check if fragment with this information does not already exist!

        # Create independent copy of the empty fragment JSON
        new_fragment = copy.deepcopy(fragment_empty)

        new_fragment['author'] = created_fragment['author']
        new_fragment['title'] = created_fragment['title']
        new_fragment['editor'] = created_fragment['editor']

        new_fragment['fragment_name'] = created_fragment['fragment_name']
        
        # TODO: check if none maybe?
        new_fragment['status'] = created_fragment['status']

        new_fragment['_id'] = uuid4().hex #, 'type': 'person', 'name': 'John Doe'}

        doc_id, doc_rev = self.db.save(new_fragment)

        return 418          

    def Revise_fragment(self, revised_fragment):
        fragment_id = revised_fragment['_id']
        revised_fragment.pop('_id')

        doc = self.db[fragment_id]

        doc['fragment_name'] = revised_fragment['fragment_name']
        doc['author'] = revised_fragment['author']
        doc['title'] = revised_fragment['title']
        doc['editor'] = revised_fragment['editor']
        doc['translation'] = revised_fragment['translation']
        doc['differences'] = revised_fragment['differences']
        doc['apparatus'] = revised_fragment['apparatus']
        doc['commentary'] = revised_fragment['commentary']
        doc['reconstruction'] = revised_fragment['reconstruction']
        doc['context'] = revised_fragment['context']
        doc['lines'] = revised_fragment['lines']
        doc['linked_fragments'] = revised_fragment['linked_fragments']
        doc['status'] = revised_fragment['status']

        self.db[doc.id] = doc

        return 418

    def Delete_fragment(self, fragment):
        print('hoi', fragment['fragment_id'])
        
        fragment_id = fragment['fragment_id']

        doc = self.db[fragment_id]

        self.db.delete(doc)

        return 418

    # def Revise_fragment_field(self, fragment, field, text):
    #     fragment[field] = text
    #     return fragment

    # def Revise_fragment_lines(self, fragment, line_number, content):
    #     # Find the context author first
    #     dicts = fragment['lines']

    #     # Search for the context author
    #     found_dict = next((item for item in dicts if item["line_number"] == line_number), False)

    #     # If he is found, change its data
    #     if found_dict:
    #         found_dict['text'] = content

    #     # If he is not here, create an entry
    #     else:
    #         new_dict_entry = {'line_number': line_number, 'text': content}
    #         context_dicts.append(new_dict_entry)
    #         fragment['lines'] = context_dicts

    #     return fragment


    # def Delete_fragment_line(self, fragment, line_number):

    #     line_dicts = fragment['lines']

    #     # Only save the entries that are not the given entry
    #     result = [i for i in line_dicts if not (i['line_number'] == line_number)]

    #     fragment['line'] = result

    #     return fragment

    # def Revise_fragment_context(self, fragment, context_author, context):
        
    #     # Find the context author first
    #     context_dicts = fragment['context']

    #     # Search for the context author
    #     found_dict = next((item for item in context_dicts if item["author"] == context_author), False)

    #     # If he is found, change its data
    #     if found_dict:
    #         found_dict['text'] = context

    #     # If he is not here, create an entry
    #     else:
    #         new_dict_entry = {'author': context_author, 'text': context}
    #         context_dicts.append(new_dict_entry)
    #         fragment['context'] = context_dicts

    #     return fragment

    # def Delete_fragment_context_author(self, fragment, context_author):

    #     context_dicts = fragment['context']

    #     # Only save the entries that are not the given entry
    #     result = [i for i in context_dicts if not (i['author'] == context_author)]

    #     fragment['context'] = result

    #     return fragment
