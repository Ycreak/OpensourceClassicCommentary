"""
                      _      _         ____                                      _                 
                     | |    | |       / / _|                                    | |                
  _ __ ___   ___   __| | ___| |___   / / |_ _ __ __ _  __ _ _ __ ___   ___ _ __ | |_   _ __  _   _ 
 | '_ ` _ \ / _ \ / _` |/ _ \ / __| / /|  _| '__/ _` |/ _` | '_ ` _ \ / _ \ '_ \| __| | '_ \| | | |
 | | | | | | (_) | (_| |  __/ \__ \/ / | | | | | (_| | (_| | | | | | |  __/ | | | |_ _| |_) | |_| |
 |_| |_| |_|\___/ \__,_|\___|_|___/_/  |_| |_|  \__,_|\__, |_| |_| |_|\___|_| |_|\__(_) .__/ \__, |
                                                       __/ |                          | |     __/ |
                                                      |___/                           |_|    |___/ 
"""


from dataclasses import dataclass, asdict
import logging

import config as conf


class PlaygroundField(object):
    ID = "_id"
    NAME = "name"
    # To find a playground based on a user
    USER = "user"
    USERS = "users"
    CANVAS = "canvas"
    CREATED_BY = "created_by"

@dataclass
class Playground:
    _id: str = None
    name: str = None
    canvas: object = None
    user: str = None
    created_by: str = None
    role: str = None
    users: list = None

class PlaygroundModel:
    def __init__(self, server):
        self.db = server[conf.COUCH_PLAYGROUNDS]
    
    def __get_playgrounds(self, playground_lst, canvas=True, users=True):
        result = list()
        for doc in playground_lst:
            playground = Playground(_id=doc.id)
            if PlaygroundField.NAME in doc:
                playground.name = doc[PlaygroundField.NAME]
            if PlaygroundField.CREATED_BY in doc:
                playground.created_by = doc[PlaygroundField.CREATED_BY]
            if (users):
                if PlaygroundField.USERS in doc:
                    playground.users = doc[PlaygroundField.USERS]
            if (canvas):
                if PlaygroundField.CANVAS in doc:
                    playground.canvas = doc[PlaygroundField.CANVAS]
            result.append(playground)
        return result
    
    def __get_playground(self, playground):
        # logging.warning(playground)
        playground = {key: value for key, value in playground.__dict__.items() if value}
        mango = {
            "selector": playground,
            "limit": conf.COUCH_LIMIT
        }
        result = self.db.find(mango)
        result = self.__get_playgrounds(result)

        if result:
            if len(result) > 1:
                logging.warning("get(): function returned more than 1 object!")
            return result[0]
        return None

    def create(self, playground):
        playground = {key: value for key, value in playground.__dict__.items() if value}
        doc_id, _ = self.db.save(playground)
        if not doc_id:
            logging.error("create(): failed to create playground")
            return None
        return playground

    def update(self, playground):
        try:
            doc = self.db[playground._id]
            for key, value in asdict(playground).items():
                if value != None:
                    doc[key] = value
            print(f'doc: {doc}')
            self.db.save(doc)
            return True
        except Exception as e:
            logging.error(e)
        return False

    def delete(self, playground):
        playground = self.__get_playground(playground)
    
        if playground == None:
            logging.error("delete(): playground could not be found")
            return False
        try:
            doc = self.db[playground._id]
            self.db.delete(doc)
            return True
        except Exception as e:
            logging.error(e)
        return False

    def get(self, playground, user):
        """
        Get the playground given the playground and the user.
        """
        result = self.__get_playground(playground)
        if playground == None:
            logging.error("get(): playground could not be found")
      
        # Get the role the requesting user has. We will return this in the request so that 
        # the frontend knows what permissions the requesting user has on the returned playground.
        result.role = self._find_user_role(user, result.users)
        # We remove the users list from the object if the user is not the owner. Only owners can change users permissions
        if result.role != 'owner':
            del result.users

        return result

    def list(self, playground, sorted=False):
        playground = {key: value for key, value in playground.__dict__.items() if value}
        # We check whether the requesting user is in any of the users object arrays of the playground.
        # If so, we return the playground metadata to the frontend for the requester to pick from.
        mango = {
           "selector": {
              "users": {
                 "$elemMatch": {
                    "name": playground["user"]
                 }
              }
           },
            "limit": conf.COUCH_LIMIT
        }
        result = self.db.find(mango)
        # Do not add the canvas or users to this request: we only want meta data
        result = self.__get_playgrounds(result, canvas=False, users=False)
        if sorted:
            result.sort(key=lambda Playground: Playground.name)

        return result

    def _find_user_role(self, user_name: str, users) :
        for user in users:
            # logging.warning(user)
            if user['name'] == user_name:
                return user['role']
        return None

