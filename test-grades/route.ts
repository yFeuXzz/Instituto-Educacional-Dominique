import { NextResponse } from "next/server"

export async function GET() {
  try {
    const gradesResponse = await fetch("http://localhost:3000/api/grades")
    const gradesResult = await gradesResponse.json()
    
    const studentsResponse = await fetch("http://localhost:3000/api/students")
    const studentsResult = await studentsResponse.json()
    
    return NextResponse.json({
      success: true,
      data: {
        grades: gradesResult.data || [],
        students: studentsResult.data || [],
        totalGrades: gradesResult.data?.length || 0,
        totalStudents: studentsResult.data?.length || 0
      }
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error.message
    })
  }
}
