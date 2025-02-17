// lib/auth.js
import * as jose from 'jose'

export async function generateToken(userId) {
  const secret = new TextEncoder().encode(process.env.JWT_SECRET)
  return await new jose.SignJWT({ sub: userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(secret)
}

export async function verifyToken(token) {
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET)
    const { payload } = await jose.jwtVerify(token, secret)
    return { userId: payload.sub }
  } catch (error) {
    return { error: 'Invalid token' }
  }
}

export function validateEmail(email) {
  return String(email)
    .toLowerCase()
    .match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)
}