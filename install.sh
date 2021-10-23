#!/bin/bash

# Check if running as root
if [ "$EUID" -ne 0 ]
  then echo "Please run as root"
  exit 1
fi

# Prompt for environment
WG_SERVER_API_KEY="$(tr -c -d '0123456789abcdefghijklmnopqrstuvwxyz' </dev/urandom | dd bs=64 count=1 2>/dev/null)"
WG_CLIENT_API_KEY="$(tr -c -d '0123456789abcdefghijklmnopqrstuvwxyz' </dev/urandom | dd bs=64 count=1 2>/dev/null)"
echo "Press enter to accept [defaults]"
echo -n "Interface name for WireGuard [wg0]: "
read i
WG_NAME=${i:=wg0}
echo -n "Network for clients [10.100.0.0/16]: "
read i
WG_POOL=${i:=10.100.0.0/16}
WG_IP="$(echo $WG_POOL | sed 's/\.[0-9]\/\+[0-9]\+$/.1/')"
echo -n "DNS namespace to redirect internal traffic [example.local]: "
read i
WG_NAMESPACE=${i:=example.local}
echo -n "DNS server to use for internal traffic [10.10.10.10]: "
read i
WG_NAMESERVER=${i:=10.10.10.10}
echo -n "Networks use for internal traffic [10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16]: "
read i
WG_ALLOWED=${i:=10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16}
echo -n "UDP port clients will connect to [51820]: "
read i
WG_PORT=${i:=51820}
echo -n "Server name [wg.example.com]: "
read i
WG_ENDPOINT=${i:=wg.example.com}

# Docker should be installed
if ! which docker > /dev/null
then
  apt-get update
  apt-get install -y \
    apt-transport-https \
    ca-certificates \
    curl \
    software-properties-common
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg | apt-key add -
  add-apt-repository \
   "deb [arch=amd64] https://download.docker.com/linux/ubuntu \
   $(lsb_release -cs) \
   stable"
   apt-get update
   apt-get install -y docker-ce
fi

# Docker compose should be installed
if ! which docker-compose >/dev/null
then
  curl -L "https://github.com/docker/compose/releases/download/v2.0.1/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
  chmod +x /usr/local/bin/docker-compose
fi

# WireGuard should be installed
if ! which wg > /dev/null
then
  add-apt-repository -y ppa:wireguard/wireguard
  apt-get update
  apt-get install -y wireguard
fi

# git should be installed
apt-get install -y git python3-pip

# install jinja2-cli
if ! which jinja2
then
  pip3 install jinja2-cli
fi

# clone ordig
if [ ! -d /opt/ordig ]
then
  cd /opt
  git clone https://github.com/nickadam/ordig.git
fi
cd /opt/ordig

# create docker-compose
echo '{
  "WG_NAME": "'"${WG_NAME}"'",
  "WG_IP": "'"${WG_IP}"'",
  "WG_POOL": "'"${WG_POOL}"'",
  "WG_NAMESPACE": "'"${WG_NAMESPACE}"'",
  "WG_NAMESERVER": "'"${WG_NAMESERVER}"'",
  "WG_PORT": "'"${WG_PORT}"'",
  "WG_ENDPOINT": "'"${WG_ENDPOINT}"'",
  "WG_ALLOWED": "'"${WG_ALLOWED}"'",
  "WG_SERVER_API_KEY": "'"${WG_SERVER_API_KEY}"'",
  "WG_CLIENT_API_KEY": "'"${WG_CLIENT_API_KEY}"'"
}' > config.json
jinja2 docker-compose-template.yml config.json > docker-compose.yml

# create wg.ps1
jinja2 windows_client/wg-template.ps1 config.json > wg.ps1

# create server config
jinja2 server/config-template.json config.json > server/config.json

# create Caddyfile
jinja2 Caddyfile-template config.json > Caddyfile

# make data dirs
mkdir /opt/ordig/caddy-data
mkdir /opt/ordig/data

# create startup
cat <<EOF > /etc/systemd/system/ordig.service
[Unit]
Description=ordig

[Service]
ExecStart=/opt/ordig/start.sh

[Install]
WantedBy=multi-user.target
EOF

systemctl enable ordig
systemctl start ordig

echo ""
echo "Install complete!"
echo ""
echo "Server started!"
echo ""
echo "Copy /opt/ordig/wg.ps1 to your windows clients and run as administrator"
echo ""
