import couchdb
import copy
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

    def Find_user(self, user): #-> tuple[bool, dict]: #FIXME: does not work on Pi
        """Finds the requested user in the database

        Args:
            username (string): of requested username

        Returns:
            bool: boolean indicating if user was found or not
            json: nosql document of the found user
        """            
        found_user = Retrieve_data_from_db(self.user_db, {'username': user.username}, [])
        
        print('found', found_user)
        
        result = [x for x in found_user]
        
        print('result', result)

        try:
            user = result[0]
            return True, user
        except:
            return False, {}

    def Login_user(self, user) -> make_response:
        """ Function to handle login of user. Checks if user exists and if its password is correct.
        Handles errors accordingly.

        Args:
            user (object): containing all user information

        Raises:
            Exception: if result[0] cannot be retrieved

        Returns:
            response: flask response object
        """             
        user_exist, found_user = self.Find_user(user)

        if user_exist:
            if self.Verify_password(found_user['password'], user.password):
                found_user_role = found_user['role']
                # Return the role of the found user to Angular
                return make_response(found_user_role, 200)
            else:
                return make_response('Invalid password', 403)   
        else:
            return make_response('This user does not exist!', 401)

    def Create_user(self, user) -> make_response:
        """ Inserts the provided user and their password into the database iff the
        username does not yet exist.

        Args:
            user (object): containing all user information

        Returns:
            response: flask response object
        """
        hashed_password = self.Hash_password(user.password)  # Password obfuscation using hashing

        user_exist, _ = self.Find_user(user)

        if user_exist:
            return make_response('This username is already taken', 403)
        else:
            new_user = copy.deepcopy(user.user_empty)

            new_user['username'] = user.username
            new_user['password'] = hashed_password
            new_user['_id'] = uuid4().hex

            doc_id, doc_rev = self.user_db.save(new_user)        
            
            return make_response('User succesfully created', 201)

    def Delete_user(self, user) -> make_response:
        """ Function to delete the user of the provided username

        Args:
            user (object): containing all user information

        Raises:
            Exception: if no user can be found to be deleted

        Returns:
            response: flask response object
        """        
        user_exist, found_user = self.Find_user(user)

        if user_exist:
            doc = self.user_db[found_user['_id']]
            self.user_db.delete(doc)
            return make_response('User succesfully deleted', 200)
        else:
            return make_response('This user does not exist', 400)

    def Change_password(self, user) -> make_response:
        """Function to change the password of a user.

        Args:
            user (object): containing all user information

        Returns:
            response: flask response object
        """
        new_password = self.Hash_password(user.new_password)  # Password obfuscation using hashing

        user_exist, found_user = self.Find_user(user)

        if user_exist:
            doc = self.user_db[found_user['_id']]          
            doc['password'] = user.new_password
            doc_id, doc_rev = self.user_db.save(doc)   
            return make_response('Password succesfully updated', 200)
        else:
            return make_response('This user does not exist', 400)


    def Change_role(self, user) -> make_response:
        """Function to change the role of a user.

        Args:
            user (object): containing all user information
        
        Returns:
            response: flask response object
        """        

        user_exist, found_user = self.Find_user(user)

        if user_exist:        
            doc = self.user_db[found_user['_id']]          
            doc['role'] = user.new_role
            doc_id, doc_rev = self.user_db.save(doc)   
            return make_response('Role succesfully updated', 200)
        else:
            return make_response('Could not find a user', 400)    

    def Retrieve_all_users(self):
        """Retrieves all available users from the database and returns them in a list

        Returns:
            list: of all users in the database (sorted and unique)
        """        
        user_list = []        
        
        for id in self.user_db:
            user_list.append({'username':self.user_db[id]['username'],'role':self.user_db[id]['role']})

        return sorted(user_list, key=lambda k: k['username'])

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