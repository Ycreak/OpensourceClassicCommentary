from flask import Flask, request
from flask_cors import CORS, cross_origin
from flask_restful import Resource, Api
from json import dumps
from flask_jsonpify import jsonify
from run import *

# -*- coding: utf-8 -*-

app = Flask(__name__)
api = Api(app)

CORS(app)

moduleimport='k1'.format(SIM_versie)
keymodule = KeyModule(moduleimport)
keymodule.beschikbare_modulegroepen.sort()

configuratie = Config()

""" Zie hier de REST server. Deze methoden worden middels
	get-requests binnen gehaald bij de front end.
"""

""" Returnt de complete JSON tree van een keymodule
	Te gebruiken bij het initialiseren van de interface
	@author bors
"""
@app.route("/2")
def JSON_init():
	res = dict()

	for modulegroepnaam in keymodule.beschikbare_modulegroepen:
		res[modulegroepnaam] = dict()
		modulegroep = vars(keymodule)[modulegroepnaam]
		modulegroep.beschikbare_versies.sort()

		for versienaam in modulegroep.beschikbare_versies:
			versie = vars(modulegroep)[versienaam]
			res[modulegroepnaam][versienaam] = []
			res[modulegroepnaam][versienaam].append({'kolommen' : versie.kolommen})
			res[modulegroepnaam][versienaam].append({'bronkolommen' : versie.bronkolommen})
			res[modulegroepnaam][versienaam].append({'brontabellen' : versie.brontabellen})
			res[modulegroepnaam][versienaam].append({'naam' : versie.naam})
			res[modulegroepnaam][versienaam].append({'auteur' : versie.auteur})
			res[modulegroepnaam][versienaam].append({'eigenaar' : versie.eigenaar})
			res[modulegroepnaam][versienaam].append({'reviewer' : versie.reviewer})
			res[modulegroepnaam][versienaam].append({'modulegroep' : versie.modulegroep})
			res[modulegroepnaam][versienaam].append({'beschrijving' : versie.beschrijving})
			res[modulegroepnaam][versienaam].append({'key' : versie.key})
			
			features = dict()
			for feature in versie.beschikbare_features:
				single_feature = []
				feat = vars(versie)[feature]
				single_feature.append({'parameters' : feat.parameters})
				single_feature.append({'opmerkingen' : feat.opmerkingen})
				single_feature.append({'definitie' : feat.definitie})
				single_feature.append({'type' : vars(feat)['type variabele']})

				single_feature.append({'beschrijving' : feat.beschrijving})
				single_feature.append({'toelichting' : vars(feat)['toelichting parameters']})
				single_feature.append({'betekenis_missing' : feat.betekenis_missing})
				single_feature.append({'betekenis_zero' : feat.betekenis_zero})
				single_feature.append({'feature.betekenis_negatief' : feat.betekenis_negatief})
				single_feature.append({'auteur' : feat.auteur})
				single_feature.append({'reviewer' : feat.reviewer})
				single_feature.append({'inhoudelijke checker' : vars(feat)['inhoudelijke checker']})

				single_feature.append({'inhoudelijke beschrijving' : vars(feat)['inhoudelijke beschrijving']})
				single_feature.append({'bronkolommen' : feat.bronkolommen})
				single_feature.append({'reviewer' : feat.reviewer})


				single_feature.append({'tijdmachine' : vars(feat)['tijdmachine: peildatum vergeleken met variabele']})
				single_feature.append({'tijdmachine risico' : vars(feat)['tijdmachine risico']})

				features[feat.naam] = single_feature

			res[modulegroepnaam][versienaam].append({'features' : features})
		      

                # 'Type variabelen: {}'.format(vars(feature)['type variabele']),
                # 'Parameters: {}\n* Toelichting: {}\n* Betekenis missing: {}\n* Betekenis zero: {}\n* Betekenis negatief: {}'.format(feature.parameters,vars(feature)['toelichting parameters'],
                #                                            feature.betekenis_missing, feature.betekenis_zero,
                #                                            feature.betekenis_negatief),
                # 'Auteur: {}\nReviewer?: {}\nInhoudelijke checker: {}'.format(feature.auteur, feature.reviewer, vars(feature)['inhoudelijke checker']),
                # #'Doelbinding:  {}'.format(feature.doelbinding),
                # 'Inhoudelijke beschrijving: {}'.format(vars(feature)['inhoudelijke beschrijving']),
                # 'Bronkolommen:  {}'.format(feature.bronkolommen),
                # 'Tijdmachine: peildatum vergeleken met variabele: {}\nTijdmachine risico: {}'.format(vars(feature)['tijdmachine: peildatum vergeleken met variabele'],
                #                                                                                      vars(feature)['tijdmachine risico']),
                # 'Teradata query:\n{}'.format(feature.definitie)]),
                # icon='info')


	return jsonify(res)

