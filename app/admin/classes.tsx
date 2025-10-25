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
import { Plus, Edit, Trash2, Users, BookOpen, Calendar, Clock, Search, User } from 'lucide-react'

interface Class {
  id: string
  name: string
  description?: string
  subject: string
  teacher: string
  schedule?: string
  capacity: number
  status: string
  createdAt: string
  updatedAt: string
  students: {
    id: string
    name: string
    status: string
  }[]
  _count: {
    students: number
    activities: number
  }
}

export default function AdminClasses() {
  const [classes, setClasses] = useState<Class[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingClass, setEditingClass] = useState<Class | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [classToDelete, setClassToDelete] = useState<string | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    subject: '',
    teacher: '',
    schedule: '',
    capacity: '30'
  })

  useEffect(() => {
    fetchClasses()
  }, [])

  const fetchClasses = async () => {
    try {
      const response = await fetch('/api/classes')
      if (response.ok) {
        const data = await response.json()
        setClasses(data.data || [])
      } else {
        console.error('Erro ao buscar turmas')
      }
    } catch (error) {
      console.error('Erro ao buscar turmas:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    try {
      const response = await fetch('/api/classes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess('Turma criada com sucesso!')
        setFormData({
          name: '',
          description: '',
          subject: '',
          teacher: '',
          schedule: '',
          capacity: '30'
        })
        setIsDialogOpen(false)
        fetchClasses()
      } else {
        setError(data.error || 'Erro ao criar turma')
      }
    } catch (error) {
      console.error('Erro ao criar turma:', error)
      setError('Erro de conexão ao criar turma')
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleDelete = async (classId: string) => {
    setClassToDelete(classId)
    setDeleteConfirmOpen(true)
  }

  const confirmDelete = async () => {
    if (!classToDelete) return

    try {
      const response = await fetch(`/api/classes/${classToDelete}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setSuccess('Turma apagada com sucesso!')
        fetchClasses()
      } else {
        const data = await response.json()
        setError(data.error || 'Erro ao apagar turma')
      }
    } catch (error) {
      console.error('Erro ao apagar turma:', error)
      setError('Erro de conexão ao apagar turma')
    } finally {
      setDeleteConfirmOpen(false)
      setClassToDelete(null)
    }
  }

  const cancelDelete = () => {
    setDeleteConfirmOpen(false)
    setClassToDelete(null)
  }

  const handleEdit = (classData: Class) => {
    setEditingClass(classData)
    setFormData({
      name: classData.name,
      description: classData.description || '',
      subject: classData.subject,
      teacher: classData.teacher,
      schedule: classData.schedule || '',
      capacity: classData.capacity.toString()
    })
    setIsDialogOpen(true)
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingClass) return

    setError('')
    setSuccess('')

    try {
      const response = await fetch(`/api/classes/${editingClass.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess('Turma atualizada com sucesso!')
        setFormData({
          name: '',
          description: '',
          subject: '',
          teacher: '',
          schedule: '',
          capacity: '30'
        })
        setIsDialogOpen(false)
        setEditingClass(null)
        fetchClasses()
      } else {
        setError(data.error || 'Erro ao atualizar turma')
      }
    } catch (error) {
      console.error('Erro ao atualizar turma:', error)
      setError('Erro de conexão ao atualizar turma')
    }
  }

  const handleViewStudents = (classId: string) => {
    // Redirecionar para a página de alunos com filtro da turma
    window.location.href = `/admin/students?class=${classId}`
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'inactive': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Ativa'
      case 'inactive': return 'Inativa'
      default: return status
    }
  }

  const getCapacityColor = (current: number, capacity: number) => {
    const percentage = (current / capacity) * 100
    if (percentage >= 90) return 'text-red-600'
    if (percentage >= 70) return 'text-yellow-600'
    return 'text-green-600'
  }

  const filteredClasses = classes.filter(cls => {
    const matchesSearch = cls.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cls.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cls.teacher.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = selectedStatus === 'all' || cls.status === selectedStatus
    
    return matchesSearch && matchesStatus
  })

  // Encontrar nome da turma para confirmação
  const getClassName = (classId: string) => {
    const classData = classes.find(c => c.id === classId)
    return classData ? classData.name : 'esta turma'
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
              Tem certeza que deseja apagar <strong>{classToDelete ? getClassName(classToDelete) : ''}</strong>?
            </DialogDescription>
          </DialogHeader>
          
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-800">
              <strong>Atenção:</strong> Esta ação não pode ser desfeita. A turma será permanentemente removida do sistema.
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
              Apagar Turma
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
          <h3 className="text-lg font-semibold">Gestão de Turmas</h3>
          <p className="text-sm text-gray-600">Gerencie turmas e disciplinas</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              className="clickable"
              data-testid="new-class-button"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nova Turma
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>{editingClass ? 'Editar Turma' : 'Criar Nova Turma'}</DialogTitle>
              <DialogDescription>
                {editingClass ? 'Atualize as informações da turma' : 'Preencha as informações da nova turma'}
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={editingClass ? handleUpdate : handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Nome da Turma *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Ex: Turma A - Matemática"
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="subject">Disciplina *</Label>
                    <Input
                      id="subject"
                      value={formData.subject}
                      onChange={(e) => handleInputChange('subject', e.target.value)}
                      placeholder="Ex: Matemática"
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="teacher">Professor(a) *</Label>
                    <Input
                      id="teacher"
                      value={formData.teacher}
                      onChange={(e) => handleInputChange('teacher', e.target.value)}
                      placeholder="Nome do professor"
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="capacity">Capacidade</Label>
                    <Input
                      id="capacity"
                      type="number"
                      min="1"
                      max="50"
                      value={formData.capacity}
                      onChange={(e) => handleInputChange('capacity', e.target.value)}
                      placeholder="30"
                    />
                  </div>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="schedule">Horário</Label>
                  <Input
                    id="schedule"
                    value={formData.schedule}
                    onChange={(e) => handleInputChange('schedule', e.target.value)}
                    placeholder="Ex: Seg/Qua 14h-16h"
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Descrição da turma, ementa, etc."
                    rows={3}
                  />
                </div>
              </div>
              
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
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => {
                  setIsDialogOpen(false)
                  setEditingClass(null)
                  setFormData({
                    name: '',
                    description: '',
                    subject: '',
                    teacher: '',
                    schedule: '',
                    capacity: '30'
                  })
                }}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingClass ? 'Atualizar Turma' : 'Criar Turma'}
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
              placeholder="Buscar por nome, disciplina ou professor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            <SelectItem value="active">Ativas</SelectItem>
            <SelectItem value="inactive">Inativas</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Classes Grid */}
      {filteredClasses.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhuma turma encontrada
            </h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || selectedStatus !== 'all' 
                ? 'Tente ajustar os filtros de busca.'
                : 'Comece criando uma nova turma.'
              }
            </p>
            <Button className="clickable" onClick={() => setIsDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Criar Turma
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClasses.map((cls) => (
            <Card key={cls.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{cls.name}</CardTitle>
                    <CardDescription className="mt-1">
                      {cls.subject}
                    </CardDescription>
                  </div>
                  <Badge className={getStatusColor(cls.status)}>
                    {getStatusLabel(cls.status)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <User className="w-4 h-4" />
                    <span>{cls.teacher}</span>
                  </div>
                  
                  {cls.schedule && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span>{cls.schedule}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span className={getCapacityColor(cls._count.students, cls.capacity)}>
                        {cls._count.students}/{cls.capacity}
                      </span>
                    </div>
                    <span className="text-gray-500">
                      {cls._count.activities} atividades
                    </span>
                  </div>
                  
                  {cls.description && (
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {cls.description}
                    </p>
                  )}
                  
                  <div className="flex gap-2 pt-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1 clickable"
                      onClick={() => handleEdit(cls)}
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Editar
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1 clickable"
                      onClick={() => handleViewStudents(cls.id)}
                    >
                      <Users className="w-4 h-4 mr-1" />
                      Ver Alunos
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="clickable text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => handleDelete(cls.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Stats Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Resumo das Turmas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{classes.length}</div>
              <div className="text-sm text-gray-600">Total de Turmas</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {classes.filter(c => c.status === 'active').length}
              </div>
              <div className="text-sm text-gray-600">Turmas Ativas</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {classes.reduce((sum, c) => sum + c._count.students, 0)}
              </div>
              <div className="text-sm text-gray-600">Total de Alunos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {classes.reduce((sum, c) => sum + c._count.activities, 0)}
              </div>
              <div className="text-sm text-gray-600">Total de Atividades</div>
            </div>
          </div>
        </CardContent>
      </Card>
      </div>
    </>
  )
}