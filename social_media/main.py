"""
This script reads the latest documents dump and picks a fragment that is eligable
for sharing to BlueSky. Yes, we should create a nice endpoint to do this. But for
now, this also works quite beautifully.
"""
from atproto import Client
import json
import random
import os
from dotenv import load_dotenv

# Load the BlueSky password from the .env file
load_dotenv()
password = os.getenv('PASSWORD')

# Open the latest documents dump
with open('documents.json', 'r') as file:
    data = json.load(file)

# Create a list of fragments eligable for publication
fragments_list: list = []
for entry in data['rows']:
    document = entry['doc']
    if document['document_type'] == 'fragment':
        # Fragment should also have the publish_to_social_media flag
        if "translation" in document and document['translation']:
            fragments_list.append(entry['doc'])

# Pick a random fragment to be published. Should keep track of already published fragments.
fragment = random.choice(fragments_list)

# Create a single string from all the lines of a fragment
latin: str = ""
for line in fragment['lines']:
    latin += line['text'] + '\n'

# Remove HTML tags from the translation
english: str = fragment['translation']
english = english.replace('<p>','').replace('</p>', '')

# TODO: Count the number of characters (300 limit)

# Publish the text to BlueSky
client = Client()
client.login('oscc753.bsky.social', password)

print(latin, english)

tweet: str = f"{latin}\n    {english}"
post = client.send_post(tweet)
