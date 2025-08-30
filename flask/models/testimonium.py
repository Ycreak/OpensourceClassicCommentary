"""
Model to handle testimonia
"""

from dataclasses import dataclass
from uuid import uuid4

from database import Database


class TestimoniumFields(object):
    ID = "_id"
    NAME = "name"
    AUTHOR = "author"
    TITLE = "title"
    TRANSLATION = "translation"
    WITNESS = "witness"
    TEXT = "text"
    EDITOR = "editor"
    SANDBOX = "sandbox"
    LOCK = "lock"
    VISIBLE = "visible"


@dataclass
class TestimoniumModel:
    _id: str = None
    document_type: str = "testimonium"
    name: str = None
    author: str = None
    title: str = None
    translation: str = None
    witness: str = None
    text: str = None
    editor: str = None
    sandbox: str = None
    lock: int = None
    visible: int = None


class Testimonium:
    def __init__(self, server):
        self.database = Database(server)

    def get(self, document: dict) -> list:
        """
        Retrieves the testimonium given the document filter.
        """
        testimonium = TestimoniumModel()
        # Retrieve the fields on which we allow filtering
        testimonium.name = document.get(TestimoniumFields.NAME, None)
        testimonium.author = document.get(TestimoniumFields.AUTHOR, None)
        testimonium.title = document.get(TestimoniumFields.TITLE, None)
        testimonium.editor = document.get(TestimoniumFields.EDITOR, None)
        testimonium.witness = document.get(TestimoniumFields.WITNESS, None)
        testimonium.sandbox = document.get(TestimoniumFields.SANDBOX, None)

        # Convert the model into a dictionary
        testimonium = {
            key: value
            for key, value in testimonium.__dict__.items()
            if value is not None
        }

        document_list = self.database.filter(testimonium)
        # Process the found documents into proper testimonia
        result: list = []
        for document in document_list:
            testimonium = TestimoniumModel()
            testimonium = self._convert_document_to_testimonium(document)
            result.append(testimonium)

        return result

    def create(self, document: dict) -> str:
        """
        Creates a testimonium. For this, a uuid will be generated as identifier.
        """
        if self.get(document):
            # Check if the document already exists.
            return ""

        testimonium = self._convert_document_to_testimonium(document)
        testimonium._id = uuid4().hex

        # Convert the model into a dictionary
        testimonium = {
            key: value
            for key, value in testimonium.__dict__.items()
            if value is not None
        }

        doc_id = self.database.create(testimonium)
        return doc_id

    def delete(self, document: dict) -> bool:
        """
        Deletes the given introduction by its identifier.
        """
        testimonium = self._convert_document_to_testimonium(document)
        return self.database.delete(testimonium._id)

    def update(self, document: dict) -> bool:
        """
        Updates the given introduction. Must receive an identifier to update.
        """
        testimonium = self._convert_document_to_testimonium(document)

        if not testimonium._id:
            return False

        # Convert the model into a dictionary
        testimonium = {
            key: value
            for key, value in testimonium.__dict__.items()
            if value is not None
        }

        return self.database.update(testimonium)

    def _convert_document_to_testimonium(self, document: dict) -> TestimoniumModel:
        """
        Converts the received document into a testimonium using the testimoniumModel
        """
        testimonium = TestimoniumModel()
        testimonium._id = document.get(TestimoniumFields.ID, None)
        testimonium.name = document.get(TestimoniumFields.NAME, None)
        testimonium.author = document.get(TestimoniumFields.AUTHOR, None)
        testimonium.title = document.get(TestimoniumFields.TITLE, None)
        testimonium.translation = document.get(TestimoniumFields.TRANSLATION, None)
        testimonium.witness = document.get(TestimoniumFields.WITNESS, None)
        testimonium.text = document.get(TestimoniumFields.TEXT, None)
        testimonium.editor = document.get(TestimoniumFields.EDITOR, None)
        testimonium.sandbox = document.get(TestimoniumFields.SANDBOX, None)
        testimonium.lock = document.get(TestimoniumFields.LOCK, None)
        testimonium.visible = document.get(TestimoniumFields.VISIBLE, None)

        return testimonium
