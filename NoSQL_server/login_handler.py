import couchdb
import copy
from models import *
from uuid import uuid4
from flask import Response, make_response
# For hashing passwords
import hashlib, binascii, os
class Login():
    def __init__(self):

        # Load Database
        couch = couchdb.Server('http://admin:password@localhost:5984/')
        self.db = couch['users']

    def Login_user(self, username, password) -> make_response:
        """ Function to handle login of user. Checks if user exists and if its password is correct.
        Handles errors accordingly.

        Args:
            username (string): of username
            password (string): of password

        Raises:
            Exception: if result[0] cannot be retrieved

        Returns:
            response: flask response object
        """      
        assert isinstance(username, str)
        assert isinstance(password, str) 
        
        found_user = self.Retrieve_data({'username': username}, [])
        result = [x for x in found_user]

        if result:
            try:
                # Check if password is correct
                user_password = result[0]['password']
            except:
                raise Exception("Somehow, a duplicate user exists.") 
            
            if self.Verify_password(user_password, password):
                found_user_role = result[0]['role']
                # Return the role of the found user to Angular
                return make_response(found_user_role, 200)
            else:
                return make_response('Invalid password', 403)  
        else:
            return make_response('This user does not exist!', 401)        

    def Create_user(self, username, password) -> make_response:
        """ Inserts the provided user and their password into the database iff the
        username does not yet exist.

        Args:
            username (string): username to be created
            password (string): password to be required

        Returns:
            response: flask response object
        """
        assert isinstance(username, str)
        assert isinstance(password, str)                

        password = self.Hash_password(password)  # Password obfuscation using hashing

        # First, we check whether the username is already in the database
        found_user = self.Retrieve_data({'username': username}, [])
        result = [x for x in found_user]

        if result:
            return make_response('This username is already taken', 403)
        else:        
            # User does not exist, so create it
            new_user = copy.deepcopy(user_empty)

            new_user['username'] = username
            new_user['password'] = password

            new_user['_id'] = uuid4().hex

            doc_id, doc_rev = self.db.save(new_user)        
            
            return make_response('User succesfully created', 201)


    def Delete_user(self, username) -> make_response:
        """ Function to delete the user of the provided username

        Args:
            username (string): user to delete

        Raises:
            Exception: if no user can be found to be deleted

        Returns:
            response: flask response object
        """        
        assert isinstance(username, str)
        
        found_user = self.Retrieve_data({'username': username}, [])
        result = [x for x in found_user]

        if result:
            try:
                id = result[0]['_id']
                doc = self.db[id]
                self.db.delete(doc)
                return make_response('User succesfully deleted', 200)
            except:
                raise Exception("Could not find a user to delete") 
        else:  
            return make_response('This user does not exist', 400)


    def Change_password(self, username, new_password) -> make_response:
        """Function to change the password of a user.

        Args:
            username (string): user whom's role is to be updated
            new_password (string): new password to be assigned to the user

        Returns:
            response: flask response object
        """
        assert isinstance(username, str)
        assert isinstance(new_password, str)  

        password = self.Hash_password(password)  # Password obfuscation using hashing

        try:
            found_user = self.Retrieve_data({'username': username}, [])
            result = [x for x in found_user]
            found_user_doc = result[0]
        except Exception:
            raise Exception("Something went wrong") #TODO: Find way for Flask to handle exceptions and return a response accordingly
        
        found_user_doc['password'] = new_password
        doc_id, doc_rev = self.db.save(found_user_doc)   
        return make_response('Password succesfully updated', 200)


    def Change_role(self, username, new_role) -> make_response:
        """Function to change the role of a user.

        Args:
            username (string): user whom's role is to be updated
            new_role (string): new role to be assigned to the user
        
        Returns:
            response: flask response object
        """        
        assert isinstance(username, str)
        assert isinstance(new_role, str)  
        
        try:

            found_user = self.Retrieve_data({'username': username}, [])
            result = [x for x in found_user]
            found_user_doc = result[0]

        except:
            return make_response('Could not find a user', 400)    

        found_user_doc['role'] = new_role
        doc_id, doc_rev = self.db.save(found_user_doc)   
        return make_response('Role succesfully updated', 200)

    def Retrieve_data(self, selector, fields):
        return self.db.find({
                'selector': selector,
               'fields': fields,
        })

    def Find_user(self, username):
        """Finds the requested user in the database

        Args:
            username (string): of requested username

        Raises:
            Exception: If no user can be found

        Returns:
            json: nosql document of the found user
        """        
        found_user = self.Retrieve_data({'username': username}, [])
        result = [x for x in found_user]
        
        try:
            user = result[0]
            return user
        except:
            raise Exception("Could not find a user")   
            
    
    def Retrieve_all_users(self):
        user_list = []        
        
        for id in self.db:
            user_list.append({'username':self.db[id]['username'],'role':self.db[id]['role']})

        return sorted(user_list, key=lambda k: k['username'])

    def Hash_password(self, password):
        """Hash a password for storing."""
        salt = hashlib.sha256(os.urandom(60)).hexdigest().encode('ascii')
        pwdhash = hashlib.pbkdf2_hmac('sha512', password.encode('utf-8'), 
                                    salt, 100000)
        pwdhash = binascii.hexlify(pwdhash)
        return (salt + pwdhash).decode('ascii')

    def Verify_password(self, stored_password, provided_password):
        """Verify a stored password against one provided by user"""
        salt = stored_password[:64]
        stored_password = stored_password[64:]
        pwdhash = hashlib.pbkdf2_hmac('sha512', 
                                    provided_password.encode('utf-8'), 
                                    salt.encode('ascii'), 
                                    100000)
        pwdhash = binascii.hexlify(pwdhash).decode('ascii')
        return pwdhash == stored_password

# Unit Tests
# response = new_login.Create_user('Lucus', 'StackCanary')
# response = new_login.Login_user('Lucus', 'Kipje')
# response = new_login.Delete_user('Karel')
# response = new_login.Delete_user('Lucus', 'StackCanary')
# response = new_login.Change_role('Kippig', 'student')
# response = new_login.Change_password('Kareltje', 'kipje')

# print(response)