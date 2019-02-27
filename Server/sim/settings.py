"""Deze module definieert de waarden van configuratieparameters, bv. van directory-locaties.
Deze waarden worden vervolgens gebruikt om vast te leggen in het configuratie-object (zie :func:`sim.run.Config`).
"""

import os
dirname = os.path.dirname(os.path.realpath(__file__))  # /srv/.../sim/settings.py
simroot, current_folder = os.path.split(dirname)  # geeft simroot zonder / aan het einde.
print(simroot)  # hier moet versie later nog af.
SIM_versie = current_folder

import os
#import pwd
username = "currentUser"       #pwd.getpwuid(os.getuid()).pw_name

keys = {"k1": ["finr", "peildatum"]}

simlogfile = './log/usage.txt'
personal_user_folder_sim = './{}/sim/'.format(username)

locatie_css = '{}/css/custom.css'.format(simroot)
locatie_parameterfile = '{}/input/parameters.txt'.format(simroot)
locatie_td_keywords = '{}/input/td_reserved_words.txt'.format(simroot)
locatie_folder_export_datadictionary = personal_user_folder_sim + 'datadictionaries/'
locatie_keymodules = '{}/keymodules/'.format(simroot)
locatie_backup_keymodules = '{}/archief/keymodules/'.format(simroot)
locatie_modulescripts = '{}/input/modulescripts/'.format(simroot)
locatie_datadictionaries = '{}/input/datadictionaries/'.format(simroot)


benodigde_kolomnamen_datadictionary=[
    "Naam"
    , "Moduleversie"
    , "Modulegroep"
    , "Type variabele"
    , "Beschrijving"
    , "Inhoudelijke beschrijving"
    , "Auteur"
    , "Reviewer"
    , "Inhoudelijke checker"
    , "Opmerkingen"
    , "Betekenis_missing"
    , "Betekenis_zero"
    , "Betekenis_negatief"
    , "Doelbinding"
    , "featuredependency"
    , "moduledependency"
    , "Parameters"
    , "Toelichting parameters"
    , "Tijdmachine: peildatum vergeleken met variabele"
    , "Tijdmachine risico"
]

# ['Beschrijving','Opmerkingen', en de betekeniskolommen] mogen niet gewijzigd worden in benodigde_kolomnamen.
# Deze worden hergebruikt in de shared_classes



