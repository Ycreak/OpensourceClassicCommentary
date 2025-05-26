from dotenv import load_dotenv
import requests 
import os

from fragment_picker import Fragment

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

    def post(self, fragment: Fragment, tumblr_url: str) -> None:
        """
        Publishes the given text to Mastadon
        :param fragment (Fragment)
        """
        if (len(fragment.latin) + len(fragment.english) > self.character_limit - 10):
            print('Too long for Mastadon! Referencing Tumblr!')
            toot: str = f"Today's fragment is too long for Mastadon! Please check out our Tumblr for today's fragment: {tumblr_url}"
        else:
            toot: str = f"{fragment.latin}\n    {fragment.english}"
            # Check if the latin starts with a space. To prevent mastadon from stripping it, we add a
            # a non-breaking space at the start of our toot.
            if fragment.latin.startswith(' '):
                toot: str = "\u00A0" + toot

        auth = {'Authorization': f'Bearer {self.token}'}
        params = {'status': toot}

        print('Posting to Mastadon')
        response = requests.post(self.domain, data=params, headers=auth)
        print(f"Mastadon response status code: {response.status_code}")
