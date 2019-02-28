"""Deze module bevat veel gebruikte functies die algemeen toepasbaar zijn.
"""

import re


def ireplace(text, old, new):
    """Levert een tekst waarbij in de string text alle voorkomens van old (case insensitive) vervangen zijn door new.

    :param text: de tekst waarin gezocht wordt
    :param old: de tekst die vervangen moet worden (case insensitive)
    :param new: de vervangende tekst
    :return: de tekst waarin alle old vervangen zijn door new
    """
    return re.sub('(?i)'+re.escape(old), lambda m: new, text)

