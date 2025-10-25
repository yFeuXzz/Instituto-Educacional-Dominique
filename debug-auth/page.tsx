'use client'

import { useState, useEffect } from 'react'
import { signIn, signOut, useSession } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Bug, User, Lock, CheckCircle, XCircle } from 'lucide-react'

export default function DebugAuthPage() {
  const { data: session, status } = useSession()
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const fetchDebugInfo = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/debug-users')
      const data = await response.json()
      setDebugInfo(data)
    } catch (err) {
      setError('Erro ao buscar informações de debug')
    } finally {
      setLoading(false)
    }
  }

  const createDemoUsers = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/debug-users', {
        method: 'POST'
      })
      const data = await response.json()
      if (data.success) {
        await fetchDebugInfo() // Atualizar a lista
      }
    } catch (err) {
      setError('Erro ao criar usuários de demonstração')
    } finally {
      setLoading(false)
    }
  }

  const testLogin = async (email: string, password: string) => {
    try {
      setLoading(true)
      setError('')
      
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false
      })

      if (result?.error) {
        setError(`Erro de login: ${result.error}`)
      } else {
        // Login successful, session will update automatically
      }
    } catch (err) {
      setError('Erro ao fazer login')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDebugInfo()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center justify-center gap-2">
            <Bug className="w-8 h-8" />
            Debug de Autenticação
          </h1>
          <p className="text-gray-600 mt-2">
            Ferramenta para diagnosticar problemas de autenticação
          </p>
        </div>

        {/* Session Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Informações da Sessão
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="font-semibold">Status:</span>
                <span className={`px-2 py-1 rounded text-sm ${
                  status === 'loading' ? 'bg-yellow-100 text-yellow-800' :
                  status === 'authenticated' ? 'bg-green-100 text-green-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {status}
                </span>
              </div>
              
              {session ? (
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-green-800 mb-2 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Sessão Ativa
                  </h3>
                  <pre className="text-sm bg-white p-3 rounded border overflow-auto">
                    {JSON.stringify(session, null, 2)}
                  </pre>
                  <Button 
                    onClick={() => signOut()} 
                    variant="outline" 
                    className="mt-3"
                    disabled={loading}
                  >
                    Sair
                  </Button>
                </div>
              ) : (
                <div className="bg-red-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-red-800 mb-2 flex items-center gap-2">
                    <XCircle className="w-4 h-4" />
                    Nenhuma Sessão Ativa
                  </h3>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Users Debug */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5" />
              Usuários no Banco de Dados
            </CardTitle>
            <CardDescription>
              Verificação dos usuários cadastrados e suas senhas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-2">
                <Button 
                  onClick={fetchDebugInfo} 
                  variant="outline" 
                  disabled={loading}
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Atualizar'}
                </Button>
                <Button 
                  onClick={createDemoUsers} 
                  disabled={loading}
                >
                  Criar Usuários Demo
                </Button>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {debugInfo && (
                <div className="space-y-3">
                  <div className="text-sm text-gray-600">
                    Total de usuários: {debugInfo.count}
                  </div>
                  
                  {debugInfo.users?.map((user: any, index: number) => (
                    <div key={user.id} className="border rounded-lg p-4 bg-gray-50">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-semibold">Email:</span> {user.email}
                        </div>
                        <div>
                          <span className="font-semibold">Nome:</span> {user.name || 'N/A'}
                        </div>
                        <div>
                          <span className="font-semibold">Role:</span> 
                          <span className={`ml-2 px-2 py-1 rounded text-xs ${
                            user.role === 'ADMIN' ? 'bg-red-100 text-red-800' :
                            user.role === 'TEACHER' ? 'bg-blue-100 text-blue-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {user.role}
                          </span>
                        </div>
                        <div>
                          <span className="font-semibold">Senha:</span> 
                          <span className={`ml-2 text-xs ${
                            user.hasPassword ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {user.hasPassword ? `✓ (${user.passwordLength} chars)` : '✗ Não definida'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="mt-3 flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => testLogin(user.email, 
                            user.email.includes('admin') ? 'admin123' : 'aluno123'
                          )}
                          disabled={loading || status === 'authenticated'}
                        >
                          Testar Login
                        </Button>
                        
                        <div className="text-xs text-gray-500 self-center">
                          Senha: {user.email.includes('admin') ? 'admin123' : 'aluno123'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Ações Rápidas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <Button
                onClick={() => testLogin('admin@dominique.com', 'admin123')}
                disabled={loading || status === 'authenticated'}
                className="w-full"
              >
                Login como Admin
              </Button>
              <Button
                onClick={() => testLogin('joao.silva@dominique.com', 'aluno123')}
                disabled={loading || status === 'authenticated'}
                variant="outline"
                className="w-full"
              >
                Login como Aluno
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}