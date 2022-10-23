from dataclasses import dataclass, field, asdict
from typing import get_type_hints
from types import GenericAlias

@dataclass(slots=True)
class Fragment:
    """_summary_ TODO: Needs docstring

    Raises:
        ValueError: _description_
    """    
    _id: str
    fragment_name: str # Must contain only numbers
    author: str
    title: str
    editor: str
    status: str | int
    translation: str = field(default_factory = str)
    differences: str = field(default_factory = str)
    apparatus: str = field(default_factory = str)
    commentary: str = field(default_factory = str)
    reconstruction: str = field(default_factory = str)
    context: list[str] = field(default_factory = list)
    lines: list[str] = field(default_factory = list)
    linked_fragments: list[str] = field(default_factory = list)
    linked_bib_entries: list[str] = field(default_factory = list)
    lock: str = field(default_factory = str)
    published: str = field(default_factory = str)


    def __post_init__(self):
        assert self.fragment_name.isnumeric(), "The Fragment's name should be numeric"
        
        # Check if provided params are of correct type
        vars = asdict(self)
        req_types = get_type_hints(self)
        for key in vars.keys():
            req_type = req_types[key]
            if req_type == GenericAlias(list, str): # If generic type like list[str], require only list
                req_type = list
            if not isinstance(vars[key], req_type):
                raise ValueError(f"{key} must be of type {req_type}. Given {key}: {vars[key]}")

        
    
        # Compile linked_fragments and linked_bib_entries into lists of 
        # unique fragment ids
        if self.linked_fragments:
            assert isinstance(self.linked_fragments, list)
            # From Angular, we receive an JSON object (from the formbuilder)
            # We must turn this into a set list again.
            linked_fragment_list = []
            for linked_fragment in self.linked_fragments:
                linked_fragment_list.append(linked_fragment['fragment_id'])
            self.linked_fragments = list(set(linked_fragment_list)) # Angular needs a tissue for its issue

        if self.linked_bib_entries:
            assert isinstance(self.linked_bib_entries, list)
            # From Angular, we receive an JSON object (from the formbuilder)
            # We must turn this into a set list again.
            linked_bib_entries_list = []
            for linked_bib_entry in self.linked_bib_entries:
                linked_bib_entries_list.append(linked_bib_entry['bib_id'])
            self.linked_bib_entries = list(set(linked_bib_entries_list)) 

    def as_dict(self):
        return asdict(self)