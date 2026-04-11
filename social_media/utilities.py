import json


def write_json(given_object: object, file: str) -> None:
    """Writes the given object to the cache

    Args:
        object (object): to store as json
        file (str): path + filename
    """
    # Serializing json
    json_object = json.dumps(given_object, indent=2)
    # Writing to sample.json
    with open(file, "w") as outfile:
        outfile.write(json_object)


def read_json(file: str) -> list:
    """Reads the requested object from the cache

    Args:
        file (str): path + filename
    """
    with open(file, "r") as openfile:
        # Reading from json file
        return json.load(openfile)
