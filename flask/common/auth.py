"""
JWT authentication helpers for the OSCC Flask API.

Tokens are signed with the secret from the .env file and carry the
username and role of the authenticated user. Endpoints that mutate data
are protected with the token_required decorator.
"""

import os
from datetime import datetime, timedelta, timezone
from functools import wraps

import jwt
from dotenv import load_dotenv
from flask import g, make_response, request

load_dotenv(".env")

TOKEN_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
TOKEN_SECRET = os.getenv("JWT_SECRET_KEY", "")
TOKEN_EXPIRY_HOURS = int(os.getenv("JWT_EXPIRY_HOURS", "12"))


class TokenError(Exception):
    """Raised when a token is missing, invalid, or expired."""


def encode_token(username: str, role: str) -> str:
    """
    Creates a signed JWT for the given user.

    Args:
        username (str): The username of the authenticated user.
        role (str): The role of the authenticated user.

    Returns:
        str: A signed JSON Web Token.
    """
    now = datetime.now(timezone.utc)
    payload = {
        "sub": username,
        "role": role,
        "iat": now,
        "exp": now + timedelta(hours=TOKEN_EXPIRY_HOURS),
    }
    return jwt.encode(payload, TOKEN_SECRET, algorithm=TOKEN_ALGORITHM)


def decode_token(token: str) -> dict:
    """
    Validates and decodes a JWT.

    Args:
        token (str): The token to validate.

    Returns:
        dict: The token payload.

    Raises:
        TokenError: If the token is invalid or has expired.
    """
    try:
        return jwt.decode(token, TOKEN_SECRET, algorithms=[TOKEN_ALGORITHM])
    except (jwt.ExpiredSignatureError, jwt.InvalidTokenError) as e:
        raise TokenError(str(e)) from e


def token_required(view):
    """
    Decorator that protects a Flask route with JWT authentication.

    Extracts the bearer token from the Authorization header, validates it
    and stores the payload on flask.g as g.user. Returns 401 otherwise.
    """

    @wraps(view)
    def decorated(*args, **kwargs):
        authorization = request.headers.get("Authorization", "")
        scheme, separator, token = authorization.partition(" ")

        if separator == "" or scheme.lower() != "bearer" or not token:
            return make_response("Authentication required", 401)

        try:
            g.user = decode_token(token)
        except TokenError:
            return make_response("Invalid or expired token", 401)

        return view(*args, **kwargs)

    return decorated


def admin_required(view):
    """
    Decorator that protects a Flask route with JWT authentication and
    restricts access to users with the admin role.
    """

    @wraps(view)
    def decorated(*args, **kwargs):
        authorization = request.headers.get("Authorization", "")
        scheme, separator, token = authorization.partition(" ")

        if separator == "" or scheme.lower() != "bearer" or not token:
            return make_response("Authentication required", 401)

        try:
            g.user = decode_token(token)
        except TokenError:
            return make_response("Invalid or expired token", 401)

        if g.user.get("role") != "admin":
            return make_response("Forbidden", 403)

        return view(*args, **kwargs)

    return decorated