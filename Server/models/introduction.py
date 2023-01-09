"""
                      _      _         ___       _                 _            _   _                           
                     | |    | |       / (_)     | |               | |          | | (_)                          
  _ __ ___   ___   __| | ___| |___   / / _ _ __ | |_ _ __ ___   __| |_   _  ___| |_ _  ___  _ __    _ __  _   _ 
 | '_ ` _ \ / _ \ / _` |/ _ \ / __| / / | | '_ \| __| '__/ _ \ / _` | | | |/ __| __| |/ _ \| '_ \  | '_ \| | | |
 | | | | | | (_) | (_| |  __/ \__ \/ /  | | | | | |_| | | (_) | (_| | |_| | (__| |_| | (_) | | | |_| |_) | |_| |
 |_| |_| |_|\___/ \__,_|\___|_|___/_/   |_|_| |_|\__|_|  \___/ \__,_|\__,_|\___|\__|_|\___/|_| |_(_) .__/ \__, |
                                                                                                   | |     __/ |
                                                                                                   |_|    |___/ 
"""

# TODO: This needs some proper testing!

from dataclasses import dataclass, asdict
import logging
from uuid import uuid4

import Server.config as conf

class IntroductionFormField(object):
    # Container for field names
    ID = '_id'
    AUTHOR = 'selected_fragment_author'
    TITLE = 'selected_fragment_title'
    AUTHOR_INTRODUCTION_TEXT = 'author_introduction_text'
    TITLE_INTRODUCTION_TEXT = 'title_introduction_text'

@dataclass
class IntroductionForm:
    # Data container. Corresponds to the IntroductionForm on the dashboard.
    _id: str = ''
    author: str = ''
    title: str = ''
    author_introduction_text: str = ''
    title_introduction_text: str = ''

class IntroductionFormModel:
    def __init__(self, server):
        self.db = server[conf.COUCH_INTRODUCTIONS]

    def __get_introduction_text(self, intro_lst: list) -> list:
        # Parses result of mango request

        # Found introductions in intro_lst will be processed piecewise and put into this new list
        result = list() 
        for doc in intro_lst:
            introduction = IntroductionForm()
            if '_id' in doc:
                introduction._id = doc['_id']
            if IntroductionFormField.AUTHOR in doc:
                introduction.author = doc[IntroductionFormField.AUTHOR]
            if IntroductionFormField.TITLE in doc:
                introduction.title = doc[IntroductionFormField.TITLE]
            if IntroductionFormField.AUTHOR_INTRODUCTION_TEXT in doc:
                introduction.author_introduction_text = doc[IntroductionFormField.AUTHOR_INTRODUCTION_TEXT]
            if IntroductionFormField.TITLE_INTRODUCTION_TEXT in doc:
                introduction.title_introduction_text = doc[IntroductionFormField.TITLE_INTRODUCTION_TEXT]
            result.append(introduction)
        
        if result == []:
            return None
        else:
            return result

    def get(self, intro: IntroductionForm) -> list:
        def find_data(query_dict):
            mango = {
                "selector": query_dict,
                "limit": conf.COUCH_LIMIT
            }
            result = self.db.find(mango)
            result = self.__get_introduction_text(result)
            return result
        
        if intro.author and not intro.title:
            # Only look for author introduction
            query = {'author': intro.author}
            result = find_data(query)
        elif intro.author and intro.title:
            # Only look for title introduction
            query = {'author': intro.author, 'title': intro.title}
            result = find_data(query)
        else: 
            raise ValueError("Cannot get introduction text; At least an author should be specified")

        if result and isinstance(result, list):
            result = [entry.__dict__ for entry in result]
        if result and not isinstance(result, list):
            result = [result]
        return result

    def create(self, intro: IntroductionForm) -> list:
        intro = IntroductionForm()
        intro = {key: value for key, value in intro.__dict__.items()}
        intro['_id'] = uuid4().hex # MongoDB uses "_id" instead of "id"
        doc_id, _ = self.db.save(intro)
        if not doc_id: 
            logging.error("create(): failed to create introduction text for: {}".format(intro.author)) # TODO!
            return None

        return [intro]

    def get_or_create(self, intro: IntroductionForm) -> list:
        result = self.get(intro)
        if result:
            return result
        else: 
            return self.create(intro)


    def update(self, intro: IntroductionForm) -> bool:
        # Always get all introduction text entries for the given author
        # Update will make sure to update the author introduction text across all these entries
        # So that each entry of the given author will have the same author introduction text.

        flag = False # Error flag; False by default
        
        if intro.title:
            _intro_title = self.get_or_create(IntroductionForm(author=intro.author, title=intro.title))
            # Update entry for given author and title
            try:
                # Try to push the changes to the database
                doc = self.db[_intro_title[0]['_id']]
                for key, value in asdict(intro).items():
                    if (value != None):
                        if (key != '_id'):
                            doc[key] = value
                self.db.save(doc)
                flag = True
            except Exception as e:
                logging.error(e)

        
        _intros_author = self.get_or_create(IntroductionForm(author=intro.author))
        if not _intros_author:
            logging.error("update(): something went wrong")
            return False
        
        # Update all entries for the given author
        try: 
            # Try to push the changes to the database
            for entry in _intros_author:
                print(entry)
                doc = self.db[entry['_id']]
                doc['author_introduction_text'] = intro.author_introduction_text
                self.db.save(doc)
                flag = True
        except Exception as e:
            logging.error(e)

        return flag # Return True/False on success/error

    def delete(self, intro):
        _intro = self.get(intro)

        if _intro == None:
            logging.error("delete(): intro could not be found")
            return False
        try:
            doc = self.db[_intro['_id']]
            self.db.delete(doc)
            return True
        except Exception as e:
            logging.error(e)
        return False