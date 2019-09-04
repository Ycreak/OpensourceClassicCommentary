from flask import Flask, request
from flask_cors import CORS, cross_origin
from flask_restful import Resource, Api
from json import dumps
from flask_jsonpify import jsonify
# from run import *
# import pyodbc
import collections
import mysql.connector

# -*- coding: utf-8 -*-

app = Flask(__name__)
api = Api(app)

CORS(app)

# configuratie = Config()

@app.route("/getAuthors")
def ABT2():

    mydb = mysql.connector.connect(
      host="localhost",
      user="Ycreak",
      passwd="YcreakPasswd26!",
      database="OSCC"
    )

    mycursor = mydb.cursor()
    mycursor.execute("SELECT ID, Name FROM Authors")
    myresult = mycursor.fetchall()

    for x in myresult:
      print(x)

    return jsonify(myresult)

# Geeft alle primaire tekst terug.
@app.route("/getBooks")
def ABT8():
    authorEntry = request.args.get("authorEntry")

    r = (authorEntry)

    mydb = mysql.connector.connect(
      host="localhost",
      user="Ycreak",
      passwd="YcreakPasswd26!",
      database="OSCC"
    )

    mycursor = mydb.cursor()
    mycursor.execute("SELECT ID, Title FROM Books WHERE Author=(%s)"%(r))

    myresult = mycursor.fetchall()

    mycursor.close()

    for x in myresult:
      print(x)

    return jsonify(myresult)

# Geeft alle primaire tekst terug.
@app.route("/getBibliography")
def sendBibliography():
#    currentBook = request.args.get("currentBook")
    currentBook = request.args.get("currentText")
    r = (currentBook)
    #r = 1
    print("Bib: currentBook is the following:")
    print(r)

    mydb = mysql.connector.connect(
      host="localhost",
      user="Ycreak",
      passwd="YcreakPasswd26!",
      database="OSCC"
    )

    mycursor = mydb.cursor()
    mycursor.execute("SELECT Editors, Author, Book, Article, Journal, Volume, ChapterTitle, Pages, Place, Year, Website, URL, ConsultDate FROM Bibliography WHERE Text=(%s)"%(r))

    myresult = mycursor.fetchall()

    mycursor.close()

    for x in myresult:
      print(x)

    return jsonify(myresult)

# Geeft alle primaire tekst terug.
@app.route("/getPrimaryText")
def ABT():
    currentBook = request.args.get("currentBook")
    r = (currentBook)
    print("Primary text: currentBook is the following:")
    print(r)

    mydb = mysql.connector.connect(
      host="localhost",
      user="Ycreak",
      passwd="YcreakPasswd26!",
      database="OSCC"
    )

    mycursor = mydb.cursor()
    mycursor.execute("SELECT lineNumber, lineContent FROM Text WHERE Book=(%s)"%(r))

    myresult = mycursor.fetchall()

    mycursor.close()

    #for x in myresult:
    #  print(x)

    return jsonify(myresult)

# Geeft geselecteerd commentaar terug.
@app.route("/getCommentary")
def ABT3():
  requestedLine = request.args.get("requestedLine")
  currentBook = request.args.get("currentBook")
  # currentBook = currentBook + 'Commentaar'
  t = (requestedLine)
  r = (currentBook)
  print('inside this var is: ' + requestedLine + ' just so you know!')
  print('inside this var2 is: ' + currentBook + ' just so you know!')

  # check if var is number!
  mydb = mysql.connector.connect(
    host="localhost",
    user="Ycreak",
    passwd="YcreakPasswd26!",
    database="OSCC"
  )

  mycursor = mydb.cursor()
  mycursor.execute('SELECT lineStart, lineEnd, lineWords, lineCommentaar, source, pages FROM Comments WHERE Text=(%s) AND lineStart<=(%s) AND lineEnd>=(%s)'%(r,t,t))
  myresult2 = mycursor.fetchall()
  mycursor.close()


  for x in myresult2:
    print(x)
  return jsonify(myresult2)

# Geeft tweede laag commentaar terug.
@app.route("/getSecondaryCommentary")
def ABT233():
  currentBook = request.args.get("currentBook")
  # currentBook = currentBook + 'Commentaar'
  r = (currentBook)
  #print('inside this var is: ' + requestedLine + ' just so you know!')
  #print('inside this var2 is: ' + currentBook + ' just so you know!')

  # check if var is number!
  mydb = mysql.connector.connect(
    host="localhost",
    user="Ycreak",
    passwd="YcreakPasswd26!",
    database="OSCC"
  )

  mycursor = mydb.cursor()
  mycursor.execute('SELECT lineStart, lineEnd, lineCommentaar FROM Comments2 WHERE Text=(%s)'%(r))
  myresult2 = mycursor.fetchall()
  mycursor.close()


  for x in myresult2:
    print(x)
  return jsonify(myresult2)

if __name__ == '__main__':
   app.run(host='0.0.0.0', port=5002)
