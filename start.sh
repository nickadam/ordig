#!/bin/bash

cd /opt/ordig

docker-compose up -d

sleep 10

cd server

nohup ./wg_server.sh &

echo "Server started!"
