import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js'

export const SOLANA_NETWORK = (process.env.SOLANA_NETWORK as 'devnet' | 'mainnet-beta') || 'devnet'
export const SOLANA_RPC_URL = process.env.SOLANA_RPC_URL || clusterApiUrl(SOLANA_NETWORK)

// USDC Mint on Devnet (for testing)
export const USDC_MINT_DEVNET = new PublicKey('Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr')

// USDC Mint on Mainnet
export const USDC_MINT_MAINNET = new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v')

export const USDC_MINT = SOLANA_NETWORK === 'devnet' ? USDC_MINT_DEVNET : USDC_MINT_MAINNET

// Program ID (will be set after deploying contract)
export const PROGRAM_ID = process.env.PROGRAM_ID
  ? new PublicKey(process.env.PROGRAM_ID)
  : null

// Create connection
export const connection = new Connection(SOLANA_RPC_URL, 'confirmed')

console.log(`[Solana Config] Network: ${SOLANA_NETWORK}`)
console.log(`[Solana Config] RPC URL: ${SOLANA_RPC_URL}`)
console.log(`[Solana Config] USDC Mint: ${USDC_MINT.toBase58()}`)
if (PROGRAM_ID) {
  console.log(`[Solana Config] Program ID: ${PROGRAM_ID.toBase58()}`)
}
