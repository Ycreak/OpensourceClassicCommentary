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
# from bibliography_handling import Bibliography_handler
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
        # Instantiate bibliography handler for when we need it
        # self.bib_handler = Bibliography_handler()

    def retrieve_all_authors(self) -> list:
        """Retrieves all the authors that exist in all documents in the database

        Returns:
            list: of all unique authors in the database
        """        
        
        data = retrieve_data_from_db(self.frag_db, {}, ['author'])
        return sorted(set([x['author'] for x in data]))

    def retrieve_all_titles(self, author) -> list:
        """Retrieves all available titles per given author

        Args:
            author (string): name of author

        Returns:
            list: of all titles from the given author
        """        
        data = retrieve_data_from_db(self.frag_db, {'author': author}, ['title'])
        return sorted(set([x['title'] for x in data]))
        
    def retrieve_all_editors(self, author, title) -> list:
        """Retrieves all editors available given an author and a title

        Args:
            author (string): name of author
            title (string): name of title

        Returns:
            list: of all editors from the given author and title
        """        
        data = retrieve_data_from_db(self.frag_db, {'author': author, 'title': title}, ['editor'])
        return sorted(set([x['editor'] for x in data]))
        
    def retrieve_all_fragments(self, fragment) -> list:
        """Retrieves all fragments available given an author, title and editor.
        NB: only retrieves the fields needed to show an edition!

        Args:
            author (str): name of author
            title (str): name of title
            editor (str): name of editor

        Returns:
            list: of all fragments given the parameters
        """                
        fragments = retrieve_data_from_db(self.frag_db, {'author': fragment.author, 'title': fragment.title, 'editor': fragment.editor}, [])

        fragment_list = []

        for fragment in fragments:
            fragment_entry = {
                'fragment_id' : fragment['_id'],
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

    def retrieve_fragment_content(self, fragment):
                
        doc = self.frag_db[fragment.fragment_id]

        for content in ['translation', 'apparatus', 'differences', 'context', 'commentary', 'reconstruction']:
            setattr(fragment, content, doc[content])

        # Also add linked bib entries separately as list
        bib_entry_list = []
        # if 'linked_bib_entries' in doc:        
        #     for bib_entry_id in doc['linked_bib_entries']:
        #         # retrieve the bib entry given the id and put it in the list
        #         bibliography = self.bib_handler.retrieve_bibliography_from_id(bib_entry_id)
                
        #         # book
        #         if bibliography['bib_entry_type'] == "book": # TODO vraag welk format men wil
        #             string = f"<p>{bibliography['author']}, ({bibliography['year']}), <i>{bibliography['title']}</i></p>"
        #         elif bibliography['bib_entry_type'] == 'article':
        #             string = f"<p>{bibliography['author']}, ({bibliography['year']}), <i>{bibliography['title']}</i></p>"
        #         else: raise KeyError("Bibliography has no valid type")

        #         bib_entry_list.append(string)

        # # bib_entry_list
        # print(bib_entry_list)
        # setattr(fragment, 'bib_entries', sorted(bib_entry_list))

        return fragment

    def retrieve_fragments_names(self, fragment):
        """Retrieves all fragment_names available given an author, title and an editor

        Args:
            fragment (Fragment): fragment object containing all needed data fields

        Returns:
            list: of all editors from the given author and title
        """        
        data = retrieve_data_from_db(self.frag_db, {'author': fragment.author,
                                                    'title': fragment.title,
                                                    'editor': fragment.editor,                                           
                                                    }, ['fragment_name'])
        return sorted(set([x['fragment_name'] for x in data]))
    
    def retrieve_complete_fragment(self, fragment) -> dict:
        """Returns all the data from the given fragment. Called in the dashboard

        Args:
            fragment_id (str): identifier of the fragment document

        Returns:
            couch document: with all data of the requested fragment
        """                
        #FIXME: HACK, needs to be fixed by the patch of Philippe
        if fragment.fragment_id != '':
            found_fragment = self.frag_db[fragment.fragment_id]
        else:
            result, found_fragment = self.find_fragment(fragment)
        # Add the fragment_id to the mix
        found_fragment['fragment_id'] = found_fragment.id
        return found_fragment #self.frag_db[fragment_id]

    def find_fragment(self, fragment): # -> tuple(bool, dict): #FIXME: does not work on Pi
        """Finds the requested fragment in the database

        Args:
            fragment (object): of a fragment

        Returns:
            bool: boolean indicating if user was found or not
            json: nosql document of the found fragment
        """                   
        found_fragment = retrieve_data_from_db(self.frag_db, {'author': fragment.author,
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
    def create_fragment(self, fragment) -> make_response:
        """ Creates a fragment from the provided data

        Args:
            fragment (object): fragment model containing all fragment data

        Returns:
            flask response: confirmation of (un)successful execution
        """
        # Check if the fragment already exists in the database
        fragment_exist, _ = self.find_fragment(fragment)

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

    def revise_fragment(self, fragment) -> make_response:
        """Revises the provided fragment with the provided data

        Args:
            fragment (object): fragment model containing all revised fragment data

        Returns:
            flask response: response on successful execution
        """                
        doc = self.frag_db[fragment.fragment_id]

        for field in doc:
            if hasattr(fragment, field) and field != 'fragment_id':
                doc[field] = getattr(fragment, field)

        doc_id, doc_rev = self.frag_db.save(doc)
        
        return make_response('Succesfully revised fragment!', 200)
       

    def delete_fragment(self, fragment) -> make_response:
        """Deletes the given fragment using its id

        Args:
            fragment (object): fragment object containing the id of the fragment to be deleted

        Returns:
            flask response: with information about the status
        """      
        doc = self.frag_db[fragment.fragment_id]
        self.frag_db.delete(doc)

        return make_response('Succesfully deleted fragment!', 200)

    def automatic_fragment_linker(self, given_fragment):
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
                            doc = self.frag_db[current_fragment['id']]                           
                            doc['linked_fragments'].append(other_fragment['id'])  # -> link the found fragment to the given fragment
                            doc['linked_fragments'] = list(set(doc['linked_fragments']))
                            doc_id, doc_rev = self.frag_db.save(doc)

                            doc = self.frag_db[other_fragment['id']]
                            doc['linked_fragments'].append(current_fragment['id'])  # -> link the found fragment to the given fragment
                            doc['linked_fragments'] = list(set(doc['linked_fragments']))                            
                            doc_id, doc_rev = self.frag_db.save(doc)

                            link_counter+=1
        # print(f'Found and linked {link_counter} matching lines.')
        return make_response(f'Found and linked {link_counter} matching lines.', 200)  

    def get_line_similarity(self, a, b):
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

    def create_additional_field(self, field, format):
        """This function allows you to add a new field to all documents in the database.

        Args:
            field (string): name of the field to be added
            format (various): data type of the value
        """        
        for id in self.frag_db:
            doc = self.frag_db[id]

            doc[field] = format
            doc_id, doc_rev = self.frag_db.save(doc)

    def create_complete_backup(self):
        for id in self.frag_db:
            doc = self.frag_db[id]

            print(doc, '\n')

# Developer functions
if __name__ == "__main__":
    fh = Fragment_handler()

    for id in fh.frag_db:
        doc = fh.frag_db[id]
        if doc['editor'] == 'TrRF':
            print(id)
            doc['editor'] = 'TRF'
            doc_id, doc_rev = fh.frag_db.save(doc)

    # fh.create_complete_backup()
    # fh.create_additional_field('linked_bib_entries', [])
    # mylist = fh.Retrieve_all_fragments('Pacuvius', 'Dulorestes', 'Schierl')
    # mylist = fh.Retrieve_all_fragments('Naevius', 'Lycurgus', 'TrRF')
    # mylist = fh.Retrieve_all_fragments('Ennius', 'Thyestes', 'TRF')

    # mylist = fh.Retrieve_all_editors('Ennius', 'Thyestes')
    # print(len(mylist))
    # print(mylist)
    # fh.migrate_linked_fragments_layout()

    # fh.Automatic_fragment_linker([])
