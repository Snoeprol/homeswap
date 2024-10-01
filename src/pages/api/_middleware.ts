import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import rateLimit from 'express-rate-limit'
import boom from '@hapi/boom'

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests, please try again later.',
  headers: true,
})

export function middleware(request: NextRequest) {
  return new Promise((resolve, reject) => {
    limiter(request, NextResponse.next(), (result: any) => {
      if (result instanceof Error) {
        reject(result)
      }
      resolve(result)
    })
  })
    .then(() => {
      return NextResponse.next()
    })
    .catch((error) => {
      if (boom.isBoom(error)) {
        return new NextResponse(
          JSON.stringify({ success: false, message: error.output.payload.message }),
          { status: error.output.statusCode, headers: { 'content-type': 'application/json' } }
        )
      }
      return new NextResponse(
        JSON.stringify({ success: false, message: 'Internal server error' }),
        { status: 500, headers: { 'content-type': 'application/json' } }
      )
    })
}