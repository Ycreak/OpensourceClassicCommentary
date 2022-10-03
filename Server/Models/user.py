import datetime as dt
from marshmallow import Schema, fields, post_load

class UserSchema(Schema):
    username = fields.Str()
    password = fields.Str()
    new_password = fields.Str()
    role = fields.Str()
    new_role = fields.Str()
    # created_at = fields.DateTime()

    @post_load
    def make_user(self, data, **kwargs):
        return User(**data)

class User:
    def __init__(self, username, password, new_password, role, new_role):
        self.username = username
        self.password = password
        self.new_password = new_password
        self.role = role
        self.new_role = new_role
        self.created_at = dt.datetime.now()

    # def __repr__(self):
    #     return "<User(username={self.username!r})>".format(self=self)

# class User:
#     """ Object class that creates a fragment from the given json.
#     Used for fragment_handling.
#     """    
#     def __init__(self, received_user):
    
#         # User meta data
#         if "username" in received_user: 
#             assert isinstance(received_user['username'], str)
#             self.username = received_user['username']
            
#         if "password" in received_user: 
#             assert isinstance(received_user['password'], str)
#             self.password = received_user['password']

#         if "new_password" in received_user: 
#             assert isinstance(received_user['new_password'], str)
#             self.new_password = received_user['new_password']
            
#         if "role" in received_user: 
#             assert isinstance(received_user['role'], str)
#             self.role = received_user['role']

#         if "new_role" in received_user: 
#             assert isinstance(received_user['new_role'], str)
#             self.new_role = received_user['new_role']

#     # Default fragment fields
#     username = ''
#     password = ''
#     new_password = ''
#     role = ''
#     new_role = ''

#     user_empty = {
#         "username": "",
#         "password": "",
#         "role": "guest",
#     }