// middleware.js
import { NextResponse } from 'next/server'
import * as jose from 'jose'

export const config = {
  matcher: [
    '/api/:path*'
  ]
}

export default async function middleware(request) {
  // Don't apply middleware to auth routes
  if (request.nextUrl.pathname.startsWith('/api/auth')) {
    return NextResponse.next()
  }

  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return new NextResponse(
        JSON.stringify({ error: 'Authorization required' }),
        { 
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    const token = authHeader.split(' ')[1]
    const secret = new TextEncoder().encode(process.env.JWT_SECRET)
    
    const { payload } = await jose.jwtVerify(token, secret)

    // Add user info to request headers
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('x-user-id', payload.sub)

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })
  } catch (error) {
    return new NextResponse(
      JSON.stringify({ 
        error: 'Invalid token',
        details: error.message 
      }),
      { 
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
}