# Ycreak 2020
from flask import Flask, request
from flask_cors import CORS, cross_origin
from flask_restful import Resource, Api
from json import dumps
from flask_jsonpify import jsonify

from flask_mysqldb import MySQL

import collections
import mysql.connector

import Data
# -*- coding: utf-8 -*-

app = Flask(__name__)
api = Api(app)

CORS(app)

################
# MYSQL CONFIG #
################
app.config['MYSQL_HOST'] = Data.HOST
app.config['MYSQL_USER'] = Data.USER
app.config['MYSQL_PASSWORD'] = Data.PASSWORD
app.config['MYSQL_DB'] = Data.DB

mysql = MySQL(app)

def jsonRequestData2(query):
    cur = mysql.connection.cursor()
    cur.execute(query)
    mysql.connection.commit()
    myresult = cur.fetchall()
    cur.close()
    
    for x in myresult:
        print(x)

    return myresult

def jsonRequestData(query):
    cur = mysql.connection.cursor()
    cur.execute(query)
    mysql.connection.commit()
    myresult = cur.fetchall()
    cur.close()
    
    for x in myresult:
        print(x)

    return jsonify(myresult)

################
# TRAGEDY PART #
################
# Geeft alle primaire tekst terug.
@app.route("/getPrimaryText")
def getPrimaryText():
    currentBook = request.args.get("currentBook")
    query = "SELECT lineNumber, lineContent FROM Text WHERE Book={}".format(currentBook)

    return jsonRequestData(query)

# Geeft geselecteerd commentaar terug.
@app.route("/getCommentary")
def getCommentary():
    requestedLine = request.args.get("requestedLine")
    currentBook = request.args.get("currentBook")
    query = "SELECT lineStart, lineEnd, lineWords, lineCommentaar, source, pages FROM Comments WHERE Text={0} AND lineStart<={1} AND lineEnd>={1}".format(currentBook,requestedLine)

    return jsonRequestData(query)

# Geeft alle primaire tekst terug.
@app.route("/getBibliography")
def getBibliography():
    currentBook = request.args.get("currentBook")
    query = "SELECT Editors, Author, Book, Article, Journal, Volume, ChapterTitle, Pages, Place, Year, Website, URL, ConsultDate FROM Bibliography WHERE Text={}".format(currentBook)

    return jsonRequestData(query)

#Geeft tweede laag commentaar terug.
@app.route("/getSecondaryCommentary")
def getSecondaryCommentary():
    currentBook = request.args.get("currentBook")
    query = "SELECT lineStart, lineEnd, lineCommentaar FROM Comments2 WHERE Text={}".format(currentBook)

    return jsonRequestData(query)


##################
# FRAGMENTS PART #
##################
@app.route("/getFragments")
def getFragments():
    currentBook = request.args.get("currentBook")
    query = "SELECT fragmentLineID, fragmentNo, Editor, fragmentContent FROM Fragments WHERE Book={}".format(currentBook)

    return jsonRequestData(query)

@app.route("/getF_AppCrit")
def getF_AppCrit():
    currentBook = request.args.get("currentBook") #Currentbook moet RequestedLine zijn!
    query = "SELECT AppCrit FROM F_AppCrit WHERE Fragment={}".format(currentBook)

    return jsonRequestData(query)

@app.route("/getF_ReferencerID")
def getF_ReferencerID():
    fragmentID = request.args.get("fragmentID")
    editorID = request.args.get("editorID")
    currentBook = request.args.get("currentBook")
    print("RequestedLine is: ", fragmentID, editorID, currentBook)
    query = "SELECT ID FROM FragmentReferencer WHERE FragmentNo={0} AND Editor={1} AND Book={2}".format(fragmentID,editorID,currentBook)

    return jsonRequestData(query)

@app.route("/getF_Commentaar")
def getF_Commentaar():
    currentBook = request.args.get("currentBook")
    query = "SELECT Commentaar FROM F_Commentary WHERE Fragment={0}".format(currentBook)

    return jsonRequestData(query)

@app.route("/getF_Translation")
def getF_Translation():
    currentBook = request.args.get("currentBook")
    query = "SELECT Translation FROM F_Translations WHERE Fragment={0}".format(currentBook)

    return jsonRequestData(query)

@app.route("/getF_Context")
def getF_Context():
    currentBook = request.args.get("currentBook") #Currentbook moet RequestedLine zijn!
    query = "SELECT ContextAuthor, Context FROM F_Context WHERE FragmentID={}".format(currentBook)

    return jsonRequestData(query)

