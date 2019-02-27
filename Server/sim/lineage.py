"""Deze module bevat functies om de lineage te bepalen van de aangeklikte features in de interface.
"""


def lineage_total(configuratie):
    """Deze functie levert o.b.v. de aangeklikte features in de interface de totale lineage (d.w.z. de gebruikte
    combinaties van [datagebied, tabel, kolom]).

    :rtype: dict
    :param configuratie: de configuratie die gebruikt is om de interface te starten
    :return: de lineage in de vorm {datagebied:{tabel:kolom}}
    """
    actieve_features = {}
    lineage = {}  # {datagebied:{tabel:kolom}}
    for items in configuratie.interface.available_features:
        if configuratie.interface.elements[items[1].id + "_checkbox"].value:
            actieve_features.setdefault(items[0], []).append(items[1])

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
            if tabelnaam.startswith('sim_') and not configuratie.interface.moduleversiedict[
                tabelnaam] in inputmodules:
                # moet nog worden aangepast als versie is aangepast
                inputmodules.append(configuratie.interface.moduleversiedict[tabelnaam])
                # print('module toegevoegd',tabelnaam)
        #    tabelnaam=module.naam)

        for kolomlocatie in module.bronkolommen:  # moduleafhankelijke kolommen
            tabelref, kolomnaam = kolomlocatie.split('.')
            datagebied, tabelnaam = tabelrefs[tabelref].split(".")
            lineage[datagebied][tabelnaam].add(kolomnaam)

        # onderstaande kan efficienter...
        if module in actieve_features:
            inputkolommen = actieve_features[module]
        else:
            inputkolommen = []

        for feature in inputkolommen:  # feature-afhankelijke kolommen
            # MFV: parameters hier gezet (iets naar boven in de code),
            #  zodat deze namen in de lineage ingevuld kunnen worden
            parameters = {}
            if feature.id in configuratie.interface.parameterwidgets:
                parameterwidgets = configuratie.interface.parameterwidgets[feature.id]
                # print(feature.id)
                # print(parameterwidgets)
                for parameter, parameterwidgetnaam in parameterwidgets:
                    paramval = configuratie.interface.elements[parameterwidgetnaam].value
                    if type(paramval) is list or type(paramval) is tuple:
                        parameters[parameter] = ",".join(paramval)
                    else:
                        parameters[parameter] = paramval
                        # print(paramval)

            for kolomlocatie in feature.bronkolommen:
                tabelref, kolomnaam = kolomlocatie.lower().split('.')
                # print(datagebied,tabelnaam,tabelref)
                datagebied, tabelnaam = tabelrefs[tabelref].split(".")
                # MFV: invullen van parameters. Ipv loon_{bruto_netto}_{type_loon}_bdr -> loon_bruto_inkomen_bdr
                # lineage[datagebied][tabelnaam].add(kolomnaam)
                lineage[datagebied][tabelnaam].add(kolomnaam.format(**parameters))
            # MFV: onderstaande mag waarschijnlijk weg (wss enkel voor TD statement nodig)
            for columndependency in feature.dependencies:
                # als dit het geval is, moet ook de oorspronkelijke feature worden toegevoegd.
                # Dit gebeurt op deze manier iteratief. Wanneer een feature afhankelijk is van een andere
                # feature die weer afhankelijk is van een andere feature gaat het ook goed.
                dependent_feature = configuratie.interface.featuredict[
                    feature.id.replace(feature.naam, columndependency)]
                if dependent_feature not in actieve_features[module]:
                    inputkolommen.append(dependent_feature)
    return lineage


def lineage_per_feature():
    """Deze functie levert de lineage horende bij een feature.

    .. todo:: Deze functie is op dit moment niet geïmplementeerd. Dit zou wel moeten gebeuren indien men de gebruiker \
    op feature-niveau terug wil kunnen koppelen welke features niet gemaakt kunnen worden o.b.v. de huidige autorisaties

    """
    return
