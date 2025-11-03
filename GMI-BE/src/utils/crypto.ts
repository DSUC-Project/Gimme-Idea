import nacl from 'tweetnacl'
import bs58 from 'bs58'

export async function verifyWalletSignature(
  walletAddress: string,
  signature: string,
  message: string
): Promise<boolean> {
  try {
    // Decode the signature and public key
    const signatureBytes = bs58.decode(signature)
    const publicKeyBytes = bs58.decode(walletAddress)

    // Encode message
    const messageBytes = new TextEncoder().encode(message)

    // Verify signature
    return nacl.sign.detached.verify(
      messageBytes,
      signatureBytes,
      publicKeyBytes
    )
  } catch (error) {
    console.error('[Crypto] Signature verification error:', error)
    return false
  }
}
