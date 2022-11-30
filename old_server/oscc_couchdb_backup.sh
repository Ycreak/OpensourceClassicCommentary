#!/bin/sh
foldername=$(date +%Y_%m_%d)
mkdir -p  ./server_backups/"$foldername"

curl -X GET http://admin:yVu4DES8qzajPCy@oscc.nolden.biz:5984/fragments/_all_docs?include_docs=true > ./server_backups/"$foldername"/fragments.json

curl -X GET http://admin:yVu4DES8qzajPCy@oscc.nolden.biz:5984/users/_all_docs?include_docs=true > ./server_backups/"$foldername"/users.json
