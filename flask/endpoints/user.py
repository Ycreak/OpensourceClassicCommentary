"""
Endpoint handlers for user-related communication and authentication.
"""

from flask import Blueprint, request, make_response, Response
from flask_jsonpify import jsonify
import common.hashing as hashing
from common.couch import CouchConnection

from models.user import User, UserField, UserModel, Role

# Initialize the Blueprint
user_blueprint = Blueprint("user_blueprint", __name__)

# Initialize the User CRUD handler with a CouchDB connection
couch_server = CouchConnection.connect()
user_handler = User(couch_server)


@user_blueprint.route("/get", methods=["POST"])
def get_user() -> Response:
    """
    Retrieve user information.
    ---
    tags:
      - Users
    parameters:
      - in: body
        name: body
        schema:
          type: object
          required:
            - username
          properties:
            username:
              type: string
              example: johndoe
    responses:
      200:
        description: List of users. Admins see all users, guests see only themselves.
        schema:
          type: array
          items:
            $ref: '#/definitions/UserModel'
      404:
        description: User not found.
      422:
        description: Unprocessable entity.
    """
    try:
        data = request.get_json()
        username = data.get(UserField.USERNAME)
    except Exception:
        return make_response("Unprocessable entity", 422)

    user_list = user_handler.get({UserField.USERNAME: username})
    if not user_list:
        return make_response("User not found", 404)

    requesting_user = user_list[0]

    if requesting_user.role == Role.ADMIN:
        all_users = user_handler.all(sorted=True)
        results = []
        for u in all_users:
            u.password = None
            results.append(u.to_dict(exclude_none=True))
        return jsonify(results), 200

    requesting_user.password = None
    return jsonify([requesting_user.to_dict(exclude_none=True)]), 200


@user_blueprint.route("/login", methods=["POST"])
def login_user() -> Response:
    """
    Authenticate a user.
    ---
    tags:
      - Users
    parameters:
      - in: body
        name: body
        schema:
          type: object
          required:
            - username
            - password
          properties:
            username:
              type: string
            password:
              type: string
              format: password
    responses:
      200:
        description: Authentication successful.
        schema:
          properties:
            username:
              type: string
            role:
              type: string
      401:
        description: User not found.
      403:
        description: Unauthorized (Invalid password).
      422:
        description: Missing credentials.
    """
    data = request.get_json()
    username = data.get(UserField.USERNAME)
    password = data.get(UserField.PASSWORD)

    if not username or not password:
        return make_response("Missing credentials", 422)

    user_list = user_handler.get({UserField.USERNAME: username})
    if not user_list:
        return make_response("User not found", 401)

    user = user_list[0]

    if hashing.verify_password(stored_pwd=user.password, provided_pwd=password):
        return jsonify({"username": user.username, "role": user.role}), 200

    return make_response("Unauthorized", 403)


@user_blueprint.route("/create", methods=["POST"])
def create_user() -> Response:
    """
    Register a new user.
    ---
    tags:
      - Users
    parameters:
      - in: body
        name: body
        schema:
          type: object
          required:
            - username
            - password
          properties:
            username:
              type: string
            password:
              type: string
              format: password
    responses:
      201:
        description: User created successfully.
      403:
        description: User already exists or database error.
      422:
        description: Missing username or password.
    """
    data = request.get_json()
    if not data.get(UserField.USERNAME) or not data.get(UserField.PASSWORD):
        return make_response("Missing username or password", 422)

    new_user_data = UserModel.from_dict(data)
    new_user_data.password = hashing.hash_password(new_user_data.password)
    new_user_data.role = Role.GUEST

    doc_id = user_handler.create(new_user_data)

    if doc_id:
        return make_response("User created", 201)

    return make_response("User already exists or server error", 403)


@user_blueprint.route("/delete", methods=["POST"])
def delete_user() -> Response:
    """
    Delete a user.
    ---
    tags:
      - Users
    parameters:
      - in: body
        name: body
        schema:
          type: object
          required:
            - username
          properties:
            username:
              type: string
    responses:
      200:
        description: User deleted successfully.
      401:
        description: User not found.
      422:
        description: Unprocessable entity.
    """
    data = request.get_json()
    username = data.get(UserField.USERNAME)

    if not username:
        return make_response("Unprocessable entity", 422)

    if user_handler.delete(UserModel(username=username)):
        return make_response("User deleted", 200)

    return make_response("User not found", 401)


@user_blueprint.route("/update", methods=["POST"])
def update_user() -> Response:
    """
    Update user attributes.
    ---
    tags:
      - Users
    parameters:
      - in: body
        name: body
        schema:
          type: object
          required:
            - username
          properties:
            username:
              type: string
            password:
              type: string
              format: password
            role:
              type: string
              enum: [ADMIN, GUEST]
    responses:
      200:
        description: User updated successfully.
      401:
        description: User not found.
      422:
        description: Unprocessable entity.
    """
    data = request.get_json()
    username = data.get(UserField.USERNAME)

    if not username:
        return make_response("Unprocessable entity", 422)

    update_model = UserModel.from_dict(data)

    if UserField.PASSWORD in data:
        update_model.password = hashing.hash_password(data[UserField.PASSWORD])

    if user_handler.update(update_model):
        return make_response("User updated", 200)

    return make_response("User not found", 401)
