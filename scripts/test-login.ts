import { signIn } from 'next-auth/react'

async function testLogin() {
  try {
    console.log('🔐 Testing admin login...')
    
    const result = await signIn('credentials', {
      email: 'admin@dominique.com',
      password: 'admin123',
      redirect: false
    })

    console.log('🔐 Login result:', result)

    if (result?.error) {
      console.log('❌ Login error:', result.error)
    } else {
      console.log('✅ Login successful!')
      
      // Get session
      const session = await fetch('http://localhost:3000/api/auth/session').then(res => res.json())
      console.log('👤 Session:', session)
    }

  } catch (error) {
    console.error('❌ Test error:', error)
  }
}

// This won't work in Node.js, but let's try to check the auth flow
console.log('🔧 Test script created - use browser to test login')