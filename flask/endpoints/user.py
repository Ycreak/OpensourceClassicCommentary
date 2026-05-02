"""
Endpoint handlers for user-related communication and authentication.
"""

import logging
from uuid import uuid4
from flask import request, make_response, Response
from flask_jsonpify import jsonify

from common.couch import CouchAuthenticator
import common.hashing as hashing

from models.user import User, UserField, UserModel, Role

# Initialize the User Model with a CouchDB connection
users = UserModel(CouchAuthenticator().couch)


def get_user() -> Response:
    """
    Retrieves user information based on a provided username.

    If the requesting user is a Student, Guest, or Teacher, returns only their info.
    If the user is an Admin, returns a list of all users. Sensitive fields like
    password and ID are stripped before returning.

    Returns:
        Response: A JSON list of users on success, or an error message
            with appropriate HTTP status code (404, 422).
    """
    try:
        username = request.get_json()[UserField.USERNAME]
    except KeyError as e:
        logging.error(f"get_user(): Missing key: {e}")
        return make_response("Unprocessable entity", 422)

    user = users.get(User(username=username))
    if not user:
        return make_response("User not found", 404)

    # Strip sensitive data and return based on role
    if user.role in [Role.STUDENT, Role.GUEST, Role.TEACHER]:
        user.password = None
        user.id = None
        return make_response(jsonify([user]), 200)

    elif user.role == Role.ADMIN:
        all_users = users.all(sorted=True)
        for i in all_users:
            i.password = None
            i.id = None
        return make_response(jsonify(all_users), 200)

    else:
        logging.warning(f"Unknown user role encountered: {user.role}")
        return make_response("Unknown user role", 404)


def login_user() -> Response:
    """
    Authenticates a user by checking provided credentials against the database.

    Returns:
        Response: JSON containing username and role on success (200),
            otherwise returns Unauthorized (403) or Not Found (401).
    """
    try:
        data = request.get_json()
        username = data[UserField.USERNAME]
        password = data[UserField.PASSWORD]
    except KeyError as e:
        logging.error(f"login_user(): Missing key: {e}")
        return make_response("Unprocessable entity", 422)

    user_list = users.filter(User(username=username))
    if not user_list:
        logging.error(f"User does not exist: {username}")
        return make_response("Not found", 401)

    try:
        user = user_list[0]
    except (KeyError, IndexError) as e:
        logging.error(f"Error during fetching user: {e}")
        return make_response("Server error", 500)

    if hashing.verify_password(stored_pwd=user.password, provided_pwd=password):
        return make_response(
            jsonify({"username": user.username, "role": user.role}), 200
        )
    else:
        return make_response("Unauthorized", 403)


def create_user() -> Response:
    """
    Registers a new user with a hashed password and default GUEST role.

    Returns:
        Response: 201 Created on success, 403 if user already exists,
            or 500 on server error.
    """
    user_data = User().from_json(request.get_json())

    if users.get(User(username=user_data.username)) is not None:
        return make_response("Forbidden", 403)

    new_user = users.create(
        User(
            id=uuid4().hex,
            username=user_data.username,
            password=hashing.hash_password(user_data.password),
            role=Role.GUEST,
        )
    )

    if new_user is None:
        return make_response("Server error", 500)

    return make_response("Created", 201)


def delete_user() -> Response:
    """
    Deletes a user from the database based on the provided username.

    Returns:
        Response: 200 OK on success, 401 Not Found if user doesn't exist,
            or 422 if the request is malformed.
    """
    try:
        username = request.get_json()[UserField.USERNAME]
    except KeyError as e:
        logging.error(f"delete_user(): Missing key: {e}")
        return make_response("Unprocessable entity", 422)

    if users.delete(User(username=username)):
        return make_response("OK", 200)
    else:
        return make_response("Not found", 401)


def update_user() -> Response:
    """
    Updates user attributes (Role or Password) for a specific username.

    Returns:
        Response: 200 OK on success, 401 if user not found,
            or 422 if username is missing.
    """
    try:
        req_data = request.get_json()
        username = req_data[UserField.USERNAME]
    except KeyError as e:
        logging.error(f"update_user(): Missing key: {e}")
        return make_response("Unprocessable entity", 422)

    user = User(username=username)

    if UserField.ROLE in req_data:
        user.role = req_data[UserField.ROLE]

    if UserField.PASSWORD in req_data:
        user.password = hashing.hash_password(req_data[UserField.PASSWORD])

    if users.update(user):
        return make_response("OK", 200)
    else:
        return make_response("Not found", 401)
