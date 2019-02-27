"""Deze module logt het gebruik, zorgt ervoor dat de directory-structuur aangemaakt is (indien deze niet bestaat),
definieert de configuratie en bevat de hoofdfunctie om carkit op te starten.

.. todo:: De volgende punten moeten worden gedaan: \n\n \
* overgang naar sim datagebied \n\n \
* Parametriseren \n\n \
* datadictionary naar interface voor infobutton. (Alle variabelen nalopen) iig: \n\n \
    * tijdmachine toevoegen \n\n \
    * parameter toelichting \n\n \
* wegschrijven naar datadictionary weer werkend maken \n\n \
* opslaan en laden van geparametriseerde features, alleen laatste versies laden + controle hierop. \n\n \
* predefined set aan features + parameters. \n\n \
* Staging code genereren nav lineage \n\n \
* versiebeheer van features, niet mogelijk maken om features uit verschillende versies tegelijk aan te maken. \n\n \
* genereren van code: exporteren van inhoudelijke beschrijving per feature als comment boven feature, \
en technische beschrijving van module als commentaar. \n\n \
* leegmaken van sampletabellen aan eind van de dag \n\n \
* error handling toevoegen in code \n\n \
* voldoen aan pep8 richtlijnen \n\n \
* versiebeheer GIT \n\n \
* automatische testen
"""


from settings import *
#from .tdquery import *
from datetime import datetime
from ipywidgets import *
import ipywidgets
import openpyxl
import ipywidgets as widgets
import IPython
from IPython.display import display
from IPython.display import clear_output
from ui import *
from ui_settings import *
from ui_functions import *
from keymodules import KeyModule

print('versie ipywidgets: ', ipywidgets.__version__)
print('versie openpyxl: ', openpyxl.__version__)

# het beschikbaar maken van de widgets
# os.system("jupyter nbextension enable --py widgetsnbextension")
# os.system("jupyter nbextension enable --py --sys-prefix widgetsnbextension")
#with open(simlogfile, 'a') as log_outputfile:
with open("../log/usage.txt", 'a') as log_outputfile:
    huidigedatum = str(datetime.now()).split(".")[0]
    log_outputfile.write('{} {} start {}\n'.format(huidigedatum, username, SIM_versie))

if not os.path.exists(personal_user_folder_sim + 'selectiefiles/'):
    os.makedirs(personal_user_folder_sim + 'selectiefiles/')

if not os.path.exists(personal_user_folder_sim + 'datadictionaries/'):
    os.makedirs(personal_user_folder_sim + 'datadictionaries/')

if not os.path.exists(personal_user_folder_sim + 'abtcode/'):
    os.makedirs(personal_user_folder_sim + 'abtcode/')

loglocatie = personal_user_folder_sim + 'huidigesessie.log'
with open(loglocatie, 'w') as logsessie_outputfile:
    logsessie_outputfile.write("log laatste sessie \nInitialisatie:\n")


def logsessie_write(text):
    """Voegt de text toe aan de logfile.

    :param text: text die toegevoegd wordt aan de logfile
    """
    with open(loglocatie, 'a') as outputfile:
        outputfile.write(text+"\n")


##############################################################################################
# declareren variabelen + config
#      config
#      abt_statements
#      abt_code
# ophalen parameters
##############################################################################################
class Config:
    """Bevat de gehele configuratie, bv. van directory-locaties.
    """
    def __init__(self):

        """Initialiseert de configurie-parameters. De parameters zijn vaak gedefinieerd in configuratiefiles (bv.
        :func:`sim.settings` en :func:`sim.ui_settings`).
        """
        self.keytable = locatie_keytable
        self.abt = locatie_abt
        self.input_parameters = locatie_parameterfile
        self.folder_sasscript_abtcode = locatie_output_abtcode
        self.folder_export_datadictionary = locatie_folder_export_datadictionary

        self.locatie_selectieroot = locatie_selectieroot
        self.selectiefolder = 'testfolder'

        self.abt_statements = []
        self.featuresetmodules = {}

        self.keywidgets = []
        self.keyselection = defaultkey

        self.inputwidgets = []
        self.peildatum = default_peildatum
        self.interface = None

configuratie = Config()
# configuratie wordt door de hele module gebruikt om variabelen op te slaan waarvan de waarden
# tijdens de interface kunnen wisselen.

##############################################################################################
# import schemas
# macrovariabelen inlezen.
##############################################################################################


# statement = ""
# with open(configuratie.input_parameters) as inputfile:
#     for lines in inputfile:
#         statement += lines.replace("\n", " ")
#         if ";" in statement:
#             if '%let' in statement.lower() and '=' in statement:
#                 key = statement.lower().split('%let')[1].split('=')[0].strip()
#                 value = statement.split('=')[1].replace(";", "").strip().replace('"', "'")
#                 if '%' in value or '&' in value:
#                     # print("not imported: {}".format(statement))
#                     # print('append to schemas manually')
#                     pass
#                 else:
#                     schemas[key] = value
#             statement = ""


