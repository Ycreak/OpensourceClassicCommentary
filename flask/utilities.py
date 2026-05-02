import hashlib
import binascii
import os
import string
from fuzzywuzzy import fuzz
import json
from typing import Any, Union

import config as conf


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
        conf.PWD_HASH_NAME,
        provided_pwd.encode("utf-8"),
        salt.encode("ascii"),
        conf.PWD_HASH_ITERATIONS,
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
        conf.PWD_HASH_NAME, password.encode("utf-8"), salt, conf.PWD_HASH_ITERATIONS
    )

    # Convert binary hash to hex
    pwd_hash = binascii.hexlify(pwd_hash)

    # Combine salt and hash into a single string for storage
    return (salt + pwd_hash).decode("ascii")


def similarity(a: str, b: str) -> int:
    """
    Calculates the fuzzy similarity ratio between two strings after normalization.

    The strings are normalized by removing all punctuation and converting
    characters to lowercase. The similarity is then calculated using a token
    sort ratio, which accounts for differences in word order.

    Args:
        a (str): The first string to compare.
        b (str): The second string to compare.

    Returns:
        int: A score between 0 and 100, where 100 is a perfect match
            (ignoring punctuation, case, and word order).
    """
    # Remove punctuation and convert to lowercase
    a = a.translate(str.maketrans("", "", string.punctuation)).lower()
    b = b.translate(str.maketrans("", "", string.punctuation)).lower()

    # Return the token sort ratio (0-100)
    return fuzz.token_sort_ratio(a, b)


def write_json(given_object: Any, file: str) -> None:
    """
    Serializes a Python object and writes it to a file in JSON format.

    Args:
        given_object (Any): The Python object (dict, list, etc.) to be
            serialized into JSON.
        file (str): The file path and name where the JSON data will be saved.
    """
    # Serializing json with a 2-space indent for readability
    json_object = json.dumps(given_object, indent=2)

    # Writing to the specified file
    with open(file, "w") as outfile:
        outfile.write(json_object)


def read_json(file: str) -> Union[list, dict]:
    """
    Reads and deserializes a JSON file into a Python object.

    Args:
        file (str): The file path and name of the JSON file to be read.

    Returns:
        Union[list, dict]: The parsed JSON data, typically returned as
            a list or a dictionary.
    """
    with open(file, "r") as openfile:
        # Reading and parsing the json file
        return json.load(openfile)
