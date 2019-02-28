"""Deze module bevat de opbouw van de interface.
"""

from ipywidgets import *
import ipywidgets as widgets
from ui_functions import *
from datetime import datetime
currenttimestamp =str(datetime.now()).replace(" ","_").replace("-","").replace(":","").split(".")[0]
import copy

class WidgetsUi():
    """Bevat de definitie van de gebruikte Ipywidgets buttons en dropdowns.
    """
    def __init__(self,configuratie):
        """Initialisatie van de variabelen voor Ipywidgets buttons en dropdowns.

        :param configuratie: de te gebruiken configuratie
        """
        self.doelbinding_gebruik_selectie =widgets.Dropdown(description='Gebruik: ',options=['Academic','LAB','Pilot','Productie','AdHoc'], value='Pilot')
        self.doelbinding_rol_selectie = widgets.Dropdown(description='Rol: ',options=['Ontwikkelaar Algemeen','Ontwikkelaar IH Winst','Ontwikkelaar IH Niet Winst','Ontwikkelaar OB','Ontwikkelaar Vastgoed','Ontwikkelaar Dynamisch Monitoren','Ontwikkelaar Betalingsregeling','Onwikkelaar Fraude','Ontwikkelaar EWS','Ontwikkelaar MI','Ontwikkelaar Auto'],value = 'Ontwikkelaar Algemeen')

        self.check_autorisatie_button = widgets.Button(
            description = 'Controleer autorisaties',
        ).add_class("ui-button-left-align-text")
        self.check_autorisatie_button.configuratie = configuratie

        self.save_selectie_button = widgets.Button(
            description = 'Save selectie',
        ).add_class("ui-button-left-align-text")
        self.save_selectie_button.configuratie = configuratie
        
        self.load_selectie_button = widgets.Button(
            description = 'Load selectie',
        ).add_class("ui-button-left-align-text")
        self.load_selectie_button.configuratie = configuratie
        
        self.delete_selectie_button = widgets.Button(
            description = 'Delete selectiefolder',
        ).add_class("ui-button-left-align-text")
        self.delete_selectie_button.configuratie = configuratie
    
        self.create_abt_code_button = widgets.Button(
            description='Genereer ABT code',
        ).add_class("ui-button-left-align-text")
        self.create_abt_code_button.configuratie = configuratie
    
        self.export_datadictionary_button = widgets.Button(
            description='Exporteer datadictionary',
        ).add_class("ui-button-left-align-text")
        self.export_datadictionary_button.configuratie = configuratie
    
    
        self.run_abt_code_button = widgets.Button(
            description='Run ABT code',
        ).add_class("ui-button-left-align-text")
        self.run_abt_code_button.configuratie = configuratie

        self.save_abt_code_button = widgets.Button(
            description='Save ABT code',
            #lineedit_sasscript_abtcode = lineedit_sasscript_abtcode,
         ).add_class("ui-button-left-align-text") 
        self.save_abt_code_button.configuratie=configuratie

        self.generate_keytable_NPbelastingplichtig_button = widgets.Button(
            description='NP Belastingplichtig',
        ).add_class("ui-button-left-align-text") 
        self.generate_keytable_NPbelastingplichtig_button.configuratie = configuratie

        self.generate_keytable_NNPactief_button = widgets.Button(
            description='NNP Actief',
        ).add_class("ui-button-left-align-text") 
        self.generate_keytable_NNPactief_button.configuratie = configuratie
        
        self.deselect_all_button = widgets.Button(
            description='(De)Select all',
            configuratie = configuratie
        ).add_class("ui-button-left-align-text")

        
#Onderstaande moet verplaatst worden naar het inlezen van de features op versieniveau, zodanig dat een object wordt aangemaakt.
#Wanneer een object is aangemaakt, kan het object gekopieerd worden. Nu betreft het een module die niet gekopieerd kan worden.
#
#

#class CopiedFeature():
#    def __init__(self):
#        self.
        
