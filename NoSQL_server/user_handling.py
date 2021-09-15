import couchdb
import copy
from models import *
from uuid import uuid4
from flask import make_response

# For hashing passwords
import hashlib, binascii, os

from server_credentials import Credentials
from utilities import *

class User_handler():
    def __init__(self):
        # Connect to the server using the stored credentials
        server_address = Credentials().generate_server_url()
        database = couchdb.Server(server_address)

        # Select the database we need
        self.user_db = database['users']

    def Find_user(self, username) -> tuple[bool, dict]:
        """Finds the requested user in the database

        Args:
            username (string): of requested username

        Returns:
            bool: boolean indicating if user was found or not
            json: nosql document of the found user
        """            
        found_user = Retrieve_data_from_db(self.user_db, {'username': username}, [])
        result = [x for x in found_user]
        
        try:
            user = result[0]
            return True, user
        except KeyError:
            return False, {}

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
        
        user_exist, user = self.Find_user(username)

        if user_exist:
            if self.Verify_password(user['password'], password):
                found_user_role = user['role']
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

        user_exist, user = self.Find_user(username)

        if user_exist:
            return make_response('This username is already taken', 403)
        else:
            new_user = copy.deepcopy(user_empty)

            new_user['username'] = username
            new_user['password'] = password
            new_user['_id'] = uuid4().hex

            doc_id, doc_rev = self.user_db.save(new_user)        
            
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

        user_exist, user = self.Find_user(username)

        if user_exist:
            doc = self.user_db[user['_id']]
            self.user_db.delete(doc)
            return make_response('User succesfully deleted', 200)
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

        new_password = self.Hash_password(new_password)  # Password obfuscation using hashing

        user_exist, user = self.Find_user(username)

        if user_exist:
            doc = self.user_db[user['_id']]          
            doc['password'] = new_password
            doc_id, doc_rev = self.user_db.save(doc)   
            return make_response('Password succesfully updated', 200)
        else:
            return make_response('This user does not exist', 400)


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

        user_exist, user = self.Find_user(username)

        if user_exist:        
            doc = self.user_db[user['_id']]          
            doc['role'] = new_role
            doc_id, doc_rev = self.user_db.save(doc)   
            return make_response('Role succesfully updated', 200)
        else:
            return make_response('Could not find a user', 400)    
    
    def Hash_password(self, password):
        """ Hash a password for storing it in the database.

        Args:
            password (str): plain text version of the password

        Returns:
            str: hashed version of the given password
        """        
        salt = hashlib.sha256(os.urandom(60)).hexdigest().encode('ascii')
        pwdhash = hashlib.pbkdf2_hmac('sha512', password.encode('utf-8'), 
                                        salt, 100000)
        pwdhash = binascii.hexlify(pwdhash)
        return (salt + pwdhash).decode('ascii')

    def Verify_password(self, stored_password, provided_password):
        """Verify a stored password against one provided by user

        Args:
            stored_password (str): password that is already stored
            provided_password (str): password that is to be matched with the stored password

        Returns:
            str: hashed stored password
        """        
        salt = stored_password[:64]
        stored_password = stored_password[64:]
        pwdhash = hashlib.pbkdf2_hmac('sha512', 
                                        provided_password.encode('utf-8'), 
                                        salt.encode('ascii'), 
                                        100000)
        pwdhash = binascii.hexlify(pwdhash).decode('ascii')
        return pwdhash == stored_password