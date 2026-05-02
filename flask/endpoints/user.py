"""
Endpoint handlers for user-related communication and authentication.
"""

from flask import request, make_response, Response
from flask_jsonpify import jsonify
import common.hashing as hashing
from common.couch import CouchConnection

from models.user import User, UserField, UserModel, Role

# Initialize the User CRUD handler with a CouchDB connection
couch_server = CouchConnection.connect()
user_handler = User(couch_server)


def get_user() -> Response:
    """
    Retrieves user information based on a provided username.
    """
    try:
        data = request.get_json()
        username = data.get(UserField.USERNAME)
    except Exception as e:
        return make_response("Unprocessable entity", 422)

    # Use the handler to find the user
    user_list = user_handler.get({UserField.USERNAME: username})
    if not user_list:
        return make_response("User not found", 404)

    requesting_user = user_list[0]

    # Admin sees everyone
    if requesting_user.role == Role.ADMIN:
        all_users = user_handler.all(sorted=True)
        # Strip passwords for safety
        results = []
        for u in all_users:
            u.password = None
            results.append(u.to_dict(exclude_none=True))
        return jsonify(results), 200

    # Others see only themselves
    requesting_user.password = None
    return jsonify([requesting_user.to_dict(exclude_none=True)]), 200


def login_user() -> Response:
    """
    Authenticates a user by checking provided credentials.
    """
    data = request.get_json()
    username = data.get(UserField.USERNAME)
    password = data.get(UserField.PASSWORD)

    if not username or not password:
        return make_response("Missing credentials", 422)

    user_list = user_handler.get({UserField.USERNAME: username})
    if not user_list:
        return make_response("Not found", 401)

    user = user_list[0]

    if hashing.verify_password(stored_pwd=user.password, provided_pwd=password):
        return jsonify({"username": user.username, "role": user.role}), 200

    return make_response("Unauthorized", 403)


def create_user() -> Response:
    """
    Registers a new user with a hashed password and default GUEST role.
    """
    data = request.get_json()
    if not data.get(UserField.USERNAME) or not data.get(UserField.PASSWORD):
        return make_response("Missing username or password", 422)

    # Map request to model
    new_user_data = UserModel.from_dict(data)

    # Secure the password before passing to the handler
    new_user_data.password = hashing.hash_password(new_user_data.password)
    new_user_data.role = Role.GUEST  # Default role

    # The create() method in your model already checks for existing users
    doc_id = user_handler.create(new_user_data)

    if doc_id:
        return make_response("Created", 201)

    return make_response("User already exists or server error", 403)


def delete_user() -> Response:
    """
    Deletes a user from the database based on the provided username.
    """
    data = request.get_json()
    username = data.get(UserField.USERNAME)

    if not username:
        return make_response("Unprocessable entity", 422)

    # delete() in your model can handle a model with just a username
    if user_handler.delete(UserModel(username=username)):
        return make_response("OK", 200)

    return make_response("Not found", 401)


def update_user() -> Response:
    """
    Updates user attributes (Role or Password) for a specific username.
    """
    data = request.get_json()
    username = data.get(UserField.USERNAME)

    if not username:
        return make_response("Unprocessable entity", 422)

    # Create a model from the update data
    update_model = UserModel.from_dict(data)

    # Hash password if it's being updated
    if UserField.PASSWORD in data:
        update_model.password = hashing.hash_password(data[UserField.PASSWORD])

    # The update logic in your model handles finding the _id by username automatically
    if user_handler.update(update_model):
        return make_response("OK", 200)

    return make_response("Not found", 401)
