"""
Model to handle fragments
"""
import logging

from dataclasses import dataclass
from uuid import uuid4

from database import Database

class FragmentFields(object):
    ID = "_id"
    NAME = "name"
    AUTHOR = "author"
    TITLE = "title"
    EDITOR = "editor"
    STATUS = "status"
    LOCK = "lock"
    VISIBLE = "visible"
    TRANSLATION = "translation"
    POPULAR_TRANSLATION = "popular_translation"
    DIFFERENCES = "differences"
    APPARATUS = "apparatus"
    COMMENTARY = "commentary"
    RECONSTRUCTION = "reconstruction"
    METRICAL_ANALYSIS = "metrical_analysis"
    CONTEXT = "context"
    LINES = "lines"
    LINKED_FRAGMENTS = "linked_fragments"
    SANDBOX = "sandbox"

@dataclass
class FragmentModel:
    _id: str = None
    document_type: str = 'fragment'
    name: str = None
    author: str = None
    title: str = None
    editor: str = None
    status: str = None
    lock: int = None 
    visible: int = None 
    translation: str = None
    popular_translation: str = None
    differences: str = None
    apparatus: str = None
    commentary: str = None
    reconstruction: str = None
    metrical_analysis: str = None
    context: list = None
    lines: list = None
    linked_fragments: list = None
    sandbox: str = None 

class Fragment:
    def __init__(self, server):
        self.database = Database(server)
    
    def get(self, document: dict) -> list:
        """
        Retrieves the fragment given the document filter.
        """
        fragment = FragmentModel()
        # Retrieve the fields on which we allow filtering
        fragment.name = document.get(FragmentFields.NAME, None)
        fragment.author = document.get(FragmentFields.AUTHOR, None)
        fragment.title = document.get(FragmentFields.TITLE, None)
        fragment.editor = document.get(FragmentFields.EDITOR, None)
        fragment.sandbox = document.get(FragmentFields.SANDBOX, None)
        fragment.visible = document.get(FragmentFields.VISIBLE, None)
  
        # Convert the model into a dictionary
        fragment = {key: value for key, value in fragment.__dict__.items() if value is not None}
        logging.error(f"Hello: {fragment}")
        
        document_list = self.database.filter(fragment)

        # Process the found documents into proper fragments
        result: list = [] 
        for document in document_list:
            fragment = FragmentModel()
            fragment = self._convert_document_to_fragment(document)
            result.append(fragment)
        
        return result

    def create(self, document: dict) -> str:
        """
        Creates a fragment. For this, a uuid will be generated as identifier.
        """
        if self.get(document):
            # Check if the document already exists.
            return ""

        fragment = self._convert_document_to_fragment(document)
        fragment._id = uuid4().hex 

        # Convert the model into a dictionary
        fragment = {key: value for key, value in fragment.__dict__.items() if value is not None}

        doc_id = self.database.create(fragment)
        return doc_id 
    
    def delete(self, document: dict) -> bool:
        """
        Deletes the given introduction by its identifier.
        """
        fragment = self._convert_document_to_fragment(document)
        return self.database.delete(fragment._id)
    
    def update(self, document: dict) -> bool:
        """
        Updates the given introduction. Must receive an identifier to update.
        """
        fragment = self._convert_document_to_fragment(document)

        if not fragment._id:
            return False

        # Convert the model into a dictionary
        fragment = {key: value for key, value in fragment.__dict__.items() if value is not None}

        return self.database.update(fragment)
    
    def _convert_document_to_fragment(self, document: dict) -> FragmentModel:
        """
        Converts the received document into a fragment using the FragmentModel
        """
        fragment = FragmentModel()
        fragment._id = document.get(FragmentFields.ID, None)
        fragment.name = document.get(FragmentFields.NAME, None)
        fragment.author = document.get(FragmentFields.AUTHOR, None)
        fragment.title = document.get(FragmentFields.TITLE, None)
        fragment.editor = document.get(FragmentFields.EDITOR, None)
        fragment.status = document.get(FragmentFields.STATUS, None)
        fragment.lock = document.get(FragmentFields.LOCK, None)
        fragment.visible = document.get(FragmentFields.VISIBLE, None)
        fragment.translation = document.get(FragmentFields.TRANSLATION, None)
        fragment.popular_translation = document.get(FragmentFields.POPULAR_TRANSLATION, None)
        fragment.differences = document.get(FragmentFields.DIFFERENCES, None)
        fragment.apparatus = document.get(FragmentFields.APPARATUS, None)
        fragment.commentary = document.get(FragmentFields.COMMENTARY, None)
        fragment.reconstruction = document.get(FragmentFields.RECONSTRUCTION, None)
        fragment.metrical_analysis = document.get(FragmentFields.METRICAL_ANALYSIS, None)
        fragment.context = document.get(FragmentFields.CONTEXT, None)
        fragment.lines = document.get(FragmentFields.LINES, None)
        fragment.linked_fragments = document.get(FragmentFields.LINKED_FRAGMENTS, None)
        fragment.sandbox = document.get(FragmentFields.SANDBOX, "")

        return fragment
