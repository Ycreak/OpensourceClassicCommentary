from dataclasses import dataclass, asdict
import logging

import Server.config as conf


class FragmentField(object):
    ID = "_id"
    NAME = "fragment_name"
    AUTHOR = "author"
    TITLE = "title"
    EDITOR = "editor"
    STATUS = "status"
    LOCK = "lock"
    TRANSLATION = "translation"
    DIFFERENCES = "differences"
    APPARATUS = "apparatus"
    COMMENTARY = "commentary"
    RECONSTRUCTION = "reconstruction"
    CONTEXT = "context"
    LINES = "lines"
    LINKED_FRAGMENTS = "linked_fragments"

@dataclass
class Fragment:
    id: str = None
    name: str = None
    author: str = None
    title: str = None
    editor: str = None
    status: str = None
    lock: int = None
    translation: str = None
    differences: str = None
    apparatus: str = None
    commentary: str = None
    reconstruction: str = None
    context: list = None
    lines: list = None
    linked_fragments: list = None



class FragmentModel:
    def __init__(self, server):
        self.db = server[conf.COUCH_FRAGMENTS]
    
    def __get_fragments(self, frag_lst):
        result = list()
        for doc in frag_lst:
            fragment = Fragment(id=doc.id)
            if FragmentField.NAME in doc:
                fragment.name = doc[FragmentField.NAME]
            if FragmentField.AUTHOR in doc:
                fragment.author = doc[FragmentField.AUTHOR]
            if FragmentField.TITLE in doc:
                fragment.title = doc[FragmentField.TITLE]
            if FragmentField.EDITOR in doc:
                fragment.editor = doc[FragmentField.EDITOR]
            if FragmentField.STATUS in doc:
                fragment.status = doc[FragmentField.STATUS]
            if FragmentField.LOCK in doc:
                fragment.lock = doc[FragmentField.LOCK]
            if FragmentField.TRANSLATION in doc:
                fragment.translation = doc[FragmentField.TRANSLATION]
            if FragmentField.DIFFERENCES in doc:
                fragment.differences = doc[FragmentField.DIFFERENCES]
            if FragmentField.APPARATUS in doc:
                fragment.apparatus = doc[FragmentField.APPARATUS]
            if FragmentField.COMMENTARY in doc:
                fragment.commentary = doc[FragmentField.COMMENTARY]
            if FragmentField.RECONSTRUCTION in doc:
                fragment.reconstruction = doc[FragmentField.RECONSTRUCTION]
            if FragmentField.CONTEXT in doc:
                fragment.context = doc[FragmentField.CONTEXT]
            if FragmentField.LINES in doc:
                fragment.lines = doc[FragmentField.LINES]
            if FragmentField.LINKED_FRAGMENTS in doc:
                fragment.linked_fragments = doc[FragmentField.LINKED_FRAGMENTS]
            result.append(fragment)
        return result

    def all(self, sorted=False):
        result = self.db.find({
            "selector": dict(),
            "limit": conf.COUCH_LIMIT
        })
        result = self.__get_fragments(result)
        if sorted:
            result.sort(key=lambda Fragment: Fragment.name)
        return result
        
    def filter(self, fragment, sorted=False):
        fragment = {key: value for key, value in fragment.__dict__.items() if value}
        if "id" in fragment:
            fragment[FragmentField.ID] = fragment.pop("id")
        if "name" in fragment:
            fragment[FragmentField.NAME] = fragment.pop("name")
        mango = {
            "selector": fragment,
            "limit": conf.COUCH_LIMIT
        }
        print(mango)
        result = self.db.find(mango)
        result = self.__get_fragments(result)
        if sorted:
            result.sort(key=lambda Fragment: Fragment.title)
        return result

    def create(self, fragment):
        fragment = {key: value for key, value in fragment.__dict__.items() if value}
        fragment[FragmentField.ID] = fragment.pop("id") # MongoDB uses "_id" instead of "id"
        fragment[FragmentField.NAME] = fragment.pop("name")
        
        doc_id, _ = self.db.save(fragment)
        if not doc_id:
            logging.error("create(): failed to create fragment")
            return None
        return fragment

#     def get(self, user):
#         user = {key: value for key, value in user.__dict__.items() if value}
#         mango = {
#             "selector": user,
#             "limit": conf.COUCH_LIMIT
#         }
#         result = self.db.find(mango)
#         result = self.__get_users(result)
        
#         if result:
#             if len(result) > 1:
#                 logging.warning("get(): function returned more than 1 object!")
#             return result[0]
#         return None


        
#     def get_or_create(self, user):
#         result = self.get(user)
#         if result is not None:
#             return result
#         else:
#             return self.create(user)
    
#     def update(self, user):
#         _user = self.get(User(username=user.username))
#         if _user == None:
#             logging.error("update(): user could not be found")
#             return False
#         try:
#             doc = self.db[_user.id]
#             for key, value in asdict(user).items():
#                 if value != None:
#                     doc[key] = value
#             self.db.save(doc)
#             return True
#         except Exception as e:
#             logging.error(e)
#         return False

#     def delete(self, user):
#         user = self.get(user)
        
#         if user == None:
#             logging.error("delete(): user could not be found")
#             return False
#         try:
#             doc = self.db[user.id]
#             self.db.delete(doc)
#             return True
#         except Exception as e:
#             logging.error(e)
#         return False




# # class Fragment:
# #     """ Object class that creates a fragment from the given json.
# #     Used for fragment_handling.
# #     """    
# #     def __init__(self, received_fragment):
    
<<<<<<< Updated upstream
        # Fragment meta data
        if "_id" in received_fragment: 
            assert isinstance(received_fragment['_id'], str)
            self._id = received_fragment['_id']
