'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus, Edit, CheckCircle, XCircle, Clock, Users, GraduationCap, Calendar, Calculator, BookOpen, ChevronDown } from 'lucide-react'

interface Student {
  id: string
  name: string
  email: string
  classId: string
  className: string
  grade: string // "6ano", "7ano", "8ano", "9ano"
}

interface Grade {
  id: string
  studentId: string
  studentName: string
  subject: string
  classId: string
  bimester: number
  note1?: number
  note2?: number
  note3?: number
  average?: number
  status: string
  gradedAt: string
  gradedBy?: string
}

interface Attendance {
  id: string
  studentId: string
  studentName: string
  classId: string
  className: string
  date: string
  status: 'present' | 'absent' | 'justified'
  observations?: string
}

interface StudentGrades {
  studentId: string
  studentName: string
  className: string
  grades: {
    [key: string]: {
      note1: number | null
      note2: number | null
      note3: number | null
      average: number | null
    }
  }
}

export default function AdminGradesAttendance() {
  const [activeTab, setActiveTab] = useState('grades')
  const [students, setStudents] = useState<Student[]>([])
  const [grades, setGrades] = useState<Grade[]>([])
  const [attendance, setAttendance] = useState<Attendance[]>([])
  const [loading, setLoading] = useState(true)
  const [isGradeDialogOpen, setIsGradeDialogOpen] = useState(false)
  const [isAttendanceDialogOpen, setIsAttendanceDialogOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [selectedClass, setSelectedClass] = useState('6ano')
  const [selectedBimester, setSelectedBimester] = useState('1')
  const [selectedSubject, setSelectedSubject] = useState('ciencias')
  const [observations, setObservations] = useState<{[key: string]: string}>({})
  
  // Estados para o formulário de notas
  const [gradeForm, setGradeForm] = useState({
    subject: '',
    classId: '',
    note1: '',
    note2: '',
    note3: ''
  })
  
  // Estados para seleção de alunos
  const [selectedStudents, setSelectedStudents] = useState<string[]>([])
  const [selectAll, setSelectAll] = useState(false)
  const [isStudentDropdownOpen, setIsStudentDropdownOpen] = useState(false)
  
  // Estados para pop-up
  const [showSuccessPopup, setShowSuccessPopup] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  // Mock data - agora usando séries em vez de turmas específicas
  const classes = [
    { id: '6ano', name: '6º Ano', grade: '6ano' },
    { id: '7ano', name: '7º Ano', grade: '7ano' },
    { id: '8ano', name: '8º Ano', grade: '8ano' },
    { id: '9ano', name: '9º Ano', grade: '9ano' }
  ]

  const subjects = [
    { id: 'algebra', name: 'Álgebra', grades: ['7ano', '8ano', '9ano'] },
    { id: 'artes', name: 'Artes', grades: ['6ano', '7ano', '8ano', '9ano'] },
    { id: 'ed_fisica', name: 'Educação Física', grades: ['6ano', '7ano', '8ano', '9ano'] },
    { id: 'geografia', name: 'Geografia', grades: ['6ano', '7ano', '8ano', '9ano'] },
    { id: 'geometria', name: 'Geometria', grades: ['6ano', '7ano', '8ano', '9ano'] },
    { id: 'gramatica', name: 'Gramática', grades: ['6ano', '7ano', '8ano', '9ano'] },
    { id: 'historia', name: 'História', grades: ['6ano', '7ano', '8ano', '9ano'] },
    { id: 'ingles', name: 'Inglês', grades: ['6ano', '7ano', '8ano', '9ano'] },
    { id: 'ciencias', name: 'Ciências', grades: ['6ano', '7ano', '8ano'] },
    { id: 'redacao', name: 'Redação', grades: ['6ano', '7ano', '8ano', '9ano'] },
    { id: 'fisica', name: 'Física', grades: ['9ano'] },
    { id: 'quimica', name: 'Química', grades: ['9ano'] },
    { id: 'biologia', name: 'Biologia', grades: ['9ano'] }
  ]

  const bimesters = [
    { value: '1', label: '1º Bimestre' },
    { value: '2', label: '2º Bimestre' },
    { value: '3', label: '3º Bimestre' },
    { value: '4', label: '4º Bimestre' }
  ]

  const mockGrades: Grade[] = []

  const mockAttendance: Attendance[] = []

  // Buscar alunos e notas do banco de dados
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        // Buscar alunos
        const response = await fetch('/api/students')
        const data = await response.json()
        
        if (data.success) {
          // Transformar os dados dos alunos para o formato esperado
          const transformedStudents: Student[] = data.data.map((student: any) => ({
            id: student.id,
            name: student.name,
            email: student.email,
            classId: student.grade || '6ano', // Usar grade como classId
            className: student.grade ? getClassNameByGrade(student.grade) : '6º Ano',
            grade: student.grade || '6ano'
          }))
          setStudents(transformedStudents)
          console.log('📚 Alunos carregados:', transformedStudents.length)
        }
        
        // Buscar notas do banco de dados
        const gradesResponse = await fetch('/api/grades')
        if (gradesResponse.ok) {
          const gradesData = await gradesResponse.json()
          setGrades(gradesData.data || [])
        } else {
          setGrades(mockGrades)
        }
        
        // Buscar presença do banco de dados
        const attendanceResponse = await fetch('/api/attendance')
        if (attendanceResponse.ok) {
          const attendanceData = await attendanceResponse.json()
          setAttendance(attendanceData.data || [])
        } else {
          setAttendance(mockAttendance)
        }
        
      } catch (error) {
        console.error('Erro ao buscar dados:', error)
        setGrades(mockGrades)
      } finally {
        setLoading(false)
      }
    }

    fetchStudents()
    setAttendance(mockAttendance)
  }, [])

  // Função auxiliar para obter nome da turma pelo grade
  const getClassNameByGrade = (grade: string): string => {
    const gradeMap: { [key: string]: string } = {
      '6ano': '6º Ano',
      '7ano': '7º Ano',
      '8ano': '8º Ano',
      '9ano': '9º Ano'
    }
    return gradeMap[grade] || '6º Ano'
  }

  // Limpar observações quando a data ou turma mudar
  useEffect(() => {
    setObservations({})
  }, [selectedDate, selectedClass])

  const handleGradeSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    console.log('🚀 Iniciando envio de notas...')
    console.log('selectedStudents:', selectedStudents)
    console.log('gradeForm:', gradeForm)
    console.log('selectedBimester:', selectedBimester)
    
    // Verificação básica
    if (selectedStudents.length === 0) {
      console.log('❌ Nenhum aluno selecionado')
      alert('Selecione pelo menos um aluno para lançar notas')
      return
    }
    
    if (!gradeForm.subject || !gradeForm.classId) {
      console.log('❌ Matéria ou série não selecionada')
      alert('Selecione a matéria e a série')
      return
    }
    
    // Verificar se pelo menos uma nota foi preenchida
    if (!gradeForm.note1 && !gradeForm.note2 && !gradeForm.note3) {
      console.log('❌ Nenhuma nota preenchida')
      alert('Preencha pelo menos uma nota')
      return
    }
    
    try {
      // Preparar dados para envio
      const gradesData = selectedStudents.map(studentId => {
        const student = students.find(s => s.id === studentId)
        return {
          studentId,
          studentName: student?.name || '',
          subject: gradeForm.subject,
          classId: gradeForm.classId,
          bimester: parseInt(selectedBimester),
          note1: gradeForm.note1 ? parseFloat(gradeForm.note1) : null,
          note2: gradeForm.note2 ? parseFloat(gradeForm.note2) : null,
          note3: gradeForm.note3 ? parseFloat(gradeForm.note3) : null
        }
      })
      
      console.log('📦 Dados preparados para envio:', gradesData)
      
      // Mostrar loading
      console.log('📡 Enviando requisição para /api/grades...')
      
      // Enviar para API
      const response = await fetch('/api/grades', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ gradesData }),
      })
      
      console.log('📡 Resposta da API - Status:', response.status)
      console.log('📡 Headers da resposta:', response.headers)
      
      if (!response.ok) {
        console.log('❌ Resposta não OK:', response.statusText)
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const result = await response.json()
      console.log('📋 Resultado da API:', result)
      
      if (result.success) {
        // Resetar formulário
        setGradeForm({ subject: '', classId: '', note1: '', note2: '', note3: '' })
        setSelectedStudents([])
        setSelectAll(false)
        setIsStudentDropdownOpen(false)
        setIsGradeDialogOpen(false)
        
        // Mostrar sucesso
        alert(`✅ ${result.message}`)
      } else {
        console.log('❌ Erro na API:', result.error)
        alert(`❌ Erro: ${result.error}`)
      }
      
    } catch (error) {
      console.error('❌ Erro ao lançar notas:', error)
      alert(`❌ Erro ao lançar notas: ${error.message}`)
    }
  }

  // Funções para seleção de alunos
  const toggleStudentSelection = (studentId: string) => {
    setSelectedStudents(prev => 
      prev.includes(studentId) 
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    )
  }

  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedStudents([])
    } else {
      setSelectedStudents(filteredStudents.map(s => s.id))
    }
    setSelectAll(!selectAll)
  }

  const removeSelectedStudent = (studentId: string) => {
    setSelectedStudents(prev => prev.filter(id => id !== studentId))
  }

  const getSelectedStudentsNames = () => {
    return selectedStudents.map(id => {
      const student = students.find(s => s.id === id)
      return student ? student.name : ''
    }).filter(name => name)
  }

  // Resetar seleção quando mudar a turma
  useEffect(() => {
    setSelectedStudents([])
    setSelectAll(false)
  }, [selectedClass])

  // Fechar dropdown quando clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isStudentDropdownOpen) {
        const target = event.target as Element
        if (!target.closest('.student-dropdown-container')) {
          setIsStudentDropdownOpen(false)
        }
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isStudentDropdownOpen])

  const handleAttendanceSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      // Preparar dados para salvar
      const attendanceData = filteredStudents.map(student => {
        const attendanceRecord = attendance.find(a => 
          a.studentId === student.id && a.date === selectedDate
        )
        
        return {
          studentId: student.id,
          classId: selectedClass,
          date: selectedDate,
          status: attendanceRecord?.status || 'present',
          observations: observations[student.id] || attendanceRecord?.observations || ''
        }
      })

      console.log('💾 Salvando presença:', attendanceData)

      const response = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ attendanceData })
      })

      const result = await response.json()
      
      if (result.success) {
        console.log('✅ Presença salva:', result.message)
        // Recarregar presença do banco
        const attendanceResponse = await fetch('/api/attendance')
        if (attendanceResponse.ok) {
          const attendanceData = await attendanceResponse.json()
          setAttendance(attendanceData.data || [])
        }
      } else {
        console.error('❌ Erro ao salvar presença:', result.error)
      }
    } catch (error) {
      console.error('❌ Erro ao salvar presença:', error)
    }
    
    setIsAttendanceDialogOpen(false)
  }

  const updateAttendanceStatus = (studentId: string, status: 'present' | 'absent' | 'justified') => {
    const student = students.find(s => s.id === studentId)
    if (!student) return

    setAttendance(prev => {
      // Procurar registro existente
      const existingIndex = prev.findIndex(record => 
        record.studentId === studentId && record.date === selectedDate
      )

      const observation = observations[studentId] || undefined

      if (existingIndex >= 0) {
        // Atualizar registro existente
        const updated = [...prev]
        updated[existingIndex] = { ...updated[existingIndex], status, observations: observation }
        return updated
      } else {
        // Criar novo registro
        const newRecord: Attendance = {
          id: Date.now().toString(),
          studentId,
          studentName: student.name,
          classId: student.classId,
          className: student.className,
          date: selectedDate,
          status,
          observations: observation
        }
        return [...prev, newRecord]
      }
    })
  }

  const updateObservation = (studentId: string, observation: string) => {
    setObservations(prev => ({
      ...prev,
      [studentId]: observation
    }))

    // Atualizar o registro de presença existente se houver
    setAttendance(prev => {
      const existingIndex = prev.findIndex(record => 
        record.studentId === studentId && record.date === selectedDate
      )

      if (existingIndex >= 0) {
        const updated = [...prev]
        updated[existingIndex] = { ...updated[existingIndex], observations: observation }
        return updated
      }
      return prev
    })
  }

  // Função para marcar todos como presentes
  const markAllAsPresent = () => {
    filteredStudents.forEach(student => {
      updateAttendanceStatus(student.id, 'present')
    })
  }

  // Função para limpar todos os registros
  const clearAllAttendance = () => {
    setAttendance(prev => prev.filter(record => 
      !(record.date === selectedDate && record.classId === selectedClass)
    ))
    setObservations({})
  }

  const getGradeColor = (grade: number, maxGrade: number) => {
    const percentage = (grade / maxGrade) * 100
    if (percentage >= 90) return 'text-green-600'
    if (percentage >= 70) return 'text-blue-600'
    if (percentage >= 50) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present': return 'bg-green-100 text-green-800'
      case 'absent': return 'bg-red-100 text-red-800'
      case 'justified': return 'bg-blue-100 text-blue-800'
      case 'graded': return 'bg-blue-100 text-blue-800'
      case 'pending': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'present': return 'Presente'
      case 'absent': return 'Ausente'
      case 'justified': return 'Falta Justificada'
      case 'graded': return 'Avaliado'
      case 'pending': return 'Pendente'
      default: return status
    }
  }

  // Obter matérias disponíveis para a turma selecionada
  const getAvailableSubjects = () => {
    const selectedClassData = classes.find(c => c.id === selectedClass)
    if (!selectedClassData) return subjects
    
    return subjects.filter(subject => 
      subject.grades.includes(selectedClassData.grade)
    )
  }

  // Agrupar notas por aluno e matéria
  const getStudentGradesByBimester = (): StudentGrades[] => {
    const filteredStudents = students.filter(s => s.classId === selectedClass)

    const bimesterNum = parseInt(selectedBimester)
    const selectedSubjectData = getAvailableSubjects().find(s => s.id === selectedSubject)

    return filteredStudents.map(student => {
      const studentGrades: StudentGrades = {
        studentId: student.id,
        studentName: student.name,
        className: student.className,
        grades: {}
      }

      // Apenas a matéria selecionada
      if (selectedSubjectData) {
        const subjectGrades = grades.filter(g => 
          g.studentId === student.id && 
          g.subject === selectedSubjectData.id && 
          g.bimester === bimesterNum
        )

        // Se houver notas para este aluno nesta matéria
        if (subjectGrades.length > 0) {
          const grade = subjectGrades[0] // Pega a primeira (e única) nota
          const note1 = grade.note1 || null
          const note2 = grade.note2 || null
          const note3 = grade.note3 || null
          const average = grade.average || null

          studentGrades.grades[selectedSubjectData.id] = {
            note1,
            note2,
            note3,
            average
          }
        } else {
          // Sem notas para este aluno
          studentGrades.grades[selectedSubjectData.id] = {
            note1: null,
            note2: null,
            note3: null,
            average: null
          }
        }
      }

      return studentGrades
    })
  }

  const filteredStudents = students.filter(s => s.classId === selectedClass)

  const filteredAttendance = attendance.filter(record => 
    record.date === selectedDate && record.classId === selectedClass
  )

  const studentGradesData = getStudentGradesByBimester()
  const availableSubjects = getAvailableSubjects()

  return (
    <div className="space-y-6 overflow-x-hidden">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold">Notas e Presença</h3>
        <p className="text-sm text-gray-600">Gerencie notas acadêmicas e controle de frequência</p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando alunos...</p>
          </div>
        </div>
      ) : (
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="grades">Notas</TabsTrigger>
          <TabsTrigger value="attendance">Presença</TabsTrigger>
        </TabsList>

        {/* Grades Tab */}
        <TabsContent value="grades" className="space-y-6">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
            <div className="flex flex-col sm:flex-row gap-4 flex-wrap">
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Selecione uma série" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((cls) => (
                    <SelectItem key={cls.id} value={cls.id}>
                      {cls.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={selectedBimester} onValueChange={setSelectedBimester}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Selecione o bimestre" />
                </SelectTrigger>
                <SelectContent>
                  {bimesters.map((bimester) => (
                    <SelectItem key={bimester.value} value={bimester.value}>
                      {bimester.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger className="w-full sm:w-56">
                  <SelectValue placeholder="Selecione a matéria" />
                </SelectTrigger>
                <SelectContent>
                  {availableSubjects.map((subject) => (
                    <SelectItem key={subject.id} value={subject.id}>
                      {subject.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Diálogo de Presença */}
            <Dialog open={isAttendanceDialogOpen} onOpenChange={setIsAttendanceDialogOpen}>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Registrar Presença</DialogTitle>
                  <DialogDescription>
                    Registre a presença dos alunos para {selectedDate}
                  </DialogDescription>
                </DialogHeader>
                
                <form onSubmit={handleAttendanceSubmit}>
                  <div className="max-h-96 overflow-y-auto space-y-3 py-4">
                    {filteredStudents.map((student) => {
                      const attendanceRecord = filteredAttendance.find(a => a.studentId === student.id)
                      const currentStatus = attendanceRecord?.status || 'present'
                      
                      return (
                        <div key={student.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex-1">
                            <p className="font-medium">{student.name}</p>
                            <p className="text-sm text-gray-500">{student.className}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Select 
                              value={currentStatus} 
                              onValueChange={(value: 'present' | 'absent' | 'justified') => 
                                updateAttendanceStatus(student.id, value)
                              }
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="present">
                                  <div className="flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4 text-green-600" />
                                    Presente
                                  </div>
                                </SelectItem>
                                <SelectItem value="absent">
                                  <div className="flex items-center gap-2">
                                    <XCircle className="w-4 h-4 text-red-600" />
                                    Ausente
                                  </div>
                                </SelectItem>
                                <SelectItem value="justified">
                                  <div className="flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-blue-600" />
                                    Justificado
                                  </div>
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsAttendanceDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button type="submit">
                      Salvar Presença
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
            
            <Dialog open={isGradeDialogOpen} onOpenChange={setIsGradeDialogOpen}>
              <DialogTrigger asChild>
                <Button className="clickable w-full sm:w-auto">
                  <Plus className="w-4 h-4 mr-2" />
                  Lançar Notas
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Lançar Notas</DialogTitle>
                  <DialogDescription>
                    Registre as notas dos alunos para o {bimesters.find(b => b.value === selectedBimester)?.label}
                  </DialogDescription>
                </DialogHeader>
                
                <form onSubmit={handleGradeSubmit}>
                  <div className="grid gap-4 py-4">
                    {/* Seleção de Alunos */}
                    <div className="grid gap-2">
                      <Label>Selecionar Alunos</Label>
                      <div className="relative student-dropdown-container">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsStudentDropdownOpen(!isStudentDropdownOpen)}
                          className="w-full justify-between h-auto py-3"
                        >
                          <span className="text-left">
                            {selectedStudents.length === 0 
                              ? 'Clique para selecionar alunos...' 
                              : `${selectedStudents.length} aluno(s) selecionado(s)`
                            }
                          </span>
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                        
                        {isStudentDropdownOpen && (
                          <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-y-auto">
                            <div className="p-2 border-b">
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={toggleSelectAll}
                                className="w-full justify-start"
                              >
                                {selectAll ? 'Desmarcar Todos' : 'Selecionar Todos'}
                              </Button>
                            </div>
                            {filteredStudents.map((student) => (
                              <div key={student.id} className="p-2 hover:bg-gray-50">
                                <label className="flex items-center space-x-2 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={selectedStudents.includes(student.id)}
                                    onChange={() => toggleStudentSelection(student.id)}
                                    className="rounded"
                                  />
                                  <span className="text-sm">{student.name}</span>
                                </label>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      {/* Alunos selecionados */}
                      {selectedStudents.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {getSelectedStudentsNames().map((name, index) => (
                            <Badge key={index} variant="secondary" className="flex items-center gap-1">
                              {name}
                              <button
                                type="button"
                                onClick={() => removeSelectedStudent(selectedStudents[index])}
                                className="ml-1 text-xs hover:text-red-600"
                              >
                                ×
                              </button>
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="subject">Matéria</Label>
                      <Select value={gradeForm.subject} onValueChange={(value) => setGradeForm(prev => ({ ...prev, subject: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma matéria" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableSubjects.map((subject) => (
                            <SelectItem key={subject.id} value={subject.id}>
                              {subject.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="class">Série</Label>
                      <Select value={gradeForm.classId} onValueChange={(value) => setGradeForm(prev => ({ ...prev, classId: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma série" />
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

                    <div className="grid grid-cols-3 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="note1">1ª Nota</Label>
                        <Input
                          id="note1"
                          type="number"
                          min="0"
                          max="10"
                          step="0.1"
                          placeholder="0.0"
                          value={gradeForm.note1}
                          onChange={(e) => setGradeForm(prev => ({ ...prev, note1: e.target.value }))}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="note2">2ª Nota</Label>
                        <Input
                          id="note2"
                          type="number"
                          min="0"
                          max="10"
                          step="0.1"
                          placeholder="0.0"
                          value={gradeForm.note2}
                          onChange={(e) => setGradeForm(prev => ({ ...prev, note2: e.target.value }))}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="note3">3ª Nota</Label>
                        <Input
                          id="note3"
                          type="number"
                          min="0"
                          max="10"
                          step="0.1"
                          placeholder="0.0"
                          value={gradeForm.note3}
                          onChange={(e) => setGradeForm(prev => ({ ...prev, note3: e.target.value }))}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsGradeDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={selectedStudents.length === 0}>
                      Lançar Notas
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Grades Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5" />
                Registro de Notas - {bimesters.find(b => b.value === selectedBimester)?.label}
                <Badge variant="secondary">
                  {availableSubjects.find(s => s.id === selectedSubject)?.name}
                </Badge>
              </CardTitle>
              <CardDescription>
                Visualize e gerencie as notas dos alunos por matéria
              </CardDescription>
            </CardHeader>
            <CardContent>
              {studentGradesData.length > 0 && (
                <div className="overflow-x-auto max-w-full">
                  <Table className="min-w-[600px]">
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-48 min-w-[180px]">Aluno</TableHead>
                        <TableHead colSpan={4} className="text-center min-w-[300px]">
                          {availableSubjects.find(s => s.id === selectedSubject)?.name || 'Matéria Selecionada'}
                        </TableHead>
                      </TableRow>
                      <TableRow>
                        <TableHead></TableHead>
                        <TableHead className="text-center text-xs min-w-[80px]">1ª Nota</TableHead>
                        <TableHead className="text-center text-xs min-w-[80px]">2ª Nota</TableHead>
                        <TableHead className="text-center text-xs min-w-[80px]">3ª Nota</TableHead>
                        <TableHead className="text-center text-xs min-w-[80px]">Média</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {studentGradesData.map((student) => {
                        const grades = student.grades[selectedSubject]
                        return (
                          <TableRow key={student.studentId}>
                            <TableCell className="font-medium min-w-[180px]">
                              <div>
                                <p className="font-semibold">{student.studentName}</p>
                                <p className="text-xs text-gray-500">{student.className}</p>
                              </div>
                            </TableCell>
                            <TableCell className="text-center min-w-[80px]">
                              {grades && grades.note1 !== null && grades.note1 !== undefined ? (
                                <span className={`font-semibold ${getGradeColor(grades.note1, 10)}`}>
                                  {grades.note1.toFixed(1)}
                                </span>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </TableCell>
                            <TableCell className="text-center min-w-[80px]">
                              {grades && grades.note2 !== null && grades.note2 !== undefined ? (
                                <span className={`font-semibold ${getGradeColor(grades.note2, 10)}`}>
                                  {grades.note2.toFixed(1)}
                                </span>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </TableCell>
                            <TableCell className="text-center min-w-[80px]">
                              {grades && grades.note3 !== null && grades.note3 !== undefined ? (
                                <span className={`font-semibold ${getGradeColor(grades.note3, 10)}`}>
                                  {grades.note3.toFixed(1)}
                                </span>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </TableCell>
                            <TableCell className="text-center min-w-[80px]">
                              {grades && grades.average !== null && grades.average !== undefined ? (
                                <div className="flex items-center justify-center gap-1">
                                  <Calculator className="w-3 h-3 text-gray-400" />
                                  <span className={`font-bold ${getGradeColor(grades.average, 10)}`}>
                                    {grades.average.toFixed(1)}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
              
              {studentGradesData.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhum aluno encontrado para os filtros selecionados</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Alunos</p>
                    <p className="text-2xl font-bold text-gray-900">{studentGradesData.length}</p>
                  </div>
                  <Users className="w-8 h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Matéria Atual</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {availableSubjects.find(s => s.id === selectedSubject)?.name || 'N/A'}
                    </p>
                  </div>
                  <GraduationCap className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Notas Lançadas</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {grades.filter(g => 
                        g.bimester === parseInt(selectedBimester) && 
                        g.subject === selectedSubject
                      ).length}
                    </p>
                    <p className="text-xs text-gray-500">
                      {availableSubjects.find(s => s.id === selectedSubject)?.name} - {selectedBimester}º Bim
                    </p>
                  </div>
                  <Calculator className="w-8 h-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Pendentes</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {grades.filter(g => g.bimester === parseInt(selectedBimester) && g.status === 'pending').length}
                    </p>
                  </div>
                  <Clock className="w-8 h-8 text-yellow-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Attendance Tab */}
        <TabsContent value="attendance" className="space-y-6">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full sm:w-48"
              />
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger className="w-full sm:w-64">
                  <SelectValue placeholder="Selecione uma série" />
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
            
            <div className="flex flex-col sm:flex-row gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={markAllAsPresent}
                className="clickable w-full sm:w-auto"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Marcar Todos Presentes
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={clearAllAttendance}
                className="clickable w-full sm:w-auto"
              >
                <XCircle className="w-4 h-4 mr-2" />
                Limpar Tudo
              </Button>
              {/* Botão de Teste */}
              <Button 
                onClick={async () => {
                  console.log('🧪 TESTE DIRETO DA API')
                  try {
                    const response = await fetch('/api/grades', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        gradesData: [{
                          studentId: 'cmgr7apdt0001qhcdmeevt3nj',
                          studentName: 'João Pedro Santos',
                          subject: 'matematica',
                          classId: '7ano',
                          bimester: 1,
                          note1: 10.0,
                          note2: 9.0,
                          note3: 8.5
                        }]
                      })
                    })
                    const result = await response.json()
                    console.log('🧪 RESULTADO TESTE:', result)
                    alert(`🧪 Teste: ${result.success ? 'SUCESSO' : 'ERRO'} - ${result.message || result.error}`)
                  } catch (error) {
                    console.error('🧪 ERRO TESTE:', error)
                    alert(`🧪 Erro no teste: ${error.message}`)
                  }
                }}
                variant="outline"
                className="bg-yellow-100 hover:bg-yellow-200"
              >
                🧪 Testar API
              </Button>
              <Button className="clickable" onClick={() => setIsAttendanceDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Registrar Presença
              </Button>
            </div>
          </div>

          {/* Attendance Grid */}
          {/* Resumo de Presença */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Resumo de Presença - {selectedDate}</CardTitle>
              <CardDescription>
                Estatísticas da turma {classes.find(c => c.id === selectedClass)?.name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {filteredAttendance.filter(a => a.status === 'present').length}
                  </div>
                  <div className="text-sm text-gray-600">Presentes</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {filteredAttendance.filter(a => a.status === 'justified').length}
                  </div>
                  <div className="text-sm text-gray-600">Faltas Justificadas</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {filteredAttendance.filter(a => a.status === 'absent').length}
                  </div>
                  <div className="text-sm text-gray-600">Ausentes</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {filteredStudents.length}
                  </div>
                  <div className="text-sm text-gray-600">Total</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4">
            {filteredStudents.map((student) => {
              const attendanceRecord = filteredAttendance.find(a => a.studentId === student.id)
              const currentObservation = observations[student.id] || attendanceRecord?.observations || ''
              
              return (
                <Card key={student.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-semibold">{student.name}</h4>
                        <p className="text-sm text-gray-600">{student.className}</p>
                        {attendanceRecord && (
                          <Badge 
                            variant="secondary" 
                            className={`mt-1 ${getStatusColor(attendanceRecord.status)}`}
                          >
                            {getStatusLabel(attendanceRecord.status)}
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          variant={attendanceRecord?.status === 'present' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => updateAttendanceStatus(student.id, 'present')}
                          className="clickable"
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Presente
                        </Button>
                        <Button
                          variant={attendanceRecord?.status === 'justified' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => updateAttendanceStatus(student.id, 'justified')}
                          className="clickable"
                        >
                          <Clock className="w-4 h-4 mr-1" />
                          Falta Justificada
                        </Button>
                        <Button
                          variant={attendanceRecord?.status === 'absent' ? 'destructive' : 'outline'}
                          size="sm"
                          onClick={() => updateAttendanceStatus(student.id, 'absent')}
                          className="clickable"
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Ausente
                        </Button>
                      </div>
                    </div>
                    
                    {/* Campo de Observações */}
                    <div className="mt-3">
                      <Label htmlFor={`obs-${student.id}`} className="text-xs text-gray-600">
                        Observações (opcional):
                      </Label>
                      <Textarea
                        id={`obs-${student.id}`}
                        placeholder="Adicione observações sobre a presença do aluno..."
                        value={currentObservation}
                        onChange={(e) => updateObservation(student.id, e.target.value)}
                        className="mt-1 min-h-[60px] text-sm"
                      />
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>
      </Tabs>
      )}
      
      {/* Pop-up de Sucesso/Erro */}
      {showSuccessPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="text-center">
              <div className={`mx-auto flex items-center justify-center h-12 w-12 rounded-full mb-4 ${
                successMessage.includes('sucesso') || successMessage.includes('salva') 
                  ? 'bg-green-100' 
                  : 'bg-red-100'
              }`}>
                {successMessage.includes('sucesso') || successMessage.includes('salva') ? (
                  <CheckCircle className="h-6 w-6 text-green-600" />
                ) : (
                  <XCircle className="h-6 w-6 text-red-600" />
                )}
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {successMessage.includes('sucesso') || successMessage.includes('salva') 
                  ? 'Sucesso!' 
                  : 'Atenção!'
                }
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                {successMessage}
              </p>
              <Button
                onClick={() => setShowSuccessPopup(false)}
                className="w-full"
              >
                OK
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}