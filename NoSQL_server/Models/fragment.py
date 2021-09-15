class Fragment:
    
    def __init__(self, received_fragment):
        self.fragment_name = received_fragment['fragment_name']
        self.author = received_fragment['author']
        self.title = received_fragment['title']
        self.editor = received_fragment['editor']
        # self.translation = received_fragment['translation']
        # self.differences = received_fragment['differences']
        # self.apparatus = received_fragment['apparatus']
        # self.commentary = received_fragment['commentary']
        # self.reconstruction = received_fragment['reconstruction']
        self.status = received_fragment['status']
        # self.lock = received_fragment['lock']
        # self.context = received_fragment['context']
        # self.lines = received_fragment['lines']
        # self.linked_fragments = received_fragment['linked_fragments']

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