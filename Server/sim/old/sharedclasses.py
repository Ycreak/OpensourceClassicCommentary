"""Deze module bevat de definitie van classes SimModule en Features.

.. todo:: De volgende punten moeten worden gedaan: \n\n \
    * parameters was oorspronkelijk stuk tekst. In toekomst moet dat dict worden. Nu overschreven met 'geen' om \
    de interface weer te laten werken. \n\n \
    * kolommen datadictionary niet meer case-sensitive \n\n \
    * bronkolommen is nu list, moet dict zijn.
    * controleren of Except AttributeError werkt.
"""

import os
import json
import re
from settings import benodigde_kolomnamen_datadictionary
# ['beschrijving','opmerkingen'] mogen niet gewijzigd worden in benodigde_kolomnamen. Deze worden onder hergebruikt.


class SimModule:
    """Bevat alle features binnen een moduleversie (SimModule).
    Bv. moduleversie sim_k1_bank_beleggen_v1 bevat feature bank_beleg_bdr_custom. De beschikbare features staan \
    in beschikbare_features.
    Dit zijn tevens de variabele-namen waaronder de feature-objecten zijn opgeslagen.

    Elementen kunnen aangeroepen worden door uitvoeren van::

        #beschikbare features
        keymodule.bank.sim_k1_bank_beleggen_v1.beschikbare_features
        #Feature-object
        keymodule.bank.sim_k1_bank_beleggen_v1.bank_beleg_bdr_custom

    Zie :func:`sim.sharedclasses.Feature` voor het aanroepen van de inhoud van een feature

    """

    def __init__(self, in_directory=None, moduledict={}):
        """Initialiseert een SimModule met een aantal basisgegevens vanuit het SimModule json-bestand. Tevens
        worden alle bijbehorende features vanuit de opgegeven SimModule-directory verwerkt en opgeslagen.

        :param in_directory: de directory waar gezocht moet worden naar de features, bv /sim_k1_bank_beleggen_v1
        :param moduledict: de json-definitie van de moduleversie als dictionary
        """
        for tag in ['naam', 'auteur', 'eigenaar', 'reviewer', 'modulegroep', 'beschrijving', 'key',
                    'codepostfix']:
            if tag in moduledict:
                vars(self)[tag] = moduledict[tag]
            else:
                vars(self)[tag] = None
        if 'kolommen' in moduledict:
            self.kolommen = moduledict['kolommen']
        else:
            self.kolommen = []

        if 'bronkolommen' in moduledict:
            self.bronkolommen = moduledict['bronkolommen']
        else:
            self.bronkolommen = []

        if 'brontabellen' in moduledict:
            self.brontabellen = {items.split(" ")[0]: items.split(" ")[1] for items in moduledict['brontabellen']}
        else:
            self.brontabellen = {}

        self.beschikbare_features = []
        if in_directory:
            for feature_files in os.listdir(in_directory):
                feature_name = str(feature_files.split(".")[0])
                self.beschikbare_features.append(feature_name)
                vars(self)[feature_name] = self.inlezen_feature(os.path.join(in_directory, feature_files))

    @staticmethod
    def inlezen_feature(filepath):
        """Leest een feature in (gespecificeerd als json) en levert deze op als Feature-object.

        :param filepath: het filepad waarin gezocht wordt naar de specificatie van de feature (in json-format)
        :return: een feature als Feature-object
        """
        with open(filepath) as infile:
            json_input = json.load(infile)
            feature = Feature(featuredict=json_input)
        return feature

    def verwerk_modulescript(self, modulesettings, moduleversie, macrovars={}):
        """Leest een sas-modulescript in en geeft variabelen de juiste waarde o.b.v. de ingelezen informatie.

        :param modulesettings: de settings bovenaan een sas-modulescript (bv. auteur)
        :param moduleversie: de naam van de moduleversie, oftewel de naam van het sas-bestand \
        (bv. sim_k1_bank_beleggen_v1)
        :param macrovars: dictionary met macrovariabelen zoals in initialisation_sim.sas gedefinieerd
        """

        # PEP-8: id wordt aangemaakt via vars-methode. Misschien is dit niet de beste pythonic methode.
        self.naam = moduleversie
        hulp1 = re.sub(r'\&(\w+)\.', r'{\1}', modulesettings["BRONTABELLEN"].lower())  # vervang &*. door {*}
        hulp2 = re.sub(r'\&(\w+)\s', r'{\1} ', hulp1)  # vervang onafgesloten &* door {*}

        # onderstaande list comprehension draait de ref en de tabelnaam om uit de listcomprehension die de module
        # uitleest. [brontabel, t0] wordt [t0,brontabel]
        self.brontabellen = [' '.join(items.split(" ")[::-1]) for items in [items.strip().format(**macrovars)
                                                                            for items in re.sub(r'\&(\w+.$)',
                                                                                                r'{\1}',
                                                                                                hulp2).split(";")]]
        # self.brontabellen = modulesettings["INPUT DATASET"].lower()

        # PEP-8: id wordt aangemaakt via vars-methode. Misschien is dit niet de beste pythonic methode.
        self.auteur = modulesettings["AUTEUR"]
        self.eigenaar = modulesettings["EIGENAAR"]
        self.reviewer = modulesettings["REVIEWER"]
        self.modulegroep = modulesettings["MODULEGROEP"].lower()
        self.beschrijving = modulesettings["BESCHRIJVING"]
        self.key = moduleversie.split("_")[1]

    def schrijfweg(self):
        """Schrijft voorgedefinieerde variabelen van een SimModule weg naar een json-formatted string.

        :return: de variabelen als een json-formatted string
        """
        wegschrijven = {}
        for tag in ['naam', 'key', 'brontabellen', 'auteur', 'eigenaar', 'reviewer', 'modulegroep', 'beschrijving',
                    'codepostfix', 'bronkolommen']:
            wegschrijven[tag]=vars(self)[tag]
            # print(json.dumps(wegschrijven))
        return json.dumps(wegschrijven)


