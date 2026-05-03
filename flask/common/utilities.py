import string
from fuzzywuzzy import fuzz
import json
from typing import Any, Union


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
