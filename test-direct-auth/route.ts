import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    console.log('=== DIRECT AUTH TEST ===')
    
    const body = await request.json()
    console.log('Request body:', body)
    
    const { email, password } = body
    
    if (!email || !password) {
      return NextResponse.json({ error: 'Missing credentials' }, { status: 400 })
    }
    
    console.log('Searching for user:', email)
    const user = await db.user.findUnique({
      where: { email }
    })
    
    if (!user) {
      console.log('User not found:', email)
      return NextResponse.json({ error: 'User not found' }, { status: 401 })
    }
    
    if (!user.password) {
      console.log('User has no password:', email)
      return NextResponse.json({ error: 'User has no password' }, { status: 401 })
    }
    
    console.log('User found, comparing passwords...')
    const isPasswordValid = await bcrypt.compare(password, user.password)
    
    if (!isPasswordValid) {
      console.log('Invalid password for:', email)
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
    }
    
    console.log('Login successful for:', email, 'Role:', user.role)
    
    return NextResponse.json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    })
    
  } catch (error) {
    console.error('Direct auth test error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      message: error.message 
    }, { status: 500 })
  }
}