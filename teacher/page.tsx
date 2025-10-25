'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { BookOpen, Users, Calculator, Calendar, Plus, CheckCircle, XCircle, Clock, LogOut } from 'lucide-react'
import { signOut, useSession } from 'next-auth/react'

interface Teacher {
  id: string
  name: string
  email: string
  phone?: string
  subjects: string[]
  grades: string[]
  status: string
}

interface Student {
  id: string
  name: string
  email: string
  grade: string
  className: string
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
}

interface Attendance {
  id: string
  studentId: string
  studentName: string
  classId: string
  date: string
  status: string
  observations?: string
}

export default function TeacherDashboard() {
  const { data: session } = useSession()
  const [teacher, setTeacher] = useState<Teacher | null>(null)
  const [students, setStudents] = useState<Student[]>([])
  const [grades, setGrades] = useState<Grade[]>([])
  const [attendance, setAttendance] = useState<Attendance[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedClass, setSelectedClass] = useState('')
  const [selectedSubject, setSelectedSubject] = useState('')
  const [selectedBimester, setSelectedBimester] = useState('1')
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/login' })
  }

  // Carregar dados do professor
  useEffect(() => {
    const fetchTeacherData = async () => {
      try {
        const response = await fetch('/api/teachers/me')
        const result = await response.json()
        
        if (result.success && result.data.teacher) {
          setTeacher(result.data.teacher)
          // Definir valores iniciais baseados nas permissões do professor
          if (result.data.teacher.grades.length > 0) {
            setSelectedClass(result.data.teacher.grades[0])
          }
          if (result.data.teacher.subjects.length > 0) {
            setSelectedSubject(result.data.teacher.subjects[0])
          }
        }
      } catch (error) {
        console.error('Erro ao carregar dados do professor:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchTeacherData()
  }, [])

  // Carregar alunos e notas quando o professor estiver carregado
  useEffect(() => {
    if (teacher && selectedClass && selectedSubject) {
      fetchStudentsAndGrades()
    }
  }, [teacher, selectedClass, selectedSubject])

  const fetchStudentsAndGrades = async () => {
    try {
      // Buscar alunos
      const studentsResponse = await fetch('/api/students')
      if (studentsResponse.ok) {
        const studentsData = await studentsResponse.json()
        const filteredStudents = studentsData.data.filter((student: Student) => 
          teacher?.grades.includes(student.grade)
        )
        setStudents(filteredStudents)
      }

      // Buscar notas
      const gradesResponse = await fetch('/api/grades')
      if (gradesResponse.ok) {
        const gradesData = await gradesResponse.json()
        const filteredGrades = gradesData.data.filter((grade: Grade) => 
          teacher?.subjects.includes(grade.subject) && 
          teacher?.grades.includes(grade.classId)
        )
        setGrades(filteredGrades)
      }

      // Buscar presença
      const attendanceResponse = await fetch('/api/attendance')
      if (attendanceResponse.ok) {
        const attendanceData = await attendanceResponse.json()
        const filteredAttendance = attendanceData.data.filter((record: Attendance) => 
          teacher?.grades.includes(record.classId)
        )
        setAttendance(filteredAttendance)
      }
    } catch (error) {
      console.error('Erro ao buscar dados:', error)
    }
  }

  // Funções auxiliares
  const getGradeColor = (grade: number, maxGrade: number = 10) => {
    const percentage = (grade / maxGrade) * 100
    if (percentage >= 90) return 'text-green-600'
    if (percentage >= 70) return 'text-blue-600'
    if (percentage >= 50) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getClassNameByGrade = (grade: string): string => {
    const gradeMap: { [key: string]: string } = {
      '6ano': '6º Ano',
      '7ano': '7º Ano',
      '8ano': '8º Ano',
      '9ano': '9º Ano'
    }
    return gradeMap[grade] || grade
  }

  const getSubjectNameById = (subjectId: string): string => {
    const subjectMap: { [key: string]: string } = {
      'algebra': 'Álgebra',
      'artes': 'Artes',
      'ed_fisica': 'Educação Física',
      'geografia': 'Geografia',
      'geometria': 'Geometria',
      'gramatica': 'Gramática',
      'historia': 'História',
      'ingles': 'Inglês',
      'ciencias': 'Ciências',
      'redacao': 'Redação',
      'fisica': 'Física',
      'quimica': 'Química',
      'biologia': 'Biologia',
      'matematica': 'Matemática',
      'portugues': 'Português'
    }
    return subjectMap[subjectId] || subjectId
  }

  const bimesters = [
    { value: '1', label: '1º Bimestre' },
    { value: '2', label: '2º Bimestre' },
    { value: '3', label: '3º Bimestre' },
    { value: '4', label: '4º Bimestre' }
  ]

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  if (!teacher) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600">Erro ao carregar dados do professor</p>
        </div>
      </div>
    )
  }

  // Filtrar dados baseados nas seleções
  const filteredStudents = students.filter(s => s.grade === selectedClass)
  const filteredGrades = grades.filter(g => 
    g.classId === selectedClass && 
    g.subject === selectedSubject && 
    g.bimester === parseInt(selectedBimester)
  )
  const filteredAttendance = attendance.filter(a => 
    a.classId === selectedClass && a.date === selectedDate
  )

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold">Dashboard do Professor</h1>
          <p className="text-gray-600">Bem-vindo(a), {teacher.name}!</p>
          <div className="flex flex-wrap gap-2 mt-2">
            {teacher.subjects.map(subject => (
              <Badge key={subject} variant="secondary">
                {getSubjectNameById(subject)}
              </Badge>
            ))}
          </div>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleLogout}
            className="flex items-center gap-2 text-red-600 hover:text-red-700"
          >
            <LogOut className="w-4 h-4" />
            Sair
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Meus Alunos</p>
                <p className="text-2xl font-bold">{filteredStudents.length}</p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Notas Lançadas</p>
                <p className="text-2xl font-bold">{filteredGrades.length}</p>
              </div>
              <Calculator className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Presença Hoje</p>
                <p className="text-2xl font-bold">
                  {filteredAttendance.filter(a => a.status === 'present').length}
                </p>
              </div>
              <Calendar className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Turmas</p>
                <p className="text-2xl font-bold">{teacher.grades.length}</p>
              </div>
              <BookOpen className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="grades" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="grades">Notas</TabsTrigger>
          <TabsTrigger value="attendance">Presença</TabsTrigger>
        </TabsList>

        {/* Grades Tab */}
        <TabsContent value="grades" className="space-y-6">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Selecione uma série" />
                </SelectTrigger>
                <SelectContent>
                  {teacher.grades.map(grade => (
                    <SelectItem key={grade} value={grade}>
                      {getClassNameByGrade(grade)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={selectedBimester} onValueChange={setSelectedBimester}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Selecione o bimestre" />
                </SelectTrigger>
                <SelectContent>
                  {bimesters.map(bimester => (
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
                  {teacher.subjects.map(subject => (
                    <SelectItem key={subject} value={subject}>
                      {getSubjectNameById(subject)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Grades Table */}
          <Card>
            <CardHeader>
              <CardTitle>
                Notas - {getSubjectNameById(selectedSubject)}
                <Badge variant="secondary" className="ml-2">
                  {getClassNameByGrade(selectedClass)}
                </Badge>
              </CardTitle>
              <CardDescription>
                Visualize as notas dos seus alunos
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredStudents.length > 0 ? (
                <div className="overflow-x-auto max-w-full">
                  <Table className="min-w-[600px]">
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-48 min-w-[180px]">Aluno</TableHead>
                        <TableHead className="text-center min-w-[80px]">1ª Nota</TableHead>
                        <TableHead className="text-center min-w-[80px]">2ª Nota</TableHead>
                        <TableHead className="text-center min-w-[80px]">3ª Nota</TableHead>
                        <TableHead className="text-center min-w-[80px]">Média</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredStudents.map(student => {
                        const studentGrade = filteredGrades.find(g => g.studentId === student.id)
                        return (
                          <TableRow key={student.id}>
                            <TableCell className="font-medium min-w-[180px]">
                              <div>
                                <p className="font-semibold">{student.name}</p>
                                <p className="text-xs text-gray-500">{getClassNameByGrade(student.grade)}</p>
                              </div>
                            </TableCell>
                            <TableCell className="text-center min-w-[80px]">
                              {studentGrade?.note1 ? (
                                <span className={`font-semibold ${getGradeColor(studentGrade.note1)}`}>
                                  {studentGrade.note1.toFixed(1)}
                                </span>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </TableCell>
                            <TableCell className="text-center min-w-[80px]">
                              {studentGrade?.note2 ? (
                                <span className={`font-semibold ${getGradeColor(studentGrade.note2)}`}>
                                  {studentGrade.note2.toFixed(1)}
                                </span>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </TableCell>
                            <TableCell className="text-center min-w-[80px]">
                              {studentGrade?.note3 ? (
                                <span className={`font-semibold ${getGradeColor(studentGrade.note3)}`}>
                                  {studentGrade.note3.toFixed(1)}
                                </span>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </TableCell>
                            <TableCell className="text-center min-w-[80px]">
                              {studentGrade?.average ? (
                                <div className="flex items-center justify-center gap-1">
                                  <Calculator className="w-3 h-3 text-gray-400" />
                                  <span className={`font-bold ${getGradeColor(studentGrade.average)}`}>
                                    {studentGrade.average.toFixed(1)}
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
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhum aluno encontrado para esta turma</p>
                </div>
              )}
            </CardContent>
          </Card>
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
                  {teacher.grades.map(grade => (
                    <SelectItem key={grade} value={grade}>
                      {getClassNameByGrade(grade)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Attendance List */}
          <Card>
            <CardHeader>
              <CardTitle>
                Presença - {selectedDate}
                <Badge variant="secondary" className="ml-2">
                  {getClassNameByGrade(selectedClass)}
                </Badge>
              </CardTitle>
              <CardDescription>
                Controle de frequência dos alunos
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredStudents.length > 0 ? (
                <div className="space-y-3">
                  {filteredStudents.map(student => {
                    const attendanceRecord = filteredAttendance.find(a => a.studentId === student.id)
                    return (
                      <div key={student.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-semibold">{student.name}</p>
                          <p className="text-sm text-gray-500">{getClassNameByGrade(student.grade)}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {attendanceRecord && (
                            <Badge 
                              variant={attendanceRecord.status === 'present' ? 'default' : 'secondary'}
                              className={
                                attendanceRecord.status === 'present' ? 'bg-green-100 text-green-800' :
                                attendanceRecord.status === 'absent' ? 'bg-red-100 text-red-800' :
                                'bg-yellow-100 text-yellow-800'
                              }
                            >
                              {attendanceRecord.status === 'present' && <CheckCircle className="w-3 h-3 mr-1" />}
                              {attendanceRecord.status === 'absent' && <XCircle className="w-3 h-3 mr-1" />}
                              {attendanceRecord.status === 'justified' && <Clock className="w-3 h-3 mr-1" />}
                              {attendanceRecord.status === 'present' ? 'Presente' :
                               attendanceRecord.status === 'absent' ? 'Ausente' : 'Falta Justificada'}
                            </Badge>
                          )}
                          {!attendanceRecord && (
                            <Badge variant="outline" className="text-gray-500">
                              Não registrado
                            </Badge>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhum aluno encontrado para esta turma</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
