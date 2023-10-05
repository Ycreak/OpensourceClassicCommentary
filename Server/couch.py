"""
                      _                   
                     | |                  
  ___ ___  _   _  ___| |__    _ __  _   _ 
 / __/ _ \| | | |/ __| '_ \  | '_ \| | | |
| (_| (_) | |_| | (__| | | |_| |_) | |_| |
 \___\___/ \__,_|\___|_| |_(_) .__/ \__, |
                             | |     __/ |
                             |_|    |___/ 
"""

import couchdb
import logging

import config as conf

class CouchAuthenticator:
    def __init__(self):
        self.url = "http://{0}:{1}@{2}:{3}/".format(conf.COUCH_USER, conf.COUCH_PASSWORD, conf.COUCH_HOST, conf.COUCH_PORT)
        logging.info("CouchDB initalization started.")
        
        # Connect
        self.couch = couchdb.Server(self.url)
        
        # Version check for availability https://couchdb-python.readthedocs.io/en/latest/client.html#server
        try:
            request = self.couch.version()
            if not str(request).startswith(conf.COUCH_VERSION):
                logging.error("Wrong Couch server version. Stopping...")
                exit(1)
        except:
            logging.error("Couch server not available or out of sync. Stopping...")
            exit(1)
            
        logging.info("CouchDB initialization completed. {0} tables found.".format(len(self.couch)))

