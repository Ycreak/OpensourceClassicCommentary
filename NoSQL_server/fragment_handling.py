from models import *

import couchdb
from uuid import uuid4
import copy

from flask import Response, make_response
from flask_jsonpify import jsonify

from server_credentials import Credentials
from utilities import *

from Models.fragment import Fragment

class Fragment_handler:
    def __init__(self):
        # Connect to the server using the stored credentials
        server_address = Credentials().generate_server_url()
        database = couchdb.Server(server_address)

        # Select the database we need
        self.frag_db = database['fragments']

    def Retrieve_all_authors(self) -> list:
        """Retrieves all the authors that exist in all documents in the database

        Returns:
            list: of all unique authors in the database
        """        
        author_list = Retrieve_data_from_db(self.frag_db, {}, [])
        return sorted(set([x['author'] for x in author_list]))

    def Retrieve_all_titles(self, author) -> list:
        """Retrieves all available titles per given author

        Args:
            author (string): name of author

        Returns:
            list: of all titles from the given author
        """        
        data = Retrieve_data_from_db(self.frag_db, {'author': author}, ['title'])
        return sorted(set([x['title'] for x in data]))

    def Retrieve_all_editors(self, author, title) -> list:
        """Retrieves all editors available given an author and a title

        Args:
            author (string): name of author
            title (string): name of title

        Returns:
            list: of all editors from the given author and title
        """        
        data = Retrieve_data_from_db(self.frag_db, {'author': author, 'title': title}, ['editor'])
        return sorted(set([x['editor'] for x in data]))

    def Retrieve_all_fragments(self, author, title, editor) -> list:
        """Retrieves all fragments available given an author, title and editor

        Args:
            author (str): name of author
            title (str): name of title
            editor (str): name of editor

        Returns:
            list: of all fragments given the parameters
        """        
        return Retrieve_data_from_db(self.frag_db, {'author': author, 'title': title, 'editor': editor}, [])

    def Retrieve_fragment_data(self, fragment, field):  #TODO: retrieve fragment content in one line
        return self.frag_db[fragment][field]   

    def Retrieve_complete_fragment(self, fragment_id) -> dict:
        """Returns all the data from the given fragment

        Args:
            fragment_id (str): identifier of the fragment document

        Returns:
            couch document: with all data of the requested fragment
        """                
        return self.frag_db[fragment_id]

    def Find_fragment(self, fragment) -> tuple[bool, dict]:
        """Finds the requested fragment in the database

        Args:
            fragment (object): of a fragment

        Returns:
            bool: boolean indicating if user was found or not
            json: nosql document of the found fragment
        """                   
        found_fragment = Retrieve_data_from_db(self.frag_db, {'author': fragment.author,
                                                              'title': fragment.title,
                                                              'editor': fragment.editor,
                                                              'fragment_name': fragment.fragment_name}, [])
        
        result = [x for x in found_fragment]

        try:
            fragment_doc = result[0]
            return True, fragment_doc
        except: #TODO: it was not a key error 11
            return False, {}    

    # POST FUNCTIONS
    def Create_fragment(self, fragment) -> make_response:
        """ Creates a fragment from the provided data

        Args:
            fragment (json): meta data provided to create a fragment

        Returns:
            flask response: confirmation of (un)successful execution
        """
        # Check if the fragment already exists in the database
        fragment_exist, _ = self.Find_fragment(fragment)

        if fragment_exist:           
            return make_response('Fragment already exists!', 403)
        else:
            new_fragment = copy.deepcopy(fragment_empty)

            for db_entry in ['author', 'title', 'editor', 'fragment_name', 'status']:
                new_fragment[db_entry] = getattr(fragment, db_entry)
            # Give the fragment a unique id
            new_fragment['_id'] = uuid4().hex

            doc_id, doc_rev = self.frag_db.save(new_fragment)
            return make_response('Succesfully created fragment!', 201)

    def Revise_fragment(self, revised_fragment) -> make_response:
        """Revises the provided fragment with the provided data

        Args:
            revised_fragment (json): object containing the revised fragment

        Returns:
            flask response: response on successful execution
        """        
        fragment_id = revised_fragment['_id']
        revised_fragment.pop('_id')

        doc = self.frag_db[fragment_id]

        for db_entry in ['fragment_name', 'author', 'title', 'editor', 'translation', 
                         'differences', 'apparatus', 'commentary', 'reconstruction',
                         'context', 'lines', 'linked_fragments', 'status']:
            doc[db_entry] = revised_fragment[db_entry]

        self.frag_db[doc.id] = doc

        return make_response('Succesfully revised fragment!', 200)

    def Delete_fragment(self, fragment) -> make_response:
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

    def Set_fragment_lock(self, fragment_id, lock_status) -> make_response:
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