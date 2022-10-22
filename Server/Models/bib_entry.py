class Bib_entry:
    """ Object class that creates a fragment from the given json.
    Used for fragment_handling.
    """    
    def __init__(self, received_bib_entry):
    
        # Fragment meta data
        if "id" in received_bib_entry: 
            assert isinstance(received_bib_entry['id'], str)
            self.id = received_bib_entry['id']

        if "bib_entry_type" in received_bib_entry: # TODO: what else?
            assert isinstance(received_bib_entry['bib_entry_type'], str)
            self.bib_entry_type = received_bib_entry['bib_entry_type']

        # Assertions for books
        if "author" in received_bib_entry: 
            assert isinstance(received_bib_entry['author'], str)
            self.author = received_bib_entry['author']

        if "title" in received_bib_entry: 
            assert isinstance(received_bib_entry['title'], str)
            self.title = received_bib_entry['title']
            
        if "year" in received_bib_entry:
            assert isinstance(received_bib_entry["year"], str)
            self.year = received_bib_entry['year']

        if "series" in received_bib_entry: 
            assert isinstance(received_bib_entry["series"], str)
            self.series = received_bib_entry['series']

        if "number" in received_bib_entry: 
            assert isinstance(received_bib_entry["number"], str)
            self.number = received_bib_entry['number']

        if "location" in received_bib_entry: 
            assert isinstance(received_bib_entry['location'], str)
            self.location = received_bib_entry['location']

        if "edition" in received_bib_entry: 
            assert isinstance(received_bib_entry['edition'], str)
            self.edition = received_bib_entry['edition']
        
        # Additional assertions for articles   <--- subclass?
        if "journal" in received_bib_entry: 
            assert isinstance(received_bib_entry['journal'], str)
            self.journal = received_bib_entry['journal']

        if "volume" in received_bib_entry: 
            assert isinstance(received_bib_entry['volume'], str)
            self.volume = received_bib_entry['volume']

        if "pages" in received_bib_entry: 
            assert isinstance(received_bib_entry['pages'], str)
            self.pages = received_bib_entry['pages']

        # Additional assertions for incollection
        
        # Additional assertions for websites

        # if "fragment_name" in received_fragment: 
        #     assert isinstance(received_fragment['fragment_name'], str)
        #     self.fragment_name = received_fragment['fragment_name']

            
        # if "editor" in received_fragment: 
        #     assert isinstance(received_fragment['editor'], str)
        #     self.editor = received_fragment['editor']
            
        # if "status" in received_fragment: 
        #     assert isinstance(received_fragment['status'], str)
        #     self.status = received_fragment['status']

        # if "lock" in received_fragment: 
        #     assert isinstance(received_fragment['lock'], int)
        #     self.lock = received_fragment['lock']

        # # Fragment content fields
        # if "translation" in received_fragment: 
        #     assert isinstance(received_fragment['translation'], str)
        #     self.translation = received_fragment['translation']
            
        # if "differences" in received_fragment: 
        #     assert isinstance(received_fragment['differences'], str)
        #     self.differences = received_fragment['differences']
            
        # if "apparatus" in received_fragment:             
        #     assert isinstance(received_fragment['apparatus'], str)
        #     self.apparatus = received_fragment['apparatus']
            
        # if "commentary" in received_fragment: 
        #     assert isinstance(received_fragment['commentary'], str)
        #     self.commentary = received_fragment['commentary']

        # if "reconstruction" in received_fragment: 
        #     assert isinstance(received_fragment['reconstruction'], str)
        #     self.reconstruction = received_fragment['reconstruction']

        # if "context" in received_fragment: 
        #     assert isinstance(received_fragment['context'], list)
        #     self.context = received_fragment['context']

        # if "lines" in received_fragment: 
        #     assert isinstance(received_fragment['lines'], list)
        #     self.lines = received_fragment['lines']

        # # Fragment linking information
        # if "linked_fragments" in received_fragment: 
        #     assert isinstance(received_fragment['linked_fragments'], list)
        #     self.linked_fragments = received_fragment['linked_fragments']

    # Default fragment fields
    _id = ''
    author = ''
    title = '' 
    date = ''
    series = ''
    number = ''
    location = ''
    edition = ''

    journal = ''
    volume = ''
    pages = ''

    book_empty = {
        "bib_entry_type": "",
        "author" : "",
        "title" : "",
        "year" : "",
        "series" : "", 
        "number" : "", 
        "location" : "", 
        "edition" : "", 
    }

    article_empty = {
        "bib_entry_type": "",
        "author" : "",
        "title" : "",
        "journal" : "",
        "volume" : "", 
        "pages" : "", 
        "year" : "", 
    }    
