"""Deze module bevat functies die gebruikt kunnen worden om met Teradata te communiceren.
"""

import os
import teradata
import pwd
from datetime import datetime
import hashlib
from IPython.display import clear_output
from IPython.display import HTML
from IPython import display
from common import ireplace

schemas = {}
getoonde_hashes = {}
udaExec = teradata.UdaExec(appName="JNB", logConsole=False, version=1)


class Connectionstring:
    """Bevat variabelen die gebruikt worden bij de connectie met Teradata.
    """
    def __init__(self):
        """Initialisatie van variabelen voor connectie met Teradata.
        """
        self.system = 'TDATA03'
        self.method = 'odbc'
        self.charset = 'UTF8'

global connectionstring, username,today
connectionstring = Connectionstring()
username = pwd.getpwuid(os.getuid()).pw_name
today = str(datetime.now())[0:10]


def _repr_html(header, inputtable, mask=False):
    """Levert de data op als html-formatted string.

    :param header: list van kolomnamen
    :param inputtable: alle records zijn als list opgenomen in een overkoepelende list
    :param mask: of finrs gemaskeerd getoond moeten worden
    :return: de data als html-formatted string
    """
    html = ["<table>", "<tr>"]
    hashedcolumns = []
    for i, col in enumerate(header):
        if 'finr' in col.lower():
            hashedcolumns.append(i)
        html.append("<th>{0}</th>".format(col))
    html.append("</tr>")
    for row in inputtable:
        html.append("<tr>")
        for i, col in enumerate(row):
            if i in hashedcolumns and mask:
                colhash = hashlib.md5("{}_{}".format(today, col).encode("utf8")).hexdigest()
                getoonde_hashes[colhash] = col
                html.append("<th>{0}</th>".format(colhash))
            else:
                html.append("<td>{0}</td>".format(col))
    html.append("</tr>")
    html.append("</table>")
    return ''.join(html)


def _show_sample(cursor, samplesize=25, mask=False):
    """Levert een sample van een Teradata-tabel op in html-format voor Ipython.

    :param cursor: een Teradata cursor van een result set
    :param samplesize: de samplesize die opgeleverd moet worden
    :param mask: of finrs gemaskeerd getoond moeten worden
    :return: een sample van de data als html in Ipython
    """
    clear_output()
    if samplesize != 0:
        print("max records weergegeven: " + str(samplesize))
    sample = cursor.fetchmany(samplesize)
    table = []
    header = [rowMetaData[0] for rowMetaData in cursor.description]
    for rows in sample:
        tablerow = []
        for cols in rows:
            tablerow.append(str(cols))
        table.append(tablerow)
    table = sorted(table)
    htmltable = _repr_html(header, table, mask)
    return display.display(HTML(htmltable))


def gethash(finr, datum=today):
    """Levert het finr gehashed terug.

    :param finr: het finr om te hashen
    :param datum: een datum
    :return: het gehashede finr
    """
    fihash = hashlib.md5("{}_{}".format(datum, finr).encode("utf8")).hexdigest()
    print(fihash)
    return fihash


def savehash(fihash, documentatie):
    """Schrijft documentatie weg voor een gehashed finr.

    :param fihash: het gehashede finr
    :param documentatie: tekst om te documenteren
    """
    documentatiedir = '/srv/data/users/{}/'.format(username)
    documentatielocatie = documentatiedir+'hashing_documentatie.txt'
    if not os.path.isdir(documentatiedir):
        os.mkdir(documentatiedir)
    if not os.path.isfile(documentatielocatie):
        with open(documentatielocatie, 'w') as outputfile:
            outputfile.write('datum;finr;fihash;documentatie\n')

    with open(documentatielocatie, 'a') as outputfile:
        for key, val in getoonde_hashes.items():
            if key == fihash:
                print('{} is vermeld in documentatie'.format(fihash))
                schemas[key] = val
                outputfile.write(";".join([today, val, fihash, documentatie.replace("\n", " ")])+"\n")


def loadhash(hashobject):
    """Print de documentatie van een gehashed finr naar de output.

    :param hashobject: het gehashede finr
    :return: een string met de documentatie van een gehashed finr
    """
    documentatiedir = '/srv/data/users/{}/'.format(username)
    documentatielocatie = documentatiedir+'hashing_documentatie.txt'
    if not os.path.isdir(documentatiedir):
        os.mkdir(documentatiedir)
    if not os.path.isfile(documentatielocatie):
        with open(documentatielocatie, 'w') as outputfile:
            outputfile.write('datum;finr;fihash;documentatie\n')

    with open(documentatielocatie) as inputfile:
        header = inputfile.readline()
        for lines in inputfile:
            datum, finr, fihash, documentatie = lines.strip().split(";")
            if hashobject == fihash:
                schemas[hashobject] = finr
                print('Hash {} :\n{}'.format(hashobject, documentatie))
                return


