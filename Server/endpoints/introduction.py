import copy

from flask import request, make_response
import logging
from flask_jsonpify import jsonify

from Server.couch import CouchAuthenticator
from Server.models.introduction import IntroductionForm, IntroductionFormField, IntroductionFormModel

introduction = IntroductionFormModel(CouchAuthenticator().couch)

def get_introduction() -> make_response:
    try:
        introform = make_introduction_form_object()
    except KeyError as e:
        logging.error(e)
        return make_response("Unprocessable entity", 422)

    # Get the introduction texts from the database and load it into the introduction object.
    intro = introduction.get(introform)
    # Make sure that only one introduction text entry is returned
    if isinstance(intro, list):
        intro = intro[0]

    # If an author/title combo was not found, look for author only
    if not intro:
        author_only = copy.deepcopy(introform)
        author_only.title = ''
        intro = introduction.get(author_only)
        # Make sure that only one introduction text entry is returned
        if isinstance(intro, list):
            intro = intro[0]
            intro['title_text'] = '' # Return only author introduction text

    # Return the introduction text to the user
    return make_response(jsonify(intro))


def set_introduction() -> make_response:
    try:
        introform = make_introduction_form_object()
    except KeyError as e:
        logging.error(e)
        return make_response("Unprocessable entity", 422)

    # Send the introduction texts to the database
    if introduction.update(introform):
        return make_response("OK", 200)
    else:
        return make_response("Access denied; could not update introduction text", 401)


def make_introduction_form_object() -> IntroductionForm:
    # Parse json request into a local object.
    try:
        json = request.get_json()
    except:
        raise Exception("Error: Could not get request json")
    try:
        author = json[IntroductionFormField.AUTHOR]
    except:
        author = ''
    try:
        title = json[IntroductionFormField.TITLE]
    except: 
        title = ''
    try: # FIXME: This is a hack
        author_text = json[IntroductionFormField.AUTHOR_TEXT]
    except:
        author_text = ''
    try:
        title_text = json[IntroductionFormField.TITLE_TEXT]
    except:
        title_text = ''

    return IntroductionForm(author=author,
                            title=title, 
                            author_text=author_text, 
                            title_text=title_text)