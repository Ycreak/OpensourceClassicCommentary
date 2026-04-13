"""
Script to publish fragments to social media.
Currently, we publish fragments to BlueSky, Mastadon and Tumblr.
We run this file on our server via a crontab task. This way, a new
fragment is posted every day at 12 o'clock.
"""

from socials.bluesky import BlueSky
from socials.mastadon import Mastadon
from fragment_picker import FragmentPicker, Fragment
from socials.tumblr import Tumblr

# First retrieve a fragment we want to publish
fragment_picker = FragmentPicker()
fragment: Fragment = fragment_picker.pick()

# Post it to Tumblr
tumblr = Tumblr()
tumblr_post_url = tumblr.post(fragment)

# If the fragment is too long for Mastadon (500 characters) and BlueSky (300 characters),
# we tweet to Tumblr and let BlueSky and Mastadon reference the Tumblr post.

# Post it to BlueSky
bluesky = BlueSky()
bluesky.post(fragment, tumblr_post_url)

# Post it to Mastadon
mastadon = Mastadon()
mastadon.post(fragment, tumblr_post_url)
