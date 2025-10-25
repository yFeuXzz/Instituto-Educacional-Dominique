import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Simular o mesmo filtro do frontend
    const gradesResponse = await fetch("http://localhost:3000/api/grades")
    const gradesResult = await gradesResponse.json()
    
    const grades = gradesResult.data || []
    const selectedBimester = "1"
    const selectedSubject = "ciencias"
    
    const filtered = grades.filter(g => 
      g.bimester === parseInt(selectedBimester) && 
      g.subject === selectedSubject
    )
    
    return NextResponse.json({
      success: true,
      debug: {
        total: grades.length,
        selectedBimester,
        selectedSubject,
        filtered: filtered.length,
        allGrades: grades.map(g => ({ 
          id: g.id,
          name: g.studentName, 
          subject: g.subject, 
          bimester: g.bimester 
        })),
        filteredGrades: filtered.map(g => ({ 
          id: g.id,
          name: g.studentName, 
          subject: g.subject, 
          bimester: g.bimester 
        }))
      }
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error.message
    })
  }
}
