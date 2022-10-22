# Library Imports
import couchdb
import copy
from uuid import uuid4

from flask import Response, make_response
from flask_jsonpify import jsonify # TODO: convert jsonify to json_pickle
from fuzzywuzzy import fuzz

# Class Imports
from server_credentials import Credentials
from Models.fragment import Fragment
from Models.bib_entry import Bib_entry

from utilities import *

class Bibliography_handler:
    def __init__(self):
        # Connect to the server using the stored credentials
        server_address = Credentials().generate_server_url()
        database = couchdb.Server(server_address)

        # Select the database we need
        self.bib_db = database['bibliography']
        

    def add_entry(self, bib_entry):
        """Adds a new bibliography entry to the database. Checks first if the entry all exists
        given author, title and other fields. Next, creates a template corresponding to the bib
        type. Fills it accordingly and writes it to the database.

        Args:
            bib_entry (object): with all bibliography data sent by OSCC

        Raises:
            ValueError: if an unknown bibliography type is given

        Returns:
            flask response: whether the operation was succesful
        """        
        check_exist = False
        #TODO: check if the title already exists
        if check_exist:
            EQUALITY_RATIO = 90 
            for id in self.bib_db:
                author = self.bib_db[id]['author']
                title = self.bib_db[id]['title']

                if fuzz.ratio(bib_entry['author'], author) > EQUALITY_RATIO and fuzz.ratio(bib_entry['title'], title) > EQUALITY_RATIO:
                    return make_response(f'Similar bibliography entry already exists: {author}, {title}', 403)

        # depending on the entry type, create a template. 
        if bib_entry.bib_entry_type == 'book': new_entry = copy.deepcopy(bib_entry.book_empty)
        elif bib_entry.bib_entry_type == 'article': new_entry = copy.deepcopy(bib_entry.article_empty)
        elif bib_entry.bib_entry_type == 'incollection': new_entry = copy.deepcopy(bib_entry.incollection_empty)
        else: raise ValueError('Unknown bibliography entry type.')
        # Now fill the created JSON entry with the corresponding data from our python object
        for field in new_entry:
            if hasattr(bib_entry, field):
                new_entry[field] = getattr(bib_entry, field) # very pep

        # Give the fragment a unique id
        new_entry['_id'] = uuid4().hex

        doc_id, doc_rev = self.bib_db.save(new_entry)
        print('Succesfully created bibliography entry!')
        return make_response('Succesfully created bibliography entry!', 201)

    def revise_entry(self, bib_entry):
        """Revises the provided bibliography entry with the provided data

        Args:
            bib_entry (object): bibliography entry model containing all revised bibliography entry data

        Returns:
            flask response: response on successful execution
        """                  
        doc = self.bib_db[bib_entry.id]

        # Take the document and replace its fields with the new data received
        for field in doc:
            if hasattr(bib_entry, field):
                doc[field] = getattr(bib_entry, field)
        
        doc_id, doc_rev = self.bib_db.save(doc)
        
        print('Succesfully revised bibliography entry!')
        return make_response('Succesfully revised bibliography entry!', 200)
        

    def delete_entry(self, bib_entry):
        """Deletes the given bibliography entry using its id

        Args:
            bib_entry (object): bibliography entry object containing the id of the bibliography entry to be deleted

        Returns:
            flask response: with information about the status
        """      
        doc = self.bib_db[bib_entry.id]
        self.bib_db.delete(doc)

        return make_response('Succesfully deleted fragment!', 200)

    def retrieve_all_authors(self):
        """Retrieves the names of all editors in the database

        Returns:
            list: of all authors in the database
        """
        data = Retrieve_data_from_db(self.bib_db, {}, ['author'])
        return sorted(set([x['author'] for x in data]))

    def retrieve_bibliography_from_author(self, author):
        """Retrieves the complete bibliography for a given author

        Arguments:
            author(str): name of the author to find the bibliography for

        Returns:
            bib_list(list): list of bibliography objects linked to the given author
        """
        bibliographies = Retrieve_data_from_db(self.bib_db, {'author': author}, [])

        print(type(bibliographies))

        bib_list = []

        for bibliography in bibliographies:
            
            bib_object = Bib_entry(bibliography)
            bib_entry = {'_id' : bib_object.id, 'bib_entry_type': bib_object.bib_entry_type}
            
            if hasattr(bib_object, 'author'): bib_entry['author'] = bib_object.author
            if hasattr(bib_object, 'title'): bib_entry['title'] = bib_object.title
            if hasattr(bib_object, 'year'): bib_entry['year'] = bib_object.year
            if hasattr(bib_object, 'series'): bib_entry['series'] = bib_object.series
            if hasattr(bib_object, 'number'): bib_entry['number'] = bib_object.number
            if hasattr(bib_object, 'location'): bib_entry['location'] = bib_object.location
            if hasattr(bib_object, 'edition'): bib_entry['edition'] = bib_object.edition
            if hasattr(bib_object, 'journal'): bib_entry['journal'] = bib_object.journal
            if hasattr(bib_object, 'volume'): bib_entry['volume'] = bib_object.volume
            if hasattr(bib_object, 'pages'): bib_entry['pages'] = bib_object.pages

            bib_list.append(bib_entry) 

        return bib_list

    def retrieve_bibliography_from_id(self, _id):
        """Retrieves the complete bibliography for a given id

        Arguments:
            _id(str): name of the id to find the bibliography for

        Returns:
            bib_list(list): list of bibliography objects linked to the given id
        """
        bibliographies = Retrieve_data_from_db(self.bib_db, {'_id': _id}, [])
  
        for bibliography in bibliographies:   # This needs to be a loop for some reason     
            bib_object = Bib_entry(bibliography)  
            bib_entry = {'_id' : bib_object.id, 'bib_entry_type': bib_object.bib_entry_type}
            
            if hasattr(bib_object, 'author'): bib_entry['author'] = bib_object.author
            if hasattr(bib_object, 'title'): bib_entry['title'] = bib_object.title
            if hasattr(bib_object, 'year'): bib_entry['year'] = bib_object.year
            if hasattr(bib_object, 'series'): bib_entry['series'] = bib_object.series
            if hasattr(bib_object, 'number'): bib_entry['number'] = bib_object.number
            if hasattr(bib_object, 'location'): bib_entry['location'] = bib_object.location
            if hasattr(bib_object, 'edition'): bib_entry['edition'] = bib_object.edition
            if hasattr(bib_object, 'journal'): bib_entry['journal'] = bib_object.journal
            if hasattr(bib_object, 'volume'): bib_entry['volume'] = bib_object.volume
            if hasattr(bib_object, 'pages'): bib_entry['pages'] = bib_object.pages

            return bib_entry # there can be only one



if __name__ == "__main__":
    bib_handler = Bibliography_handler()
    
    bib_handler.retrieve_bibliography_from_author('Ribbeck')
    exit(0)

    bib_json = { 
        "bib_entry_type" : "book",
        "author" : "Ribbeck, O.",
        "title" : "Scaenicae Romanorum poesis fragmenta",
        "year" : "1852",
        "series" : "Tragicorum Romanorum fragmenta",
        "number" : "1",
        "location" : "Leipzig",
        "edition" : "1",
    } # received from OSCC

    bib_json = {
        "_id" : '00c50a53d7644e11aa99e6a3b409e32f', 
        "bib_entry_type" : "article",
        "author" : "Pietersen, P.",
        "title" : "A Proto-Lucan basis for the Gospel according to the Hebrews",
        "year" : "1940",
        "journal" : "Journal of Biblical Literature",
        "volume" : "1",
        "pages" : "471-478"
    } # received from OSCC

    cleaned_bib_entry = Bib_entry(bib_json)
    print(cleaned_bib_entry.author)

    bib_handler.delete_entry(cleaned_bib_entry)
