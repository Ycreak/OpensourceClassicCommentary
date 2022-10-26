#!/bin/bash
sshfs nolden.biz:/ /mnt/nox -p 13010 && rm -rfv /mnt/nox/home/luukie/OSCC/staging_server/* && cp -rv Server/* /mnt/nox/home/luukie/OSCC/staging/server/ && cd Angular && ng build && 



