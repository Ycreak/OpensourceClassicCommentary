"""

       _   _ _ _ _   _                         
      | | (_) (_) | (_)                        
 _   _| |_ _| |_| |_ _  ___  ___   _ __  _   _ 
| | | | __| | | | __| |/ _ \/ __| | '_ \| | | |
| |_| | |_| | | | |_| |  __/\__ \_| |_) | |_| |
 \__,_|\__|_|_|_|\__|_|\___||___(_) .__/ \__, |
                                  | |     __/ |
                                  |_|    |___/ 

"""

import hashlib, binascii, os, string
from fuzzywuzzy import fuzz

import Server.config as conf

def verify_password(stored_pwd, provided_pwd) -> bool:
    salt = stored_pwd[:64]
    stored_pwd = stored_pwd[64:]
    pwd_hash = hashlib.pbkdf2_hmac(conf.PWD_HASH_NAME, 
                                   provided_pwd.encode('utf-8'), 
                                   salt.encode('ascii'), 
                                   conf.PWD_HASH_ITERATIONS)
    pwd_hash = binascii.hexlify(pwd_hash).decode('ascii')
    return pwd_hash == stored_pwd

def hash_password(password) -> str:
    salt = hashlib.sha256(os.urandom(60)).hexdigest().encode('ascii')
    pwd_hash = hashlib.pbkdf2_hmac(conf.PWD_HASH_NAME, 
                                   password.encode('utf-8'), 
                                   salt, 
                                   conf.PWD_HASH_ITERATIONS)
    pwd_hash = binascii.hexlify(pwd_hash)
    return (salt + pwd_hash).decode('ascii')

def similarity(a, b):
    a = a.translate(str.maketrans("", "", string.punctuation)).lower()
    b = b.translate(str.maketrans("", "", string.punctuation)).lower()
    return fuzz.token_sort_ratio(a,b)    
