'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Users, 
  Mail, 
  Phone, 
  LogOut,
  User,
  Calendar,
  BookOpen,
  MessageSquare,
  TrendingUp,
  GraduationCap
} from 'lucide-react'
import AdminMessages from './messages'
import AdminActivities from './activities'
import AdminGradesAttendance from './grades-attendance'
import AdminStudents from './students'
import AdminClasses from './classes'

export default function AdminDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [stats, setStats] = useState({
    totalStudents: 245,
    totalMessages: 12,
    newMessages: 3,
    totalClasses: 16
  })

  // Refs para controlar os componentes filhos
  const studentsRef = useRef<any>(null)
  const classesRef = useRef<any>(null)
  const activitiesRef = useRef<any>(null)

  useEffect(() => {
    if (status === 'loading') return
    
    if (!session) {
      router.push('/login')
      return
    }
    
    if (session.user.role !== 'ADMIN') {
      router.push('/student')
      return
    }
    
    setLoading(false)
    
    // Carregar estatísticas
    fetchStats()
    
    // Verificar se há uma aba específica na URL
    const urlParams = new URLSearchParams(window.location.search)
    const tab = urlParams.get('tab')
    if (tab) {
      // Aqui você poderia usar um estado para controlar a aba ativa
      console.log('Navegando para aba:', tab)
    }
  }, [session, status, router])

  const fetchStats = async () => {
    try {
      // Buscar mensagens
      const messagesResponse = await fetch('/api/contact')
      if (messagesResponse.ok) {
        const messagesData = await messagesResponse.json()
        const messages = messagesData.data || []
        
        setStats(prev => ({
          ...prev,
          totalMessages: messages.length,
          newMessages: messages.filter((m: any) => m.status === 'new').length
        }))
      }
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error)
    }
  }

  const handleLogout = async () => {
    await signOut({ redirect: false })
    router.push('/login')
  }

  // Funções para ações rápidas
  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'new-student':
        setActiveTab('students')
        // Abrir diálogo de novo aluno após um pequeno delay
        setTimeout(() => {
          const button = document.querySelector('[data-testid="new-student-button"]') as HTMLButtonElement
          if (button) {
            button.click()
          } else {
            console.warn('Botão Novo Aluno não encontrado')
          }
        }, 300)
        break
      case 'new-class':
        setActiveTab('classes')
        // Abrir diálogo de nova turma após um pequeno delay
        setTimeout(() => {
          const button = document.querySelector('[data-testid="new-class-button"]') as HTMLButtonElement
          if (button) {
            button.click()
          } else {
            console.warn('Botão Nova Turma não encontrado')
          }
        }, 300)
        break
      case 'new-activity':
        setActiveTab('activities')
        // Abrir diálogo de nova atividade após um pequeno delay
        setTimeout(() => {
          const button = document.querySelector('[data-testid="new-activity-button"]') as HTMLButtonElement
          if (button) {
            button.click()
          } else {
            console.warn('Botão Nova Atividade não encontrado')
          }
        }, 300)
        break
      case 'manage-grades':
        setActiveTab('grades')
        break
      default:
        console.warn('Ação rápida não reconhecida:', action)
        break
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Painel Administrativo</h1>
                <p className="text-sm text-gray-600">Instituto Dominique</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium">{session.user.name}</span>
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  Administrador
                </Badge>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="clickable flex items-center gap-2"
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
            Bem-vindo(a), {session.user.name}! 👋
          </h2>
          <p className="text-gray-600">
            Gerencie a instituição e acompanhe as atividades administrativas.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="card-clickable">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Alunos</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalStudents}</p>
                </div>
                <Users className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="card-clickable">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Mensagens</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalMessages}</p>
                </div>
                <MessageSquare className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="card-clickable">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Novas Mensagens</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.newMessages}</p>
                </div>
                <Mail className="w-8 h-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="card-clickable">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Turmas</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalClasses}</p>
                </div>
                <BookOpen className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="messages" className="flex items-center gap-2">
              Mensagens
              {stats.newMessages > 0 && (
                <Badge variant="destructive" className="text-xs">
                  {stats.newMessages}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="activities">Atividades</TabsTrigger>
            <TabsTrigger value="grades">Notas</TabsTrigger>
            <TabsTrigger value="students">Alunos</TabsTrigger>
            <TabsTrigger value="classes">Turmas</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Activities */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Atividades Recentes
                  </CardTitle>
                  <CardDescription>
                    Últimas atividades no sistema
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { action: 'Nova mensagem de contato', user: 'Maria Silva', time: '2 horas atrás' },
                      { action: 'Novo aluno matriculado', user: 'João Santos', time: '5 horas atrás' },
                      { action: 'Atualização de turma', user: 'Prof. Ana', time: '1 dia atrás' },
                    ].map((activity, index) => (
                      <div key={index} className="list-item-clickable flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium text-sm">{activity.action}</p>
                          <p className="text-xs text-gray-500">por {activity.user}</p>
                        </div>
                        <span className="text-xs text-gray-500">{activity.time}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Ações Rápidas</CardTitle>
                  <CardDescription>
                    Ações administrativas comuns
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <Button 
                      className="clickable h-20 flex-col gap-2 hover:scale-105 transition-transform"
                      onClick={() => handleQuickAction('new-student')}
                    >
                      <Users className="w-6 h-6" />
                      <span className="text-sm font-medium">Novo Aluno</span>
                      <span className="text-xs text-blue-600">➕</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      className="clickable h-20 flex-col gap-2 hover:scale-105 transition-transform"
                      onClick={() => handleQuickAction('new-class')}
                    >
                      <BookOpen className="w-6 h-6" />
                      <span className="text-sm font-medium">Nova Turma</span>
                      <span className="text-xs text-purple-600">📚</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      className="clickable h-20 flex-col gap-2 hover:scale-105 transition-transform"
                      onClick={() => handleQuickAction('new-activity')}
                    >
                      <Calendar className="w-6 h-6" />
                      <span className="text-sm font-medium">Nova Atividade</span>
                      <span className="text-xs text-green-600">📋</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      className="clickable h-20 flex-col gap-2 hover:scale-105 transition-transform"
                      onClick={() => handleQuickAction('manage-grades')}
                    >
                      <TrendingUp className="w-6 h-6" />
                      <span className="text-sm font-medium">Lançar Notas</span>
                      <span className="text-xs text-orange-600">📊</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="messages">
            <AdminMessages />
          </TabsContent>

          <TabsContent value="activities">
            <AdminActivities />
          </TabsContent>

          <TabsContent value="grades">
            <AdminGradesAttendance />
          </TabsContent>

          <TabsContent value="students">
            <AdminStudents />
          </TabsContent>

          <TabsContent value="classes">
            <AdminClasses />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}