=======
# #         print('#############################')
# #         print(received_fragment['author'])

# #         # Fragment meta data
# #         if "id" in received_fragment: 
# #             assert isinstance(received_fragment['id'], str)
# #             self._id = received_fragment['id']
>>>>>>> Stashed changes

# #         if "fragment_name" in received_fragment: 
# #             assert isinstance(received_fragment['fragment_name'], str)
# #             self.fragment_name = received_fragment['fragment_name']
            
# #         if "author" in received_fragment: 
# #             assert isinstance(received_fragment['author'], str)
# #             self.author = received_fragment['author']

# #         if "title" in received_fragment: 
# #             assert isinstance(received_fragment['title'], str)
# #             self.title = received_fragment['title']
            
# #         if "editor" in received_fragment: 
# #             assert isinstance(received_fragment['editor'], str)
# #             self.editor = received_fragment['editor']
            
# #         if "status" in received_fragment: 
# #             assert isinstance(received_fragment['status'], str)
# #             self.status = received_fragment['status']

# #         if "lock" in received_fragment: 
# #             assert isinstance(received_fragment['lock'], int)
# #             self.lock = received_fragment['lock']

# #         # Fragment content fields
# #         if "translation" in received_fragment: 
# #             assert isinstance(received_fragment['translation'], str)
# #             self.translation = received_fragment['translation']
            
# #         if "differences" in received_fragment: 
# #             assert isinstance(received_fragment['differences'], str)
# #             self.differences = received_fragment['differences']
            
# #         if "apparatus" in received_fragment:             
# #             assert isinstance(received_fragment['apparatus'], str)
# #             self.apparatus = received_fragment['apparatus']
            
<<<<<<< Updated upstream
        if "commentary" in received_fragment: 
            assert isinstance(received_fragment['commentary'], str)
            self.commentary = received_fragment['commentary']

        if "reconstruction" in received_fragment: 
            assert isinstance(received_fragment['reconstruction'], str)
            self.reconstruction = received_fragment['reconstruction']

        if "context" in received_fragment: 
            assert isinstance(received_fragment['context'], list)
            self.context = received_fragment['context']

        if "lines" in received_fragment: 
            assert isinstance(received_fragment['lines'], list)
            self.lines = received_fragment['lines']

        # Fragment linking information
        if "linked_fragments" in received_fragment: 
            assert isinstance(received_fragment['linked_fragments'], list)
            self.linked_fragments = received_fragment['linked_fragments']

    # Default fragment fields
    _id = ''
    fragment_name = ''
    author = ''
    title = '' 
    editor = '' 
    translation = '' 
    differences = '' 
    apparatus = ''
    commentary = '' 
    reconstruction = '' 
    status = ''
    lock = 0
    context = [] 
    lines = []
    linked_fragments = []

    fragment_empty = {
        "fragment_name": "", 
        "author": "",
        "title": "",
        "editor": "",
        "translation": "",
        "differences": "",
        "apparatus": "",
        "commentary": "",
        "reconstruction":"",
        "status": "",
        "context":[
        ],
        "lines":[
        ],
        "linked_fragments":[
        ],
        "lock": 0,
    }
=======
# #         if "commentary" in received_fragment: 
# #             assert isinstance(received_fragment['commentary'], str)
# #             self.commentary = received_fragment['commentary']

# #         if "reconstruction" in received_fragment: 
# #             assert isinstance(received_fragment['reconstruction'], str)
# #             self.reconstruction = received_fragment['reconstruction']

# #         if "context" in received_fragment: 
# #             assert isinstance(received_fragment['context'], list)
# #             self.context = received_fragment['context']

# #         if "lines" in received_fragment: 
# #             assert isinstance(received_fragment['lines'], list)
# #             self.lines = received_fragment['lines']

# #         # Fragment linking information
# #         if "linked_fragments" in received_fragment: 
# #             assert isinstance(received_fragment['linked_fragments'], list)
# #             # From Angular, we receive an JSON object (from the formbuilder)
# #             # We must turn this into a set list again.
# #             linked_fragment_list = []
# #             for linked_fragment in received_fragment['linked_fragments']:
# #                 linked_fragment_list.append(linked_fragment['fragment_id'])
# #             self.linked_fragments = list(set(linked_fragment_list)) # Angular needs a tissue for its issue

# #         if "linked_bib_entries" in received_fragment: 
# #             assert isinstance(received_fragment['linked_bib_entries'], list)
# #             # From Angular, we receive an JSON object (from the formbuilder)
# #             # We must turn this into a set list again.
# #             linked_bib_entries_list = []
# #             for linked_bib_entry in received_fragment['linked_bib_entries']:
#                 linked_bib_entries_list.append(linked_bib_entry['bib_id'])
#             self.linked_bib_entries = list(set(linked_bib_entries_list)) 

#     # Default fragment fields
#     _id: str = ''
#     fragment_name: str = ''
#     author: str = ''
#     title: str = '' 
#     editor: str = '' 
#     translation: str = '' 
#     differences: str = '' 
#     apparatus: str = ''
#     commentary: str = '' 
#     reconstruction: str = '' 
#     status: str = ''
#     lock: int = 0
#     context: list = [] 
#     lines: list = []
#     linked_fragments: list = []
#     linked_bib_entries: list = []

#     fragment_empty: dict = {
#         "fragment_name": "", 
#         "author": "",
#         "title": "",
#         "editor": "",
#         "translation": "",
#         "differences": "",
#         "apparatus": "",
#         "commentary": "",
#         "reconstruction":"",
#         "status": "",
#         "context":[
#         ],
#         "lines":[
#         ],
#         "linked_fragments":[
#         ],
#         "linked_bib_entries":[
#         ],
#         "lock": 0,
#     }
>>>>>>> Stashed changes
