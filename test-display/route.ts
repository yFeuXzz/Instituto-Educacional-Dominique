import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Buscar notas
    const gradesResponse = await fetch('http://localhost:3000/api/grades')
    const gradesResult = await gradesResponse.json()
    
    // Buscar alunos
    const studentsResponse = await fetch('http://localhost:3000/api/students')
    const studentsResult = await studentsResponse.json()
    
    const grades = gradesResult.data || []
    const students = studentsResult.data || []
    
    // Simular o filtro do frontend
    const selectedClass = '7ano'
    const selectedBimester = '1'
    const selectedSubject = 'ciencias'
    
    const filteredStudents = students.filter(s => s.classId === selectedClass || s.grade === selectedClass)
    
    const bimesterNum = parseInt(selectedBimester)
    
    const studentGradesData = filteredStudents.map(student => {
      const subjectGrades = grades.filter(g => 
        g.studentId === student.id && 
        g.subject === selectedSubject && 
        g.bimester === bimesterNum
      )

      let note1 = null, note2 = null, note3 = null, average = null
      
      if (subjectGrades.length > 0) {
        const grade = subjectGrades[0]
        note1 = grade.note1 || null
        note2 = grade.note2 || null
        note3 = grade.note3 || null
        average = grade.average || null
      }

      return {
        studentId: student.id,
        studentName: student.name,
        className: student.grade ? getClassNameByGrade(student.grade) : selectedClass,
        note1,
        note2,
        note3,
        average
      }
    })
    
    return NextResponse.json({
      success: true,
      debug: {
        totalGrades: grades.length,
        totalStudents: students.length,
        filteredStudents: filteredStudents.length,
        selectedClass,
        selectedBimester,
        selectedSubject,
        studentGrades: studentGradesData
      }
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error.message
    })
  }
}

function getClassNameByGrade(grade: string): string {
  const gradeMap: { [key: string]: string } = {
    '6ano': '6º Ano',
    '7ano': '7º Ano',
    '8ano': '8º Ano',
    '9ano': '9º Ano'
  }
  return gradeMap[grade] || grade
}