##############################################################################################
# opstarten van de tool
#      tabeldefinities ophalen
#      in tabeldefinitie staat de brontabel die gebruikt wordt als testtabel om de tabel mee aan te maken.
#      deze tabel moet gebruikt worden voor alle tabellen! Hiervoor moet een kleine testtabel worden aangemaakt.
#      alleen deze testtabel mag gebruikt worden voor het aanmaken van de tabellen.
#      de test-keytable moet staan op de locatie INT.
#      de query kan dan uitgevoerd worden op andere keytables
##############################################################################################

def run(moduleimport='k1'.format(SIM_versie)):
    """Functie voor het opstarten van de tool: \n\n \
    * tabeldefinities ophalen \n\n \
    * in tabeldefinitie staat de brontabel die gebruikt wordt als testtabel om de tabel mee aan te maken. \n\n \
    * deze tabel moet gebruikt worden voor alle tabellen! Hiervoor moet een kleine testtabel worden aangemaakt. \n\n \
    * alleen deze testtabel mag gebruikt worden voor het aanmaken van de tabellen. \n\n \
    * de test-keytable moet staan op de locatie INT. \n\n \
    * de query kan dan uitgevoerd worden op andere keytables

    :param configuratie: de te gebruiken configuratie
    :param moduleimport: de naam van de te importeren keymodule (d.w.z. de naam van de map van de keymodule met \
    daarin de modulegroepen/modules/features)
    """
    keymodule = KeyModule(moduleimport)
    print("interface initialiseren...")
    # print(keymodule.beschikbare_modulegroepen)
    configuratie.featureset = {}

    interface = Interface('startscherm')
    ui_widgets = WidgetsUi(configuratie=configuratie)
    interface.add_tabblad('startscherm', 'doelbinding')
    interface.add_widget('doelbinding', 'doelbinding_gebruik_select', ui_widgets.doelbinding_gebruik_selectie)
    interface.add_widget('doelbinding', 'doelbinding_rol_select', ui_widgets.doelbinding_rol_selectie)
    interface.add_tabblad('startscherm', 'keytable')
    interface.add_tabblad('keytable', 'select_keytable')
    # interface.add_tabblad('settings', 'locatie_parameters')
    interface.add_tabblad('startscherm', 'featureselection')
    interface.add_tabblad('featureselection', 'select_features')
    interface.add_tabblad('featureselection', 'save_load_selection')
    interface.add_tabblad('select_keytable', 'predefined')
    interface.add_widget('predefined',
                         'generate_keytable_NNPactief_button',
                         ui_widgets.generate_keytable_NNPactief_button)
    interface.add_widget('predefined',
                         'generate_keytable_NPbelastingplichtig_button',
                         ui_widgets.generate_keytable_NPbelastingplichtig_button)
    interface.add_tabblad('select_keytable', 'custom')
    interface.add_lineedit('predefined'
                           , 'lineedit_peildatum'
                           , configuratie=configuratie
                           , configuratie_variable='peildatum'
                           , description='Peildatum:'
                           , placeholder='20191231')
    interface.add_lineedit('predefined'
                           , 'lineedit_keytable'
                           , configuratie=configuratie
                           , configuratie_variable='keytable'
                           , description='Locatie Keytable:'
                           , placeholder='DATABASE.TABLENAME')
    interface.add_lineedit('custom'
                           , 'lineedit_keytable'
                           , configuratie=configuratie
                           , configuratie_variable='keytable'
                           , description='Loactie keytable'
                           , placeholder='DATABASE.TABLENAME')
    interface.add_lineedit('save_load_selection'
                           , 'lineedit_selectieroot'
                           , configuratie=configuratie
                           , configuratie_variable='locatie_selectieroot'
                           , description='locatie selectieroot'
                           , placeholder='./')
    interface.add_widget('save_load_selection', 'saveselectiehbox', widgets.HBox())
    interface.add_lineedit('saveselectiehbox'
                           , 'lineedit_selectiefolder'
                           , configuratie=configuratie
                           , configuratie_variable='selectiefolder'
                           , description='naam selectiefolder'
                           , placeholder='yyyymmdd.txt')
    interface.add_widget('saveselectiehbox', 'save_selectie_button', ui_widgets.save_selectie_button)
    interface.add_widget('save_load_selection', 'loaddeleteselectiehbox', widgets.HBox())
    interface.add_widget('save_load_selection', 'saveload_logging', widgets.Output())
    interface.add_widget('loaddeleteselectiehbox',
                         'selectiefolder_dropdown',
                         widgets.Dropdown(options=os.listdir(configuratie.locatie_selectieroot)))
    interface.add_widget('loaddeleteselectiehbox', 'load_selectie_button', ui_widgets.load_selectie_button)
    interface.add_widget('loaddeleteselectiehbox', 'delete_selectie_button', ui_widgets.delete_selectie_button)
    interface.add_tabblad('startscherm', 'codegenerator')
    interface.add_tabblad('codegenerator', 'create_abt_code')
    interface.add_tabblad('codegenerator', 'save_abt_code')
    interface.add_tabblad('codegenerator', 'run_abt_code')
    interface.add_widget('codegenerator', 'codegenerator_out_logging', widgets.Output())
    interface.add_tabblad('startscherm', 'logging')
    interface.add_widget('logging', 'out_logging', widgets.Output())
    interface.add_lineedit('create_abt_code'
                           , 'lineedit_keytable'
                           , configuratie=configuratie
                           , configuratie_variable='keytable'
                           , description='Locatie keytable'
                           , placeholder='DATABASE.TABLENAME')
    interface.add_lineedit('create_abt_code'
                           , 'lineedit_abt'
                           , configuratie=configuratie
                           , configuratie_variable='abt'
                           , description='Locatie abt'
                           , placeholder='DATABASE.TABLENAME')
    interface.add_widget('create_abt_code', 'create_abt_code_button', ui_widgets.create_abt_code_button)   
    interface.add_widget('run_abt_code', 'run_abt_code_button', ui_widgets.run_abt_code_button)    
    interface.add_widget('save_abt_code', 'save_abt_code_button', ui_widgets.save_abt_code_button)
    # interface.add_widget('save_abt_code','lineedit_export_datadictionary',ui_widgets.lineedit_export_datadictionary)
    # interface.add_lineedit('save_abt_code'
    #                       , 'lineedit_export_datadictionary'
    #                       , configuratie=configuratie
    #                       , configuratie_variable='folder_export_datadictionary'
    #                       , description='Locatie datadictionary'
    #                       , placeholder='DATABASE.TABLENAME')
    # interface.add_widget('save_abt_code','export_datadictionary_button',ui_widgets.export_datadictionary_button)
    # interface.add_widget('locatie_parameters','lineedit_keytable',ui_widgets.lineedit_keytable)
    # interface.add_widget('locatie_parameters','lineedit_abt',ui_widgets.lineedit_abt)
    # interface.add_widget('locatie_parameters','lineedit_selectiefile',ui_widgets.lineedit_selectiefile)
    # interface.add_widget('locatie_parameters','lineedit_export_datadictionary',ui_widgets.lineedit_export_datadictionary)

    interface.add_widget('doelbinding', 'check_autorisatie_button', ui_widgets.check_autorisatie_button)

    # eventueel kan hier een extra tabblad tussen gezet worden die per datafundament en product modulegroepen geeft.
    keymodule.beschikbare_modulegroepen.sort()
    for modulegroepnaam in keymodule.beschikbare_modulegroepen:
        interface.add_tabblad('select_features', modulegroepnaam)
        modulegroep = vars(keymodule)[modulegroepnaam]
        modulegroep.beschikbare_versies.sort()
        for versienaam in modulegroep.beschikbare_versies:
            # interface.add_accordion(modulegroepnaam,versienaam)
            versie = vars(modulegroep)[versienaam]
            # versie.naam = versienaam
            # print(modulegroepnaam,versie,versie.naam,versienaam)
            # print(dir(versie))
            interface.add_moduleversie(modulegroepnaam, versie)

    # acties op userinterface buttons.
    # interface.build()
    # configuratie.keymodule = keymodule
    # configuratie.interface = interface
    # interface.elements['generate_keytable_NPbelastingplichtig_button'].on_click(
    #     on_generate_keytable_npbelastingplichtig_button_clicked)
    # interface.elements['generate_keytable_NNPactief_button'].on_click(on_generate_keytable_nnpactief_button_clicked)
    # interface.elements['create_abt_code_button'].on_click(on_create_abt_code_button_clicked)
    # interface.elements['load_selectie_button'].on_click(on_load_selectie_button_clicked)
    # interface.elements['save_selectie_button'].on_click(on_save_selectie_button_clicked)
    # interface.elements['delete_selectie_button'].on_click(on_delete_selectie_button_clicked)
    # interface.elements['save_abt_code_button'].on_click(on_save_abt_code_button_clicked)
    # interface.elements['run_abt_code_button'].on_click(on_run_abt_code_button_clicked)
    # # interface.elements['export_datadictionary_button'].on_click(on_export_datadictionary_button_clicked)
    # interface.elements['check_autorisatie_button'].on_click(on_check_autorisatie_button_clicked)
    # clear_output()

    with open(locatie_css) as css_file:
        custom_css = css_file.read()
    custom_css = HTML('<style>{}</style>'.format(custom_css))
    display(custom_css, interface.elements['startscherm'])
    # display(interface.elements['startscherm'])
    return

