from flask import Flask, request
from flask_cors import CORS, cross_origin
from flask_restful import Resource, Api
from json import dumps
from flask_jsonpify import jsonify
from run import *
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

configuratie = Config()

""" Zie hier de REST server. Deze methoden worden middels
	get-requests binnen gehaald bij de front end.
"""

""" Returnt de complete JSON tree van een keymodule
	Te gebruiken bij het initialiseren van de interface
	@author bors
"""
@app.route("/2")
def ABT2():

    mydb = mysql.connector.connect(
      host="localhost",
      user="Ycreak",
      passwd="YcreakPasswd26!",
      database="myDB"
    )

    mycursor = mydb.cursor()

    mycursor.execute("SELECT lineCommentaar FROM ThyestesCommentaar")

    myresult = mycursor.fetchall()

    for x in myresult:
      print(x)

    # temp = "hello there"
    return jsonify(myresult)
    # return jsonify(statements)

# Geeft alle primaire tekst terug.
@app.route("/3")
def ABT():

    mydb = mysql.connector.connect(
      host="localhost",
      user="Ycreak",
      passwd="YcreakPasswd26!",
      database="myDB"
    )

    mycursor = mydb.cursor()

    mycursor.execute("SELECT lineContent FROM Thyestes")

    myresult = mycursor.fetchall()

    for x in myresult:
      print(x)

    return jsonify(myresult)

# Geeft geselecteerd commentaar terug.
@app.route("/4")
def ABT3():
  opt_param = request.args.get("test1")
  print('inside this var is: ' + opt_param + ' just so you know!')

  mydb = mysql.connector.connect(
    host="localhost",
    user="Ycreak",
    passwd="YcreakPasswd26!",
    database="myDB"
  )

  mycursor = mydb.cursor()

  t = (opt_param)
  mycursor.execute('SELECT lineStart, lineEnd, lineWords, lineCommentaar, source FROM ThyestesCommentaar WHERE lineStart<=(%s) AND lineEnd>=(%s)'%(t,t))
  myresult2 = mycursor.fetchall()
  for x in myresult2:
    print(x)

  return jsonify(myresult2)
  # return jsonify(lineWords=myresult2.lineWords,lineCommentaar=myresult2.lineCommentaar,source=myresult2.source)



if __name__ == '__main__':
   app.run(port=5002)