@app.route("/3")
def ABT():
    """Genereer de ABT code o.b.v. de aangevinkte features en opgegeven locatie, en schrijf deze naar de output.
    """
    opt_param = request.args.get("interface_selected_features")
    


    actieve_features = {}
    statements = []
    lineage = {}  # {datagebied:{tabel:kolom}}

    for modulegroepnaam in keymodule.beschikbare_modulegroepen:
      modulegroep = vars(keymodule)[modulegroepnaam]
      for versienaam in modulegroep.beschikbare_versies:
        versie = vars(modulegroep)[versienaam]
        for feature in versie.beschikbare_features:
          feat = vars(versie)[feature]
          if (feat.naam in opt_param.split(',')):
            actieve_features.setdefault(versie, []).append(feat)

    # het joinstatement wordt gemaakt, voordat de dependencies worden bepaald.
    # zo worden dependent variabelen niet meegenomen in de uiteindelijke output.
    # in het stuk code onder het statement worden kolommen toegevoegd aan de actieve features
    # aan de hand van de dependencies.

    joinstatement_start = """
CREATE MULTISET TABLE {keytable} AS (""".format(keytable=configuratie.abt)
    joinstatement_select = """
SELECT
 t0.finr
 ,t0.peildatum"""
    for tx, module in enumerate(actieve_features):
        for feature in actieve_features[module]:
            joinstatement_select += "\n     ,t{index}.{kolomnaam}".format(index=tx + 1, kolomnaam=feature.naam)

    joinstatement_from = """
\nFROM {} t0""".format(configuratie.keytable)
    for tx, module in enumerate(actieve_features):
        joinstatement_from += """\nLEFT JOIN v_{tabelnaam} t{index}
        ON t0.finr = t{index}.finr AND t0.peildatum = t{index}.peildatum""".format(
            tabelnaam=module.naam, index=tx + 1)
    joinstatement_end = """
) WITH DATA PRIMARY INDEX(FINR, PEILDATUM)
"""
    joinstatement = ''.join([joinstatement_start, joinstatement_select, joinstatement_from, joinstatement_end])

    inputmodules = list(actieve_features.keys())
    for module in inputmodules:
        # print(module.naam)
        tabelrefs = {}
        for ref, tabellocatie in module.brontabellen.items():
            # print(tabellocatie)
            tabelrefs[ref] = tabellocatie
            datagebied, tabelnaam = tabellocatie.split(".")
            lineage.setdefault(datagebied, {})
            lineage[datagebied].setdefault(tabelnaam, set())
            # dependencies regelen:
            # if tabelnaam.startswith('sim_') and not self.configuratie.interface.moduleversiedict[
            #     tabelnaam] in inputmodules:
            #     # moet nog worden aangepast als versie is aangepast
            #     inputmodules.append(self.configuratie.interface.moduleversiedict[tabelnaam])
                # print('module toegevoegd',tabelnaam)
        # statements moeten nog in juiste volgorde worden afgehandeld
        statement = "create volatile table v_{tabelnaam}".format(
            tabelnaam=module.naam) + " AS(\n/*"+ module.beschrijving + "*/\n\tselect \n\tt0.finr,\n\tt0.peildatum"

        for kolomlocatie in module.bronkolommen:  # moduleafhankelijke kolommen
            tabelref, kolomnaam = kolomlocatie.split('.')
            datagebied, tabelnaam = tabelrefs[tabelref].split(".")
            lineage[datagebied][tabelnaam].add(kolomnaam)

        # onderstaande kan efficienter...
        if module in actieve_features:
            inputkolommen = actieve_features[module]
        else:
            inputkolommen = []

        # for feature in inputkolommen:  # feature-afhankelijke kolommen

        #     for kolomlocatie in feature.bronkolommen:
        #         tabelref, kolomnaam = kolomlocatie.lower().split('.')
        #         # print(datagebied,tabelnaam,tabelref)
        #         datagebied, tabelnaam = tabelrefs[tabelref].split(".")
        #         lineage[datagebied][tabelnaam].add(kolomnaam)
        #     for columndependency in feature.dependencies:
        #         # print(feature.id, columndependency)
        #         # als dit het geval is, moet ook de oorspronkelijke feature worden toegevoegd.
        #         # Dit gebeurt op deze manier iteratief. Wanneer een feature afhankelijk is van een andere
        #         # feature die weer afhankelijk is van een andere feature gaat het ook goed.
        #         # dependent_feature = self.configuratie.interface.featuredict[
        #         #     feature.id.replace(feature.naam, columndependency)]
        #         # if not dependent_feature in actieve_features[module]:
        #         #     inputkolommen.append(dependent_feature)

        #     # parameteroplossing is aangepast bij het genereren van de custom features.
        #     parameters = {}
        #     #if feature.id in self.configuratie.interface.parameterwidgets:
        #     #    parameterwidgets = self.configuratie.interface.parameterwidgets[feature.id]
        #     #    for parameter, parameterwidgetnaam in parameterwidgets:
        #     #        paramval = self.configuratie.interface.elements[parameterwidgetnaam].value
        #     #        if type(paramval) is list or type(paramval) is tuple:
        #     #            parameters[parameter] = ",".join(paramval)
        #     #        else:
        #     #            parameters[parameter] = paramval

        #     statement += "\n\n\t," + "/*" + feature.beschrijving + "*/ \n" + feature.definitie.format(**parameters)


        statement += "\n"+module.codepostfix.replace("FROM","\nFROM").replace("LEFT JOIN","\nLEFT JOIN") + " ON COMMIT PRESERVE ROWS\n\n"
        statements.append(statement.replace("{keytable_finr_validatie}", configuratie.keytable))
        # print(lineage)
        # print(statement)

    # print(joinstatement)
    statements.append(joinstatement)

    # print('benodige kolommmen en tabellen:')

    configuratie.abt_statements = statements
    for datagebied, tabelnaam in lineage.items():
        # print(datagebied)
        for tabelnaam, kolommen in lineage[datagebied].items():
            for kolomnaam in kolommen:
                # print('\t{tabelnaam}.{kolomnaam}'.format(tabelnaam=tabelnaam, kolomnaam=kolomnaam))
                pass
    
    temp = "hello there"
    return temp
    # return jsonify(statements)



if __name__ == '__main__':
   app.run(port=5002)
