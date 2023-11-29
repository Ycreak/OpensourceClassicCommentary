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
import time

import config as conf

class CouchAuthenticator:
    def __init__(self):
        not_connected: bool = True

        self.url = "http://{0}:{1}@{2}:{3}/".format(conf.COUCH_USER, conf.COUCH_PASSWORD, conf.COUCH_HOST, conf.COUCH_PORT)
        logging.info("CouchDB initalization started.")
        
        # Version check for availability https://couchdb-python.readthedocs.io/en/latest/client.html#server
        while(not_connected):
            try:
                # Try to connect
                self.couch = couchdb.Server(self.url)
                request = self.couch.version()
                if not str(request).startswith(conf.COUCH_VERSION):
                    logging.error("Wrong Couch server version. Stopping...")
                    exit(1)
                not_connected = False

            except:
                logging.error("Couch server not (yet) available or out of sync. Retrying...")
                time.sleep(3)
            
        logging.info("CouchDB initialization completed. {0} tables found.".format(len(self.couch)))