def print_query(query, samplesize=25, connection=connectionstring, schema=schemas, mask=False):
    """Toont (een sample van) de output van de Teradata-query in html-format in Ipython.
    I.t.t. :func:`sim.tdquery._show_sample` maakt deze functie ook de connectie met Teradata.

    :param query: de Teradata-query
    :param samplesize: de samplesize die opgeleverd moet worden
    :param connection: een Connectionstring-object met relevante gegevens over de Teradata-connectie
    :param schema: mapping van schemanamen. Bv. in de query staat "sel * from {a}.table" en het schema geeft \
    "{'a': 'correct_schema'}, dan levert dit de resultaatquery "sel * from correct_schema.table"
    :param mask: of finrs gemaskeerd getoond moeten worden
    """
    with (udaExec.connect(method=connection.method, system=connection.system)) as session:
        result = (session.execute(query.format(**schema)))
        _show_sample(result, samplesize, mask)


def execute_query(query, ignore=False, log=True, connection=connectionstring, schema=schemas):
    """Voert een query uit op Teradata.

    :param query: de uit te voeren Teradata-query
    :param ignore: indien True, dan wordt er geen foutmelding gegeven bij het niet bestaan van een tabel
    :param log: of de log getoond moet worden
    :param connection: een Connectionstring-object met relevante gegevens over de Teradata-connectie
    :param schema: mapping van schemanamen. Bv. in de query staat "sel * from {a}.table" en het schema geeft \
    "{'a': 'correct_schema'}, dan levert dit de resultaatquery "sel * from correct_schema.table"
    """
    with (udaExec.connect(method=connection.method, system=connection.system)) as session:
        if ignore:
            session.execute(query.format(**schema),ignoreErrors=[3807])
        else:
            session.execute(query.format(**schema))
    if not log:
        clear_output()


def execute_queries(queries, ignore=False, log=True, connection=connectionstring, schema=schemas):
    """Voert meerdere queries uit op Teradata.

    :param queries: de uit te voeren Teradata-queries
    :param ignore: indien True, dan wordt er geen foutmelding gegeven bij het niet bestaan van een tabel
    :param log: of de log getoond moet worden
    :param connection: een Connectionstring-object met relevante gegevens over de Teradata-connectie
    :param schema: mapping van schemanamen. Bv. in de query staat "sel * from {a}.table" en het schema geeft \
    "{'a': 'correct_schema'}, dan levert dit de resultaatquery "sel * from correct_schema.table"
    """
    with (udaExec.connect(method=connection.method, system=connection.system)) as session:
        aantalqueries=len(queries)
        for i, query in enumerate(queries):
            print('start executing query {}/{}'.format(i+1, aantalqueries))
            if ignore:
                session.execute(query.format(**schema), ignoreErrors=[3807])
            else:
                session.execute(query.format(**schema))
    if not log:
        clear_output()


def print_sample(tablename, samplesize=5, connection=connectionstring, schema=schemas, mask=False):
    """Toont een sample van een Teradata-tabel in html-format in Ipython. I.t.t. :func:`sim.tdquery.print_query`
    levert deze functie standaard een "SELECT \*".

    :param tablename: de tabel die getoond moet worden
    :param samplesize: de samplesize die opgeleverd moet worden
    :param connection: een Connectionstring-object met relevante gegevens over de Teradata-connectie
    :param schema: mapping van schemanamen. Bv. in de query staat "sel * from {a}.table" en het schema geeft \
    "{'a': 'correct_schema'}", dan levert dit de resultaatquery "sel * from correct_schema.table"
    :param mask: of finrs gemaskeerd getoond moeten worden
    """
    query = "SELECT * FROM {} SAMPLE {}".format(tablename, samplesize)
    print_query(query.format(**schema), samplesize, connection, mask=mask)


