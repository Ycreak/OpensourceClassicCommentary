#!/bin/bash
echo 'mounting pax'

if mount | grep /mnt/pax > /dev/null; then
  echo "already mounted"
else
	sshfs -p 13011 luukie@katwijk.nolden.biz:/ /mnt/pax
fi

echo 'copying documentation'
cp -r Documentation /mnt/pax/home/luukie/OSCC_Transfer/

echo 'building angular'
cd Angular/
ng build --prod
cd ..

echo 'copying angular'
cp -r public /mnt/pax/home/luukie/OSCC_Transfer/

echo 'please login on Pax to deploy'
