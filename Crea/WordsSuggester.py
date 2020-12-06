#    _____ _____  ______          ___  
#   / ____|  __ \|  ____|   /\   |__ \ 
#  | |    | |__) | |__     /  \     ) |
#  | |    |  _  /|  __|   / /\ \   / / 
#  | |____| | \ \| |____ / ____ \ / /_ 
#   \_____|_|  \_\______/_/    \_\____|
#
# Philippe Bors 1773585
# Luuk Nolden 1370898
# Computational Creativity 4
# Leiden University
# November 2020

# Class imports
import random
import json
import pandas as pd
# Latin Decliner
from cltk.stem.latin.declension import CollatinusDecliner

class WordsSuggester:
    """ Class Generates a oracle in Latin
    The idea is rather simple: take a verb and add the
    mandatory items like nominative, accusative etc. For each
    item, add a genitive using chance. Also, add some ablatives
    using chance. Next, add a subclause using chance. This finishes
    the class and returns the generated oracle.
    """
    language = 'latin'
    corpus = 'latin_models_cltk'
    # Chance the following items will occur
    genitiveChance = 30
    ablativeChance = 30
    subClauseChance = 50
    # JSON Dictionary of Words used to generate the oracle
    dictionary = {}
    # Generated oracle that will be read by the main class
    oracle = ''

    def __init__(self):
        """ When called from the web server, this init generates
        a oracle using the steps listed below.
        """        
        # Import the Latin Corpus
        self.ImportCorpus(self.language, self.corpus)
        # Create the dictionary from the CSV files
        # self.dictionary = self.CreateJSON()
        # # Generate a sentence
        # oracle = self.GenerateSentence()
        # # Add a subclause using chance: check for subjunctive
        # if self.PercentageBool(self.subClauseChance):
        #     subClause = self.PickSubClause()
        #     oracle += ', ' + subClause['word']
        #     if subClause['clause'] == 'subj': 
        #         oracle += ' ' + self.GenerateSentence('subj')
        #     else:
        #         oracle += ' ' + self.GenerateSentence()
        # # Make the oracle uppercase, which is very Latin
        # self.oracle = oracle.upper()

        return 'this list'

    def GenerateSentence(self, clause = 'ind'):
        """Generates an oracle

        Args:
            clause (str, optional): Clause to be used. Defaults to indicative.

        Returns:
            string: the oracle
        """            
        # Find a verb from the list
        verb = self.RandomJSONValue(self.dictionary, 'verbs')
        # Find a nominative
        noun = self.RandomJSONValue(self.dictionary, 'subst')
        # Adhere nominative to form (singular, plural)
        noun, verb = self.MatchNomVerb(noun, verb, clause)
        # Start creating the oracle
        oracle = noun['n']
        # Add a genitive to the nominative using chance
        if self.PercentageBool(self.genitiveChance):
            oracle += ' ' + self.GenerateForm('g')['g']
        # If the verb has a valence of two, we need an accusative
        oracle = self.AddValency(oracle, verb)       
        # Add satellites using chance. Multiple can be added. 
        oracle = self.AddSatellites(oracle)
        # Finally, add the verb to the oracle
        oracle += ' ' + verb['form'].strip()
        # Check if the verb needs additional components
        if verb['with'] == 'infi':
            # If it needs an inifinitive, add it
            inf = self.RandomJSONValue(self.dictionary, 'verbs')
            oracle += ' ' +  self.Decliner(inf['word'], 'v--pna')
        if verb['with'] == 'aci':
            # If it needs an accusativus cum infinitivo, add it
            oracle += ' ' +  self.GenerateForm('a')['a']
            inf = self.RandomJSONValue(self.dictionary, 'verbs')
            # Add the right valency.
            oracle = self.AddValency(oracle, inf)
            oracle += ' ' +  self.Decliner(inf['word'], 'v--pna')
        return oracle

    def AddValency(self, oracle, verb):
        """Checks the valency of the given verb and adds components accordingly

        Args:
            oracle (string): the oracle to which words are to be added
            verb (JSON): object with all the data for the given verb

        Returns:
            string: the oracle with items added
        """        
        if verb['valency'] >= 2:
        # Add the mandatory accusative
            oracle += ' ' + self.GenerateForm('a')['a']
        # Add a genitive to the accusative using chance
        if self.PercentageBool(self.genitiveChance):
            oracle += ' ' + self.GenerateForm('g')['g']
        # If the verb has a valence of three, we need a dative
        if verb['valency'] >= 3:
            # Add the mandatory dative
            oracle += ' ' + self.GenerateForm('d')['d']
            # Add a genitive to the dative using chance
            if self.PercentageBool(self.genitiveChance):
                oracle += ' ' +  self.GenerateForm('g')['g'] 

        return oracle

    def PickSubClause(self):
        """Picks a subclause from the dictionary

        Returns:
            string: selected sub clause
        """              
        return self.RandomJSONValue(self.dictionary, 'clause')

    def AddSatellites(self, oracle):
        """Returns the oracles with satellites added. Can generate multiple, 
        which are separated using the Latin -que form.

        Args:
            oracle (string): the constructed oracle

        Returns:
            string: the oracle with satellites added
        """        
        counter = 0
        while True:
            if self.PercentageBool(self.ablativeChance):
                if counter > 0:
                    # From the second satellite on, we need to add -que
                    oracle += ' ' + self.GenerateForm('b')['b'] + 'que'
                else:
                    # For the first satellite, we do not need -que yet
                    oracle +=  ' ' + self.GenerateForm('b')['b']
                counter += 1
            else:
                # If no ablatives are to be generated, break and return the oracle
                break

        return oracle.strip()

    def GenerateForm(self, declination):
        """Generates a form for the given word. Returns declined word

        Args:
            name (string): declination requested, like nominative ('n')

        Returns:
            JSON: JSON with the requested form added to it
        """        
        lemma = self.RandomJSONValue(self.dictionary, 'subst')

        if random.randint(0, 1) == 0: # Singular
            form = 's----' + declination 
        else: 
            form = 'p----' + declination

        lemma[declination] = self.Decliner(lemma['word'], form)
        return lemma


    def MatchNomVerb(self, nom, verb, clause = 'ind'):
        """Mathes the given nominative to the given verb. 

        Args:
            nom (JSON): given nominative and its data
            verb (JSON): given verb and its data
            clause (str, optional): Clause to be used. Defaults to indicative.


        Returns:
            JSON: JSON of nominative and verb with correct form added
        """
        if nom['person'] == 3:
            # If the word uses a third person, decline the verb accordingly        
            if random.randint(0, 1) == 0: # The form will be singular, select that
                nomForm = 's----n'
                if clause == 'subj':
                    verbForm = 'v3spsa'
                else:    
                    verbForm = 'v3spia'
            else: # The form will be Plural, give the corresponding declination  
                nomForm = 'p----n'
                if clause == 'subj':
                    verbForm = 'v3spsa'
                else:   
                    verbForm = 'v3ppia'
            # Decline the words using the form generated above
            nom['n'] = self.Decliner(nom['word'], nomForm).strip()
            verb['form'] = self.Decliner(verb['word'], verbForm).strip()
           
        return nom, verb

    def RandomJSONValue(self, JSON, k):
        """Selects random value from the given JSON file

        Args:
            JSON (JSON): JSON with items
            k (string): JSON Value from which to choose

        Returns:
            JSON: single JSON entry that was selected
        """        
        return random.choice(JSON[k])

    def PercentageBool(self, percent):
        """Generates true or false based on the given percentage

        Args:
            percent (int): percentage of cases that should return true

        Returns:
            bool: bool
        """        
        return random.randrange(100) < percent

    def ImportCorpus(self, language, corpus):
        """ Imports the given language and corpus given

        Args:
            language (string): language to import corpus from
            corpus (string): corpus to be imported
        """        
        from cltk.corpus.utils.importer import CorpusImporter
        corpus_importer = CorpusImporter(language)
        corpus_importer.import_corpus(corpus)

    def Decliner(self, word, declination):
        """Declines the given word using the given declination

        Args:
            word (string): word to be declined
            declination (string): requested declination

        Returns:
            string: correct declination of the given word
        """ 
        # Import the decliner
        decliner = CollatinusDecliner()
        declinations = decliner.decline(word)
        # Search the given form
        for form in declinations:
            if declination in form[1]:
                return form[0]
        # If not found, return empty string
        print(word.upper())
        return ''

    def CreateJSON(self):
        """Creates a JSON dictionary from the CSV files provided

        Returns:
            JSON: dictionary with all words to oracle with
        """        
        # Open the dictionary with nouns and verbs.
        with open('dict.json') as f:
            dictionary = json.load(f)
        
        dfS = json.loads(pd.read_csv('Wordlists/subst.csv', sep=';').to_json(orient="records"))
        dfV = json.loads(pd.read_csv('Wordlists/verbs.csv', sep=';').to_json(orient="records"))
        dfC = json.loads(pd.read_csv('Wordlists/clause.csv', sep=';').to_json(orient="records"))

        dictionary["subst"] = dfS
        dictionary["verbs"] = dfV
        dictionary["clause"] = dfC
                
        f.close()

        return dictionary