def query2table(query, connection=connectionstring, schema=schemas, log=True):
    """Levert de output van de Teradata-query op als list.

    :param query: de Teradata-query
    :param connection: een Connectionstring-object met relevante gegevens over de Teradata-connectie
    :param schema: mapping van schemanamen. Bv. in de query staat "sel * from {a}.table" en het schema geeft \
    "{'a': 'correct_schema'}, dan levert dit de resultaatquery "sel * from correct_schema.table"
    :param log: of de log van het aantal verwerkte rijen getoond moet worden
    :return: de Teradata-tabel als list
    """
    resulttable = []
    with (udaExec.connect(method=connection.method, system=connection.system)) as session:
        result = (session.execute(query.format(**schema)))
        i = -1  # voor geval dat result leeg is...
        for i, row in enumerate(result):
            if (i+1) % 10000 == 0:
                if log:
                    print('{} rijen verwerkt'.format(i+1))
            if len(row) == 1:
                resulttable.append(row[0])
            else:
                resulttable.append([x for x in row])
    if log:
        print('{} rijen verwerkt'.format(i+1))
    return resulttable


def columns(table, connection=connectionstring, schema=schemas):
    """Toont de kolommen van een Teradata-tabel in html-format in Ipython.

    :param table: de tabel waarvan de kolommen getoond moeten worden
    :param connection: een Connectionstring-object met relevante gegevens over de Teradata-connectie
    :param schema: mapping van schemanamen. Bv. in de query staat "sel * from {a}.table" en het schema geeft \
    "{'a': 'correct_schema'}, dan levert dit de resultaatquery "sel * from correct_schema.table"
    """
    query = "SELECT * FROM {} WHERE 1=0".format(table)
    with (udaExec.connect(method=connection.method, system=connection.system)) as session:
        result = (session.execute(query.format(**schema)))
        _show_sample(result, 0)


def tables(datalab, samplesize=100, connection=connectionstring,schema=schemas):
    """Toont (een sample van) de tabellen van een Teradata-datalab in html-format in Ipython.

    :param datalab: het te doorzoeken datalab
    :param samplesize: de samplesize die opgeleverd moet worden
    :param connection: een Connectionstring-object met relevante gegevens over de Teradata-connectie
    :param schema: mapping van schemanamen. Bv. in de query staat "sel * from {a}.table" en het schema geeft \
    "{'a': 'correct_schema'}, dan levert dit de resultaatquery "sel * from correct_schema.table"
    """
    query = "SELECT tablename from DBC.TABLES WHERE UPPER(databasename)=UPPER('{}')".format(datalab)
    with (udaExec.connect(method=connection.method, system=connection.system)) as session:
        result = (session.execute(query.format(**schema)))
        _show_sample(result, samplesize)


def convert2csv(table, pathcsv, connection=connectionstring, delimiter=',', schema=schemas, log=True):
    """

    :param table: de Teradata-tabel die naar csv geconverteerd moet worden
    :param pathcsv: het filepad waarnaar weggeschreven moet worden
    :param connection: een Connectionstring-object met relevante gegevens over de Teradata-connectie
    :param delimiter: de te gebruiken delimiter tussen records
    :param schema: mapping van schemanamen. Bv. in de query staat "sel * from {a}.table" en het schema geeft \
    "{'a': 'correct_schema'}, dan levert dit de resultaatquery "sel * from correct_schema.table"
    :param log: of de log van het aantal weggeschreven rijen getoond moet worden
    """
    print("let op! geen data exporteren met finr")
    query = "SELECT * FROM {}".format(table)
    with open(pathcsv, "w") as outputfile:
        with udaExec.connect(method=connection.method, system=connection.system, charset=connection.charset) as session:
            session.arraysize = 4
            result = session.execute(query.format(**schema))
            header = [rowMetaData[0].lower() for rowMetaData in result.description]
            outputfile.write(delimiter.join(header)+'\n')
            for i, row in enumerate(result):
                rowstr = delimiter.join(['"{}"'.format(str(x).strip()) if isinstance(x, str) else str(x) for x in row])
                outputfile.write(rowstr + "\n")
                if log and (i+1) % 10000 == 0:
                    clear_output()
                    print(i+1, "rows weggeschreven")
    clear_output()
    print('bestand geconverteerd, {} regels weggeschreven'.format(i+1))


class Row:
    """Bevat de definitie van een rij. D.w.z. een Rij-object bevat iedere kolom als variabele met daaraan gekoppeld
    de waarde horende bij die variabele.
    """
    def __init__(self, line, header, delimiter=","):
        """Initialiseer een rij.

        :param line: een record als delimited string
        :param header: een list met de variabelenamen
        :param delimiter: de gebruikte delimiter tussen waarden
        """
        self.attributes = []
        for index, items in enumerate(line.strip().split(delimiter)):
            vars(self)[header[index]] = items.strip()


def inlezen_csv(pathcsv, delimiter=","):
    """Levert een csv-bestand op als list van Row-objecten.

    :param pathcsv: het filepad van de csv met de data
    :param delimiter: de gebruikte delimiter
    :return: het csv-bestand als list van Row-objecten
    """
    result = []
    with open(pathcsv) as inputfile:
        header = inputfile.readline().lower().strip().split(delimiter)
        for lines in inputfile:
            result.append(Row(lines, header, delimiter))
    return result


