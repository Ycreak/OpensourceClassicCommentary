from flask import Flask, request
from flask_cors import CORS, cross_origin
from flask_restful import Resource, Api
from json import dumps
from flask_jsonpify import jsonify
from run import *

import mysql.connector
import sqlite3

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

    temp = "hello there"
    return jsonify(myresult)
    # return jsonify(statements)

@app.route("/4")
def JSON_init():

  opt_param = request.args.get("test1")
  print('inside this var is: ' + opt_param + ' just so you know!')
  print('hello!')

  conn = sqlite3.connect(
    host="localhost",
    user="Ycreak",
    passwd="YcreakPasswd26!",
    database="myDB"
    )

  c = conn.cursor()

  t = (2,)
  # c.execute('SELECT * FROM ThyestesCommentaar WHERE lineStart=(%s)', t)
  c.execute("""
    SELECT
        *
    FROM
        ThyestesCommentaar
    WHERE
       lineStart=%s""", (t,))
  myresult2 = c.fetchall()
  for x in myresult2:
    print(x)

  # Save (commit) the changes
  conn.commit()

  # We can also close the connection if we are done with it.
  # Just be sure any changes have been committed or they will be lost.
  conn.close()


  # mycursor = mydb.cursor()

  # mycursor.execute('SELECT lineCommentaar FROM ThyestesCommentaar WHERE lineStart=?', (2))
  # myresult2 = mycursor.fetchall()
  # for x in myresult2:
  #   print(x)

  # mycursor.execute("SELECT lineCommentaar FROM ThyestesCommentaar WHERE lineStart = 2")

  # myresult = mycursor.fetchall()

  # print('gebruikende opt_param')
  # for x in myresult:
  #   print(x)

    # return jsonify(statements)


# res = dict()

  return jsonify(opt_param)


if __name__ == '__main__':
   app.run(port=5002)
