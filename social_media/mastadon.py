from dotenv import load_dotenv
import requests 
import os

class Mastadon:
    """
    Publishes the given fragment, consisting of a string in Latin and English
    to Mastadon. To do this, we only need the domain and a token from Mastadon.
    """
    def __init__(self) -> None:
        load_dotenv()
        self.domain: str = 'https://mastodon.social/api/v1/statuses'
        self.token: str = os.getenv('MASTADON_TOKEN')
        self.character_limit: int = 500

    def post(self, latin: str, english: str, tumblr_url: str) -> None:
        """
        Publishes the given text to Mastadon
        :param latin (str)
        :param english (str)
        """
        if (len(latin) + len(english) > self.character_limit - 10):
            print('Too long for Mastadon! Referencing Tumblr!')
            toot: str = f"Today's fragment is too long for Mastadon! Please check out our Tumblr for today's fragment: {tumblr_url}"
        else:
            toot: str = f"{latin}\n    {english}"

        auth = {'Authorization': f'Bearer {self.token}'}
        params = {'status': toot}

        print('Posting to Mastadon')
        response = requests.post(self.domain, data=params, headers=auth)
        print(f"Mastadon response status code: {response.status_code}")
