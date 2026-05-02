import hashlib
import binascii
import os

import os
from dotenv import load_dotenv

load_dotenv(".env")


def verify_password(stored_pwd: str, provided_pwd: str) -> bool:
    """
    Verifies a provided password against a stored salted and hashed password.

    This function extracts the salt from the first 64 characters of the stored
    password string, re-hashes the provided password using PBKDF2, and
    compares the results.

    Args:
        stored_pwd (str): The hex-encoded string containing the 64-character
            salt followed by the hashed password.
        provided_pwd (str): The plain-text password provided by the user
            for verification.

    Returns:
        bool: True if the provided password matches the stored hash,
            False otherwise.
    """
    # Extract the salt (first 64 chars) and the hash (the rest)
    salt = stored_pwd[:64]
    stored_hash = stored_pwd[64:]

    # Hash the provided password using the same salt and parameters
    pwd_hash = hashlib.pbkdf2_hmac(
        os.getenv("PWD_HASH_NAME"),
        provided_pwd.encode("utf-8"),
        salt.encode("ascii"),
        int(os.getenv("PWD_HASH_ITERATIONS")),
    )

    # Convert binary hash to hex string for comparison
    computed_hash = binascii.hexlify(pwd_hash).decode("ascii")

    return computed_hash == stored_hash


def hash_password(password: str) -> str:
    """
    Hashes a plain-text password using PBKDF2 with a unique, random salt.

    The function generates a 64-character hex salt, applies the PBKDF2-HMAC
    algorithm, and returns a concatenated string of the salt and the resulting
    hash for storage.

    Args:
        password (str): The plain-text password to be hashed.

    Returns:
        str: A string containing the 64-character hex salt followed by
            the hex-encoded password hash.
    """
    # Generate a random salt and convert to hex (64 characters)
    salt = hashlib.sha256(os.urandom(60)).hexdigest().encode("ascii")

    # Hash the password using PBKDF2-HMAC
    pwd_hash = hashlib.pbkdf2_hmac(
        os.getenv("PWD_HASH_NAME"),
        password.encode("utf-8"),
        salt,
        int(os.getenv("PWD_HASH_ITERATIONS")),
    )

    # Convert binary hash to hex
    pwd_hash = binascii.hexlify(pwd_hash)

    # Combine salt and hash into a single string for storage
    return (salt + pwd_hash).decode("ascii")
