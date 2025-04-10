from dotenv import load_dotenv
import json
import random
import os
from datetime import datetime
import re 
from bs4 import BeautifulSoup

class FragmentPicker:
    """
    This class reads the latest dump of the database and filters a fragment eligable for publishing.
    At the moment, it will publish any fragment that has a translation. 
    """
    def __init__(self) -> None:
        load_dotenv()
        self.documents_dump_path = os.getenv('DUMP_PATH')

    def pick(self) -> tuple[str, str]:
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
        
        return latin, english
