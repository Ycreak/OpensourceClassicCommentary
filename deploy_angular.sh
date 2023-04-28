#!/bin/bash
DIR="/mnt/nox/home/luukie/"
if ! [[ -d "$DIR" ]]; then
  ### Take action if Nox is not yet mounted
	echo "Mounting Nox"
	sshfs -p 13010 nolden.biz:/ /mnt/nox
else
  ###  Control will jump here if $DIR does NOT exists ###
	echo "Nox already mounted"
fi

rm -rfv /mnt/nox/var/www/oscc/* && cd Angular && ng build --configuration=production && cp -rv dist/OpenSourceClassicCommentary/* /mnt/nox/var/www/oscc/;



