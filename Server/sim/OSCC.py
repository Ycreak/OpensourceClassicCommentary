# BORS & Ycreak 2020
from flask import Flask, request
from flask_cors import CORS, cross_origin
from flask_restful import Resource, Api
from json import dumps
from flask_jsonpify import jsonify

from flask_mysqldb import MySQL

import collections
import mysql.connector
# import re

import os
salt = os.urandom(32)


# Class imports
import Data
from Hash import Hashing

# -*- coding: utf-8 -*-

app = Flask(__name__)
api = Api(app)

CORS(app)

@app.route("/testHash")
def testHash():
    h = Hashing()
    username = request.args.get('username')
    password = request.args.get('password')

    return h.doHash(username, password)

################
# MYSQL CONFIG #
################
app.config['MYSQL_HOST'] = Data.HOST
app.config['MYSQL_USER'] = Data.USER
app.config['MYSQL_PASSWORD'] = Data.PASSWORD
app.config['MYSQL_DB'] = Data.DB

mysql = MySQL(app)

def jsonRequestData(query):
    cur = mysql.connection.cursor()
    cur.execute(query)
    mysql.connection.commit()
    myresult = cur.fetchall()
    cur.close()
    
    for x in myresult:
        print(x)

    return jsonify(myresult)

# Should be renamed to ProcessData
def requestData(query):
    cur = mysql.connection.cursor()
    cur.execute(query)
    mysql.connection.commit()
    myresult = cur.fetchall()
    cur.close()

    return myresult

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
    query = "SELECT fragmentName, lineName, Editor, fragmentContent, Editor, published, status FROM Fragments WHERE Book={}".format(currentBook)

    return jsonRequestData(query)

@app.route("/getF_AppCrit")
def getF_AppCrit():
    currentBook = request.args.get("currentBook") #Currentbook moet RequestedLine zijn!
    query = "SELECT AppCrit FROM F_AppCrit WHERE Fragment={}".format(currentBook)

    return jsonRequestData(query)

@app.route("/getF_ReferencerID")
def getF_ReferencerID():
    fragment = request.args.get("fragment")
    editorID = request.args.get("editorID")
    currentBook = request.args.get("currentBook")
    print("RequestedLine is: ", fragment, editorID, currentBook)
    query = "SELECT ID FROM FragmentReferencer WHERE FragmentNo={0} AND Editor={1} AND Book={2} AND published = 1".format(fragment,editorID,currentBook)

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
    query = "SELECT ContextAuthor, Context FROM F_Context WHERE Fragment={}".format(currentBook)

    return jsonRequestData(query)

@app.route("/getF_Differences")
def getF_Differences():
    currentBook = request.args.get("currentBook") #Currentbook moet RequestedLine zijn!
    query = "SELECT Differences FROM F_Differences WHERE Fragment={}".format(currentBook)
    return jsonRequestData(query)

