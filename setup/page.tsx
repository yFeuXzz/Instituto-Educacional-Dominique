'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, CheckCircle, AlertCircle, Shield } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function SetupPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string; data?: any } | null>(null)
  const router = useRouter()

  const handleSetupAdmin = async () => {
    setLoading(true)
    setResult(null)

    try {
      const response = await fetch('/api/setup-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      if (response.ok) {
        setResult({
          success: true,
          message: data.message,
          data: data.data
        })
      } else {
        setResult({
          success: false,
          message: data.error || 'Erro ao configurar admin'
        })
      }
    } catch (error) {
      setResult({
        success: false,
        message: 'Erro de conexão'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo e Título */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
              <Shield className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Configuração Inicial
          </h1>
          <p className="text-gray-600">
            Instituto Dominique - Sistema Educacional
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Configurar Administrador
            </CardTitle>
            <CardDescription>
              Crie a conta de administrador inicial para acessar o sistema
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {result && (
              <Alert className={result.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
                <div className="flex items-center gap-2">
                  {result.success ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-600" />
                  )}
                  <AlertDescription className={result.success ? 'text-green-800' : 'text-red-800'}>
                    {result.message}
                  </AlertDescription>
                </div>
              </Alert>
            )}

            {result?.success && result.data && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-sm mb-2 text-blue-900">Credenciais de Acesso:</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Email:</span>
                    <span className="font-mono text-blue-700">{result.data.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Senha:</span>
                    <span className="font-mono text-blue-700">{result.data.password}</span>
                  </div>
                </div>
                <p className="mt-3 text-xs text-blue-700">
                  Anote estas credenciais em um local seguro!
                </p>
              </div>
            )}

            <Button
              onClick={handleSetupAdmin}
              disabled={loading || result?.success}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Configurando...
                </>
              ) : result?.success ? (
                '✓ Administrador Configurado'
              ) : (
                'Criar Administrador'
              )}
            </Button>

            {result?.success && (
              <Button
                variant="outline"
                onClick={() => router.push('/login')}
                className="w-full"
              >
                Ir para Login
              </Button>
            )}
          </CardContent>
        </Card>

        <div className="mt-6 text-center text-sm text-gray-600">
          <p>Após configurar o administrador, você poderá:</p>
          <ul className="mt-2 space-y-1">
            <li>• Acessar o painel administrativo</li>
            <li>• Cadastrar alunos e professores</li>
            <li>• Gerenciar turmas e atividades</li>
            <li>• Acompanhar desempenho acadêmico</li>
          </ul>
        </div>
      </div>
    </div>
  )
}