import couchdb
import copy
from models import *
from uuid import uuid4
from flask import Response, make_response

class Login():
    def __init__(self, login_json):

        # Load Database
        couch = couchdb.Server('http://admin:YcreakPasswd26!@localhost:5984/')
        self.db = couch['users']
           
        self.username = login_json['username']
        self.password = login_json['password']

        # print(username, password)

        # new_user = copy.deepcopy(user_empty)


        # result = make_response('Login authenticated!', 200)
        # result = make_response('Login rejected', 403)

    def Login_user(self):

        found_user = self.Retrieve_data({'username': self.username}, [])
        result = [x.id for x in found_user]

        if result:     
            # TODO: check whether the password is correct
            
            # return make_response('User exists!', 202)
            return make_response('teacher', 202)

        else:
            return make_response('The user does not exist!', 403)
    
    def Create_user(self, username, password):
        
        #TODO: check if user exists
        
        new_user = copy.deepcopy(user_empty)

        new_user['username'] = username
        new_user['password'] = password

        new_user['_id'] = uuid4().hex

        doc_id, doc_rev = self.db.save(new_user)        
        

    def Delete_user(self):
        pass

    def Revise_user(self):
        pass

    def Retrieve_data(self, selector, fields):
        return self.db.find({
                'selector': selector,
               'fields': fields,
            })

new_login = Login({'username': 'Lucus', 'password': 'StackCanary'})
# new_login.Create_user('Lucus', 'StackCanary')