# TODO Rename Fragment to Fragment (consistency)
@app.route("/getF_Reconstruction")
def getF_Reconstruction():
    currentBook = request.args.get("currentBook") #Currentbook moet RequestedLine zijn!
    query = "SELECT Reconstruction FROM F_Reconstruction WHERE Fragment={}".format(currentBook)
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
@app.route("/process")
def process():
    command = request.args.get("command")
    print('executing command: ', command)

    inputauthor = request.args.get('inputauthor')
    selectedauthor = request.args.get('selectedauthor')
    inputBook = request.args.get('inputBook')
    selectedBook = request.args.get('selectedBook')
    inputEditor = request.args.get('inputEditor')
    selectedEditor = request.args.get('selectedEditor')

    selectedFragment = request.args.get('selectedFragment')
    selectedLine = request.args.get('selectedLine')

    inputFragNum = request.args.get('inputFragNum')
    inputLineNum = request.args.get('inputLineNum')
    inputFragContent = request.args.get('inputFragContent')
    inputFragStatus = request.args.get('inputFragStatus')

    inputAppCrit = request.args.get('inputAppCrit')
    inputDifferences = request.args.get('inputDifferences')
    inputCommentary = request.args.get('inputCommentary')
    inputTranslation = request.args.get('inputTranslation')
    inputReconstruction = request.args.get('inputReconstruction')

    ReferencerID = request.args.get('ReferencerID')

    inputContext = request.args.get('inputContext')
    inputContextAuthor = request.args.get('inputContextAuthor')

    if command == 'createAuthor':
        query = "INSERT INTO Authors (Name) VALUES ('{0}')".format(inputAuthor)

    elif command == 'deleteAuthor':
        query = "SELECT ID FROM Books WHERE Author = {0}".format(selectedAuthor)

        for book in requestData(query):
            query = "DELETE FROM FragmentReferencer WHERE Book = {0}".format(book[0])
            jsonRequestData(query) 

        query = "DELETE FROM Authors WHERE ID = ({0})".format(selectedAuthor)

    elif command == 'createBook':
        query = "INSERT INTO Books (Author, Title) VALUES ('{0}','{1}')".format(selectedAuthor, inputBook)

    elif command == 'deleteBook':
        query = "DELETE FROM Books WHERE ID = ({0})".format(selectedBook)
        jsonRequestData(query) 
        query = "DELETE FROM FragmentReferencer WHERE Book = {0}".format(selectedBook)

    elif command == 'createEditor':
        query = "INSERT INTO Editors (Book, editorName) VALUES ('{0}','{1}')".format(selectedBook, inputEditor)
    
    elif command == 'deleteEditor':
        query = "DELETE FROM Editors WHERE ID = ({0})".format(selectedEditor)
        #Delete ReferencerID

    elif command == 'setMainEditor':
        query = "UPDATE Editors SET defaultEditor = 1 WHERE ID = ({0})".format(selectedEditor)
 
    elif command == 'deleteMainEditor':
        query = "UPDATE Editors SET defaultEditor = NULL WHERE ID = ({0})".format(selectedEditor)

    elif command == 'createFragment':
        query = "INSERT INTO Fragments (Book, fragmentName, lineName, Editor, FragmentContent, status) VALUES ({0},'{1}','{2}',{3},'{4}','{5}')".format(selectedBook, inputFragNum, inputLineNum, selectedEditor, inputFragContent, inputFragStatus)
        jsonRequestData(query) 

        query = "INSERT INTO FragmentReferencer (Book, Editor, FragmentNo) VALUES ({0},{1},{2})".format(selectedBook, selectedEditor, inputFragNum)
        # This needs to be a catch

    elif command == 'deleteFragment':
        query = "DELETE FROM Fragments WHERE FragmentName = '{0}' AND Book = '{1}' AND Editor = '{2}'".format(selectedFragment, selectedBook, selectedEditor)
        #Delete ReferencerID

    elif command == 'createFragCommentary': # NEEDS TO CHECK IF GIVEN VALUES ARE NOT NULL: IF THEY ARE, DO NOT INPUT ANYTHING.
        print('data',ReferencerID,inputAppCrit)
        
        if not inputAppCrit == '':
            query = "INSERT INTO F_AppCrit (Fragment, AppCrit) VALUES ({0},'{1}')".format(ReferencerID, inputAppCrit)
            jsonRequestData(query) 
        
        if not inputCommentary == '':        
            query = "INSERT INTO F_Commentary (Fragment, Commentaar) VALUES ({0},'{1}')".format(ReferencerID, inputCommentary)
            jsonRequestData(query) 
        
        if not inputDifferences == '':
            query = "INSERT INTO F_Differences (Fragment, Differences) VALUES ({0},'{1}')".format(ReferencerID, inputDifferences)
            jsonRequestData(query) 

        if not inputReconstruction == '':      
            query = "INSERT INTO F_Reconstruction (Fragment, Reconstruction) VALUES ({0},'{1}')".format(ReferencerID, inputReconstruction)
            jsonRequestData(query) 
        
        if not inputTranslation == '':
            query = "INSERT INTO F_Translations (Fragment, Translation) VALUES ({0},'{1}')".format(ReferencerID, inputTranslation)
            jsonRequestData(query) 

        return {}

    elif command == 'createContext':
        query = "INSERT INTO F_Context (Fragment, ContextAuthor, Context) VALUES ({0},'{1}','{2}')".format(ReferencerID, inputContextAuthor, inputContext)

    elif command == 'reviseFragCommentary':
        if not inputAppCrit == '':
            query = "UPDATE F_AppCrit SET AppCrit = '{0}' WHERE Fragment = ({1})".format(inputAppCrit, ReferencerID)
            jsonRequestData(query)        

        if not inputDifferences == '':
            query = "UPDATE F_Differences SET Differences = '{0}' WHERE Fragment = ({1})".format(inputDifferences, ReferencerID)
            jsonRequestData(query)        

        if not inputCommentary == '':
            query = "UPDATE F_Commentary SET Commentaar = '{0}' WHERE Fragment = ({1})".format(inputCommentary, ReferencerID)
            jsonRequestData(query)        

        if not inputTranslation == '':
            query = "UPDATE F_Translations SET Translation = '{0}' WHERE Fragment = ({1})".format(inputTranslation, ReferencerID)
            jsonRequestData(query)        

        if not inputReconstruction == '':
            query = "UPDATE F_Reconstruction SET Reconstruction = '{0}' WHERE Fragment = ({1})".format(inputReconstruction, ReferencerID)
            jsonRequestData(query)        

        return {}
        # if not inputAppCrit == '':

    elif command == 'reviseFragContext':
        query = "UPDATE F_Context SET Context = '{0}' WHERE Fragment = ({1}) AND ContextAuthor = '{2}'".format(inputContext, ReferencerID, inputContextAuthor)

    elif command == 'reviseFragContent':
        query = "UPDATE Fragments SET fragmentContent = '{0}' WHERE Book = '{1}' AND fragmentName = '{2}' AND lineName = '{3}'".format(inputFragContent, selectedBook, selectedFragment, selectedLine)

    elif command == 'publishFragment':
        query = "UPDATE FragmentReferencer SET published = 1 WHERE Editor = {0} AND Book = {1} AND fragmentNo = {2}".format(selectedEditor, selectedBook, selectedFragment)

    elif command == 'unpublishFragment':
        query = "UPDATE FragmentReferencer SET published = NULL WHERE Editor = {0} AND Book = {1} AND fragmentNo = {2}".format(selectedEditor, selectedBook, selectedFragment)


    return jsonRequestData(query)        


