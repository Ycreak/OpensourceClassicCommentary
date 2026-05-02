"""
Model to handle user logic and database persistence.
"""

import logging
from dataclasses import dataclass, asdict, fields
from typing import Optional, Any, List
from common.couch import Couch


class Role:
    """Constants for user roles."""

    ADMIN = "admin"
    TEACHER = "teacher"
    STUDENT = "student"
    GUEST = "guest"


class UserField:
    """Container for field name constants to avoid magic strings."""

    ID = "_id"
    USERNAME = "username"
    PASSWORD = "password"
    ROLE = "role"
    DOC_TYPE = "document_type"


@dataclass
class UserModel:
    """
    Data container representing a User document.
    """

    _id: Optional[str] = None
    document_type: str = "user"
    username: Optional[str] = None
    password: Optional[str] = None
    role: str = Role.GUEST

    @classmethod
    def from_dict(cls, data: dict) -> "UserModel":
        """
        Creates a model instance from a dictionary, ignoring extra keys.

        Args:
            data (dict): The raw dictionary from the database or request.

        Returns:
            UserModel: An initialized instance of the dataclass.
        """
        class_fields = {f.name for f in fields(cls)}
        filtered_data = {k: v for k, v in data.items() if k in class_fields}
        return cls(**filtered_data)

    def to_dict(self, exclude_none: bool = False) -> dict:
        """
        Converts the model to a dictionary for database storage.

        Args:
            exclude_none (bool): If True, keys with None values will be removed.

        Returns:
            dict: The dictionary representation of the model.
        """
        data = asdict(self)
        if exclude_none:
            return {k: v for k, v in data.items() if v is not None}
        return data


class User:
    """
    Handles CRUD operations for User documents in the database.
    """

    def __init__(self, server: Any):
        """
        Initializes the User handler with a database connection.

        Args:
            server (Any): The CouchDB server instance.
        """
        self.database = Couch(server, "users")

    def get(self, query_filter: dict) -> List[UserModel]:
        """
        Retrieves users matching the provided filter criteria.

        Args:
            query_filter (dict): Dictionary containing filter criteria like
                username or role.

        Returns:
            List[UserModel]: A list of matching UserModel instances.
        """
        search_criteria = {k: v for k, v in query_filter.items() if v is not None}
        search_criteria[UserField.DOC_TYPE] = "user"

        logging.info(f"Retrieving users for filter: {search_criteria}")
        document_list = self.database.filter(search_criteria)

        return [UserModel.from_dict(doc) for doc in document_list]

    def all(self, sorted: bool = False) -> List[UserModel]:
        """
        Retrieves all users from the database.

        Args:
            sorted (bool): Whether to sort the users by username.

        Returns:
            List[UserModel]: A list of all users.
        """
        document_list = self.database.all()
        # Filter for only 'user' document types in case the view returns mixed results
        users = [UserModel.from_dict(doc) for doc in document_list]

        if sorted:
            users.sort(key=lambda x: x.username if x.username else "")

        return users

    def create(self, user_model: UserModel) -> Optional[str]:
        """
        Creates a new user document.

        Args:
            user_model (UserModel): The UserModel instance to store.

        Returns:
            Optional[str]: The new document ID if successful,
                None if a user with that username already exists.
        """
        # Check if username is taken
        if self.get({UserField.USERNAME: user_model.username}):
            logging.warning(f"create(): User '{user_model.username}' already exists.")
            return None

        return self.database.create(user_model.to_dict(exclude_none=True))

    def delete(self, user_model: UserModel) -> bool:
        """
        Deletes a user document by its unique identifier or username.

        Args:
            user_model (UserModel): Model containing either the _id or username.

        Returns:
            bool: True if deletion was successful, False otherwise.
        """
        doc_id = user_model._id

        # If no ID, find the ID by username first
        if not doc_id and user_model.username:
            existing = self.get({UserField.USERNAME: user_model.username})
            if existing:
                doc_id = existing[0]._id

        if not doc_id:
            logging.error("delete(): Could not find user ID to delete.")
            return False

        return self.database.delete(doc_id)

    def update(self, user_model: UserModel) -> bool:
        """
        Updates an existing user. Requires an '_id'.

        Args:
            user_model (UserModel): Instance containing the fields to update
                and the mandatory '_id'.

        Returns:
            bool: True if the update was successful, False otherwise.
        """
        if not user_model._id:
            # Try to find the ID by username if it was omitted but exists
            existing = self.get({UserField.USERNAME: user_model.username})
            if existing:
                user_model._id = existing[0]._id
            else:
                logging.error("update(): Missing document _id and user not found.")
                return False

        return self.database.update(user_model.to_dict(exclude_none=True))
