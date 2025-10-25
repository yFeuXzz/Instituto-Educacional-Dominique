import { NextRequest, NextResponse } from 'next/server'
import { authOptions } from '@/lib/auth'
import { getServerSession } from 'next-auth'

export async function GET(request: NextRequest) {
  try {
    console.log('Test auth endpoint called')
    
    // Test if we can get the session
    const session = await getServerSession(authOptions)
    console.log('Session in test endpoint:', session)
    
    return NextResponse.json({ 
      message: 'Auth test endpoint',
      session: session,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error in test auth endpoint:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      message: error.message 
    }, { status: 500 })
  }
}