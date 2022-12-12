from flask import request, make_response
import logging
from flask_jsonpify import jsonify
from uuid import uuid4

from Server.couch import CouchAuthenticator
from Server.models.fragment import Fragment, FragmentModel, FragmentField

fragments = FragmentModel(CouchAuthenticator().couch)

def get_author():
    author = None
    title = None
    editor = None
    name = None
    try:
        if FragmentField.AUTHOR in request.get_json():
            author = request.get_json()[FragmentField.AUTHOR]
        if FragmentField.TITLE in request.get_json():
            title = request.get_json()[FragmentField.TITLE]
        if FragmentField.EDITOR in request.get_json():
            editor = request.get_json()[FragmentField.EDITOR]
        if FragmentField.NAME in request.get_json():
            name = request.get_json()[FragmentField.NAME]
    except KeyError as e:
        logging.error(e)
        return make_response("Unprocessable entity", 422)
    fragment_lst = fragments.filter(Fragment(author=author, title=title, editor=editor, name=name), sorted=True)
    if not fragment_lst:
        return make_response("Not found", 401)
    return jsonify(sorted(set([frag.author for frag in fragment_lst]))), 200

def get_title():
    author = None
    title = None
    editor = None
    name = None
    try:
        if FragmentField.AUTHOR in request.get_json():
            author = request.get_json()[FragmentField.AUTHOR]
        if FragmentField.TITLE in request.get_json():
            title = request.get_json()[FragmentField.TITLE]
        if FragmentField.EDITOR in request.get_json():
            editor = request.get_json()[FragmentField.EDITOR]
        if FragmentField.NAME in request.get_json():
            name = request.get_json()[FragmentField.NAME]
    except KeyError as e:
        logging.error(e)
        return make_response("Unprocessable entity", 422)
    fragment_lst = fragments.filter(Fragment(author=author, title=title, editor=editor, name=name), sorted=True)
    if not fragment_lst:
        return make_response("Not found", 401)
    return jsonify(sorted(set([frag.title for frag in fragment_lst]))), 200

def get_editor():
    author = None
    title = None
    editor = None
    name = None
    try:
        if FragmentField.AUTHOR in request.get_json():
            author = request.get_json()[FragmentField.AUTHOR]
        if FragmentField.TITLE in request.get_json():
            title = request.get_json()[FragmentField.TITLE]
        if FragmentField.EDITOR in request.get_json():
            editor = request.get_json()[FragmentField.EDITOR]
        if FragmentField.NAME in request.get_json():
            name = request.get_json()[FragmentField.NAME]
    except KeyError as e:
        logging.error(e)
        return make_response("Unprocessable entity", 422)
    fragment_lst = fragments.filter(Fragment(author=author, title=title, editor=editor, name=name), sorted=True)
    if not fragment_lst:
        return make_response("Not found", 401)
    return jsonify(sorted(set([frag.editor for frag in fragment_lst]))), 200

def get_name():
    author = None
    title = None
    editor = None
    name = None
    try:
        if FragmentField.AUTHOR in request.get_json():
            author = request.get_json()[FragmentField.AUTHOR]
        if FragmentField.TITLE in request.get_json():
            title = request.get_json()[FragmentField.TITLE]
        if FragmentField.EDITOR in request.get_json():
            editor = request.get_json()[FragmentField.EDITOR]
        if FragmentField.NAME in request.get_json():
            name = request.get_json()[FragmentField.NAME]
    except KeyError as e:
        logging.error(e)
        return make_response("Unprocessable entity", 422)
    fragment_lst = fragments.filter(Fragment(author=author, title=title, editor=editor, name=name), sorted=True)
    if not fragment_lst:
        return make_response("Not found", 401)
    return jsonify(list(set([frag.name for frag in fragment_lst]))), 200

