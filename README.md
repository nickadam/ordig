# ordig
Automatic WireGuard VPN for Windows

Granting clients access to internal resources from anywhere can be a pain. Getting a VPN, configuring it, teaching your users how to connect and disconnect from VPN. It's a lot of work. Ordig tries to simplify this work by scripting as much as possible. With ordig you can setup a WireGuard server and distribute a single PowerShell script to your computers to get them each joined to the server. By default ordig works in a split tunnel mode. Only traffic to your internal domain will be sent through the proxy. Internet and LAN traffic are not affected.

## Installation

All you need to get started is an Ubuntu 18.04 box on your desired network. Your server should have an internet accessible name with ports `tcp/80`, `tcp/443`, and a UDP port of your choosing for WireGuard traffic, default is `udp/51820`.

Copy the `install.sh` script to your system and run as root.

```
curl -s -o install.sh https://raw.githubusercontent.com/nickadam/ordig/master/install.sh
sudo sh install.sh
```

This script will install WireGuard, docker, and all other dependencies. Follow the prompts to configure ordig for your environment.

`Interface name for WireGuard [wg0]: ` This interface name will be used on the server and clients


`Network for clients [10.100.0.0/16]: ` This network should not conflict with your internal network or the client's LAN


`DNS namespace to redirect internal traffic [example.local]: ` Any requests from the client to server.example.local will be resolved via your internal DNS server

`DNS server to use for internal traffic [10.10.10.10]: ` Your internal DNS server


`Networks use for internal traffic [10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16]: ` By default all RFC1918, you may want more or less

`UDP port clients will connect to [51820]: ` The UDP port for clients to connect to WireGuard


`Server name [wg.example.com]: ` The name used by the API and WireGuard

After completing all these prompts the installation will occur and you will be prompted to start the server.

```
sudo /opt/ordig/start.sh
```

Copy `/opt/ordig/wg1.ps1` to your clients and run as administrator. This script contains a shared client API key. 

WARNING: Anyone that has access to this script will have access to your network.

This script will install wireguard, and a monitoring service. The monitoring service will continually check that the client has access to query your internal DNS server. If it's not available it will toggle the client's VPN up or down.

Access to the API is secured via Let's Encrypt and Caddy!

Enjoy!
