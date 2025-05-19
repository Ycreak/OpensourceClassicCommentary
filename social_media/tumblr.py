import pytumblr
from datetime import datetime
from dotenv import load_dotenv
import os

class Tumblr:
    """
    Publishes the given fragment, consisting of a string in Latin and Exception
    to Tumblr. To do this, we need the consumer key/secret and a oauth token/secret.
    We use the pytumblr package to post to Tumblr.
    - https://github.com/tumblr/pytumblr
    """
    def __init__(self) -> None:
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

        result = client.create_text('opensourceclassicscommentary',
            state="published",
            slug=today,
            body=body)

        # Save the post url. We might need to reference it on other social media if their character limit is surpassed.
        if result:
            tumblr_post_url: str = f"https://www.tumblr.com/opensourceclassicscommentary/{result["id_string"]}/{today}"
        else: 
            tumblr_post_url: str = f"https://www.tumblr.com/opensourceclassicscommentary/"

        return tumblr_post_url
