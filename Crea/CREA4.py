# Computational Creativity 2020
# This simple FLASK server interfaces with
# the Oracle creator.
from flask import Flask, request
from flask_cors import CORS, cross_origin
from flask_restful import Resource, Api
from flask_jsonpify import jsonify

from json import dumps

# INSTALL INSTRUCTIONS
# pipInstall flask flask_cors flask_restful flask_jsonpify

# RUN INSTRUCTIONS
# FLASK_APP=CREA4.py FLASK_ENV=development flask run --port 5002

app = Flask(__name__)
api = Api(app)

CORS(app)






@app.route("/GetInterestingWords")
def GetInterestingWords():

    words = request.args.get('words')
    print(words)
    
    result = MyClass(words)

    return jsonify(result)

def MyClass(words):
    import re

    # language = 'latin'
    # corpus = 'latin_models_cltk'
    # ImportCorpus(language, corpus)

    # words = ' '.join(filter(str.isalnum, words))

    words = re.sub('[^A-Za-z0-9 ]+', '', words)

    from cltk.stem.latin.stem import Stemmer
    stemmer = Stemmer()

    list1 = []

    for word in words.split():
        if len(word) > 1:
            print(word, len(word))
            # print(Decliner(word.strip()))
            list1.append(word)

    print(Decliner('hominus'))

    # print(stemmer.stem(words.lower()))

    from cltk.tag.pos import POSTag
    tagger = POSTag('latin')

    from cltk.semantics.latin.lookup import Lemmata
    lemmatizer = Lemmata(dictionary = 'lemmata', language = 'latin')

    lemmas = lemmatizer.lookup(list1)
    justlemmas = lemmatizer.isolate(lemmas)
    print(justlemmas)

    listOfInterest = []

    for lemma in justlemmas:
        declinations = lemma, Decliner(lemma)
        stem = stemmer.stem(lemma.lower())

        # print(declinations[0], declinations[1][0][1])
        
        try:
            if declinations[1][0][1][0] == 'v':
                print('verbum!', declinations[0])
                # listOfInterest.append(declinations[0])
                if len(stem.strip()) > 2:
                    listOfInterest.append(stem.strip())
        except:
            print("Not verbum or substantivum") 
        try:
            if declinations[1][0][1][2] == 's':
                print('substantivum!', declinations[0])
                # listOfInterest.append(declinations[0])
                if len(stem.strip()) > 2:
                    listOfInterest.append(stem.strip())
        except:
            print("Not verbum or substantivum") 


        # tag = tagger.tag_ngram_123_backoff(lemma)
        # tag2 = tagger.tag_tnt(lemma)
        # print(tag[0][1])
        # print(tag2)
        

        print(listOfInterest)
        print(set(listOfInterest))


    # print(tagger.tag_ngram_123_backoff(words))


    return list(set(listOfInterest))

def Decliner(word):
    from cltk.stem.latin.declension import CollatinusDecliner

    language = 'latin'
    corpus = 'latin_models_cltk'

    from cltk.corpus.utils.importer import CorpusImporter
    corpus_importer = CorpusImporter(language)
    corpus_importer.import_corpus(corpus)

    """Declines the given word using the given declination

    Args:
        word (string): word to be declined
        declination (string): requested declination

    Returns:
        string: correct declination of the given word
    """ 
    # Import the decliner
    decliner = CollatinusDecliner()

    try:
        declinations = decliner.decline(word)
        return declinations
    except:
        print("An exception occurred") 
        return ''

    # Search the given form
    # for form in declinations:
    #     if declination in form[1]:
    #         return form[0]
    # # If not found, return empty string
    # print(word.upper())
    # return ''

def ImportCorpus(language, corpus):
    """ Imports the given language and corpus given

    Args:
        language (string): language to import corpus from
        corpus (string): corpus to be imported
    """        
    from cltk.corpus.utils.importer import CorpusImporter
    corpus_importer = CorpusImporter(language)
    corpus_importer.import_corpus(corpus)

# MAIN
if __name__ == '__main__':
   app.run(host='0.0.0.0', port=5002)
