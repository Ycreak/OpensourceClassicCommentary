import hashlib
import os

class Hashing:
    def doHash(self, username1, password1):
        users = {} # A simple demo storage

        # Add a user
        username = 'luuk' # The users username
        password = 'nolden' # The users password

        salt = os.urandom(32) # A new salt for this user
        key = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt, 100000)
        users[username] = { # Store the salt and key
            'salt': salt,
            'key': key
            }

        # Verification attempt 1 (incorrect password)
        username = username1
        password = password1

        salt = users[username]['salt'] # Get the salt
        key = users[username]['key'] # Get the correct key
        new_key = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt, 100000)

        if new_key == key:
            return '1'
        else:
            return '0'
