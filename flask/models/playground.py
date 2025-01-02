"""
Model to handle playgrounds
"""
from dataclasses import dataclass
from uuid import uuid4

from database import Database

class PlaygroundFields(object):
    ID = "_id"
    CANVAS = "canvas"
    CREATED_BY = "created_by"
    NAME = "name"
    # To find a playground based on a user
    USER = "user"
    USERS = "users"

@dataclass
class PlaygroundModel:
    _id: str = ""
    canvas: object = None
    created_by: str = ""
    name: str = ""
    role: str = ""
    user: str = ""
    users = None

class Playground:
    def __init__(self, server):
        self.database = Database(server)
    
    def get(self, document: dict) -> list:
        """
        Retrieves the playground given the document filter.
        """
        playground = PlaygroundModel()
        # Retrieve the fields on which we allow filtering
        playground._id = document.get(PlaygroundFields.ID, None)
        playground.name = document.get(PlaygroundFields.NAME, None)
        playground.created_by = document.get(PlaygroundFields.CREATED_BY, None)
        playground.users = document.get(PlaygroundFields.USERS, None)
        playground.canvas = document.get(PlaygroundFields.CANVAS, None)

        # Convert the model into a dictionary
        playground = {key: value for key, value in playground.__dict__.items() if value is not None}

        document_list = self.database.filter(playground)
        # We can only find one playground, so just use the first entry in the list
        try:
            playground = PlaygroundModel()
            playground = self._convert_document_to_playground(document_list[0])
            return [playground]
        except:
            return []

        # TODO: 
        # Get the role the requesting user has. We will return this in the request so that 
        # the frontend knows what permissions the requesting user has on the returned playground.
        # playground.role = self._find_user_role(user, result.users)
        # We remove the users list from the object if the user is not the owner. Only owners can change users permissions
        # if playground.role != 'owner':
            # del playground.users
        
        # return playground
        

    def create(self, document: dict) -> str:
        """
        Creates a playground. For this, a uuid will be generated as identifier.
        """
        playground = self._convert_document_to_playground(document)
        playground._id = uuid4().hex 

        # Convert the model into a dictionary
        playground = {key: value for key, value in playground.__dict__.items() if value is not None}
       
        doc_id = self.database.create(playground)
        return doc_id 
    
    def delete(self, document: dict) -> bool:
        """
        Deletes the given playground by its identifier.
        """
        playground = self._convert_document_to_playground(document)
        return self.database.delete(playground._id)
    
    def update(self, document: dict) -> bool:
        """
        Updates the given playground. Must receive an identifier to update.
        """
        playground = self._convert_document_to_playground(document)

        if not playground._id:
            return False

        # Convert the model into a dictionary
        playground = {key: value for key, value in playground.__dict__.items() if value is not None}

        return self.database.update(playground)
    
    def _convert_document_to_playground(self, document: dict) -> PlaygroundModel:
        """
        Converts the received document into a playground using the PlaygroundModel
        """
        playground = PlaygroundModel()
        playground._id = document.get(PlaygroundFields.ID, None)
        playground.name = document.get(PlaygroundFields.NAME, None)
        playground.created_by = document.get(PlaygroundFields.CREATED_BY, None)
        playground.users = document.get(PlaygroundFields.USERS, None)
        playground.canvas = document.get(PlaygroundFields.CANVAS, None)

        return playground

    def _find_user_role(self, user_name: str, users) -> str:
        """
        Returns the role of the given user in the given users list
        """
        for user in users:
            # logging.warning(user)
            if user['name'] == user_name:
                return user['role']
        return ""

