class User:
    """ Object class that creates a fragment from the given json.
    Used for fragment_handling.
    """    
    def __init__(self, received_user):
    
        # User meta data
        if "username" in received_user: 
            assert isinstance(received_user['username'], str)
            self.username = received_user['username']
            
        if "password" in received_user: 
            assert isinstance(received_user['password'], str)
            self.password = received_user['password']

        if "new_password" in received_user: 
            assert isinstance(received_user['new_password'], str)
            self.new_password = received_user['new_password']
            
        if "role" in received_user: 
            assert isinstance(received_user['role'], str)
            self.role = received_user['role']
            
    # Default fragment fields
    username = ''
    password = ''
    new_password = ''
    role = ''

    user_empty = {
        "username": "",
        "password": "",
        "role": "guest",
    }