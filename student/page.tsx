'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  GraduationCap, 
  BookOpen, 
  Calendar, 
  Award, 
  Clock, 
  User,
  LogOut,
  Mail,
  Phone
} from 'lucide-react'
import { signOut } from 'next-auth/react'

interface StudentData {
  id: string
  name: string
  email: string
  grade: string
  enrollment: string
  status: string
  createdAt: string
}

export default function StudentPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [studentData, setStudentData] = useState<StudentData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/login')
      return
    }

    if (session.user?.role !== 'STUDENT') {
      router.push('/admin')
      return
    }

    // Buscar dados do aluno
    fetchStudentData()
  }, [session, status, router])

  const fetchStudentData = async () => {
    try {
      const response = await fetch('/api/students/me')
      if (response.ok) {
        const data = await response.json()
        setStudentData(data.data)
      }
    } catch (error) {
      console.error('Erro ao buscar dados do aluno:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await signOut({ redirect: false })
    router.push('/login')
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!session || !studentData) {
    return null
  }

  const getGradeLabel = (grade: string) => {
    const gradeMap: { [key: string]: string } = {
      '6ano': '6º Ano',
      '7ano': '7º Ano',
      '8ano': '8º Ano',
      '9ano': '9º Ano'
    }
    return gradeMap[grade] || grade
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'inactive': return 'bg-red-100 text-red-800'
      case 'graduated': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Ativo'
      case 'inactive': return 'Inativo'
      case 'graduated': return 'Formado'
      default: return status
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Instituto Dominique</h1>
                <p className="text-sm text-gray-600">Portal do Aluno</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{studentData.name}</p>
                <p className="text-xs text-gray-600">{studentData.email}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Bem-vindo(a), {studentData.name.split(' ')[0]}! 👋
          </h2>
          <p className="text-gray-600">
            Aqui você pode acompanhar seu desempenho acadêmico e acessar informações importantes.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Série</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {getGradeLabel(studentData.grade)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Award className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <Badge className={getStatusColor(studentData.status)}>
                    {getStatusLabel(studentData.status)}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Matrícula</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {studentData.enrollment}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <Clock className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Cadastro</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {new Date(studentData.createdAt).toLocaleDateString('pt-BR', {
                      month: 'short',
                      year: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Academic Performance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  Desempenho Acadêmico
                </CardTitle>
                <CardDescription>
                  Acompanhe suas notas e progresso
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Sistema de Notas em Desenvolvimento
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Em breve você poderá acompanhar suas notas e atividades aqui.
                  </p>
                  <Button variant="outline" disabled>
                    Ver Notas
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Attendance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Frequência
                </CardTitle>
                <CardDescription>
                  Controle de presença e faltas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Sistema de Frequência em Desenvolvimento
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Em breve você poderá consultar seu histórico de presenças.
                  </p>
                  <Button variant="outline" disabled>
                    Ver Frequência
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Info & Actions */}
          <div className="space-y-6">
            {/* Contact Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Informações de Contato
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="text-sm font-medium">{studentData.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Telefone</p>
                    <p className="text-sm font-medium">Não informado</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Ações Rápidas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start" disabled>
                  <BookOpen className="w-4 h-4 mr-2" />
                  Ver Atividades
                </Button>
                <Button variant="outline" className="w-full justify-start" disabled>
                  <Calendar className="w-4 h-4 mr-2" />
                  Calendário Escolar
                </Button>
                <Button variant="outline" className="w-full justify-start" disabled>
                  <Award className="w-4 h-4 mr-2" />
                  Histórico Escolar
                </Button>
              </CardContent>
            </Card>

            {/* Support */}
            <Card>
              <CardHeader>
                <CardTitle>Suporte</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-3">
                    Precisa de ajuda? Entre em contato:
                  </p>
                  <p className="font-semibold text-gray-900">(83) 3221-1234</p>
                  <p className="text-sm text-gray-600">secretaria@dominique.com</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}