@app.route("/insertFragment")
def insertFragment():


    i_fragmentNo = request.args.get("fragmentNo")
    i_Editor = request.args.get("editor")
    i_fragmentContent = request.args.get("content")
    i_primaryFrag = request.args.get("primFrag")
        
    query = "INSERT INTO Fragments (Book, fragmentLineID, fragmentNo, Editor, fragmentContent) VALUES ({0}, {1}, {2}, {3}, '{4}')".format(i_currentBook, nextKey, i_fragmentNo, i_Editor, i_fragmentContent)
    jsonRequestData(query)
    
    if i_primaryFrag == "1":
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
    query = "INSERT INTO F_Differences (Fragment, Differences) VALUES ({0}, '{1}')".format(i_ref, i_diff)
    jsonRequestData(query)
    query = "INSERT INTO F_Commentary (Fragment, Commentaar) VALUES ({0}, '{1}')".format(i_ref, i_comment)
    return jsonRequestData(query)

@app.route("/insertContext")
def insertContext():
    i_context = request.args.get("context")
    i_author = request.args.get("author")
    i_ref = request.args.get("ref")

    query = "INSERT INTO F_Context (Fragment, ContextAuthor, Context) VALUES ({0}, '{1}', '{2}')".format(i_ref, i_author, i_context)
    return jsonRequestData(query)

if __name__ == '__main__':
   app.run(host='0.0.0.0', port=5002)
