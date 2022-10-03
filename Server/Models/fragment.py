class Fragment:
    """ Object class that creates a fragment from the given json.
    Used for fragment_handling.
    """    
    def __init__(self, received_fragment):
    
        # Fragment meta data
        if "_id" in received_fragment: 
            assert isinstance(received_fragment['_id'], str)
            self._id = received_fragment['_id']

        if "fragment_name" in received_fragment: 
            assert isinstance(received_fragment['fragment_name'], str)
            self.fragment_name = received_fragment['fragment_name']
            
        if "author" in received_fragment: 
            assert isinstance(received_fragment['author'], str)
            self.author = received_fragment['author']

        if "title" in received_fragment: 
            assert isinstance(received_fragment['title'], str)
            self.title = received_fragment['title']
            
        if "editor" in received_fragment: 
            assert isinstance(received_fragment['editor'], str)
            self.editor = received_fragment['editor']
            
        if "status" in received_fragment: 
            assert isinstance(received_fragment['status'], str)
            self.status = received_fragment['status']

        if "lock" in received_fragment: 
            assert isinstance(received_fragment['lock'], int)
            self.lock = received_fragment['lock']

        # Fragment content fields
        if "translation" in received_fragment: 
            assert isinstance(received_fragment['translation'], str)
            self.translation = received_fragment['translation']
            
        if "differences" in received_fragment: 
            assert isinstance(received_fragment['differences'], str)
            self.differences = received_fragment['differences']
            
        if "apparatus" in received_fragment:             
            assert isinstance(received_fragment['apparatus'], str)
            self.apparatus = received_fragment['apparatus']
            
        if "commentary" in received_fragment: 
            assert isinstance(received_fragment['commentary'], str)
            self.commentary = received_fragment['commentary']

        if "reconstruction" in received_fragment: 
            assert isinstance(received_fragment['reconstruction'], str)
            self.reconstruction = received_fragment['reconstruction']

        if "context" in received_fragment: 
            assert isinstance(received_fragment['context'], list)
            self.context = received_fragment['context']

        if "lines" in received_fragment: 
            assert isinstance(received_fragment['lines'], list)
            self.lines = received_fragment['lines']

        # Fragment linking information
        if "linked_fragments" in received_fragment: 
            assert isinstance(received_fragment['linked_fragments'], list)
            # From Angular, we receive an JSON object (from the formbuilder)
            # We must turn this into a set list again.
            linked_fragment_list = []
            for linked_fragment in received_fragment['linked_fragments']:
                linked_fragment_list.append(linked_fragment['fragment_id'])
            self.linked_fragments = list(set(linked_fragment_list)) # Angular needs a tissue for its issue

        if "linked_bib_entries" in received_fragment: 
            assert isinstance(received_fragment['linked_bib_entries'], list)
            # From Angular, we receive an JSON object (from the formbuilder)
            # We must turn this into a set list again.
            linked_bib_entries_list = []
            for linked_bib_entry in received_fragment['linked_bib_entries']:
                linked_bib_entries_list.append(linked_bib_entry['bib_id'])
            self.linked_bib_entries = list(set(linked_bib_entries_list)) 

    # Default fragment fields
    _id: str = ''
    fragment_name: str = ''
    author: str = ''
    title: str = '' 
    editor: str = '' 
    translation: str = '' 
    differences: str = '' 
    apparatus: str = ''
    commentary: str = '' 
    reconstruction: str = '' 
    status: str = ''
    lock: int = 0
    context: list = [] 
    lines: list = []
    linked_fragments: list = []
    linked_bib_entries: list = []

    fragment_empty: dict = {
        "fragment_name": "", 
        "author": "",
        "title": "",
        "editor": "",
        "translation": "",
        "differences": "",
        "apparatus": "",
        "commentary": "",
        "reconstruction":"",
        "status": "",
        "context":[
        ],
        "lines":[
        ],
        "linked_fragments":[
        ],
        "linked_bib_entries":[
        ],
        "lock": 0,
    }
