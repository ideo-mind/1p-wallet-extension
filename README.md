# 1P Wallet - Chrome Extension

Quantum-resistant browser wallet secured by the 1P (1-Letter Password) Protocol.

## Features

- **Brain-Based Authentication**: Single UTF-8 character secret + visual grid challenges
- **No Seed Phrases**: Custodial model - never manage private keys
- **Quantum-Resistant**: Zero-knowledge authentication protocol
- **Username System**: Simple `username.1p` identity
- **EIP-1193 Compliant**: Compatible with all Ethereum dApps
- **Sepolia Testnet**: Ready for testing

## Development Setup

### Prerequisites

- Node.js 18+
- npm or yarn
- Chrome browser

### Installation

```bash
# Install dependencies
npm install

# Build extension
npm run build

# Development mode (watch)
npm run dev
```

### Load Extension in Chrome

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select the `dist` folder from this project
5. The 1P Wallet icon should appear in your extensions toolbar

## Project Structure

```
1p-wallet/
├── src/
│   ├── background/          # Service worker
│   ├── content/             # Provider injection
│   ├── popup/               # Main UI
│   ├── components/          # React components
│   │   ├── ui/              # shadcn/ui components
│   │   ├── common/          # Shared components
│   │   ├── Registration/    # Registration flow
│   │   ├── AuthChallenge/   # Authentication grids
│   │   └── Dashboard/       # Wallet dashboard
│   ├── services/            # API clients
│   │   └── mock/            # Mock backend/contract
│   ├── utils/               # Utilities
│   ├── types/               # TypeScript definitions
│   ├── constants/           # Constants (protocol colors, etc.)
│   └── styles/              # Global styles (Tailwind)
├── public/                  # Static assets
│   └── icons/               # Extension icons
├── dist/                    # Build output
└── manifest.json            # Extension manifest
```

## Development

### Available Scripts

- `npm run dev` - Watch mode for development
- `npm run build` - Production build
- `npm test` - Run tests
- `npm run lint` - Lint code
- `npm run format` - Format code with Prettier
- `npm run type-check` - TypeScript type checking

### Technology Stack

- **React 18** - UI framework
- **TypeScript 5** - Type safety
- **Tailwind CSS 3** - Styling
- **shadcn/ui** - UI components
- **Ethers.js 6** - Ethereum interactions
- **Webpack 5** - Bundling

## Features

### Registration Flow

1. Choose username (format: `username.1p`)
2. Enter single secret character
3. Confirm secret
4. Wallet created with custodial address

### Authentication

- Visual grid challenges with colored letters
- Direction inputs: Red=UP, Green=DOWN, Blue=LEFT, Yellow=RIGHT, Skip
- Adaptive difficulty (1-30 rounds)
- Keyboard support: Arrow keys, WASD, Space/Enter

### Wallet Dashboard

- View custodial address and username
- ETH and $1P token balances
- Transaction history
- Quick actions (Send, Receive, Buy $1P)

### dApp Integration

- EIP-1193 compliant `window.ethereum` provider
- Compatible with MetaMask-based dApps
- Supports: `eth_requestAccounts`, `personal_sign`, `eth_sendTransaction`
- Works with Uniswap, OpenSea, and other Ethereum dApps

## Testing

### Test with Sample dApp

A test dApp is included in `test-dapp/index.html`. To use:

```bash
# Serve the test dApp
npx serve test-dapp
```

Then open http://localhost:3000 and test wallet connection, signing, and transactions.

## Current Status

### ✅ Implemented

- Project setup with TypeScript, React, Tailwind CSS
- Core type definitions and protocol constants
- Mock backend and contract services
- Type-safe storage service with encryption
- Registration flow components
- Authentication challenge UI (Grid, Direction Input)
- Wallet dashboard
- EIP-1193 provider injection
- Background service worker with message router

### 🚧 Mock Mode

Currently using **mock services** for development. Backend integration will be added later.

- Mock registration (auto-succeeds)
- Mock authentication (80% success rate)
- Mock balances and transactions
- Mock contract interactions

### 📋 TODO

- Integrate real backend API (Cloudflare Worker)
- Integrate real smart contract (1P Contract on Sepolia)
- Add transaction confirmation popups
- Add origin approval management
- Implement profile editing
- Add $1P token purchasing flow
- Implement session management
- Add error tracking
- Write comprehensive tests
- Add internationalization

## Security Notes

⚠️ **Important Security Features**:

- User's secret character is **NEVER stored** locally or transmitted
- Hot wallet private key is **encrypted** using AES-GCM
- All dApp interactions require authentication
- Origin validation for all external requests
- Minimal permissions (only `storage` and `unlimitedStorage`)

## Documentation

Full documentation available in `.cursor/rules/`:
- `prd.md` - Product Requirements Document
- `1p-wallet-overview.mdc` - Project overview
- `1p-protocol.mdc` - Protocol implementation guide
- Additional development rules and guidelines

## License

MIT

## Support

For issues and questions, please open an issue on GitHub.

