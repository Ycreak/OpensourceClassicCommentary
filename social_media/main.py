"""
This script reads the latest documents dump and picks a fragment that is eligable
for sharing to BlueSky. Yes, we should create a nice endpoint to do this. But for
now, this also works quite beautifully.
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
