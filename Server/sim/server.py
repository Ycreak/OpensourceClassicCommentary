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
# moduleimport='k1'.format(SIM_versie)
# keymodule = KeyModule(moduleimport)
# keymodule.beschikbare_modulegroepen.sort()

# configuratie = Config()

@app.route("/getAuthors")
def ABT2():

    mydb = mysql.connector.connect(
      host="localhost",
      user="Ycreak",
      passwd="YcreakPasswd26!",
      database="myDB"
    )

    mycursor = mydb.cursor()
    mycursor.execute("SELECT Name FROM Authors")
    myresult = mycursor.fetchall()

    for x in myresult:
      print(x)

    return jsonify(myresult)

# Geeft alle primaire tekst terug.
@app.route("/getPrimaryText")
def ABT():
    currentText = request.args.get("currentText")
    r = (currentText)

    mydb = mysql.connector.connect(
      host="localhost",
      user="Ycreak",
      passwd="YcreakPasswd26!",
      database="myDB"
    )

    mycursor = mydb.cursor()
    mycursor.execute("SELECT lineNumber, lineContent FROM (%s)"%(r))

    myresult = mycursor.fetchall()

    mycursor.close()

    for x in myresult:
      print(x)

    return jsonify(myresult)

# Geeft geselecteerd commentaar terug.
@app.route("/getCommentary")
def ABT3():
  requestedLine = request.args.get("requestedLine")
  currentText = request.args.get("currentText")
  currentText = currentText + 'Commentaar'
  t = (requestedLine)
  r = (currentText)
  print('inside this var is: ' + requestedLine + ' just so you know!')
  print('inside this var2 is: ' + currentText + ' just so you know!')

  # check if var is number!
  mydb = mysql.connector.connect(
    host="localhost",
    user="Ycreak",
    passwd="YcreakPasswd26!",
    database="myDB"
  )

  mycursor = mydb.cursor()
  mycursor.execute('SELECT lineStart, lineEnd, lineWords, lineCommentaar, source, pages FROM (%s) WHERE lineStart<=(%s) AND lineEnd>=(%s)'%(r,t,t))
  myresult2 = mycursor.fetchall()
  mycursor.close()


  for x in myresult2:
    print(x)
  return jsonify(myresult2)

if __name__ == '__main__':
   app.run(port=5002)
