from dotenv import load_dotenv
from atproto import Client
import os

class BlueSky:
    """
    Publishes the given fragment, consisting of a string in Latin and English
    to BlueSky. To do this, we only need the domain and the password of BlueSky.
    """
    def __init__(self) -> None:
        load_dotenv()
        self.domain: str = "oscc753.bsky.social"
        self.password: str = os.getenv('BLUESKY_PASSWORD')

    def post(self, latin: str, english: str) -> None:
        """
        Publishes the given text to BlueSky
        :param latin (str)
        :param english (str)
        """
        client = Client()
        client.login(self.domain, self.password)

        tweet: str = f"{latin}\n    {english}"
        print('Posting to BlueSky')
        try:
            client.send_post(tweet)
            print("BlueSky response status code: 200")
        except Exception:
            print("BlueSky response status code: 400")