def get_fragment():
    author = None
    title = None
    editor = None
    name = None
    try:
        if FragmentField.AUTHOR in request.get_json():
            author = request.get_json()[FragmentField.AUTHOR]
        if FragmentField.TITLE in request.get_json():
            title = request.get_json()[FragmentField.TITLE]
        if FragmentField.EDITOR in request.get_json():
            editor = request.get_json()[FragmentField.EDITOR]
        if FragmentField.NAME in request.get_json():
            name = request.get_json()[FragmentField.NAME]
    except KeyError as e:
        logging.error(e)
        return make_response("Unprocessable entity", 422)

    fragment_lst = fragments.filter(Fragment(author=author, title=title, editor=editor, name=name), sorted=True)
    if not fragment_lst:
        return make_response("Not found", 401)
    return jsonify(fragment_lst), 200

def create_fragment():
    try:
        author = request.get_json()[FragmentField.AUTHOR]
        title = request.get_json()[FragmentField.TITLE]
        editor = request.get_json()[FragmentField.EDITOR]
        name = request.get_json()[FragmentField.NAME]

        status = None
        lock = None
        translation = None
        differences = None
        apparatus = None
        commentary = None
        reconstruction = None
        context = None
        lines = None
        linked_fragments = None

        if FragmentField.STATUS in request.get_json():
            status = request.get_json()[FragmentField.STATUS]
        if FragmentField.LOCK in request.get_json():
            lock = request.get_json()[FragmentField.LOCK]
        if FragmentField.TRANSLATION in request.get_json():
            translation = request.get_json()[FragmentField.TRANSLATION]
        if FragmentField.DIFFERENCES in request.get_json():
            differences = request.get_json()[FragmentField.DIFFERENCES]
        if FragmentField.APPARATUS in request.get_json():
            apparatus = request.get_json()[FragmentField.APPARATUS]
        if FragmentField.COMMENTARY in request.get_json():
            commentary = request.get_json()[FragmentField.COMMENTARY]
        if FragmentField.RECONSTRUCTION in request.get_json():
            reconstruction = request.get_json()[FragmentField.RECONSTRUCTION]
        if FragmentField.CONTEXT in request.get_json():
            context = request.get_json()[FragmentField.CONTEXT]
        if FragmentField.LINES in request.get_json():
            lines = request.get_json()[FragmentField.LINES]
        if FragmentField.LINKED_FRAGMENTS in request.get_json():
            linked_fragments = request.get_json()[FragmentField.LINKED_FRAGMENTS]
    except KeyError as e:
        logging.error(e)
        return make_response("Unprocessable entity", 422)
    
    if fragments.filter(Fragment(author=author, title=title, editor=editor, name=name)):
        logging.error("create_fragment(): duplicate fragment")
        return make_response("Forbidden", 403)

    fragment = fragments.create(Fragment(id=uuid4().hex, author=author, title=title, editor=editor, name=name, status=status,
                                         lock=lock, translation=translation, differences=differences, apparatus=apparatus, 
                                         commentary=commentary, reconstruction=reconstruction, context=context, lines=lines, 
                                         linked_fragments=linked_fragments))
    if fragment == None:
        return make_response("Server error", 500)
    
    return "Created", 200

def link_fragment():
    try:
        author = request.get_json()[FragmentField.AUTHOR]
        title = request.get_json()[FragmentField.TITLE]
    except KeyError as e:
        logging.error(e)
        return make_response("Unprocessable entity", 422)
    
    fragment_lst = fragments.filter(Fragment(author=author, title=title))
    if not fragment_lst:
        return make_response("Not found", 401)

    while(fragment_lst):
        fragment = fragment_lst.pop()
        for line in fragment.lines:
            for other in fragment_lst:
                for other_line in other:
                    return "hello", 200

def update_fragment():
    return "", 200

def delete_fragment():

    try:
        author = request.get_json()[FragmentField.AUTHOR]
        title = request.get_json()[FragmentField.TITLE]
        editor = request.get_json()[FragmentField.EDITOR]
        name = request.get_json()[FragmentField.NAME]

    except KeyError as e:
        logging.error(e)
        return make_response("Unprocessable entity", 422)

    fragment = fragments.delete(Fragment(author=author, title=title, editor=editor, name=name))

    if fragment:
        return make_response("OK", 200)
    else:
        return make_response("Not found", 401)
