from dotenv import load_dotenv
import json
import random
import os
from datetime import datetime
import re 
from bs4 import BeautifulSoup

class Fragment:
    """
    Simple object to represent a Fragment. Will be used by all social media publishers
    """
    def __init__(self, author: str, title: str, editor: str, name: str, latin: str, english: str):
        self.author: str = author
        self.title: str = title
        self.editor: str = editor
        self.name: str = name
        self.latin: str = latin
        self.english: str = english

class FragmentPicker:
    """
    This class reads the latest dump of the database and filters a fragment eligable for publishing.
    At the moment, it will publish any fragment that has a translation. 
    """
    def __init__(self) -> None:
        load_dotenv()
        self.documents_dump_path = os.getenv('DUMP_PATH')

    def pick(self) -> Fragment:
        # Get the latest documents dump
        files = os.listdir(self.documents_dump_path)
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
        with open(f'{self.documents_dump_path}/{latest_file}', 'r') as file:
            data = json.load(file)

        # Create a list of fragments eligable for publication
        fragments_identifiers_list: list = []
        fragments_list: list = []
        for entry in data['rows']:
            document = entry['doc']
            # We have the following criteria for a fragment to be selected:
            # 1. It needs to be a fragment
            # 2. It needs to belong to the admin sandbox
            # 3. It needs to be visible
            # 4. It needs to have a translation property
            # 5. The translation cannot be empty
            if document['document_type'] == 'fragment' and document['sandbox'] == 'admin' and document['visible'] == 1 and "translation" in document and document['translation']:
                # Save the identifier of the fragment for easy storage.
                fragments_identifiers_list.append(document['_id'])
                # Keep the fragments in memory for easy retrieval of the posting candidate
                fragments_list.append(document)

        # Now we need to check which fragments we already posted. We do not want to post them again (if unposted fragments yet remain). Make sure the file exists.
        try:
            with open('published_fragments.json', 'r') as file:
                published_fragments = json.load(file)
        except:
            print("Make sure a published_fragments.json exists in the root.")

        # The candidate fragments are those that are not yet posted. 
        candidate_fragments: list[str] = []
        candidate_fragments = list(set(fragments_identifiers_list) - set(published_fragments)) 

        if candidate_fragments:
            fragment_id = random.choice(candidate_fragments)
        else:
            # If no candidate fragments exist, it means we ran out of fragments. 
            # Empty the published fragments stack and let the loop begin anew. 
            print('No more candidate fragments. Emptying stack and starting anew!')
            fragment_id: str = random.choice(fragments_identifiers_list)
            with open('published_fragments.json', "w") as outfile:
                outfile.write(json.dumps([]))

        # fragment_id = '208d3144dee74b358fd01d48b5650acb' # long atreus fragment
        # fragment_id = "e479498cd84a4d6085b8a917ed05b774" # left space fragment
        # Retrieve the fragment from the list based on the id we selected as a candidate
        fragment = next((item for item in fragments_list if item['_id'] == fragment_id), None)
        
        if fragment:
            # Add fragment to the list of published fragments
            published_fragments.append(fragment_id)
            with open('published_fragments.json', "w") as outfile:
                outfile.write(json.dumps(published_fragments))

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
        
            # Now create a nice Fragment object to share with the other choice
            fragment_object = Fragment(
                fragment['author'],
                fragment['title'],
                fragment['editor'],
                fragment['name'],
                latin,
                english
            )
            
            return fragment_object 
