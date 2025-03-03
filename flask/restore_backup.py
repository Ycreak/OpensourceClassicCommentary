import json
import requests

def restore_couchdb_backup(backup_path, target_url):
    # Read the backup file
    with open(backup_path, 'r') as f:
        data = json.load(f)
    
    # Get all documents from the response
    docs = [row['doc'] for row in data['rows']]
    
    # Process each document
    for doc in docs:
        try:
            # Remove _id if exists (will be regenerated)
            doc.pop('_id', None)
            
            # POST to target database
            response = requests.post(
                f"{target_url}/test",
                json=doc,
                auth=('admin', 'secret')  # Replace credentials
            )
            
            if response.status_code != 201:
                print(f"Error restoring doc: {response.text}")
                
        except Exception as e:
            print(f"Error processing document: {str(e)}")

# Usage
backup_path = "fragments.json"
target_url = "http://localhost:5984"

restore_couchdb_backup(backup_path, target_url)
