import pytumblr
from datetime import datetime
from dotenv import load_dotenv
import os

class Tumblr:
    def __init__(self):
        load_dotenv()
        self.consumer_key: str = os.getenv('TUMBLR_CONSUMER_KEY')
        self.consumer_secret: str = os.getenv('TUMBLR_CONSUMER_SECRET')
        self.oauth_token: str = os.getenv('TUMBLR_OAUTH_TOKEN')
        self.oauth_secret: str = os.getenv('TUMBLR_OAUTH_SECRET')

    def post(self, latin: str, english: str) -> None:
        """
        Publishes the given text to Tumblr
        :param latin (str)
        :param english (str)
        """
        # Authenticate via OAuth
        client = pytumblr.TumblrRestClient(
            self.consumer_key,
            self.consumer_secret,
            self.oauth_token,
            self.oauth_secret
        )

        today: str = datetime.now().strftime('%Y-%m-%d')
        body: str = f"<i>{latin}</i><br><br>{english}"

        client.create_text('opensourceclassicscommentary',
            state="published",
            slug=today,
            body=body)
