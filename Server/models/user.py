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

import config as conf

class UserField(object):
    ID = "_id"
    USERNAME = "username"
    PASSWORD = "password"
    ROLE = "role"

class Role(object):
    STUDENT = "student"
    TEACHER = "teacher"
    ADMIN = "admin"
    GUEST = "guest"

@dataclass
class User:
    id: str = None
    username: str = None
    password: str = None
    role: str = None

    @classmethod
    def from_json(self, data):
        if UserField.ID in data:
            self.id = data[UserField.ID]
        if UserField.USERNAME in data:
            self.username = data[UserField.USERNAME]
        if UserField.PASSWORD in data:
            self.password = data[UserField.PASSWORD]
        if UserField.ROLE in data:
            self.role = data[UserField.ROLE]
        return self
    
class UserModel:
    def __init__(self, server):
        self.db = server[conf.COUCH_USERS]
    
    def __get_users(self, usr_lst):
        result = list()
        for doc in usr_lst:
            user = User(id=doc.id)
            if UserField.USERNAME in doc:
                user.username = doc[UserField.USERNAME]
            if UserField.PASSWORD in doc:
                user.password = doc[UserField.PASSWORD]
            if UserField.ROLE in doc:
                user.role = doc[UserField.ROLE]
            result.append(user)
        return result

    def all(self, sorted=False):
        result = self.db.find({
            "selector": dict(),
            "limit": conf.COUCH_LIMIT
        })
        result = self.__get_users(result)
        if sorted:
            result.sort(key=lambda User: User.username)
        return result
        
    def filter(self, user, sorted=False):
        user = {key: value for key, value in user.__dict__.items() if value}
        if "id" in user:
            user[UserField.ID] = user.pop("id")
        mango = {
            "selector": user,
            "limit": conf.COUCH_LIMIT
        }
        result = self.db.find(mango)
        result = self.__get_users(result)
        if sorted:
            result.sort(key=lambda User: User.username)
        return result

    def get(self, user):
        user = {key: value for key, value in user.__dict__.items() if value}
        mango = {
            "selector": user,
            "limit": conf.COUCH_LIMIT
        }
        result = self.db.find(mango)
        result = self.__get_users(result)
        
        if result:
            if len(result) > 1:
                logging.warning("get(): function returned more than 1 object!")
            return result[0]
        return None

    def create(self, user):
        user = {key: value for key, value in user.__dict__.items() if value}
        user[UserField.ID] = user.pop("id") # MongoDB uses "_id" instead of "id"
        doc_id, _ = self.db.save(user)
        if not doc_id:
            logging.error("create(): failed to create user: {}".format(user.username))
            return None
        return user
        
    def get_or_create(self, user):
        result = self.get(user)
        if result is not None:
            return result
        else:
            return self.create(user)
    
    def update(self, user):
        _user = self.get(User(username=user.username))
        if _user == None:
            logging.error("update(): user could not be found")
            return False
        try:
            doc = self.db[_user.id]
            for key, value in asdict(user).items():
                if (value != None):
                    doc[key] = value
            self.db.save(doc)
            return True
        except Exception as e:
            logging.error(e)
        return False

    def delete(self, user):
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