def sassify(statement, schema=schemas):
    """Vertaalt het statement met daarin schemanamen tussen {} naar de correcte SAS-macrovariabelen (gebruikmakend
    van de parameter schemas). Tevens worden een Teradata header en footer toegevoegd.

    :param statement: het te vertalen statement
    :param schema: mapping van schemanamen. Bv. in de query staat "sel * from {a}.table" en het schema geeft \
    "{'a': 'correct_schema'}, dan levert dit de resultaatquery "sel * from correct_schema.table"
    :return: een vertaald statement dat door SAS uitgevoerd kan worden
    """
    td_header = """
PROC SQL;
CONNECT TO teradata AS td (&teradata_connect_string.);
EXECUTE (
    """
    refs = [ref.lower() for ref in schemas.values()]
    for key,val in schema.items():
        if refs.count(val.lower()) == 1 and key != 'singlequote':
            statement = ireplace(statement, " "+val, " &"+key+".")

    td_footer = """
) by td;
QUIT;
"""

    return td_header + statement.replace("{", "&").replace("}", ".") + td_footer


def td_ophalen_file(td_input,outputlocatie):
    """Haalt een Teradata-tabel op en schrijft deze in bytes weg naar de outputlocatie.

    :param td_input: de Teradata tabel
    :param outputlocatie: de filelocatie waar het bestand weggeschreven wordt
    """
    bytelist=query2table("sel * from {}".format(td_input))
    bytelist.sort()
    array=[]
    with open(outputlocatie, "wb") as outputfile:
        for items in bytelist:
            array.append((int(items[1])+256)%256)

        outputfile.write(bytes(array))
    print("bestand weggeschreven naar {}".format(outputlocatie))


def td_unzip(td_input, outputlocatie, overwrite=False):
    # eerst een zipbestand vanaf een aws byte voor byte kopieren naar een teradatatabel met index.
    # zie hiervoor onderstaande stukje code
    #
    # data test;
    # infile "&outputlocatie./&naamzipbestand."
    # recfm=n;
    # input byte ib1. @@;
    # run;

    # PROC SQL;
    # DROP TABLE TD.test_zip;
    # QUIT;

    # PROC SQL;
    # CREATE TABLE TD.test_zip AS
    # SELECT
    # MONOTONIC() AS index,
    # byte FROM TEST;
    # QUIT;

    # de inhoud van het zipbestand staat op teradata, en kan met deze functie worden opgehaald en worden weggeschreven.

    """Haalt een Teradata-tabel op (opgeslagen als bytes), schrijft deze weg als zip, en pakt deze uit in de gegeven
    directory.

    :param td_input: de Teradata tabel
    :param outputlocatie: de directory waar de bestanden worden weggeschreven
    :param overwrite: overschrijven van de bestanden in de gegeven directory
    """
    if overwrite:
        bytelist = query2table("sel * from {}".format(td_input))
        bytelist.sort()
        array = []
        with open(outputlocatie+".zip", "wb") as outputfile:
            for items in bytelist:
                array.append((int(items[1])+256) % 256)

            outputfile.write(bytes(array))
            print("{}.zip aangemaakt".format(outputlocatie))
        os.system("rm -rf {}".format(outputlocatie))
        os.system("unzip {}.zip -d {}".format(outputlocatie, outputlocatie))
        print("bestand uitgepakt in folder {}".format(outputlocatie))
    else:
        if os.path.exists(outputlocatie) or os.path.exists(outputlocatie+".zip"):
            print('overwrite = False, hierdoor geen output')
        else:
            bytelist=query2table("sel * from {}".format(td_input))
            bytelist.sort()
            os.system("unzip {}.zip -d {}".format(outputlocatie,outputlocatie))
            print("bestand uitgepakt in folder {}".format(outputlocatie))


