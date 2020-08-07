#!/bin/bash
echo 'mounting pax'

if mount | grep /mnt/pax > /dev/null; then
  echo "already mounted"
else
	sshfs -p 13011 luukie@katwijk.nolden.biz:/ /mnt/pax
fi

#echo 'copying documentation'
#rsync -avzuh Documentation/ /mnt/pax/home/luukie/OSCC_Transfer/Documentation/

echo 'building angular'
cd Angular/
ng build --prod
cd ..

echo 'copying angular'
rm -rf /mnt/pax/home/luukie/OSCC_Transfer/public
rsync -avzuh public /mnt/pax/home/luukie/OSCC_Transfer/

echo 'please login on Pax to deploy'
