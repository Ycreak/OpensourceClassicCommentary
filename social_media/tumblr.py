import pytumblr
from datetime import datetime
from dotenv import load_dotenv
import os

from fragment_picker import Fragment

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

        self.oscc_url: str = os.getenv('OSCC_URL')

    def post(self, fragment: Fragment) -> None:
        """
        Publishes the given text to Tumblr
        :param fragment (Fragment)
        """
        # Authenticate via OAuth
        client = pytumblr.TumblrRestClient(
            self.consumer_key,
            self.consumer_secret,
            self.oauth_token,
            self.oauth_secret
        )

        # Tumblr does not correctly show string formatting. Replace the spaces and carriage returns
        # to tokens Tumblr can cope with. Sadly, the <pre> tag does not seem to work.
        tumblr_latin: str = fragment.latin.replace(" ", "&nbsp;").replace("\n", "<br>")

        today: str = datetime.now().strftime('%Y-%m-%d')
        body: str = f"<i>{tumblr_latin}</i><br>{fragment.english}<br><br>{fragment.author}, <i>{fragment.title}</i>, {fragment.editor}: {fragment.name}. <a href='{self.oscc_url}/?author={fragment.author}&title={fragment.title}&editor={fragment.editor}'>Find this fragment on the OSCC.</a>"

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
