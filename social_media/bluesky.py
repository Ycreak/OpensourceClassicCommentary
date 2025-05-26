from dotenv import load_dotenv
from atproto import Client, models
import os

from fragment_picker import Fragment

class BlueSky:
    """
    Publishes the given fragment, consisting of a string in Latin and English
    to BlueSky. To do this, we only need the domain and the password of BlueSky.
    """
    def __init__(self) -> None:
        load_dotenv()
        self.domain: str = "oscc753.bsky.social"
        self.password: str = os.getenv('BLUESKY_PASSWORD')
        self.character_limit: int = 300

    def post(self, fragment: Fragment, tumblr_url: str) -> None:
        """
        Publishes the given text to BlueSky
        :param fragment (Fragment)
        """
        client = Client()
        client.login(self.domain, self.password)

        # If we cannot post today's tweet, reference the Tumblr post.
        if (len(fragment.latin) + len(fragment.english) > self.character_limit - 10):
            print('Too long for BlueSky! Referencing Tumblr!')
            text = "Today's fragment is too long for BlueSky! Please check out our Tumblr for today's fragment."
            # Of course BlueSky does not support hyperlinks. We need to do some nice programming to create one.
            start = text.index("Tumblr")
            end = start + len("Tumblr")
            byte_start = len(text[:start].encode('utf-8'))
            byte_end = len(text[:end].encode('utf-8'))

            facet = models.AppBskyRichtextFacet.Main(
                index=models.AppBskyRichtextFacet.ByteSlice(
                    byte_start=byte_start,
                    byte_end=byte_end
                ),
                features=[
                    models.AppBskyRichtextFacet.Link(uri=tumblr_url)
                ]
            )

            client.send_post(text, facets=[facet])


        else:
            tweet: str = f"{fragment.latin}\n    {fragment.english}"

            print('Posting to BlueSky')
            try:
                client.send_post(tweet)
                print("BlueSky response status code: 200")
            except Exception:
                print("BlueSky response status code: 400")
