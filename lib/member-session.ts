// Edge-compatible (Web Crypto API — no Node.js Buffer)
export const MEMBER_COOKIE = 'mxb_ms'
const SESSION_TTL = 7 * 24 * 60 * 60 * 1000 // 7 days

function getSecret(): string {
  return (process.env.SUPABASE_SERVICE_ROLE_KEY || 'mxb-fallback-secret').slice(0, 64)
}

async function hmacKey(): Promise<CryptoKey> {
  const enc = new TextEncoder().encode(getSecret())
  return crypto.subtle.importKey('raw', enc, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify'])
}

function u8toHex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('')
}

function hexToU8(hex: string): Uint8Array<ArrayBuffer> {
  const arr = new Uint8Array(new ArrayBuffer(hex.length / 2))
  for (let i = 0; i < hex.length; i += 2) arr[i / 2] = parseInt(hex.slice(i, i + 2), 16)
  return arr
}

function b64url(str: string): string {
  return btoa(unescape(encodeURIComponent(str))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

function fromb64url(str: string): string {
  return decodeURIComponent(escape(atob(str.replace(/-/g, '+').replace(/_/g, '/'))))
}

export async function signMemberSession(email: string): Promise<string> {
  const exp = Date.now() + SESSION_TTL
  const payload = `${email}:${exp}`
  const key = await hmacKey()
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload))
  return b64url(`${payload}:${u8toHex(sig)}`)
}

export async function verifyMemberSession(token: string): Promise<string | null> {
  try {
    const decoded = fromb64url(token)
    const lastColon = decoded.lastIndexOf(':')
    const sigHex = decoded.slice(lastColon + 1)
    const payload = decoded.slice(0, lastColon)
    const firstColon = payload.indexOf(':')
    const email = payload.slice(0, firstColon)
    const exp = parseInt(payload.slice(firstColon + 1))
    if (!email || isNaN(exp) || Date.now() > exp) return null
    const key = await hmacKey()
    const valid = await crypto.subtle.verify('HMAC', key, hexToU8(sigHex), new TextEncoder().encode(payload))
    return valid ? email : null
  } catch {
    return null
  }
}
