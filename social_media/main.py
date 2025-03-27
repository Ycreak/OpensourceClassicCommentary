"""
This script reads the latest documents dump and picks a fragment that is eligable
for sharing to BlueSky. Yes, we should create a nice endpoint to do this. But for
now, this also works quite beautifully.

You will need an env file containing the following:
    PASSWORD=<bluesky password>
    DUMP_PATH=<path to dump files>
"""
from atproto import Client
import json
import random
import os
from dotenv import load_dotenv
from datetime import datetime
import re 
from bs4 import BeautifulSoup

# Get the latest documents dump
folder_path = os.getenv('DUMP_PATH')
files = os.listdir(folder_path)
# Filter only the files that match the pattern "documents-YYYY-MM-DD.json"
date_files = [file for file in files if file.startswith("documents-") and file.endswith(".json")]
# Parse the dates from the filenames and sort the files
date_files.sort(key=lambda f: datetime.strptime(f[10:20], '%Y_%m_%d'), reverse=True)
# Get the latest file
latest_file = date_files[0] if date_files else None

# Output the result
if latest_file:
    print(f"The latest file is: {latest_file}")
else:
    print("No matching files found.")
    exit(0)

# Open the latest documents dump
with open(f'{folder_path}/{latest_file}', 'r') as file:
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
    line_text = line['text']
    # Add spaces for the <n> tags
    line_text = re.sub(r'<(\d+)>', lambda match: ' ' * int(match.group(1)), line_text)
    latin += line_text + '\n'

# Remove HTML tags from the translation
english: str = fragment['translation']
soup = BeautifulSoup(english, "html.parser")
english = soup.get_text()

print(latin, english)
# TODO: Count the number of characters (300 limit)

# Publish the text to BlueSky
load_dotenv()
password = os.getenv('PASSWORD')

client = Client()
client.login('oscc753.bsky.social', password)

tweet: str = f"{latin}\n    {english}"
post = client.send_post(tweet)
