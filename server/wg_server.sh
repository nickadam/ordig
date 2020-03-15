#!/bin/bash

server="$(grep api_url server/config.json | awk -F \" '{print $4}')"

while [ "$(curl -s -o /dev/null -w "%{http_code}" $server/public/works)" != 200 ]
do
  sleep 1
done

while true
do
  python3 daemon.py &>> daemon.log
done
