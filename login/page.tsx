'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Eye, EyeOff, GraduationCap, Users, Mail, Lock } from 'lucide-react'

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [selectedRole, setSelectedRole] = useState<'admin' | 'student' | 'teacher' | null>(null)

  const router = useRouter()

  // Função para limpar seleção e formulário
  const clearSelection = () => {
    setSelectedRole(null)
    setFormData({
      email: '',
      password: ''
    })
  }

  // Função para preencher dados de demonstração
  const fillDemoCredentials = (role: 'admin' | 'student' | 'teacher') => {
    setSelectedRole(role)
    if (role === 'admin') {
      setFormData({
        email: 'admin@dominique.com',
        password: 'admin123'
      })
    } else if (role === 'teacher') {
      setFormData({
        email: 'teacher@dominique.com',
        password: 'teacher123'
      })
    } else {
      setFormData({
        email: 'student@dominique.com',
        password: 'student123'
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false
      })

      if (result?.error) {
        setError('Email ou senha incorretos')
      } else {
        // Redirecionar baseado no papel do usuário
        const session = await fetch('/api/auth/session').then(res => res.json())
        if (session?.user?.role === 'ADMIN') {
          router.push('/admin')
        } else if (session?.user?.role === 'TEACHER') {
          router.push('/teacher')
        } else {
          router.push('/student')
        }
      }
    } catch (error) {
      setError('Erro ao fazer login. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    // Limpar seleção se o usuário editar manualmente
    if (selectedRole) {
      setSelectedRole(null)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo e Título */}
        <div className="text-center mb-8">
          <a href="/" className="inline-block hover:opacity-80 transition-opacity">
            <div className="flex justify-center mb-4">
              <div className="w-20 h-16 bg-blue-900 rounded-lg flex items-center justify-center p-2">
                <div className="text-white text-center">
                  <div className="text-xs font-bold leading-none">Instituto</div>
                  <div className="text-xs font-bold leading-none">Educacional</div>
                  <div className="text-sm font-bold leading-none">Dominique</div>
                  <div className="text-xs italic leading-none mt-1">Desde 1989</div>
                </div>
              </div>
            </div>
          </a>
          <h1 className="text-2xl font-bold text-blue-900 mb-2">
            Instituto Educacional Dominique
          </h1>
          <p className="text-blue-700 italic text-sm mb-1">
            "O estudo é a luz da vida"
          </p>
          <p className="text-gray-600">
            Portal de Acesso ao Sistema
          </p>
        </div>

        {/* Cards de Acesso Rápido */}
        {selectedRole && (
          <div className="mb-4 flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-900">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-900 rounded-full"></div>
              <span className="text-sm text-blue-900 font-medium">
                Modo de demonstração: {selectedRole === 'admin' ? 'Administrador' : selectedRole === 'teacher' ? 'Professor' : 'Estudante'}
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearSelection}
              className="text-blue-900 hover:text-blue-700 hover:bg-blue-100 h-8 px-3"
            >
              Limpar
            </Button>
          </div>
        )}
        
        <div className="grid grid-cols-3 gap-3 mb-6">
          <Card 
            className={`card-clickable p-3 border-2 transition-all cursor-pointer ${
              selectedRole === 'admin' 
                ? 'border-blue-900 bg-blue-50 shadow-lg scale-[1.02]' 
                : 'border-blue-200 hover:border-blue-900 hover:shadow-md'
            }`}
            onClick={() => fillDemoCredentials('admin')}
          >
            <div className="text-center">
              <Users className={`w-6 h-6 mx-auto mb-1 transition-colors ${
                selectedRole === 'admin' ? 'text-blue-900' : 'text-blue-700'
              }`} />
              <h3 className={`font-semibold text-xs transition-colors ${
                selectedRole === 'admin' ? 'text-blue-900' : 'text-gray-900'
              }`}>Admin</h3>
              {selectedRole === 'admin' && (
                <div className="mt-1 text-xs text-blue-900 font-medium">
                  ✓ Preenchido
                </div>
              )}
            </div>
          </Card>
          <Card 
            className={`card-clickable p-3 border-2 transition-all cursor-pointer ${
              selectedRole === 'teacher' 
                ? 'border-orange-500 bg-orange-50 shadow-lg scale-[1.02]' 
                : 'border-orange-200 hover:border-orange-400 hover:shadow-md'
            }`}
            onClick={() => fillDemoCredentials('teacher')}
          >
            <div className="text-center">
              <GraduationCap className={`w-6 h-6 mx-auto mb-1 transition-colors ${
                selectedRole === 'teacher' ? 'text-orange-700' : 'text-orange-600'
              }`} />
              <h3 className={`font-semibold text-xs transition-colors ${
                selectedRole === 'teacher' ? 'text-orange-900' : 'text-gray-900'
              }`}>Professor</h3>
              {selectedRole === 'teacher' && (
                <div className="mt-1 text-xs text-orange-600 font-medium">
                  ✓ Preenchido
                </div>
              )}
            </div>
          </Card>
          <Card 
            className={`card-clickable p-3 border-2 transition-all cursor-pointer ${
              selectedRole === 'student' 
                ? 'border-green-500 bg-green-50 shadow-lg scale-[1.02]' 
                : 'border-green-200 hover:border-green-400 hover:shadow-md'
            }`}
            onClick={() => fillDemoCredentials('student')}
          >
            <div className="text-center">
              <GraduationCap className={`w-6 h-6 mx-auto mb-1 transition-colors ${
                selectedRole === 'student' ? 'text-green-700' : 'text-green-600'
              }`} />
              <h3 className={`font-semibold text-xs transition-colors ${
                selectedRole === 'student' ? 'text-green-900' : 'text-gray-900'
              }`}>Estudante</h3>
              {selectedRole === 'student' && (
                <div className="mt-1 text-xs text-green-600 font-medium">
                  ✓ Preenchido
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Formulário de Login */}
        <Card className="border-blue-200">
          <CardHeader>
            <CardTitle className="text-xl text-center text-blue-900">Fazer Login</CardTitle>
            <CardDescription className="text-center">
              Entre com suas credenciais para acessar o sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2 text-blue-900">
                  <Mail className="w-4 h-4" />
                  Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Senha
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    disabled={isLoading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="icon-clickable absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <Button
                type="submit"
                className="clickable w-full bg-blue-600 hover:bg-blue-700"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Entrando...
                  </>
                ) : (
                  'Entrar'
                )}
              </Button>
            </form>

            {/* Links Úteis */}
            <div className="mt-6 text-center space-y-2">
              <Link
                href="/register"
                className="clickable text-sm text-blue-600 hover:underline block"
              >
                Não tem uma conta? Cadastre-se
              </Link>
              <Link
                href="/reset-password"
                className="clickable text-sm text-gray-600 hover:underline block"
              >
                Redefinir senha
              </Link>
              <Link
                href="/list-users"
                className="clickable text-sm text-gray-500 hover:underline block"
              >
                Ver usuários cadastrados
              </Link>
              <Link
                href="/debug-auth"
                className="clickable text-sm text-orange-600 hover:underline block"
              >
                🔧 Debug de Autenticação
              </Link>
            </div>

            {/* Contas de Demonstração */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold text-sm mb-2">Contas de Demonstração:</h4>
              <div className="space-y-2 text-xs">
                <div className={`p-2 rounded transition-colors ${
                  selectedRole === 'admin' ? 'bg-blue-100 border border-blue-300' : ''
                }`}>
                  <div className="flex items-center justify-between">
                    <span>
                      <strong>Admin:</strong> admin@dominique.com / admin123
                    </span>
                    {selectedRole === 'admin' && (
                      <span className="text-blue-600 text-xs">✓ Selecionado</span>
                    )}
                  </div>
                </div>
                <div className={`p-2 rounded transition-colors ${
                  selectedRole === 'teacher' ? 'bg-orange-100 border border-orange-300' : ''
                }`}>
                  <div className="flex items-center justify-between">
                    <span>
                      <strong>Professor:</strong> teacher@dominique.com / teacher123
                    </span>
                    {selectedRole === 'teacher' && (
                      <span className="text-orange-600 text-xs">✓ Selecionado</span>
                    )}
                  </div>
                </div>
                <div className={`p-2 rounded transition-colors ${
                  selectedRole === 'student' ? 'bg-green-100 border border-green-300' : ''
                }`}>
                  <div className="flex items-center justify-between">
                    <span>
                      <strong>Estudante:</strong> student@dominique.com / student123
                    </span>
                    {selectedRole === 'student' && (
                      <span className="text-green-600 text-xs">✓ Selecionado</span>
                    )}
                  </div>
                </div>
              </div>
              <p className="mt-2 text-xs text-gray-500 italic">
                Clique nos cards acima para preencher automaticamente
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Informações de Contato */}
        <div className="mt-6 text-center text-sm text-gray-600">
          <p>Precisa de ajuda? Entre em contato:</p>
          <p className="font-semibold">(83) 3221-1234</p>
        </div>
      </div>
    </div>
  )
}