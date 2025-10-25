'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Plus, Edit, Trash2, Calendar, Clock, Users, BookOpen } from 'lucide-react'

interface Activity {
  id: string
  title: string
  description: string
  type: 'assignment' | 'test' | 'project' | 'other'
  classId: string
  className: string
  dueDate: string
  status: 'active' | 'completed' | 'cancelled'
  createdAt: string
}

export default function AdminActivities() {
  const [activities, setActivities] = useState<Activity[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'assignment' as Activity['type'],
    classId: '',
    dueDate: ''
  })

  // Mock classes
  const classes = [
    { id: '1', name: 'Turma A - Matemática' },
    { id: '2', name: 'Turma B - Português' },
    { id: '3', name: 'Turma C - Ciências' },
    { id: '4', name: 'Turma D - História' }
  ]

  // Mock activities
  const mockActivities: Activity[] = [
    {
      id: '1',
      title: 'Prova de Matemática',
      description: 'Avaliação sobre equações de segundo grau',
      type: 'test',
      classId: '1',
      className: 'Turma A - Matemática',
      dueDate: '2024-01-15',
      status: 'active',
      createdAt: '2024-01-01'
    },
    {
      id: '2',
      title: 'Trabalho de Português',
      description: 'Redação sobre literatura brasileira',
      type: 'assignment',
      classId: '2',
      className: 'Turma B - Português',
      dueDate: '2024-01-18',
      status: 'active',
      createdAt: '2024-01-02'
    },
    {
      id: '3',
      title: 'Projeto de Ciências',
      description: 'Experimento sobre fotossíntese',
      type: 'project',
      classId: '3',
      className: 'Turma C - Ciências',
      dueDate: '2024-01-20',
      status: 'active',
      createdAt: '2024-01-03'
    }
  ]

  useEffect(() => {
    setActivities(mockActivities)
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (editingActivity) {
      // Edit existing activity
      setActivities(prev => prev.map(activity => 
        activity.id === editingActivity.id 
          ? {
              ...activity,
              ...formData,
              className: classes.find(c => c.id === formData.classId)?.name || ''
            }
          : activity
      ))
    } else {
      // Add new activity
      const newActivity: Activity = {
        id: Date.now().toString(),
        ...formData,
        className: classes.find(c => c.id === formData.classId)?.name || '',
        status: 'active',
        createdAt: new Date().toISOString().split('T')[0]
      }
      setActivities(prev => [...prev, newActivity])
    }

    resetForm()
    setIsDialogOpen(false)
  }

  const handleEdit = (activity: Activity) => {
    setEditingActivity(activity)
    setFormData({
      title: activity.title,
      description: activity.description,
      type: activity.type,
      classId: activity.classId,
      dueDate: activity.dueDate
    })
    setIsDialogOpen(true)
  }

  const handleDelete = (id: string) => {
    setActivities(prev => prev.filter(activity => activity.id !== id))
  }

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      type: 'assignment',
      classId: '',
      dueDate: ''
    })
    setEditingActivity(null)
  }

  const getTypeColor = (type: Activity['type']) => {
    switch (type) {
      case 'test': return 'bg-red-100 text-red-800'
      case 'assignment': return 'bg-blue-100 text-blue-800'
      case 'project': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeLabel = (type: Activity['type']) => {
    switch (type) {
      case 'test': return 'Prova'
      case 'assignment': return 'Tarefa'
      case 'project': return 'Projeto'
      default: return 'Outro'
    }
  }

  const getStatusColor = (status: Activity['status']) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'completed': return 'bg-blue-100 text-blue-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusLabel = (status: Activity['status']) => {
    switch (status) {
      case 'active': return 'Ativa'
      case 'completed': return 'Concluída'
      case 'cancelled': return 'Cancelada'
      default: return status
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Gestão de Atividades</h3>
          <p className="text-sm text-gray-600">Crie e gerencie atividades acadêmicas</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              className="clickable" 
              onClick={resetForm}
              data-testid="new-activity-button"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nova Atividade
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>
                {editingActivity ? 'Editar Atividade' : 'Nova Atividade'}
              </DialogTitle>
              <DialogDescription>
                {editingActivity ? 'Edite as informações da atividade' : 'Preencha os dados para criar uma nova atividade'}
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Título</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Ex: Prova de Matemática"
                    required
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Descreva a atividade detalhadamente"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="type">Tipo</Label>
                    <Select value={formData.type} onValueChange={(value: Activity['type']) => setFormData(prev => ({ ...prev, type: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="assignment">Tarefa</SelectItem>
                        <SelectItem value="test">Prova</SelectItem>
                        <SelectItem value="project">Projeto</SelectItem>
                        <SelectItem value="other">Outro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="dueDate">Data de Entrega</Label>
                    <Input
                      id="dueDate"
                      type="date"
                      value={formData.dueDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                      required
                    />
                  </div>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="classId">Turma</Label>
                  <Select value={formData.classId} onValueChange={(value) => setFormData(prev => ({ ...prev, classId: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma turma" />
                    </SelectTrigger>
                    <SelectContent>
                      {classes.map((cls) => (
                        <SelectItem key={cls.id} value={cls.id}>
                          {cls.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingActivity ? 'Salvar Alterações' : 'Criar Atividade'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Activities List */}
      <div className="grid gap-4">
        {activities.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhuma atividade encontrada
              </h3>
              <p className="text-gray-600 mb-4">
                Crie sua primeira atividade para começar a gerenciar as tarefas acadêmicas.
              </p>
              <Button className="clickable" onClick={() => setIsDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Criar Primeira Atividade
              </Button>
            </CardContent>
          </Card>
        ) : (
          activities.map((activity) => (
            <Card key={activity.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold text-lg">{activity.title}</h4>
                      <Badge className={getTypeColor(activity.type)}>
                        {getTypeLabel(activity.type)}
                      </Badge>
                      <Badge className={getStatusColor(activity.status)}>
                        {getStatusLabel(activity.status)}
                      </Badge>
                    </div>
                    
                    <p className="text-gray-600 mb-3">{activity.description}</p>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>{activity.className}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>Entrega: {new Date(activity.dueDate).toLocaleDateString('pt-BR')}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>Criado: {new Date(activity.createdAt).toLocaleDateString('pt-BR')}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(activity)}
                      className="clickable"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(activity.id)}
                      className="clickable text-red-600 hover:text-red-700 hover:border-red-300"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}