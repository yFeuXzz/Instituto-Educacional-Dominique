'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'
import { Plus, Edit, Trash2, Users, Mail, Phone, Calendar, Search, User } from 'lucide-react'

interface Student {
  id: string
  userId: string
  name: string
  email: string
  phone: string
  address?: string
  birthDate?: string
  classId?: string
  grade?: string
  enrollment: string
  status: string
  createdAt: string
  updatedAt: string
  class?: {
    id: string
    name: string
    subject: string
  }
  user: {
    id: string
    email: string
    createdAt: string
  }
}

interface Class {
  id: string
  name: string
  subject: string
  teacher: string
  capacity: number
  status: string
}

export default function AdminStudents() {
  const [students, setStudents] = useState<Student[]>([])
  const [classes, setClasses] = useState<Class[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingStudent, setEditingStudent] = useState<Student | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [studentToDelete, setStudentToDelete] = useState<string | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    grade: ''
  })

  useEffect(() => {
    fetchStudents()
    fetchClasses()
  }, [])

  const fetchStudents = async () => {
    try {
      const response = await fetch('/api/students-with-user')
      if (response.ok) {
        const data = await response.json()
        setStudents(data.data || [])
      } else {
        console.error('Erro ao buscar alunos')
      }
    } catch (error) {
      console.error('Erro ao buscar alunos:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchClasses = async () => {
    try {
      const response = await fetch('/api/classes')
      if (response.ok) {
        const data = await response.json()
        setClasses(data.data || [])
      }
    } catch (error) {
      console.error('Erro ao buscar turmas:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    // Validação simples
    if (!formData.name.trim()) {
      setError('Nome é obrigatório')
      return
    }
    if (!formData.grade) {
      setError('Série é obrigatória')
      return
    }

    try {
      // Usar API combinada que cria usuário e aluno juntos
      const response = await fetch('/api/students-with-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          grade: formData.grade
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Erro ao criar aluno')
        return
      }

      // Atualizar lista local
      fetchStudents()

      // Mostrar credenciais geradas
      setSuccess(`Aluno criado com sucesso! Conta de acesso gerada:
📧 Email: ${data.data.credentials.email}
🔑 Senha: ${data.data.credentials.password}`)
      
      setFormData({
        name: '',
        grade: ''
      })
      setIsDialogOpen(false)
    } catch (error) {
      console.error('Erro ao criar aluno:', error)
      setError('Erro ao criar aluno')
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleDelete = async (studentId: string) => {
    setStudentToDelete(studentId)
    setDeleteConfirmOpen(true)
  }

  const confirmDelete = async () => {
    if (!studentToDelete) return

    try {
      const response = await fetch(`/api/students-with-user/${studentToDelete}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setSuccess('Aluno apagado com sucesso!')
        fetchStudents()
      } else {
        const data = await response.json()
        setError(data.error || 'Erro ao apagar aluno')
      }
    } catch (error) {
      console.error('Erro ao apagar aluno:', error)
      setError('Erro de conexão ao apagar aluno')
    } finally {
      setDeleteConfirmOpen(false)
      setStudentToDelete(null)
    }
  }

  const cancelDelete = () => {
    setDeleteConfirmOpen(false)
    setStudentToDelete(null)
  }

  const handleEdit = (student: any) => {
    setFormData({
      name: student.name,
      grade: student.grade || ''
    })
    setIsDialogOpen(true)
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

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.enrollment.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (student.grade && student.grade.toLowerCase().includes(searchTerm.toLowerCase()))
    
    return matchesSearch
  })

  // Encontrar nome do aluno para confirmação
  const getStudentName = (studentId: string) => {
    const student = students.find(s => s.id === studentId)
    return student ? student.name : 'este aluno'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <>
      {/* Diálogo de Confirmação de Exclusão */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <Trash2 className="w-5 h-5" />
              Confirmar Exclusão
            </DialogTitle>
            <DialogDescription>
              Tem certeza que deseja apagar <strong>{studentToDelete ? getStudentName(studentToDelete) : ''}</strong>?
            </DialogDescription>
          </DialogHeader>
          
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-800">
              <strong>Atenção:</strong> Esta ação não pode ser desfeita. O aluno será permanentemente removido do sistema.
            </p>
          </div>
          
          <DialogFooter className="gap-2">
            <Button 
              variant="outline" 
              onClick={cancelDelete}
              className="clickable"
            >
              Cancelar
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmDelete}
              className="clickable bg-red-600 hover:bg-red-700"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Apagar Aluno
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="space-y-6">
      {/* Global Messages */}
      {error && (
        <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
          {error}
        </div>
      )}
      
      {success && (
        <div className="text-sm text-green-600 bg-green-50 p-3 rounded-md">
          {success}
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Gestão de Alunos</h3>
          <p className="text-sm text-gray-600">Gerencie todos os alunos da instituição</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              className="clickable"
              data-testid="new-student-button"
            >
              <Plus className="w-4 h-4 mr-2" />
              Novo Aluno
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Adicionar Novo Aluno</DialogTitle>
              <DialogDescription>
                Preencha as informações do novo aluno
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Nome Completo *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Nome do aluno"
                    required
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="grade">Série *</Label>
                  <Select value={formData.grade} onValueChange={(value) => handleInputChange('grade', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a série" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="6ano">6º Ano</SelectItem>
                      <SelectItem value="7ano">7º Ano</SelectItem>
                      <SelectItem value="8ano">8º Ano</SelectItem>
                      <SelectItem value="9ano">9º Ano</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {error && (
                <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                  {error}
                </div>
              )}
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  Criar Aluno
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Buscar por nome, email, matrícula ou série..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      {/* Students Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Alunos Cadastrados ({filteredStudents.length})
          </CardTitle>
          <CardDescription>
            Lista completa de alunos da instituição
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredStudents.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhum aluno encontrado
              </h3>
              <p className="text-gray-600 mb-4">
                {searchTerm 
                  ? 'Tente ajustar os filtros de busca.'
                  : 'Comece adicionando um novo aluno.'
                }
              </p>
              <Button className="clickable" onClick={() => setIsDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Aluno
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Aluno</TableHead>
                  <TableHead>Informações</TableHead>
                  <TableHead>Matrícula</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium">{student.name}</p>
                          {student.birthDate && (
                            <p className="text-xs text-gray-500">
                              Nascido em {new Date(student.birthDate).toLocaleDateString('pt-BR')}
                            </p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-sm">
                          <Mail className="w-3 h-3 text-gray-400" />
                          {student.email}
                        </div>
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <Users className="w-3 h-3 text-gray-400" />
                          {student.grade ? `${student.grade.replace('ano', 'º Ano')}` : 'Sem série'}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {student.enrollment}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(student.status)}>
                        {getStatusLabel(student.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="clickable"
                          onClick={() => handleEdit(student)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="clickable text-red-600 hover:text-red-700"
                          onClick={() => handleDelete(student.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      </div>
    </>
  )
}