def inserttable2td(table, insert_locatie, log=True, connection=connectionstring, schema=schemas):
    """Voegt records toe aan een Teradata-tabel. Records zijn gedefinieerd als list. Een tabel is een list van lists
    (d.w.z. een list van records).

    :param table: een tabel die toegevoegd moet worden aan de Teradata-tabel. De tabel is gedefinieerd als list van \
    lists. Voor ieder record is er een list, waarbij een tabel een list van records is. \
    Bv. [[val_kolom1, valkolom2], [val_kolom1, val_kolom2]]
    :param insert_locatie: de Teradata-locatie waar weggeschreven moet worden, bv. SCHEMA.tabel1
    :param log: of de log getoond moet worden
    :param connection: een Connectionstring-object met relevante gegevens over de Teradata-connectie
    :param schema: mapping van schemanamen. Bv. in de query staat "sel * from {a}.table" en het schema geeft \
    "{'a': 'correct_schema'}, dan levert dit de resultaatquery "sel * from correct_schema.table"
    """
    scheme, tabname = insert_locatie.split(".")
    coltabel = query2table("""
    select
        columnId,
        columnname
    FROM DBC.COLUMNSV
    WHERE
        DATABASENAME = '{}'
        AND
        TableNAme = '{}'
    """.format(scheme, tabname), log=log)
    coltabel.sort()
    cols = ",".join([column for id, column in coltabel])
    qms = "?"+",?"*(cols.count(","))
    query = """INSERT INTO {} ({})
                 VALUES ({})""".format(insert_locatie, cols, qms)

    if "," not in cols:  # normaal bestaat de tabel uit [[val_kolom1,valkolom2],[val_kolom1,val_kolom2]]
        # indien de tabel bestaat uit slechts een enkele waarde ziet de tabel er als volgt uit [regel1,regel2,regel3]
        # ipv [[regel1],[regel2],[regel3]] en daar moet voor worden gecorrigeerd.
        tablenew = []
        for items in table:
            tablenew.append([items])
        table = tablenew

    # print(query.format(**schema),(table[0]))
    for chunk in [table[i:i + 10000] for i in range(0, len(table), 10000)]:
        with (udaExec.connect(method=connection.method, system=connection.system)) as session:
            session.executemany(query.format(**schema), chunk, batch=True)

    # if not log:
    #    clear_output()


def td_zipfolder(folder, td_locatie):
    """Zipt een folder (directory) en schrijft deze als bytes weg naar een Teradata-tabel.

    :param folder: de folder die gezipt wordt en naar een Teradata-tabel geschreven wordt
    :param td_locatie: de Teradata-locatie waar weggeschreven moet worden, bv. SCHEMA.tabel1
    """
    if not folder.endswith("/"):
        print("folder opgeven, eindigend op /")
    else:
        ziplocatie = "/".join(folder.split("/")[:-2])+"/"+folder.split("/")[-2]+".zip"
        os.system("zip -r {0} {1}".format(ziplocatie, folder))

    # nu overzetten naar td_locatie.
    execute_query("drop table {}".format(td_locatie), ignore=True)
    execute_query("""
    CREATE MULTISET TABLE {} ,NO FALLBACK ,
     NO BEFORE JOURNAL,
     NO AFTER JOURNAL,
     CHECKSUM = DEFAULT,
     DEFAULT MERGEBLOCKRATIO
     (
      "volgnr" INTEGER,
      "bytenr" INTEGER)
    PRIMARY INDEX ( "volgnr" );
    """.format(td_locatie))

    with open(ziplocatie,"rb") as inputfile:
        content = inputfile.read()
    bytelist = []
    for i, character in enumerate(content):
        if character >= 128:  # Range 0:255 moet vertaald worden naar range -128:+127. 127-255 geeft -128
            bytelist.append((i+1, character-256))
        else:
            bytelist.append((i+1, character))

    inserttable2td(bytelist, td_locatie)


def td_exportfile(filelocatie, td_locatie):
    """Schrijft een bestand als bytes weg naar een Teradata-tabel.

    :param filelocatie: het bestand dat naar een Teradata-tabel geschreven wordt
    :param td_locatie: de Teradata-locatie waar weggeschreven moet worden, bv. SCHEMA.tabel1
    """
    execute_query("drop table {}".format(td_locatie), ignore=True)
    execute_query("""
    CREATE MULTISET TABLE {} ,NO FALLBACK ,
     NO BEFORE JOURNAL,
     NO AFTER JOURNAL,
     CHECKSUM = DEFAULT,
     DEFAULT MERGEBLOCKRATIO
     (
      "volgnr" INTEGER,
      "bytenr" INTEGER)
    PRIMARY INDEX ( "volgnr" );
    """.format(td_locatie))

    with open(filelocatie,"rb") as inputfile:
        content = inputfile.read()
    bytelist = []
    for i,character in enumerate(content):
        if character >= 128:  # Range 0:255 moet vertaald worden naar range -128:+127. 127-255 geeft -128
            bytelist.append((i+1, character-256))
        else:
            bytelist.append((i+1, character))

    inserttable2td(bytelist, td_locatie)
    clear_output()
    print('file weggeschreven naar {}'.format(td_locatie))

