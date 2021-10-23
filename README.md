# ordig
Automatic WireGuard VPN for Windows

Granting clients access to internal resources from anywhere can be a pain. Getting a VPN, configuring it, teaching your users how to connect and disconnect from VPN. It's a lot of work. Ordig tries to simplify this work by scripting as much as possible. With ordig you can setup a WireGuard server and distribute a single PowerShell script to your computers to get them each joined to the server. By default ordig works in a split tunnel mode. Only traffic to your internal domain will be sent through the proxy. Internet and LAN traffic are not affected.

## Installation

All you need to get started is an Ubuntu 20.04 box on your desired network. Your server should have an internet accessible name with ports `tcp/80`, `tcp/443`, and a UDP port of your choosing for WireGuard traffic, default is `udp/51820`.

Copy the `install.sh` script to your system and run as root.

```
curl -s -o install.sh https://raw.githubusercontent.com/nickadam/ordig/master/install.sh
chmod +x install.sh
sudo ./install.sh
```

This script will install WireGuard, docker, and all other dependencies. Follow the prompts to configure ordig for your environment.

`Interface name for WireGuard [wg0]: ` This interface name will be used on the server and clients


`Network for clients [10.100.0.0/16]: ` This network should not conflict with your internal network or the client's LAN


`DNS namespace to redirect internal traffic [example.local]: ` Any requests from the client to server.example.local will be resolved via your internal DNS server

`DNS server to use for internal traffic [10.10.10.10]: ` Your internal DNS server


`Networks use for internal traffic [10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16]: ` By default all RFC1918, you may want more or less

`UDP port clients will connect to [51820]: ` The UDP port for clients to connect to WireGuard


`Server name [wg.example.com]: ` The name used by the API and WireGuard

After completing all these prompts, the installation will occur and your server will be started.

Copy `/opt/ordig/wg.ps1` to your clients and run as administrator. This script contains a shared client API key.

## ⚠ WARNING ⚠

### Anyone that has access to or a copy of `wg.ps1` will have access to your network.

This script will install wireguard, and a monitoring service. The monitoring service will continually check that the client has access to query your internal DNS server. If it's not available it will toggle the client's VPN up or down.

To turn off the VPN from the client, turn off and set the WireGuardTunnel service to disabled. The accompanying WireGuardWatcherDaemon will clean up any DNS changes and stop itself.

The API docs are accessible at `https://{YOUR SERVER}/api/docs/`

Access to the API is secured via Let's Encrypt and Caddy!

## Backup & Restore

There are only two files that need to be backed up:
- `/opt/ordig/config.json`
- `/opt/ordig/data/ordig.sqlite3`

To rebuild a server - go through the install process, replace these two files, and run the following commands as root.
```
cd /opt/ordig

# create docker-compose.yml
jinja2 docker-compose-template.yml config.json > docker-compose.yml

# create wg.ps1
jinja2 windows_client/wg-template.ps1 config.json > wg.ps1

# create server config
jinja2 server/config-template.json config.json > server/config.json

# create Caddyfile
jinja2 Caddyfile-template config.json > Caddyfile

reboot
```

Enjoy!