class Feature():
    """Bevat alle gegevens van een feature.
    Bv. feature bank_beleg_bdr_custom bevat id 'im_k1_bank_beleggen_v1;bank_beleg_bdr_custom'.

    De inhoudelijke elementen van een Feature kunnen aangeroepen worden door uitvoeren van::

        #Teradata-definitie van een feature
        keymodule.bank.sim_k1_bank_beleggen_v1.bank_beleg_bdr_custom.definitie
    """

    def __init__(self, featuredict={}):
        """Initialiseert een Feature. Benodigde gegevens voor een feature zijn gespecificeerd als
        benodigde_kolomnamen_datadictionary in de :func:`sim.settings`. Daarnaast worden een id, definitie, dependencies
        en bronkolommen gebruikt vanuit de feature-specificatie (in json-format).

        :param featuredict: de feature-definitie (json-formatted string)
        """
        for tag in ['id'] + [items.lower() for items in benodigde_kolomnamen_datadictionary]:
            if tag in featuredict:
                vars(self)[tag] = featuredict[tag]
            else:
                vars(self)[tag] = None

        if not self.parameters:
            self.parameters = ''

        if not self.opmerkingen:
            self.opmerkingen = ''

        # if 'parameters' in featuredict:
        #    self.parameters = featuredict['parameters']
        # else:
        #    self.parameters = {}

        if 'definitie' in featuredict:
            self.definitie = featuredict['definitie']
        else:
            self.definitie = ''

        for tag in ['dependencies', 'bronkolommen']:
            if tag in featuredict:
                vars(self)[tag] = featuredict[tag]
            else:
                vars(self)[tag] = []

        self.datadictionary = False
        self.modulescript = False

    def verwerk_datadictionary_record(self, kolomnamen, sheet, index):
        """Verwerkt een record uit het datadictionary. D.w.z. de waarden van het record worden opgeslagen onder de
        correcte variabelen (de kolomnamen).

        :param kolomnamen: een dictionary van {kolomnaam: kolomnummer} uit de datadictionary
        :param sheet: de naam van de Excel-sheet
        :param index: het rijnummer uit de Excel-sheet
        """
        for kolomnaam in kolomnamen:
            if kolomnaam:  # Nonetype heeft geen lower
                vars(self)[kolomnaam.lower()] = sheet.cell(column=kolomnamen[kolomnaam], row=index).value
                if kolomnaam.lower() in ['beschrijving', 'opmerkingen'] or kolomnaam.lower().startswith("betekenis"):
                    pass
                    # inhoud is casesensitive
                elif vars(self)[kolomnaam.lower()]:  # Nonetype heeft geen lower
                    try:  # probeer lower te maken indien mogelijk
                        vars(self)[kolomnaam.lower()] = vars(self)[kolomnaam.lower()].lower()  # inhoud alles klein
                    except AttributeError:  # None type heeft geen attribute lower
                        pass
        if self.moduleversie:
            self.modulescript = True

            # PEP-8: id wordt aangemaakt via vars-methode. Misschien is dit niet de beste pythonic methode.
            self.id = ";".join([self.moduleversie, self.naam])

        elif self.naam:
            # errorexception
            print("feature bevat geen versie")

    def verwerk_modulescript_feature(self, definitie):
        """

        .. todo:: @Wouter: verouderd? Wordt namelijk nergens gebruikt.

        :param definitie:
        """
        self.definitie = definitie

    def schrijfweg(self):
        """Schrijft voorgedefinieerde variabelen van een Feature weg naar een json-formatted string.

        :return: de variabelen als een json-formatted string
        """
        wegschrijven = {}
        for tag in ["id", "definitie", "bronkolommen", "dependencies"] +\
                [items.lower() for items in benodigde_kolomnamen_datadictionary]:
            wegschrijven[tag] = vars(self)[tag]

        return json.dumps(wegschrijven)  # .replace('", ','",\n') # stukje code toevoegen voor leesbare layout.

        # attribstring = ['{attribnaam} = """{attribvalue}"""'.format(attribnaam = attrib.lower(),
        #                    attribvalue=vars(self)[attrib.lower()]) for attrib in self.attributes_char_export]
        # attriblist   = ['{attribnaam} = {attribvalue}'.format(attribnaam = attrib.lower(),
        #                    attribvalue=vars(self)[attrib.lower()]) for attrib in self.attributes_list_export]
        # return '\n'.join(attribstring+attriblist)
