"""
Model to handle introductions
"""
import logging
from dataclasses import dataclass
from uuid import uuid4

from database import Database

class IntroductionFields(object):
    # Container for field names
    ID = '_id'
    AUTHOR = 'author'
    TITLE = 'title'
    TEXT = 'text'

@dataclass
class IntroductionModel:
    # Data container. Corresponds to the IntroductionForm on the dashboard.
    _id: str = ''
    document_type: str = 'introduction'
    author: str = ''
    title: str = ''
    text: str = ''

class Introduction:
    def __init__(self, server):
        self.database = Database(server)

    def get(self, document: dict) -> list:
        """
        Retrieves the introduction given the document filter.
        """
        introduction = IntroductionModel()
        introduction.author = document.get(IntroductionFields.AUTHOR, '')
        introduction.title = document.get(IntroductionFields.TITLE, '')

        logging.error(introduction)

        # Convert the model into a dictionary
        introduction = {key: value for key, value in introduction.__dict__.items() if value != ''}
        
        logging.info(f"Retrieving introduction for filter: {introduction}")
        document_list = self.database.filter(introduction)
        # Process the found documents into proper introductions
        result: list = [] 
        for document in document_list:
            introduction = IntroductionModel()
            introduction = self._convert_document_to_introduction(document)
            result.append(introduction)
        
        return result

    def create(self, document: dict) -> str:
        """
        Creates a document. For this, a uuid will be generated as identifier.
        """
        if self.get(document):
            # Check if the document already exists.
            return ""

        introduction = self._convert_document_to_introduction(document)
        introduction._id = uuid4().hex 

        # Convert the model into a dictionary
        introduction = {key: value for key, value in introduction.__dict__.items()}
      
        doc_id = self.database.create(introduction)
        return doc_id 
    
    def delete(self, document: dict) -> bool:
        """
        Deletes the given introduction by its identifier.
        """
        introduction = self._convert_document_to_introduction(document)
        return self.database.delete(introduction._id)
    
    def update(self, document: dict) -> bool:
        """
        Updates the given introduction. Must receive an identifier to update.
        """
        introduction = self._convert_document_to_introduction(document)

        if not introduction._id:
            return False

        # Convert the model into a dictionary
        introduction = {key: value for key, value in introduction.__dict__.items() if value is not None}

        return self.database.update(introduction)

    def _convert_document_to_introduction(self, document: dict) -> IntroductionModel:
        """
        Converts the received document into an introduction using the IntroductionModel
        """
        introduction = IntroductionModel()
        introduction._id = document.get(IntroductionFields.ID, None) 
        introduction.author = document.get(IntroductionFields.AUTHOR, None)
        introduction.title = document.get(IntroductionFields.TITLE, None)
        introduction.text = document.get(IntroductionFields.TEXT, None)

        return introduction
