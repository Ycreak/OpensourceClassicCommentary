class Fragment:
    #TODO: fix the asserts (alongside angular)
    def __init__(self, received_fragment):
    
        print('received', received_fragment)

        # Fragment meta data
        if "_id" in received_fragment: 
            #assert isinstance(received_fragment['_id'], str)
            self.id = received_fragment['_id']

        if "fragment_name" in received_fragment: 
            #assert isinstance(received_fragment['fragment_name'], str)
            self.fragment_name = received_fragment['fragment_name']
            
        if "author" in received_fragment: 
            #assert isinstance(received_fragment['author'], str)
            self.author = received_fragment['author']

        if "title" in received_fragment: 
            #assert isinstance(received_fragment['title'], str)
            self.title = received_fragment['title']
            
        if "editor" in received_fragment: 
            #assert isinstance(received_fragment['editor'], str)
            self.editor = received_fragment['editor']
            
        if "status" in received_fragment: 
            #assert isinstance(received_fragment['status'], str)
            self.status = received_fragment['status']

        if "lock" in received_fragment: 
            #assert isinstance(received_fragment['lock'], int)
            self.lock = received_fragment['lock']

        # Fragment content fields
        if "translation" in received_fragment: 
            #assert isinstance(received_fragment['translation'], str)
            self.translation = received_fragment['translation']
            
        if "differences" in received_fragment: 
            #assert isinstance(received_fragment['differences'], str)
            self.differences = received_fragment['differences']
            
        if "apparatus" in received_fragment:             
            #assert isinstance(received_fragment['apparatus'], str)
            self.apparatus = received_fragment['apparatus']
            
        if "commentary" in received_fragment: 
            #assert isinstance(received_fragment['commentary'], str)
            self.commentary = received_fragment['commentary']

        if "reconstruction" in received_fragment: 
            #assert isinstance(received_fragment['reconstruction'], str)
            self.reconstruction = received_fragment['reconstruction']

        if "context" in received_fragment: 
            #assert isinstance(received_fragment['context'], list)
            self.context = received_fragment['context']

        if "lines" in received_fragment: 
            #assert isinstance(received_fragment['lines'], list)
            self.lines = received_fragment['lines']

        # Fragment linking information
        if "linked_fragments" in received_fragment: 
            #assert isinstance(received_fragment['linked_fragments'], list)
            self.linked_fragments = received_fragment['linked_fragments']

    # Default fragment fields
    id = ''
    fragment_name = ''
    author = ''
    title = '' 
    editor = '' 
    translation = '' 
    differences = '' 
    apparatus = ''
    commentary = '' 
    reconstruction = '' 
    status = ''
    lock = 0
    context = [] 
    lines = []
    linked_fragments = []