from dotenv import load_dotenv
import requests 
import os

class Mastadon:
    def __init__(self):
        load_dotenv()
        self.domain: str = 'https://mastodon.social/api/v1/statuses'
        self.token: str = os.getenv('MASTADON_TOKEN')

    def post(self, latin: str, english: str) -> None:
        """
        Publishes the given text to Mastadon
        :param latin (str)
        :param english (str)
        """
        toot: str = f"{latin}\n    {english}"
        auth = {'Authorization': f'Bearer {self.token}'}
        params = {'status': toot}

        print('Posting to Mastadon')
        response = requests.post(self.domain, data=params, headers=auth)
        print(f"Mastadon response status code: {response.status_code}")
