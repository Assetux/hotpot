# Hotpot Project

## Overview

Hotpot is a decentralized mesh network platform built on Solana. It enables users to share and monetize their internet connectivity through hotspot devices. The platform uses two native tokens:

- **ASX** – the governance and utility token for the network.
- **HOTPOT** – the branding token used for the UI and community assets.

## Repository Structure

```
hotpot/
├─ backend/      # Node.js server handling API, wallet integration, and token economics
├─ landing/      # Vue 3 frontend (the landing page you are currently working on)
├─ mobile/       # React Native mobile app for hotspot management
└─ README.md     # This file
```

## Tokens

- **ASX**: Used for network treasury, staking, and governance voting.
- **HOTPOT**: Represents the brand and is used in UI elements. Both tokens are SPL tokens on Solana.

## Setup Instructions

### Prerequisites

- Node.js (>=18)
- Yarn or npm
- Solana CLI installed for localnet testing
- `.env` files for each component (see below)

### Backend

```bash
cd hotpot/backend
cp .env.example .env   # configure your DB, RPC endpoint, and secret keys
npm install
npm run dev            # starts the API server
```

### Landing (Web UI)

```bash
cd hotpot/landing
cp .env.example .env   # set VITE_API_URL and any other env vars
npm install
npm run dev            # Vite dev server at http://localhost:5173
npm run build          # production build (dist folder)
```

### Mobile App

```bash
cd hotpot/mobile
cp .env.example .env   # configure SOLANA_RPC_URL, API_URL, etc.
yarn install
yarn android           # for Android
yarn ios               # for iOS (requires Xcode)
```

## Building for Production

- **Backend**: `npm run build` creates a compiled server bundle.
- **Landing**: `npm run build` outputs static files in `dist/`.
- **Mobile**: Follow React Native build docs (`gradle assembleRelease` for Android, Xcode archive for iOS).

## Environment Variables (`.env`)

Create a `.env` in each sub‑project:

- `VITE_API_URL` – URL of the backend API.
- `SOLANA_RPC_URL` – Solana RPC endpoint.
- `ASX_MINT_ADDRESS` – SPL token address for ASX.
- `HOTPOT_MINT_ADDRESS` – SPL token address for HOTPOT.
- Any secret keys for wallet adapters (keep these out of version control!).

## Contributing

1. Fork the repository.
2. Create a feature branch.
3. Follow the code style – run `npm run format` before committing.
4. Submit a pull request.

## License

MIT License – see `LICENSE` file.
