'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Mail, User, Calendar, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface User {
  id: string
  email: string
  name: string | null
  role: string
  createdAt: string
}

export default function ListUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/list-users')
      const data = await response.json()
      
      if (data.success) {
        setUsers(data.users)
      }
    } catch (error) {
      console.error('Erro ao buscar usuários:', error)
    } finally {
      setLoading(false)
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800'
      case 'teacher':
        return 'bg-blue-100 text-blue-800'
      case 'student':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getRoleText = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Administrador'
      case 'teacher':
        return 'Professor'
      case 'student':
        return 'Aluno'
      default:
        return role
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Carregando usuários...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-6">
          <Link href="/login">
            <Button variant="outline" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar para Login
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Usuários Cadastrados</h1>
          <p className="text-gray-600 mt-2">
            Use o email do usuário para redefinir a senha em <code>/reset-password</code>
          </p>
        </div>

        {users.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum usuário encontrado</h3>
              <p className="text-gray-600">Não há usuários cadastrados no sistema.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {users.map((user) => (
              <Card key={user.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-medium text-gray-900 truncate">
                      {user.name || 'Sem nome'}
                    </CardTitle>
                    <Badge className={getRoleColor(user.role)}>
                      {getRoleText(user.role)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center text-sm text-gray-600">
                    <Mail className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span className="truncate">{user.email}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span>
                      {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  <div className="pt-2">
                    <Link href={`/reset-password?email=${encodeURIComponent(user.email)}`}>
                      <Button size="sm" className="w-full">
                        Redefinir Senha
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-medium text-blue-900 mb-2">Como redefinir uma senha:</h3>
          <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
            <li>Encontre o usuário na lista acima</li>
            <li>Clique em "Redefinir Senha" ou acesse <code>/reset-password</code></li>
            <li>Digite o email do usuário</li>
            <li>Defina a nova senha (mínimo 6 caracteres)</li>
            <li>Confirme a nova senha</li>
            <li>Clique em "Redefinir Senha"</li>
          </ol>
        </div>
      </div>
    </div>
  )
}