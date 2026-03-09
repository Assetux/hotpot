/**
 * Generate a .mobileconf (Apple-style mobileconfig XML) file
 * containing thousands of WiFi network payloads.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Pool of realistic SSID prefixes
const SSID_PREFIXES = [
  'NetSpot', 'FreeWiFi', 'CityConnect', 'OpenNet', 'PublicAP',
  'HotZone', 'ConnectFree', 'UrbanLink', 'MetroWiFi', 'CafeNet',
  'ParkConnect', 'TransitWiFi', 'LibraryNet', 'MallConnect', 'AirportFree',
  'StationWiFi', 'PlazaNet', 'SquareConnect', 'MarketWiFi', 'HubLink',
  'CommunityNet', 'GreenSpot', 'QuickConnect', 'EasyWiFi', 'SmartLink',
  'WaveNet', 'BeamConnect', 'FlashWiFi', 'PulseNet', 'CoreLink',
];

const CITIES = [
  'NYC', 'LAX', 'CHI', 'HOU', 'PHX', 'SAN', 'DAL', 'AUS',
  'MIA', 'DEN', 'SEA', 'BOS', 'ATL', 'PDX', 'LDN', 'BER',
  'TKY', 'PAR', 'AMS', 'DXB', 'SYD', 'TOR', 'SGP', 'HKG',
];

function generatePassword(length = 16) {
  return crypto.randomBytes(length).toString('base64url').slice(0, length);
}

function generateUUID() {
  return crypto.randomUUID();
}

function generatePayload(index) {
  const prefix = SSID_PREFIXES[index % SSID_PREFIXES.length];
  const city = CITIES[index % CITIES.length];
  const ssid = `${prefix}_${city}_${String(index).padStart(4, '0')}`;
  const password = generatePassword();
  const uuid = generateUUID();

  return `    <dict>
      <key>PayloadType</key>
      <string>com.apple.wifi.managed</string>
      <key>PayloadVersion</key>
      <integer>1</integer>
      <key>PayloadIdentifier</key>
      <string>net.hotspot.wifi.${index}</string>
      <key>PayloadUUID</key>
      <string>${uuid}</string>
      <key>PayloadDisplayName</key>
      <string>${ssid}</string>
      <key>SSID_STR</key>
      <string>${ssid}</string>
      <key>Password</key>
      <string>${password}</string>
      <key>EncryptionType</key>
      <string>WPA2</string>
      <key>AutoJoin</key>
      <true/>
      <key>IsHotspot</key>
      <false/>
      <key>ProxyType</key>
      <string>None</string>
    </dict>`;
}

function generateMobileConfig(count = 2000) {
  const profileUUID = generateUUID();
  const payloads = [];

  for (let i = 0; i < count; i++) {
    payloads.push(generatePayload(i));
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>PayloadContent</key>
  <array>
${payloads.join('\n')}
  </array>
  <key>PayloadDisplayName</key>
  <string>Net WiFi Hotspot Network</string>
  <key>PayloadIdentifier</key>
  <string>net.hotspot.profile</string>
  <key>PayloadOrganization</key>
  <string>Net Hotspot Network</string>
  <key>PayloadRemovalDisallowed</key>
  <false/>
  <key>PayloadType</key>
  <string>Configuration</string>
  <key>PayloadUUID</key>
  <string>${profileUUID}</string>
  <key>PayloadVersion</key>
  <integer>1</integer>
  <key>PayloadDescription</key>
  <string>Automatically connect to ${count} verified WiFi hotspots in the Net network.</string>
</dict>
</plist>`;

  const outDir = path.join(__dirname, '..', 'configs');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const outPath = path.join(outDir, 'networks.mobileconf');
  fs.writeFileSync(outPath, xml, 'utf-8');
  console.log(`✅ Generated ${count} WiFi payloads → ${outPath}`);
  console.log(`   File size: ${(fs.statSync(outPath).size / 1024).toFixed(1)} KB`);
}

const count = parseInt(process.argv[2], 10) || 2000;
generateMobileConfig(count);
