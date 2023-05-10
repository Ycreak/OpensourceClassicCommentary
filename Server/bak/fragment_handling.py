# Library Imports
import couchdb

from flask import Response, make_response
# Class Imports
from server_credentials import Credentials
from bibliography_handling import Bibliography_handler
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



    def Revise_fragment(self, fragment) -> make_response:
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
