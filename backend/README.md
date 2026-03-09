# Hotpot Backend

Node.js REST API powering the Hotpot Network — a decentralized WiFi hotspot sharing and VPN platform built on Solana.

## Overview

The backend handles:
- **Device registry** — tracks active hotspot hosts via periodic pings
- **ASX balance ledger** — credits deposits, deducts VPN/hotspot usage
- **On-chain top-up verification** — parses Solana transactions to confirm ASX transfers to treasury
- **VPN integration** — proxies the NetSepio/Erebrus WireGuard credential flow
- **Hotspot discovery** — stores host network details and serves them to clients by country
- **Pricing** — fetches live ASX/USD rate from DexScreener; charges $0.10 USD/GB

## Stack

- **Runtime**: Node.js (ESM-free, `'use strict'`)
- **Framework**: Express 4
- **Blockchain**: `@solana/web3.js` for on-chain transaction parsing
- **Storage**: Flat-file JSON (`data/db.json`) — no database required
- **Pricing oracle**: DexScreener API (cached 60 s)
- **Geolocation**: ip-api.com (free tier)

## Project Structure

```
backend/
├── server.js          # All routes and business logic
├── data/
│   └── db.json        # Persistent device/balance/session state
├── configs/
│   └── networks.mobileconf   # Apple .mobileconfig for static WiFi networks
└── scripts/           # Utility scripts
```

## Environment Variables

Create a `.env` file (never commit it):

```env
HELIUS_API_KEY=your-helius-api-key
RPC_URL=https://mainnet.helius-rpc.com/?api-key=your-helius-api-key
TREASURY_WALLET=your-solana-wallet-address
VPN_HOST=vpn.yourdomain.com
PORT=3000
```

| Variable | Default | Description |
|---|---|---|
| `HELIUS_API_KEY` | — | Helius RPC key (used if `RPC_URL` not set) |
| `RPC_URL` | Solana mainnet public | Solana RPC endpoint |
| `TREASURY_WALLET` | hardcoded fallback | Wallet that receives ASX top-up payments |
| `VPN_HOST` | `vpn.hotpot.assetux.com` | Hostname returned to VPN clients |
| `PORT` | `3000` | HTTP listen port |

## Running

```bash
npm install
npm start          # production
npm run dev        # development (nodemon)
```

## API Reference

### General

| Method | Path | Description |
|---|---|---|
| `GET` | `/health` | Server status, uptime, treasury balance |
| `GET` | `/api/stats` | Active hotspots, coverage, average speed, ASX price |
| `GET` | `/api/rate/asx` | Live ASX/USD rate and cost per GB |
| `GET` | `/api/countries` | Countries with active hotspot hosts |
| `GET` | `/api/geolocate` | Detect client country from IP |

### Devices

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/ping` | Heartbeat — registers device, links wallet, returns balance |
| `GET` | `/api/balance?walletAddress=` | Look up ASX balance by Solana wallet |

### Top-up

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/topup/verify` | Verify on-chain ASX transfer and credit device balance |
| `POST` | `/api/deposit/quote` | Get ASX quote for a USD deposit amount |

**Top-up flow**: user sends ASX to the treasury wallet on-chain, then calls `/api/topup/verify` with the transaction signature. The backend parses the transaction, confirms the transfer, and adds the amount to the device balance.

### VPN (NetSepio / WireGuard)

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/vpn/netsepio/flowid?walletAddress=` | Step 1 — get flow ID and EULA for wallet signing |
| `POST` | `/api/vpn/netsepio/connect` | Step 2 — authenticate and receive WireGuard config |
| `POST` | `/api/vpn/usage` | Report GB used; deducts ASX from balance |
| `POST` | `/api/vpn/disconnect` | Record completed VPN session |

**VPN flow**:
1. Client calls `flowid` → receives `flowId` + EULA text
2. Client signs the EULA with their Solana wallet (via the mobile app)
3. Client calls `connect` with the signature → receives a WireGuard `.conf` string
4. The in-app WireGuard service connects; usage is reported periodically

### Hotspot Hosting

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/hotspot/settings` | Publish host's WiFi networks to the global map |
| `POST` | `/api/hotspot/usage` | Report GB shared; credits host earnings |
| `POST` | `/api/hotspot/claim` | Claim accumulated earnings (off-chain record only) |

### WiFi Config

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/config` | Download Apple `.mobileconfig` for iOS auto-join |
| `GET` | `/api/config/json` | JSON list of available networks (filter by `?country=US`) |

## Economics

- **Price**: $0.10 USD per GB (constant), ASX amount varies with market price
- **Host earnings**: 45% of data revenue goes to the host
- **Platform fee**: 45% to treasury; 10% burned (tracked off-chain)
- **Rate cache**: DexScreener price is refreshed every 60 seconds

## Deployment

The backend is stateless except for `data/db.json`. Any Node.js host works (VPS, Railway, Render, etc.). Recommended setup:

```bash
# Install PM2 for process management
npm install -g pm2
pm2 start server.js --name hotpot-backend
pm2 save
```

For HTTPS, put Caddy or Nginx in front:
```
api-hotpot.yourdomain.com → localhost:3000
```
