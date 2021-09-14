from models import *

import couchdb
from uuid import uuid4
import copy

from flask import Response, make_response
from flask_jsonpify import jsonify

from server_credentials import Credentials
from utilities import *

class Fragment_handler:
    def __init__(self):
        # Connect to the server using the stored credentials
        server_address = Credentials().generate_server_url()
        database = couchdb.Server(server_address)

        # Select the database we need
        self.frag_db = database['fragments']

    # GET FUNCTIONS
    def Retrieve_all_x(self, x):

        all_list = []

        for id in self.frag_db:
            all_list.append(self.frag_db[id][x])

        return all_list

    # def Retrieve_data(self, selector, fields):
    #     return self.frag_db.find({
    #             'selector': selector,
    #            'fields': fields,
    #         })

    def Retrieve_all_authors(self):

        author_list = self.Retrieve_all_x('author') # FIXME: cant use Retrieve_data here... only returns 20 results
        
        data = Retrieve_data_from_db(self.frag_db, {}, [])
        
        method1 = sorted(set([x['author'] for x in data]))
        method2 = sorted(set(author_list))

        return sorted(set(author_list))

    def Retrieve_all_titles(self, author):
        #TODO: this should be in a view maybe?
        data = Retrieve_data_from_db(self.frag_db, {'author': author}, ['title'])
        return sorted(set([x['title'] for x in data]))

    def Retrieve_all_editors(self, author, title):

        data = Retrieve_data_from_db(self.frag_db, {'author': author, 'title': title}, ['editor'])
        return sorted(set([x['editor'] for x in data]))

    def Retrieve_all_fragments(self, author, title, editor):

        return Retrieve_data_from_db(self.frag_db, {'author': author, 'title': title, 'editor': editor}, [])

    def Retrieve_fragment_data(self, fragment, field):
        return self.frag_db[fragment][field]   

    def Retrieve_complete_fragment(self, fragment_id):
        return self.frag_db[fragment_id]

    # POST FUNCTIONS
    def Create_fragment(self, created_fragment):

        # Check if fragment with this information does not already exist!
        author = created_fragment['author']
        title = created_fragment['title']
        editor = created_fragment['editor']
        fragment_name = created_fragment['fragment_name']

        found_fragment = Retrieve_data_from_db(self.frag_db, {'author': author, 'title': title, 'editor': editor, 'fragment_name': fragment_name}, [])

        result = [x.id for x in found_fragment]

        if result:           
            return make_response('Fragment already exists!', 403)
            
        else:
            print('not found')
            # Create independent copy of the empty fragment JSON
            new_fragment = copy.deepcopy(fragment_empty)

            new_fragment['author'] = created_fragment['author']
            new_fragment['title'] = created_fragment['title']
            new_fragment['editor'] = created_fragment['editor']

            new_fragment['fragment_name'] = created_fragment['fragment_name']

            new_fragment['status'] = created_fragment['status']

            new_fragment['_id'] = uuid4().hex #, 'type': 'person', 'name': 'John Doe'}

            doc_id, doc_rev = self.frag_db.save(new_fragment)

            return make_response('Succesfully created fragment!', 201)

    def Revise_fragment(self, revised_fragment):
        fragment_id = revised_fragment['_id']
        revised_fragment.pop('_id')

        doc = self.frag_db[fragment_id]

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

        self.frag_db[doc.id] = doc

        return make_response('Succesfully revised fragment!', 200)

    def Delete_fragment(self, fragment):
        """Deletes the given fragment using its id

        Args:
            fragment (str): _id of the fragment

        Returns:
            flask response: with information about the status
        """        
        fragment_id = fragment['fragment_id']

        doc = self.frag_db[fragment_id]

        self.frag_db.delete(doc)

        return make_response('Succesfully deleted fragment!', 200)

    def Set_fragment_lock(self, fragment_id, lock_status):
        """Locks the fragment so that it cannot be edited

        Args:
            fragment_id (str): _id of the fragment
            lock_status (int): 0 = unlocked, 1 = locked

        Returns:
            flask response: confirmation of lock status change
        """        
        assert isinstance(fragment_id, str)
        assert isinstance(lock_status, int)

        doc = self.frag_db[fragment_id]
        doc['lock'] = lock_status
        doc_id, doc_rev = self.frag_db.save(doc)

        return make_response('Fragment lock status set', 200)

temp = Fragment_handler()
temp.Retrieve_all_authors()