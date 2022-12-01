from dataclasses import dataclass, asdict
import logging

import Server.config as conf


class FragmentField(object):
    ID = "_id"
    FRAGMENT_NAME = "fragment_name"
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
    fragment_name: str = None
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
            if FragmentField.FRAGMENT_NAME in doc:
                fragment.fragment_name = doc[FragmentField.FRAGMENT_NAME]
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
            result.sort(key=lambda Fragment: Fragment.fragment_name)
        return result
        
    def filter(self, fragment, sorted=False):
        fragment = {key: value for key, value in fragment.__dict__.items() if value}
        if "id" in fragment:
            fragment[FragmentField.ID] = fragment.pop("id")
        if "fragment_name" in fragment:
            fragment[FragmentField.FRAGMENT_NAME] = fragment.pop("fragment_name")
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
        fragment[FragmentField.FRAGMENT_NAME] = fragment.pop("fragment_name")
        
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