@app.route("/getF_Differences")
def getF_Differences():
    currentBook = request.args.get("currentBook") #Currentbook moet RequestedLine zijn!
    query = "SELECT Differences FROM F_Differences WHERE FragmentID={}".format(currentBook)
    return jsonRequestData(query)

@app.route("/getEditors")
def getEditors():
    currentBook = request.args.get("currentBook") #Currentbook moet RequestedLine zijn!
    query = "SELECT ID, editorName, defaultEditor FROM Editors WHERE Book={}".format(currentBook)

    return jsonRequestData(query)

###################
# NAVIGATION PART #
###################
# Returns all authors
@app.route("/getAuthors")
def getAuthors():
    query = "SELECT ID, Name FROM Authors"

    return jsonRequestData(query)

@app.route("/getBooks")
def getBooks():
    authorEntry = request.args.get("currentBook")
    query = "SELECT ID, Title FROM Books WHERE Author={}".format(authorEntry)

    return jsonRequestData(query)

###############
# INSERT DATA #
###############
@app.route("/insertFragment")
def insertFragment():
    i_currentBook = request.args.get("currentBook")
    i_fragmentNo = request.args.get("fragmentNo")
    i_Editor = request.args.get("editor")
    i_fragmentContent = request.args.get("content")
    #print(currentBook, fragmentNo, Editor, fragmentContent)

    query = "SELECT MAX(fragmentLineID) FROM Fragments"
    temp = jsonRequestData2(query)
    print(temp)

    for key in temp:
        for key2 in key:
            highestValue = key2

    nextKey = highestValue + 1
    
    print(i_fragmentContent)
    tempArray = i_fragmentContent.split("@,")
    print(tempArray) 

    for item in tempArray:
        inputString = item.replace('@','').replace('"','')
        inputString = '<p>'+inputString+'</p>'
        
        query = "INSERT INTO Fragments (Book, fragmentLineID, fragmentNo, Editor, fragmentContent) VALUES ({0}, {1}, {2}, {3}, '{4}')".format(i_currentBook, nextKey, i_fragmentNo, i_Editor, inputString)
        jsonRequestData(query)
        nextKey += 1


    # TODO NEED TO LOCK THE TABLE BEFORE THIS STUFF
    query = "INSERT INTO Fragments (Book, fragmentLineID, fragmentNo, Editor, fragmentContent) VALUES ({0}, {1}, {2}, {3}, '{4}')".format(i_currentBook, nextKey, i_fragmentNo, i_Editor, i_fragmentContent)
    #query = "INSERT INTO Fragments (Book,fragmentContent) VALUES ({0},'{1}')".format(i_currentBook,i_fragmentContent)
    #query = "INSERT INTO Fragments (Book,fragmentContent) VALUES ({0},'hello there')".format(i_currentBook)

    #jsonRequestData(query)
    

    query = "INSERT INTO FragmentReferencer (Book, Editor, fragmentNo) VALUES ({0}, {1}, {2})".format(i_currentBook, i_Editor, i_fragmentNo)

    return jsonRequestData(query)



@app.route("/insertCommentary")
def insertCommentary():
    i_book = request.args.get("book")
    i_appcrit = request.args.get("appcrit")
    i_diff = request.args.get("diff")
    i_context = request.args.get("context")
    i_trans = request.args.get("trans")
    i_comment = request.args.get("comment")
    i_frag = request.args.get("frag")
    i_ref = request.args.get("ref")

    query = "INSERT INTO F_Translations (Fragment, Translation) VALUES ({0}, '{1}')".format(i_ref, i_trans)
    jsonRequestData(query)
    query = "INSERT INTO F_AppCrit (Fragment, AppCrit) VALUES ({0}, '{1}')".format(i_ref, i_appcrit)
    jsonRequestData(query)
    query = "INSERT INTO F_Differences (FragmentID, Differences) VALUES ({0}, '{1}')".format(i_ref, i_diff)
    jsonRequestData(query)
    query = "INSERT INTO F_Commentary (Fragment, Commentaar) VALUES ({0}, '{1}')".format(i_ref, i_comment)
    return jsonRequestData(query)

@app.route("/insertContext")
def insertContext():
    i_context = request.args.get("context")
    i_author = request.args.get("author")
    i_ref = request.args.get("ref")

    query = "INSERT INTO F_Context (FragmentID, ContextAuthor, Context) VALUES ({0}, '{1}', '{2}')".format(i_ref, i_author, i_context)
    return jsonRequestData(query)

if __name__ == '__main__':
   app.run(host='0.0.0.0', port=5002)
