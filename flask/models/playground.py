"""
Model to handle playgrounds
"""


from uuid import uuid4

from database import Database


class PlaygroundFields(object):
    ID = "_id"
    CANVAS = "canvas"
    CREATED_BY = "created_by"
    NAME = "name"
    USERS = "users"
    SANDBOX = "sandbox"


# Dataclasses dislike the use of lists, so this is a normal class
class PlaygroundModel:
    _id: str = ""
    document_type: str = "playground"
    canvas: object = None
    created_by: str = ""
    name: str = ""
    users: list = []
    sandbox: str = None


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

        # Convert the model into a dictionary
        playground = {
            key: value
            for key, value in playground.__dict__.items()
            if value is not None and value != ""
        }

        document_list = self.database.filter(playground)

        result: list = []
        for document in document_list:
            playground = PlaygroundModel()
            playground = self._convert_document_to_playground(document)
            result.append(playground.__dict__)

        return result

    def create(self, document: dict) -> str:
        """
        Creates a playground. For this, a uuid will be generated as identifier.
        """
        playground = self._convert_document_to_playground(document)
        playground._id = uuid4().hex

        # Convert the model into a dictionary
        playground = {
            key: value
            for key, value in playground.__dict__.items()
            if value is not None
        }

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
        playground = {
            key: value
            for key, value in playground.__dict__.items()
            if value is not None
        }

        return self.database.update(playground)

    def _convert_document_to_playground(self, document: dict) -> PlaygroundModel:
        """
        Converts the received document into a playground using the PlaygroundModel
        """
        playground = PlaygroundModel()
        playground._id = document.get(PlaygroundFields.ID, "")
        playground.document_type = "playground"
        playground.name = document.get(PlaygroundFields.NAME, "")
        playground.created_by = document.get(PlaygroundFields.CREATED_BY, "")
        playground.users = document.get(PlaygroundFields.USERS, [])
        playground.canvas = document.get(PlaygroundFields.CANVAS, None)
        playground.sandbox = document.get(PlaygroundFields.SANDBOX, None)

        return playground

    def _find_user_role(self, user_name: str, users) -> str:
        """
        Returns the role of the given user in the given users list
        """
        for user in users:
            # logging.warning(user)
            if user["name"] == user_name:
                return user["role"]
        return ""
