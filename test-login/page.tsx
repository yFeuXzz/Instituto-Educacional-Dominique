'use client'

import { useState } from 'react'
import { signIn, getSession } from 'next-auth/react'

export default function TestLogin() {
  const [email, setEmail] = useState('admin@dominique.com')
  const [password, setPassword] = useState('admin123')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState('')

  const testLogin = async () => {
    setLoading(true)
    setResult('')
    
    try {
      const res = await signIn('credentials', {
        email,
        password,
        redirect: false
      })
      
      setResult(`Login result: ${JSON.stringify(res, null, 2)}`)
      
      // Check session
      const session = await getSession()
      setResult(prev => prev + `\n\nSession: ${JSON.stringify(session, null, 2)}`)
      
    } catch (error) {
      setResult(`Error: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  const checkSession = async () => {
    const session = await getSession()
    setResult(`Current session: ${JSON.stringify(session, null, 2)}`)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-6">Test Login</h1>
        
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={testLogin}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Testing...' : 'Test Login'}
            </button>
            
            <button
              onClick={checkSession}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Check Session
            </button>
          </div>
        </div>
        
        {result && (
          <div className="bg-gray-100 p-4 rounded">
            <h3 className="font-semibold mb-2">Result:</h3>
            <pre className="text-sm whitespace-pre-wrap">{result}</pre>
          </div>
        )}
        
        <div className="mt-6">
          <h3 className="font-semibold mb-2">Quick Test:</h3>
          <p>Try clicking "Test Login" with the default admin credentials.</p>
          <p className="text-sm text-gray-600 mt-1">
            Email: admin@dominique.com<br />
            Password: admin123
          </p>
        </div>
      </div>
    </div>
  )
}