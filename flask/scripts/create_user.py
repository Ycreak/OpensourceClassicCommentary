"""
Seed or update a user in the OSCC CouchDB users database.

Because account creation via the API now requires an admin token, this
script is the bootstrap that creates the very first admin (or any other
user) directly in the database.

Usage:
    cd flask
    uv run python scripts/create_user.py --username <name>
    # will prompt for the password, or pass it explicitly:
    uv run python scripts/create_user.py --username <name> --password <pwd> --role admin

Add --update to change the password and/or role of an existing user.
"""

import argparse
import getpass
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from common.couch import CouchConnection
import common.hashing as hashing
from models.user import User, UserField, UserModel, Role


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Seed or update a user in the CouchDB users database."
    )
    parser.add_argument("--username", required=True, help="Username of the user.")
    parser.add_argument(
        "--password",
        default=None,
        help="Password for the user. Prompts securely if omitted.",
    )
    parser.add_argument(
        "--role",
        default=Role.ADMIN,
        choices=[Role.ADMIN, Role.TEACHER, Role.STUDENT, Role.GUEST],
        help="Role to assign. Defaults to admin.",
    )
    parser.add_argument(
        "--update",
        action="store_true",
        help="Update the password and/or role if the user already exists.",
    )
    args = parser.parse_args()

    password = args.password or getpass.getpass("Enter password: ")

    server = CouchConnection.connect()
    user_handler = User(server)

    existing = user_handler.get({UserField.USERNAME: args.username})
    if existing:
        if not args.update:
            print(
                f"User '{args.username}' already exists. "
                "Use --update to change its password or role."
            )
            return

        model = existing[0]
        model.password = hashing.hash_password(password)
        model.role = args.role
        if user_handler.update(model):
            print(f"Updated user '{args.username}' (role={args.role}).")
            return
        sys.exit(f"Failed to update user '{args.username}'.")

    model = UserModel(
        username=args.username, password=hashing.hash_password(password), role=args.role
    )
    doc_id = user_handler.create(model)
    if doc_id:
        print(f"Created user '{args.username}' (role={args.role}) with id={doc_id}.")
        return
    sys.exit(f"Failed to create user '{args.username}'.")


if __name__ == "__main__":
    main()
