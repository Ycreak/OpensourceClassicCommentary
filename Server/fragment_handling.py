# Library Imports
import couchdb
import copy
from uuid import uuid4

from flask import Response, make_response
from flask_jsonpify import jsonify # TODO: convert jsonify to json_pickle

# For string similarity comparison
import string
# from fuzzywuzzy import fuzz

# Class Imports
from server_credentials import Credentials
from Models.fragment import Fragment
from utilities import *

# TODO:
# The fragment data should be sanitized

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
        data = Retrieve_data_from_db(self.frag_db, {}, ['author'])
        return sorted(set([x['author'] for x in data]))

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
        """Retrieves all fragments available given an author, title and editor.
        NB: only retrieves the fields needed to show an edition!

        Args:
            author (str): name of author
            title (str): name of title
            editor (str): name of editor

        Returns:
            list: of all fragments given the parameters
        """                
        fragments = Retrieve_data_from_db(self.frag_db, {'author': author, 'title': title, 'editor': editor}, [])

        fragment_list = []

        for fragment in fragments:
            fragment_entry = {
                'id' : fragment.id,
                'author' : fragment['author'],
                'title' : fragment['title'],
                'editor' : fragment['editor'],
                'fragment_name' : fragment['fragment_name'],
                'lines' : fragment['lines'],
                'status' : fragment['status'],
                'linked_fragments' : fragment['linked_fragments']
            }
            fragment_list.append(fragment_entry) 

        return fragment_list

    def Retrieve_fragment_content(self, fragment):
        doc = self.frag_db[fragment._id]
        
        for content in ['translation', 'apparatus', 'differences', 'context', 'commentary', 'reconstruction']:
            setattr(fragment, content, doc[content])
        
        return fragment

    def Retrieve_complete_fragment(self, fragment_id) -> dict:
        """Returns all the data from the given fragment

        Args:
            fragment_id (str): identifier of the fragment document

        Returns:
            couch document: with all data of the requested fragment
        """                
        return self.frag_db[fragment_id]

    def Find_fragment(self, fragment): # -> tuple(bool, dict): #FIXME: does not work on Pi
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
            fragment (object): fragment model containing all fragment data

        Returns:
            flask response: confirmation of (un)successful execution
        """
        # Check if the fragment already exists in the database
        fragment_exist, _ = self.Find_fragment(fragment)

        if fragment_exist:          
            return make_response('Fragment already exists!', 403)
        else:
            new_fragment = copy.deepcopy(fragment.fragment_empty)

            for fragment_entry in ['author', 'title', 'editor', 'fragment_name', 'status']:
                new_fragment[fragment_entry] = getattr(fragment, fragment_entry)

            # Give the fragment a unique id
            new_fragment['_id'] = uuid4().hex

            doc_id, doc_rev = self.frag_db.save(new_fragment)
            return make_response('Succesfully created fragment!', 201)

    def Revise_fragment(self, fragment) -> make_response:
        """Revises the provided fragment with the provided data

        Args:
            fragment (object): fragment model containing all revised fragment data

        Returns:
            flask response: response on successful execution
        """        
        doc = self.frag_db[fragment._id]

        for fragment_entry in ['fragment_name', 'author', 'title', 'editor', 'translation', 
                         'differences', 'apparatus', 'commentary', 'reconstruction',
                         'context', 'lines', 'linked_fragments', 'status']:
            doc[fragment_entry] = getattr(fragment, fragment_entry)
        
        doc_id, doc_rev = self.frag_db.save(doc)
        
        return make_response('Succesfully revised fragment!', 200)


    # DEPRECATED: this used to be the Create/Revise button. Separated again.
    # def Revise_fragment(self, fragment) -> make_response:
    #     """Revises the provided fragment with the provided data. Creates a new one
    #     if none exists yet.

    #     Args:
    #         fragment (object): fragment model containing all revised fragment data

    #     Returns:
    #         flask response: response on successful execution
    #     """        
    #     # Check if the fragment already exists in the database
    #     fragment_exist, _ = self.Find_fragment(fragment)

    #     if fragment_exist:          
    #         doc = self.frag_db[fragment._id]

    #         for fragment_entry in ['fragment_name', 'author', 'title', 'editor', 'translation', 
    #                         'differences', 'apparatus', 'commentary', 'reconstruction',
    #                         'context', 'lines', 'linked_fragments', 'status']:
    #             doc[fragment_entry] = getattr(fragment, fragment_entry)
            
    #         doc_id, doc_rev = self.frag_db.save(doc)
    #         return make_response('Succesfully revised fragment!', 200)

    #     else:
    #         new_fragment = copy.deepcopy(fragment.fragment_empty)

    #         for fragment_entry in ['fragment_name', 'author', 'title', 'editor', 'translation', 
    #                         'differences', 'apparatus', 'commentary', 'reconstruction',
    #                         'context', 'lines', 'linked_fragments', 'status']:
    #             new_fragment[fragment_entry] = getattr(fragment, fragment_entry)

    #         # Give the fragment a unique id
    #         new_fragment['_id'] = uuid4().hex

    #         doc_id, doc_rev = self.frag_db.save(new_fragment)
    #         return make_response('Succesfully created fragment!', 201)            

    def Delete_fragment(self, fragment) -> make_response:
        """Deletes the given fragment using its id

        Args:
            fragment (object): fragment object containing the id of the fragment to be deleted

        Returns:
            flask response: with information about the status
        """      
        doc = self.frag_db[fragment._id]
        self.frag_db.delete(doc)

        return make_response('Succesfully deleted fragment!', 200)

    def Set_fragment_lock(self, fragment) -> make_response:
        """Locks the fragment so that it cannot be edited

        Args:
            fragment (object): fragment object with the id and lock status to be changed

        Returns:
            flask response: confirmation of lock status change
        """
        doc = self.frag_db[fragment._id]
        doc['lock'] = fragment.lock
        doc_id, doc_rev = self.frag_db.save(doc)

        return make_response('Fragment lock status set', 200)

    def Automatic_fragment_linker(self, given_fragment):
        '''
        Finds fragments containing similar lines and links the fragments together.
        This function is very very very expensive. You should be Richie Rich rich.
        About halfway between Bruce Wayne and Scrooge McDuck.

        Args:
            given_fragment (obj): fragment object with all data needed

        Returns:
            flask response: confirmation of number of lines linked
        '''
                
        link_counter = 0 # Counter for number of lines linked
        # the amount of similarity between fragments needed to be linked
        EQUALITY_RATIO = 90 
        # extract the data we need
        author = given_fragment.author
        title = given_fragment.title
        
        # First, make a list of all fragments from the given author and title
        fragment_list = []
        for id in self.frag_db:
            doc = self.frag_db[id]
            if doc['author'] == author and doc['title'] == title:
                fragment_list.append(doc)
                       
        # Check every fragment for linking with other fragments. Use pop to save some work       
        while(fragment_list):
            current_fragment = fragment_list.pop()
            
            for current_fragment_line in current_fragment['lines']:

                # Check this line against all lines of those fragments residing in fragment_list
                for other_fragment in fragment_list:
                    for other_fragment_line in other_fragment['lines']:
                        # check if given line is similar to found line
                        if self.Get_line_similarity(current_fragment_line.get('text'), other_fragment_line.get('text')) >= EQUALITY_RATIO:

                            # Link both fragments together
                            doc = self.frag_db[current_fragment['_id']]                           
                            doc['linked_fragments'].append(other_fragment['_id'])  # -> link the found fragment to the given fragment
                            doc['linked_fragments'] = list(set(doc['linked_fragments']))
                            doc_id, doc_rev = self.frag_db.save(doc)

                            doc = self.frag_db[other_fragment['_id']]
                            doc['linked_fragments'].append(current_fragment['_id'])  # -> link the found fragment to the given fragment
                            doc['linked_fragments'] = list(set(doc['linked_fragments']))                            
                            doc_id, doc_rev = self.frag_db.save(doc)

                            link_counter+=1
        # print(f'Found and linked {link_counter} matching lines.')
        return make_response(f'Found and linked {link_counter} matching lines.', 200)  

    def Get_line_similarity(self, a, b):
        """ Returns the ratio of similarity between the two given strings

        Args:
            a (str): first string to be compared
            b (str): second string to be compared

        Returns:
            integer: of ratio of similarity between to arguments (value between 0 and 100)
        """     
        # remove punctuation and capitalisation
        a = a.translate(str.maketrans('', '', string.punctuation)).lower()
        b = b.translate(str.maketrans('', '', string.punctuation)).lower()
        return fuzz.token_sort_ratio(a,b)      

    def migrate_linked_fragments_layout(self):
        """ Simple function to migrate the linked fragment layout
        """        
        for id in self.frag_db:
            doc = self.frag_db[id]
            doc['linked_fragments'] = []
            doc_id, doc_rev = self.frag_db.save(doc)

# Developer functions
if __name__ == "__main__":
    fh = Fragment_handler()

    mylist = fh.Retrieve_all_fragments('Pacuvius', 'Dulorestes', 'Schierl')
    # mylist = fh.Retrieve_all_fragments('Naevius', 'Lycurgus', 'TrRF')
    # mylist = fh.Retrieve_all_fragments('Ennius', 'Thyestes', 'TRF')

    # mylist = fh.Retrieve_all_editors('Ennius', 'Thyestes')
    print(len(mylist))
    print(mylist)
    # fh.migrate_linked_fragments_layout()

    # fh.Automatic_fragment_linker([])