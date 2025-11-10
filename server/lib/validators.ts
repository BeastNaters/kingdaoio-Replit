/**
 * Address validation utilities for Ethereum and Solana addresses
 */

/**
 * Validates an Ethereum (EVM) address
 * @param address - The address to validate
 * @returns true if valid Ethereum address, false otherwise
 */
export function isValidEthAddress(address: string): boolean {
  if (!address || typeof address !== 'string') {
    return false;
  }
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

/**
 * Validates a Solana address
 * @param address - The address to validate
 * @returns true if valid Solana address, false otherwise
 */
export function isValidSolAddress(address: string): boolean {
  if (!address || typeof address !== 'string') {
    return false;
  }
  return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address);
}

/**
 * Validates an address for either Ethereum or Solana
 * @param address - The address to validate
 * @param chain - The expected chain ('ETH' or 'SOL')
 * @returns true if valid for the specified chain, false otherwise
 */
export function isValidAddress(address: string, chain: 'ETH' | 'SOL'): boolean {
  if (chain === 'ETH') {
    return isValidEthAddress(address);
  } else if (chain === 'SOL') {
    return isValidSolAddress(address);
  }
  return false;
}

/**
 * Validates an address and returns the detected chain type
 * @param address - The address to validate
 * @returns 'ETH' if valid Ethereum address, 'SOL' if valid Solana address, null if invalid
 */
export function detectAddressChain(address: string): 'ETH' | 'SOL' | null {
  if (isValidEthAddress(address)) {
    return 'ETH';
  } else if (isValidSolAddress(address)) {
    return 'SOL';
  }
  return null;
}