class Interface():
        """Bevat de functies om de Ipywidgets interface op te bouwen. Bv. het toevoegen van tabbladen aan de interface,
        of het definieren van de acties die onder een button hangen.
        """
        def __init__(self, elementnaam):
            #elementnaam is altijd een vbox.  Zie elementen als widgets.
            """Initialisatie van de variabelen die relevant zijn voor de interface.

            :param elementnaam: de naam van het hoofdscherm (bv. 'startscherm')
            """
            self.children            = {} #{naamwidget,onderhangendewidgetsnamen} #hierin worden children opgeslagen
            self.elements            = {} #{naamwidget,widgetzelf} dict ipv list nodig om controles uit te voeren
            self.hierarchy           = [] #alleen parent-parent relaties ()
            self.main                = elementnaam
            self.available_features  = []
            self.parameterwidgets    = {} #featureid: [[parameter1,parameterwidget1naam],[parameter2,parameterwidget2naam]]
            self.blockedparameters   = [] #[parameterwidget1naam, parameterwidget2naam,...]
            self.featuredict         = {}
            self.moduleversiedict    = {}
            self.statements          = []
            self.dropdownoptions     = {} #anders dan elements, bug in dropdown tuple setting.
                                          #als options al bestaan, en options worden opnieuw geset, wordt dit niet goed gedaan.
            
            self.elements[elementnaam] = widgets.VBox()

        def on_select_all_button_clicked(self,herkomstbutton):
            """Definieert de acties die uitgevoerd worden indien op de Ipywidgets button geclicked wordt. In dit
            geval worden alle features geselecteerd die onder de moduleversie hangen.

            :param herkomstbutton: de Ipywidgets button
            """
            for items in self.available_features:
                if items[0].naam==herkomstbutton.versie.naam:
                    self.elements[items[1].id+"_checkbox"].value=True
                    
        def on_add_feature_button_clicked(self,herkomstbutton):
            """Definieert de actie die uitgevoerd worden indien op de Ipywidgets button geclicked wordt. In dit
            geval wordt een dropdown getoond met mogelijke te kopieren features, en een copy-button (of de dropdown
            en copy-button worden weer verborgen indien ze al getoond werden).

            :param herkomstbutton: de Ipywidgets button
            """
            if self.elements[herkomstbutton.versie.naam+"_customselectbox"].layout.display == 'none':
                self.elements[herkomstbutton.versie.naam+"_customselectbox"].layout.display = 'block'
            else:
                self.elements[herkomstbutton.versie.naam+"_customselectbox"].layout.display = 'none'
                self.elements[herkomstbutton.versie.naam+"_modifyvbox"].layout.display = 'none'
                while self.blockedparameters:
                    item = self.blockedparameters.pop()
                    self.elements[item].layout.display = 'none'


        def on_copybutton_clicked(self,herkomstbutton):
            """Definieert de actie die uitgevoerd worden indien op de Ipywidgets button geclicked wordt. In dit
            geval wordt een dropdown getoond van mogelijke waarden, een tekstveld met de naam van de nieuwe feature,
            en een commit-button.

            :param herkomstbutton: de Ipywidgets button
            """
            while self.blockedparameters:
                    item = self.blockedparameters.pop()
                    self.elements[item].layout.display = 'none'
            herkomstversienaam  = herkomstbutton.versie.naam
            herkomstfeaturenaam = self.elements[herkomstbutton.versie.naam+"_featuredropdown"].value
            herkomstfeature = self.featuredict[herkomstversienaam+";"+herkomstfeaturenaam]
            self.elements[herkomstbutton.versie.naam+"_modifyvbox"].layout.display = 'block'
            self.elements[herkomstfeature.id+"_parametersvbox"].layout.display = 'block'
            self.blockedparameters.append(herkomstfeature.id+"_parametersvbox")
            self.elements[herkomstversienaam+"_lineedit"].value = herkomstfeaturenaam.replace("_custom","_")

            #self.elements[herkomstbutton.versie.naam+"_modifyparameters"].value = herkomstfeature.parameters

            #self.elements[herkomstbutton.versie.naam+"_modifyparameters"].value = herkomstfeature.parameters
            #self.elements[herkomstbutton.versie.naam+"_modifydefinitie"].value   = herkomstfeature.definitie
            #self.elements[herkomstbutton.versie.naam+"_modifyopmerkingen"].value   = herkomstfeature.opmerkingen
            #self.elements[herkomstbutton.versie.naam+"_modifybeschrijving"].value   = herkomstfeature.beschrijving

        def on_commit_feature_button_clicked(self,herkomstbutton):
            """Definieert de actie die uitgevoerd worden indien op de Ipywidgets button geclicked wordt. In dit
            geval wordt een checkbox en de nieuwe feature toegevoegd.

            :param herkomstbutton: de Ipywidgets button
            """
            herkomstversienaam  = herkomstbutton.versie.naam
            herkomstfeaturenaam = self.elements[herkomstbutton.versie.naam+"_featuredropdown"].value
            custom_feature      = copy.copy(self.featuredict[herkomstversienaam+";"+herkomstfeaturenaam])
            custom_feature.naam = self.elements[herkomstbutton.versie.naam+"_lineedit"].value
            custom_feature.id   = ";".join([herkomstbutton.versie.naam,custom_feature.naam])

            parameters = {}

            parameterwidgets = self.parameterwidgets[";".join([herkomstbutton.versie.naam,herkomstfeaturenaam])]
            for parameter, parameterwidgetnaam in parameterwidgets:
                paramval = self.elements[parameterwidgetnaam].value
                if type(paramval) is list or type(paramval) is tuple:
                    parameters[parameter] = ",".join(paramval)
                else:
                    parameters[parameter] = paramval

            custom_feature.definitie = custom_feature.definitie.format(**parameters)
            custom_feature.bronkolommen = [bronkolom.format(**parameters) for bronkolom in custom_feature.bronkolommen]

            # aanpassing om naam van de feature ook in de definitie te verwerken.
            custom_feature.definitie = " ".join(custom_feature.definitie.strip().split(" ")[:-1]+[custom_feature.naam])


            #custom_feature.parameters = self.elements[herkomstbutton.versie.naam+"_modifyparameters"].value
            #belangrijk om deze goed te zetten.
            #custom_feature.definitie  = " ".join(self.elements[herkomstbutton.versie.naam+"_modifydefinitie"].value.strip().split(" ")[:-1]+[custom_feature.naam])

            #deze zijn niet langer noodzakelijk.
            #custom_feature.beschrijving  = self.elements[herkomstbutton.versie.naam+"_modifybeschrijving"].value
            #custom_feature.opmerkingen  = self.elements[herkomstbutton.versie.naam+"_modifyopmerkingen"].value
            log_out = self.elements[herkomstbutton.versie.naam+"_logging"]
            if herkomstversienaam+";"+custom_feature.naam in self.featuredict:
                with log_out:
                    print("feature bestaat al")
                return 
            elif len(custom_feature.naam)>32:
                with log_out:
                    print("naam te lang, bestaat uit {} characters".format(len(custom_feature.naam)))
                return 
            else:
                with log_out:
                    log_out.clear_output()
                self.add_feature(herkomstbutton.versie,custom_feature)
                self.build()
                # print('rebuild')

            #self,versie,feature
            #self.add_widget(self.selements[button.herkomst],'feature_test')
        
        def add_tabblad(self,parentnaam,tabbladnaam):
            #aanmaken benodigde widgets, tabwidget met voor ieder tabblad een vbox
            """Voegt een (Ipywidgets) tabblad toe aan de interface-hierarchie.

            :param parentnaam: de naam van de parent van het toe te voegen tabblad
            :param tabbladnaam: de naam van het toe te voegen tabblad
            """
            if not parentnaam in self.elements:
                print(parentnaam + " bestaat niet")
                return
            if parentnaam+"_accwidget" in self.elements:
                print("kan geen tab en acc tegelijkertijd ")
                
            self.elements[parentnaam + "_tabwidget"]=widgets.Tab()
            self.children.setdefault(parentnaam+"_tabwidget",[])
            self.children[parentnaam+"_tabwidget"].append(tabbladnaam)
            self.children.setdefault(parentnaam,[])
            if parentnaam+"_tabwidget" not in self.children[parentnaam]:
                self.children[parentnaam].append(parentnaam+"_tabwidget")
            self.elements[tabbladnaam]=widgets.VBox()
            self.hierarchy.append([parentnaam,parentnaam+"_tabwidget"])
            self.hierarchy.append([parentnaam+"_tabwidget",tabbladnaam])
            
        def add_accordion(self, parentnaam, accordionnaam):
            """Voegt een (Ipywidgets) accordion toe aan de interface-hierarchie. Een accordion is een uitvouwbaar item.

            :param parentnaam: de naam van de parent van het toe te voegen tabblad
            :param accordionnaam: de naam van de toe te voegen accordion
            """
            if not parentnaam in self.elements:
                print(parentnaam + " bestaat niet")
                return
            
            if parentnaam+ "_tabwidget" in self.elements:
                print("kan geen tab en acc tegelijkertijd ")
            
            self.elements[parentnaam + "_accwidget"]=widgets.Accordion()
            self.children.setdefault(parentnaam + "_accwidget", [])
            self.children[parentnaam + "_accwidget"].append(accordionnaam)
            self.children.setdefault(parentnaam, [])
            if parentnaam+"_accwidget" not in self.children[parentnaam]:
                self.children[parentnaam].append(parentnaam + "_accwidget")
            self.elements[accordionnaam]=widgets.VBox()
            self.hierarchy.append([parentnaam, parentnaam + "_accwidget"])
            self.hierarchy.append([parentnaam + "_accwidget", accordionnaam])

        def add_widget(self, parentnaam, widgetnaam, widget):
            """Voegt een (Ipywidgets) widget toe aan de interface-hierarchie.

            :param parentnaam: de naam van de parent van het toe te voegen tabblad
            :param widgetnaam: de naam van de toe te voegen widget
            :param widget: de Ipywidgets widget
            """
            if not parentnaam in self.elements:
                print(parentnaam + " bestaat niet")
                return
            self.elements.setdefault(widgetnaam, widget) #als widgetnaam al bestaat, dan niet toevoegen aan parents.
                                                       #widget kan dan hergebruikt worden.
            self.children.setdefault(parentnaam, []).append(widgetnaam)
            self.hierarchy.append([parentnaam, widgetnaam])

        def add_lineedit(self, parentnaam, widgetnaam, configuratie, configuratie_variable, description, placeholder):
            """Voegt een (Ipywidgets) lineedit toe aan de interface-hierarchie.

            :param parentnaam: de naam van de parent van het toe te voegen tabblad
            :param widgetnaam: de naam van de toe te voegen widget
            :param configuratie: de configuratie die gebruikt is om de interface te starten
            :param configuratie_variable: de naam van de variabele uit het Configuratie-object die de default tekst \
            bevat om standaard (bij opstarten) te tonen in de lineedit, bv. '20180101'
            :param description: het label dat getoond wordt vóór de lineedit, bv. 'Peildatum: '
            :param placeholder: de default beschrijving die in de lineedit getoond wordt indien er geen getypte tekst \
            in staat (bv. '20191231')
            """
            widget_description = widgets.Label(
                description,
            ).add_class("ui-label-left-align-text")
            widget_text = widgets.Text(
                value = getattr(configuratie, configuratie_variable),
                placeholder=placeholder,
                layout=Layout(width='80%', height='40px'),
                disabled=False
            )
            
            def update(value,configuratie=configuratie):
                """Deze functie zorgt ervoor dat ingevoerde tekst in de lineedit verwerkt wordt in de configuratie.

                :param value: de ingevoerde waarde in de lineedit
                :param configuratie: de configuratie die gebruikt is om de interface te starten
                """
                setattr(configuratie,configuratie_variable,value['new'])
               
            widget_text.observe(update,'value')
    
            if not parentnaam in self.elements:
                print(parentnaam + " bestaat niet")
                return
            self.elements[widgetnaam]=widgets.HBox([widget_description,widget_text])
            self.elements[widgetnaam+"_text"] = widget_text
            self.children.setdefault(parentnaam, []).append(widgetnaam)
            self.hierarchy.append([parentnaam, widgetnaam])            

        def add_button(self, parentnaam, widgetnaam, description):
            """Voegt een (Ipywidgets) button toe aan de interface-hierarchie.

            :param parentnaam: de naam van de parent van het toe te voegen tabblad
            :param widgetnaam: de naam van de toe te voegen widget
            :param description: de tekst van de button
            :return:

            .. todo:: Verwijderen? Deze functie wordt niet meer gebruikt.
            """
            if not parentnaam in self.elements:
                print(parentnaam + " bestaat niet")
                return
            self.elements[widgetnaam]=widgets.Button(description = description)
            self.children.setdefault(parentnaam, []).append(widgetnaam)
            self.hierarchy.append([parentnaam, widgetnaam])

        def add_moduleversie(self,modulegroepnaam,versie):
            # print(modulegroepnaam,versie,versie.naam)
            """Bouwt een moduleversie op in de interface door alle Ipywidgets-elementen toe te voegen aan de interface.
            Dit kunnen zijn: info-buttons, namen van de moduleversies, en buttons.

            :param modulegroepnaam: de naam van de modulegroep waaraan elementen toegevoegd worden, bv. 'bank'
            :param versie: het onderliggende SimModule-object (moduleversie) waaraan elementen toegevoegd worden, bv. \
            sim_k1_bank_beleggen_v1
            """
            self.moduleversiedict[versie.naam]=versie
            self.add_accordion(modulegroepnaam,versie.naam)
            self.add_widget(versie.naam,versie.naam+"_hbox",widgets.HBox())
            self.add_widget(versie.naam,versie.naam+"_customselectbox",widgets.VBox(layout=Layout(display='none')))

            #if versie.reviewer:
            #    alertstyle='info'
            # tijdelijk voor 3dc alles op danger gezet.
            #else:

            alertstyle='danger'
            self.add_widget(versie.naam+"_hbox",versie.naam+"_info_button",widgets.Button(button_style=alertstyle,
                            layout=Layout(width='10px',height='25px'),
                            tooltip="\n\n".join([versie.beschrijving,
                                                'eigenaar: {eigenaar}'.format(eigenaar = versie.eigenaar),
                                                'auteur  : {auteur}'.format(auteur = versie.auteur),
                                                'reviewer: {reviewer}'.format(reviewer = versie.reviewer),
                                                'brontabellen: {brontabellen}'.format(brontabellen = versie.brontabellen),
                                                'bronkolommen: {bronkolommen}'.format(bronkolommen = versie.bronkolommen),
                                                '']),
                            icon='info'))
            self.add_widget(versie.naam+"_hbox",versie.naam+"_html_label",widgets.HTML(value = "          {}".format(versie.naam)))
            self.add_widget(versie.naam+"_hbox",versie.naam+"_select_all_button",widgets.Button(description="Select all features"))
            self.elements[versie.naam+"_select_all_button"].versie = versie
            self.elements[versie.naam+"_select_all_button"].on_click(self.on_select_all_button_clicked)

            #controleren of er uberhaupt custom features bestaan binnen de module.
            custom_features = False
            for featurenaam in versie.beschikbare_features:
                if featurenaam.endswith('custom'):
                    feature = vars(versie)[featurenaam]
                    self.featuredict[feature.id]=feature
                    custom_features=True
            #als customfeatures, dan moet de addfeature ingericht worden
            if custom_features:
                self.add_widget(versie.naam+"_hbox",versie.naam+"_add_feature_button",widgets.Button(description="Add custom feature"))
                self.elements[versie.naam+"_add_feature_button"].versie = versie
                self.elements[versie.naam+"_add_feature_button"].on_click(self.on_add_feature_button_clicked)

                #maak hier de moduleversiecustomselectvbox
                #maak hier de dropdown button
                #maak hier de copybutton

                self.add_widget(versie.naam+"_customselectbox",versie.naam+"_featuredropdown",widgets.Dropdown(description='Copy from'))
                self.dropdownoptions[versie.naam+"_dropdown"]=[]
                self.add_widget(versie.naam+"_customselectbox",versie.naam+"_copybutton",widgets.Button(description="Copy"))
                self.elements[versie.naam+"_copybutton"].versie=versie
                self.elements[versie.naam+"_copybutton"].on_click(self.on_copybutton_clicked)
                self.dropdownoptions[versie.naam+"_featuredropdown"]=[]

                for featurenaam in versie.beschikbare_features:
                    feature = vars(versie)[featurenaam]
                    if featurenaam.endswith('custom'):
                        self.dropdownoptions[versie.naam+"_featuredropdown"].append(feature.naam)

                        #self.add_widget(versie.naam, feature.id+"_hbox", widgets.HBox())
                        self.add_widget(versie.naam, feature.id+"_parametersvbox", widgets.VBox(layout=Layout(display='none')))
                        self.add_widget(feature.id+"_parametersvbox",
                            feature.id+"_button",
                            widgets.Button(button_style='danger',
                                           layout=Layout(width='10px',
                                           height='25px'),
                                           tooltip="\n\n".join(
                                               [feature.beschrijving,
                                                'Type variabelen: {}'.format(vars(feature)['type variabele']),
                                                'Opmerkingen: {}'.format(feature.opmerkingen),
                                                'Parameters: {}\n* Toelichting: {}\n* Betekenis missing: {}\n* Betekenis zero: {}\n* Betekenis negatief: {}'.format(feature.parameters,vars(feature)['toelichting parameters'],
                                                                                           feature.betekenis_missing, feature.betekenis_zero,
                                                                                           feature.betekenis_negatief),
                                                'Auteur: {}\nReviewer?: {}\nInhoudelijke checker: {}'.format(feature.auteur, feature.reviewer, vars(feature)['inhoudelijke checker']),
                                                #'Doelbinding:  {}'.format(feature.doelbinding),
                                                'Inhoudelijke beschrijving: {}'.format(vars(feature)['inhoudelijke beschrijving']),
                                                'Bronkolommen:  {}'.format(feature.bronkolommen),
                                                'Tijdmachine: peildatum vergeleken met variabele: {}\nTijdmachine risico: {}'.format(vars(feature)['tijdmachine: peildatum vergeleken met variabele'],
                                                                                                                                     vars(feature)['tijdmachine risico']),
                                                'Teradata query:\n{}'.format(feature.definitie)]),
                                           icon='info')
                            )
                        #self.add_widget(feature.id+"_hbox",
                        #                feature.id+"_editparameters_button",
                        #                widgets.Button(description='Edit parameters'))
                        #self.elements[feature.id+"_editparameters_button"].feature = self.featuredict[feature.id]
                        #self.elements[feature.id+"_editparameters_button"].feature_id = feature.id
                        #self.elements[feature.id+"_editparameters_button"].on_click(self.on_edit_parameters_button_clicked)


                        #parameters per custom feature.

                        for i, items in enumerate(feature.parameters.split(";")):
                            if " in (" in items:
                                parameter = items.split(" in (")[0].strip()
                                opties = [optie.strip() for optie in items.split(" in (")[1].replace(")", "").split(",")]
                                self.add_widget(feature.id+"_parametersvbox",
                                                feature.id+"_p{}_multipleselect".format(i+1),
                                                widgets.SelectMultiple(description=parameter,
                                                                       options=opties,
                                                                       value=[opties[0],opties[1]]))
                                self.parameterwidgets.setdefault(feature.id, []).append(
                                    [parameter, feature.id+"_p{}_multipleselect".format(i+1)])
                            elif " in range(" in items:
                                parameter = items.split(" in range(")[0].strip()
                                rangeparam = items.split("range(")[1].replace(")", "").split(",")
                                if len(rangeparam) == 3:
                                    opties=[str(i) for i in range(int(rangeparam[0]), int(rangeparam[1]), int(rangeparam[2]))]
                                elif len(rangeparam) == 2:
                                    opties=[str(i) for i in range(int(rangeparam[0]),int(rangeparam[1]))]
                                self.add_widget(feature.id+"_parametersvbox",
                                                feature.id+"_p{}_multipleselect".format(i+1),
                                                widgets.SelectMultiple(description=parameter,
                                                                       options=opties,
                                                                       value=[opties[0],opties[1]]))
                                self.parameterwidgets.setdefault(feature.id, []).append(
                                    [parameter, feature.id+"_p{}_multipleselect".format(i+1)])

                            elif " = (" in items:
                                parameter = items.split(" = (")[0].strip()
                                opties = [optie.strip() for optie in items.split(" = (")[1].replace(")", "").split(",")]
                                self.add_widget(feature.id+"_parametersvbox",
                                                feature.id+"_p{}_dropdown".format(i+1),
                                                widgets.Dropdown(description=parameter,
                                                                 options=opties,
                                                                 value=opties[0]))
                                self.parameterwidgets.setdefault(feature.id, []).append(
                                    [parameter, feature.id+"_p{}_dropdown".format(i+1)])

                            elif " = range(" in items:
                                parameter = items.split(" = range(")[0].strip()
                                rangeparam = items.split("range(")[1].replace(")", "").split(",")
                                if len(rangeparam) == 3:
                                    opties = [str(i) for i in range(int(rangeparam[0]), int(rangeparam[1]), int(rangeparam[2]))]
                                elif len(rangeparam)==2:
                                    opties = [str(i) for i in range(int(rangeparam[0]), int(rangeparam[1]))]
                                self.add_widget(feature.id+"_parametersvbox",
                                                feature.id+"_p{}_dropdown".format(i+1),
                                                widgets.Dropdown(description=parameter,
                                                                options=opties,
                                                                value=opties[0]))
                                self.parameterwidgets.setdefault(feature.id, []).append(
                                    [parameter, feature.id+"_p{}_dropdown".format(i+1)])


                                # maak hier de featurenaamparametervboxes
                                # maak hier de infobutton van de parameters




                # maak hier de moduleversie modifyvbox
                self.add_widget(versie.naam,versie.naam+"_modifyvbox",widgets.VBox(layout=Layout(display='none')))
                self.add_widget(versie.naam+"_modifyvbox",versie.naam+"_lineedit",widgets.Text(description='Naam feature',value="custom_variable"))
                # self.add_widget(versie.naam+"_modifyvbox",versie.naam+"_modifydefinitie",widgets.Text(description='Definitie',value=""))
                # self.add_widget(versie.naam+"_modifyvbox",versie.naam+"_modifyparameters",widgets.Text(description='Parameters',value=""))
                # eventueel kan later beschrijving etc worden toegevoegd.
                # self.add_widget(versie.naam+"_modifyvbox",versie.naam+"_modifybeschrijving",widgets.Text(description='Beschrijving',value=""))
                # self.add_widget(versie.naam+"_modifyvbox",versie.naam+"_modifyopmerkingen",widgets.Text(description='Opmerkingen',value=""))

                self.add_widget(versie.naam+"_modifyvbox",versie.naam+"_commit_feature_button",widgets.Button(description = 'Commit'))
                self.elements[versie.naam+"_commit_feature_button"].versie = versie
                self.elements[versie.naam+"_commit_feature_button"].on_click(self.on_commit_feature_button_clicked)
                self.add_widget(versie.naam,versie.naam+"_logging",widgets.Output()) 

                # maak hier de naamlineedit
                # maak hier de commitbutton

            #voeg vervolgens alle features toe die niet custom zijn.
            for featurenaam in versie.beschikbare_features: #daarna alle niet custom features (aanmaken)
                feature = vars(versie)[featurenaam]
                if not featurenaam.endswith('custom'):
                    self.add_feature(versie,feature)








        def add_feature(self,versie,feature):
            """Bouwt een feature op in de interface door alle Ipywidgets-elementen toe te voegen aan de interface.
            Dit kunnen zijn: info-buttons, checkboxes, en namen van de features.

            :param versie: het SimModule-object (moduleversie) waaraan de feature toegevoegd wordt, bv. \
            sim_k1_bank_beleggen_v1
            :param feature: het Feature-object dat gebruikt wordt om aan de interface toe te voegen
            """
            if versie.naam not in self.elements:
                print(versie.naam + " bestaat niet")
                return
            self.available_features.append([versie, feature])
            self.featuredict[feature.id]=feature
            self.add_widget(versie.naam, feature.id+"_hbox", widgets.HBox())
            self.add_widget(feature.id+"_hbox",
                            feature.id+"_button",
                            widgets.Button(button_style='danger',
                                           layout=Layout(width='10px',
                                           height='25px'),
                                           tooltip="\n\n".join(
                                               [feature.beschrijving,
                                                'Type variabelen: {}'.format(vars(feature)['type variabele']),
                                                'Opmerkingen: {}'.format(feature.opmerkingen),
                                                'Parameters: {}\n* Toelichting: {}\n* Betekenis missing: {}\n* Betekenis zero: {}\n* Betekenis negatief: {}'.format(feature.parameters,vars(feature)['toelichting parameters'],
                                                                                           feature.betekenis_missing, feature.betekenis_zero,
                                                                                           feature.betekenis_negatief),
                                                #'Auteur: {}\nReviewer?: {}\nInhoudelijke checker: {}'.format(feature.auteur, feature.reviewer, vars(feature)['inhoudelijke checker']),
                                                'Auteur: {}\nInhoudelijke checker: {}'.format(feature.auteur, vars(feature)['inhoudelijke checker']),
                                                #'Doelbinding:  {}'.format(feature.doelbinding),
                                                'Inhoudelijke beschrijving: {}'.format(vars(feature)['inhoudelijke beschrijving']),
                                                'Bronkolommen:  {}'.format(feature.bronkolommen),
                                                'Tijdmachine: peildatum vergeleken met variabele: {}\nTijdmachine risico: {}'.format(vars(feature)['tijdmachine: peildatum vergeleken met variabele'],
                                                                                                                                     vars(feature)['tijdmachine risico']),
                                                'Teradata query:\n{}'.format(feature.definitie)]),
                                           icon='info')
                            )
            self.add_widget(feature.id+"_hbox",
                            feature.id+"_checkbox",
                            widgets.Checkbox(value=False,
                                             description=feature.naam,
                                             disabled=False,
                                             layout=Layout(width='500px',
                                                           height='30px')
                                             )
                            )


                
        def build(self):
            """Loopt de interface-hierarchie af en voegt alle onderdelen toe aan de interface.

            .. todo:: @Wouter: klopt bovenstaande beschrijving?
            """
            built = []
            for connections in reversed(self.hierarchy):
                if connections[0] in built:
                    pass
                else:
                    # print(self.parents)
                    # print(connections[0])
                    # print(self.parents[connections[0]])
                    
                    self.elements[connections[0]].children = [
                        self.elements[widgetnaam] for widgetnaam in self.children[connections[0]]
                        ]
                    if connections[0].endswith("_tabwidget") or connections[0].endswith("_accwidget"):
                        for i, items in enumerate(self.children[connections[0]]):
                            self.elements[connections[0]].set_title(i, items)
                    built.append(connections[0])
            for element in self.elements:
                if element.endswith("_featuredropdown"):
                        self.elements[element].options = self.dropdownoptions[element]
