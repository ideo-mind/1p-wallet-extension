// 1P Protocol Constants

import { Direction } from '@/types/protocol';

// Standard 1P Protocol colors (MUST use exact hex values)
export const PROTOCOL_COLORS = {
  RED: '#FF0000',    // Direction: UP
  GREEN: '#00FF00',  // Direction: DOWN
  BLUE: '#0000FF',   // Direction: LEFT
  YELLOW: '#FFFF00', // Direction: RIGHT
} as const;

// Color to direction mapping
export const COLOR_TO_DIRECTION: Record<string, Direction> = {
  [PROTOCOL_COLORS.RED]: 'UP',
  [PROTOCOL_COLORS.GREEN]: 'DOWN',
  [PROTOCOL_COLORS.BLUE]: 'LEFT',
  [PROTOCOL_COLORS.YELLOW]: 'RIGHT',
};

// Direction to color mapping
export const DIRECTION_TO_COLOR: Record<Direction, string> = {
  UP: PROTOCOL_COLORS.RED,
  DOWN: PROTOCOL_COLORS.GREEN,
  LEFT: PROTOCOL_COLORS.BLUE,
  RIGHT: PROTOCOL_COLORS.YELLOW,
  SKIP: '#CCCCCC',
};

// Grid configuration
export const DEFAULT_GRID_SIZE = {
  rows: 6,
  cols: 6,
};

// Difficulty configuration
export const DIFFICULTY_CONFIG = {
  MIN_LEVEL: 1,
  MAX_LEVEL: 10,
  MIN_ROUNDS: 1,
  MAX_ROUNDS: 30,
  BASE_ROUNDS: 3,
  ROUND_INCREMENT: 3,
  ROUND_DECREMENT: 2,
};

// Network configuration
export const NETWORKS = {
  creditcoin_mainnet: {
    chainId: '0x18e6e', // 102030 in hex
    name: 'Creditcoin',
    rpcUrl: 'https://mainnet3.creditcoin.network',
    currencySymbol: 'CTC',
    blockExplorerUrl: 'https://creditcoin.blockscout.com',
    status: 'coming_soon' as const,
  },
  creditcoin_testnet: {
    chainId: '0x18e7f', // 102031 in hex
    name: 'Creditcoin Testnet',
    rpcUrl: 'https://rpc.cc3-testnet.creditcoin.network',
    currencySymbol: 'tCTC',
    blockExplorerUrl: 'https://creditcoin-testnet.blockscout.com',
    status: 'active' as const,
  },
  creditcoin_devnet: {
    chainId: '0x18e80', // 102032 in hex
    name: 'Creditcoin Devnet',
    rpcUrl: 'https://rpc.cc3-devnet.creditcoin.network',
    currencySymbol: 'devCTC',
    blockExplorerUrl: 'https://creditcoin-devnet.blockscout.com',
    status: 'coming_soon' as const,
  },
  mainnet: {
    chainId: '0x1',
    name: 'Ethereum Mainnet',
    rpcUrl: 'https://mainnet.infura.io/v3/YOUR_KEY',
    currencySymbol: 'ETH',
    blockExplorerUrl: 'https://etherscan.io',
    status: 'coming_soon' as const,
  },
} as const;

