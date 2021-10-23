#!/bin/bash

# Check if running as root
if [ "$EUID" -ne 0 ]
  then echo "Please run as root"
  exit 1
fi

# accept forwarding packets
iptables -P FORWARD ACCEPT
if ! grep "^net.ipv4.ip_forward=1$" /etc/sysctl.conf > /dev/null
then
  echo net.ipv4.ip_forward=1 >> /etc/sysctl.conf
  sysctl -p
fi

# masq outbound interface
dev=$(ip route get 10.0.0.0 | grep -Po "(?<=(dev ))(\S+)")
if ! iptables -S -t nat | grep "\-o $dev \-j MASQUERADE" > /dev/null
then
  iptables -t nat -A POSTROUTING -o $dev -j MASQUERADE
fi

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
