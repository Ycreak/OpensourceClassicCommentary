"""
Script to publish fragments to social media.
Currently, we publish fragments to BlueSky, Mastadon and Tumblr.
We run this file on our server via a crontab task. This way, a new
fragment is posted every day at 12 o'clock.
"""
from bluesky import BlueSky
from mastadon import Mastadon
from fragment_picker import FragmentPicker
from tumblr import Tumblr

# First retrieve a fragment we want to publish
fragment_picker = FragmentPicker()
latin, english = fragment_picker.pick()

# Post it to BlueSky
bluesky = BlueSky()
bluesky.post(latin, english)

# Post it to Mastadon
mastadon = Mastadon()
mastadon.post(latin, english)

# Post it to Tumblr
tumblr = Tumblr()
tumblr.post(latin, english)
