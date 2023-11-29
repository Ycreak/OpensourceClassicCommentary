#!/bin/bash
set -eu

DIR="/mnt/nox/home/luukie/"
if ! [[ -d "$DIR" ]]; then
  ### Take action if Nox is not yet mounted
	echo "Mounting Nox"
	sshfs -p 13010 nolden.biz:/ /mnt/nox
else
  ###  Control will jump here if $DIR does NOT exists ###
	echo "Nox already mounted"
fi

cd Server;
rsync -avzPhu cache couch.py server.py utilities.py models endpoints /mnt/nox/home/luukie/Servers/OSCC_staging/;


