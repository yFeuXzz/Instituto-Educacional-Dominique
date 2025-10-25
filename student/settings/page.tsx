'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/hooks/use-toast'
import { User, Lock, Palette, BookOpen, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface StudentUser {
  id: string
  name: string
  email: string
  grade: string
  className: string
}

interface StudentPreferences {
  darkMode: boolean
  emailNotifications: boolean
  showGrades: boolean
  language: string
}

export default function StudentSettings() {
  const [student, setStudent] = useState<StudentUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  // Form states
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: ''
  })

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const [preferences, setPreferences] = useState<StudentPreferences>({
    darkMode: false,
    emailNotifications: true,
    showGrades: true,
    language: 'pt-BR'
  })

  useEffect(() => {
    fetchStudentData()
    
    // Carregar preferências salvas
    const savedPreferences = localStorage.getItem('student-preferences')
    if (savedPreferences) {
      try {
        const parsed = JSON.parse(savedPreferences)
        setPreferences(prev => ({ ...prev, ...parsed }))
        
        if (parsed.darkMode) {
          document.documentElement.classList.add('dark')
        }
      } catch (error) {
        console.error('Erro ao carregar preferências:', error)
      }
    }
  }, [])

  const fetchStudentData = async () => {
    try {
      const response = await fetch('/api/students/me')
      const result = await response.json()
      
      if (result.success && result.data) {
        const studentData = result.data
        setStudent(studentData)
        setProfileForm({
          name: studentData.name,
          email: studentData.email
        })
      }
    } catch (error) {
      console.error('Erro ao carregar dados do estudante:', error)
      toast({
        title: "Erro",
        description: "Não foi possível carregar seus dados",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      // Simulação de API
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setStudent(prev => prev ? { ...prev, ...profileForm } : null)
      toast({
        title: "Sucesso",
        description: "Perfil atualizado com sucesso"
      })
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao atualizar perfil",
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!student?.email) {
      toast({
        title: "Erro",
        description: "Dados do estudante não carregados. Tente novamente.",
        variant: "destructive"
      })
      return
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({
        title: "Erro",
        description: "As senhas não coincidem",
        variant: "destructive"
      })
      return
    }

    if (passwordForm.newPassword.length < 6) {
      toast({
        title: "Erro",
        description: "A nova senha deve ter pelo menos 6 caracteres",
        variant: "destructive"
      })
      return
    }

    setSaving(true)

    try {
      const response = await fetch('/api/students/password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
          email: student.email
        })
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: "Sucesso",
          description: "Senha alterada com sucesso"
        })
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        })
      } else {
        toast({
          title: "Erro",
          description: result.message || "Erro ao alterar senha",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao alterar senha",
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }

  const handlePreferencesUpdate = (key: keyof StudentPreferences, value: any) => {
    const newPreferences = { ...preferences, [key]: value }
    setPreferences(newPreferences)

    localStorage.setItem('student-preferences', JSON.stringify(newPreferences))

    if (key === 'darkMode') {
      if (value) {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    }

    toast({
      title: "Preferências",
      description: "Preferências atualizadas"
    })
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link href="/student">
              <Button variant="ghost" size="sm" className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Voltar
              </Button>
            </Link>
          </div>
          <h1 className="text-2xl font-bold">Meus Dados</h1>
          <p className="text-gray-600">Gerencie suas informações pessoais</p>
        </div>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="w-4 h-4" />
            Perfil
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Lock className="w-4 h-4" />
            Segurança
          </TabsTrigger>
          <TabsTrigger value="preferences" className="flex items-center gap-2">
            <Palette className="w-4 h-4" />
            Preferências
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Informações Pessoais
              </CardTitle>
              <CardDescription>
                Atualize suas informações pessoais
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfileUpdate} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome Completo</Label>
                    <Input
                      id="name"
                      value={profileForm.name}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Seu nome completo"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profileForm.email}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="seu.email@dominique.com"
                      required
                    />
                  </div>
                </div>
                
                {student && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Série</Label>
                      <Input
                        value={student.grade}
                        disabled
                        className="bg-muted"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Turma</Label>
                      <Input
                        value={student.className}
                        disabled
                        className="bg-muted"
                      />
                    </div>
                  </div>
                )}
                
                <div className="flex justify-end">
                  <Button type="submit" disabled={saving}>
                    {saving ? 'Salvando...' : 'Salvar Alterações'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="w-5 h-5" />
                Alterar Senha
              </CardTitle>
              <CardDescription>
                Atualize sua senha de acesso ao sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordUpdate} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Senha Atual</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                    placeholder="Digite sua senha atual"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">Nova Senha</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                    placeholder="Digite sua nova senha"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    placeholder="Confirme sua nova senha"
                    required
                  />
                </div>
                <div className="flex justify-end">
                  <Button 
                    type="submit" 
                    disabled={saving || !student?.email}
                  >
                    {saving ? 'Alterando...' : 'Alterar Senha'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Preferences Tab */}
        <TabsContent value="preferences">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="w-5 h-5" />
                  Aparência
                </CardTitle>
                <CardDescription>
                  Personalize a aparência do sistema
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Modo Escuro</Label>
                    <p className="text-sm text-muted-foreground">
                      Ative o modo escuro para reduzir o cansaço visual
                    </p>
                  </div>
                  <Switch
                    checked={preferences.darkMode}
                    onCheckedChange={(checked) => handlePreferencesUpdate('darkMode', checked)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  Notificações
                </CardTitle>
                <CardDescription>
                  Configure suas preferências de notificação
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Notificações por Email</Label>
                    <p className="text-sm text-muted-foreground">
                      Receba atualizações importantes por email
                    </p>
                  </div>
                  <Switch
                    checked={preferences.emailNotifications}
                    onCheckedChange={(checked) => handlePreferencesUpdate('emailNotifications', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Exibir Notas</Label>
                    <p className="text-sm text-muted-foreground">
                      Mostre suas notas no dashboard
                    </p>
                  </div>
                  <Switch
                    checked={preferences.showGrades}
                    onCheckedChange={(checked) => handlePreferencesUpdate('showGrades', checked)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Configurações Regionais</CardTitle>
                <CardDescription>
                  Ajuste suas preferências de idioma
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Idioma</Label>
                  <select
                    value={preferences.language}
                    onChange={(e) => handlePreferencesUpdate('language', e.target.value)}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="pt-BR">Português (Brasil)</option>
                    <option value="en-US">English (US)</option>
                    <option value="es-ES">Español</option>
                  </select>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}