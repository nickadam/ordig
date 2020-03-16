#!/bin/bash

cd /opt/ordig

docker-compose up -d

cd server

server="$(grep api_url config.json | awk -F \" '{print $4}')"

while [ "$(curl -s -o /dev/null -w "%{http_code}" $server/public/works)" != 200 ]
do
  echo "Waiting for API..."
  sleep 5
done

nohup ./wg_server.sh >/dev/null &

sleep 2

wg show

echo ""
echo ""
echo "Server started!"
echo ""
echo "Copy /opt/ordig/wg.ps1 to your windows clients and run as administrator"
echo ""
echo ""
