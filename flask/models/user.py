"""                                
                     _      _         __                              
                    | |    | |       / /                              
 _ __ ___   ___   __| | ___| |___   / /   _ ___  ___ _ __ _ __  _   _ 
| '_ ` _ \ / _ \ / _` |/ _ \ / __| / / | | / __|/ _ \ '__| '_ \| | | |
| | | | | | (_) | (_| |  __/ \__ \/ /| |_| \__ \  __/ |_ | |_) | |_| |
|_| |_| |_|\___/ \__,_|\___|_|___/_/  \__,_|___/\___|_(_)| .__/ \__, |
                                                         | |     __/ |
                                                         |_|    |___/ 
"""

from dataclasses import dataclass, asdict
import logging
import builtins

from config import COUCH_USERS, COUCH_LIMIT
from constants import UserMappingField, user_mapping
from mixins import SetFieldsetToNoneMixin


@dataclass
class User(SetFieldsetToNoneMixin):
    id: str
    username: str
    password: str
    role: str

    @classmethod
    def from_json(self, data):
        if UserMappingField.ID in data:
            self.id = data[UserMappingField.ID]
        if UserMappingField.USERNAME in data:
            self.username = data[UserMappingField.USERNAME]
        if UserMappingField.PASSWORD in data:
            self.password = data[UserMappingField.PASSWORD]
        if UserMappingField.ROLE in data:
            self.role = data[UserMappingField.ROLE]
        return self
    
class UserModel:
    def __init__(self, server):
        self.db = server[COUCH_USERS]
    
    def __get_users(self, user_lst):
        """ Helper function to store a query result as a list of users """
        result = []

        for doc in user_lst:
            user = User(_id=doc.id)
            for field_name, field_key in user_mapping.items():
                if field_key in doc:
                    setattr(user, field_name.lower(), doc[field_key])
            result.append(user)

        return result

    def all(self, sorted=False):
        """ Returns all users, optionally sorted on username """

        result = self.db.find({
            "selector": dict(),
            "limit": COUCH_LIMIT
        })
        result = self.__get_users(result)

        if sorted:
            result = builtins.sorted(builtins.filter(lambda user: user.username is not None, result), key=lambda user: user.username)

        return result
        
    def filter(self, user, sorted=False):
        """ Filter users on key: value pairs """

        user = {key: value for key, value in user.__dict__.items() if value}
        if "id" in user:
            user[UserMappingField.ID] = user.pop("id")
        
        result = self.db.find({
            "selector": user,
            "limit": COUCH_LIMIT
        })
        result = self.__get_users(result)

        if sorted:
            result = builtins.sorted(builtins.filter(lambda user: user.username is not None, result), key=lambda user: user.username)

        return result

    def get(self, user):
        """ Gets the selected user from the database """

        user = {key: value for key, value in user.__dict__.items() if value}
        result = self.db.find({
            "selector": user,
            "limit": COUCH_LIMIT
        })
        result = self.__get_users(result)
        
        if result:
            if len(result) > 1:
                logging.warning("get(): function returned more than 1 object!")
            return result[0]
        
        return None

    def create(self, user):
        """ Create a user from parameter values """

        user = {key: value for key, value in user.__dict__.items() if value}
        user[UserMappingField.ID] = user.pop("id") # MongoDB uses "_id" instead of "id"
        doc_id, _ = self.db.save(user)
        
        if not doc_id:
            logging.error("create(): failed to create user: {}".format(user.username))
            return None
        
        return user
        
    def get_or_create(self, user):
        """ Create a user if it doesn't exist yet. Else return the existing user """
        
        result = self.get(user)
        if result is not None:
            return result
        else:
            return self.create(user)
    
    def update(self, user):
        """ Update an existing user using fieldset """
        result = self.get(User(username=user.username))
        if result == None:
            logging.error("update(): user could not be found")
            return False
        
        try:
            doc = self.db[result.id]
            for key, value in asdict(user).items():
                if (value != None):
                    doc[key] = value
            self.db.save(doc)
            return True
        
        except Exception as e:
            logging.error(e)

        return False

    def delete(self, user):
        """ Delete the user """
        user = self.get(user)
        
        if user == None:
            logging.error("delete(): user could not be found")
            return False
        
        try:
            doc = self.db[user.id]
            self.db.delete(doc)
            return True
        
        except Exception as e:
            logging.error(e)

        return False
