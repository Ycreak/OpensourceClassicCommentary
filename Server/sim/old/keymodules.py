"""Deze module bevat de definitie van classes KeyModule en Modulegroep.
"""

import os
from settings import locatie_keymodules
from sharedclasses import Feature
from sharedclasses import SimModule
import json


class KeyModule:
    """Bevat alle modulegroepen van een keymodule met bijbehorende informatie van moduleversies en features.
    Bv. keymodule k1 (niveau: finr, peildatum) bevat modulegroep bank, die bevat moduleversie sim_k1_bank_beleggen_v1,
    die weer feature bank_beleg_bdr_custom bevat. De beschikbare modulegroepen staan in beschikbare_modulegroepen.
    Dit zijn tevens de variabele-namen waaronder de modulegroep-objecten zijn opgeslagen.
    De volledige structuur wordt aangemaakt door uitvoeren van::

        keymodule = Keymodule('k1')

    Elementen kunnen aangeroepen worden door uitvoeren van::

        #beschikbare modulegroepen
        keymodule.beschikbare_modulegroepen
        #ModuleGroep-object
        keymodule.bank
        #beschikbare moduleversies
        keymodule.bank.beschikbare_versies
        #SimModule-object
        keymodule.bank.sim_k1_bank_beleggen_v1

    Tevens zijn de elementen van een SimModule-object (zie :func:`sim.sharedclasses.SimModule`) en een Feature-object
    (zie :func:`sim.sharedclasses.Feature`) te raadplegen.
    """

    def __init__(self, key, in_directory=locatie_keymodules):
        """Initialiseert een keymodule met alle bijbehorende modulegroepen vanuit de opgegeven directories.

        :param key: de naam van de daadwerkelijke keymodule-directory, bv k1. In deze directory staan alle modulegroepen \
        horende bij de keymodule
        :param in_directory: de directory waar gezocht moet worden naar de keymodules, bv /keymodules \
        Default is locatie_keymodules, zoals in de settings gespecificeerd
        """
        keymodulepath = os.path.join(in_directory, key)
        self.beschikbare_modulegroepen = []
        for directories in os.listdir(keymodulepath):
            self.beschikbare_modulegroepen.append(directories)
            vars(self)[directories] = ModuleGroep(os.path.join(keymodulepath, directories))


class ModuleGroep:
    """Bevat alle moduleversies (opgeslagen als SimModule-objecten) van een modulegroep met bijbehorende informatie
    van features. Bv. modulegroep bank bevat moduleversie (SimModule) sim_k1_bank_beleggen_v1, die weer feature
    bank_beleg_bdr_custom bevat. De beschikbare moduleversies zijn opgeslagen in beschikbare_versies. Dit zijn tevens de
    variabele-namen waaronder de moduleversies (d.w.z. SimModule-objecten) zijn opgeslagen.
    """
    def __init__(self, in_directory):
        """Initialiseert een modulegroep met alle bijbehorende moduleversies vanuit de opgegeven directory.
        Beschikbare moduleversies worden bepaald o.b.v. de beschikbare json-files in de modulegroep-directory. Van
        iedere moduleversie wordt gekeken naar de map met dezelfde naam als het json-bestand van de moduleversie, om
        bijbehorende features in te lezen (vanuit json).

        :param in_directory: de directory van de modulegroep (binnen de directory van de keymodule) die \
        doorzocht wordt naar de specificatie van de moduleversies (in json-format)
        """
        self.beschikbare_versies = []
        for moduleversie_files in os.listdir(in_directory):
            if moduleversie_files.endswith(".json"):
                versie_directory = str(moduleversie_files.split(".")[0])  # noodzakelijk dat string wordt teruggegeven
                vars(self)[versie_directory] = self.inlezen_module(os.path.join(in_directory, versie_directory))
                self.beschikbare_versies.append(versie_directory)

    @staticmethod
    def inlezen_module(filepath):
        """Leest een moduleversie in (gespecificeerd als json) en levert deze op als SimModule-object. De moduleversie
        bevat de features.

        :param filepath: het filepad waarin gezocht wordt naar de specificatie van de moduleversie (in json-format)
        :return: een moduleversie als SimModule-object
        """
        with open(filepath+".json") as infile:
            json_input = json.load(infile)
            moduleversie = SimModule(filepath, moduledict=json_input)
            return moduleversie










