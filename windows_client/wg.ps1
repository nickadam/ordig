$WG_URL = "http://battery.hcpss.org:9000"
$WG_KEY = ""
$HEADER = @{"Authorization"="Bearer "+ $WG_KEY}
$FolderPath = "C:\ProgramData\WireGuard"

Function Get-RandomKey() {
  $c = "ABCDEFGHKLMNOPRSTUVWXYZabcdefghiklmnoprstuvwxyz1234567890"
  $r = 1..64 | ForEach { Get-Random -Maximum $c.length }
  $private:ofs=""
  return [String]$c[$r]
}

# Make WireGuard Folder
if(-not (Test-Path $FolderPath)){
  mkdir $FolderPath
}

# Make an ID file
if(-not (Test-Path ($FolderPath + "\client_id"))){
  hostname | Out-File -Encoding Default ($FolderPath + "\client_id")
}

# Get the ID
$client_id = (Get-Content ($FolderPath + "\client_id")).toString()

# Generate a shared key for the config
if(-not (Test-Path ($FolderPath + "\config_key"))){
  Get-RandomKey | Out-File -Encoding Default ($FolderPath + "\config_key")
}

# Get the key
$config_key = (Get-Content ($FolderPath + "\config_key")).toString()

# check if wg is installed
if(-not (Test-Path "C:\Program Files\WireGuard\wireguard.exe")){
  (New-Object System.Net.WebClient).DownloadFile("https://secminio.hcpss.org/public/wireguard-amd64-0.0.38.msi", ($FolderPath + "\wireguard-amd64-0.0.38.msi"))
  & ($FolderPath + "\wireguard-amd64-0.0.38.msi") /quiet /qn /log ($FolderPath + "\wireguard-amd64-0.0.38.log")
  Start-Sleep 60
}

# Get client config
$Body = @{ "key" = $config_key; } | ConvertTo-Json -Compress
$Uri = $WG_URL + "/api/v1/devices/" + $client_id + "/config"
$r = Invoke-WebRequest -UseBasicParsing -Uri $Uri -Headers $HEADER -Method POST -Body $Body -ContentType "application/json"
if($r.StatusCode -eq 200){
  # Write the config
  $Config = $r.Content | ConvertFrom-Json
  $Config.config | Out-File -NoNewline -Encoding Default ($FolderPath + "\" + $Config.name + ".conf")

  # Install the service
  if(-not (Get-Service | Where{$_.name -eq ("WireGuardTunnel`$" + $Config.name)})){
    & "C:\Program Files\WireGuard\wireguard.exe" /installtunnelservice ($FolderPath + "\" + $Config.name + ".conf")
  }

  # Start the service
  if((Get-Service ("WireGuardTunnel`$" + $Config.name)).Status -ne "Running"){
    Start-Service ("WireGuardTunnel`$" + $Config.name)
  }

  # Add a proxy DNS for domain
  if(-not (Get-DnsClientNrptRule | Where{$_.NameServer -eq $Config.nameserver})){
    Add-DnsClientNrptRule -Namespace $Config.namespace -NameServers $Config.nameserver
  }
}
