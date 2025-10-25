import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(request: NextRequest) {
  console.log("🔥 GET attendance request received")
  
  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get("date")
    const classId = searchParams.get("classId")
    const studentId = searchParams.get("studentId")

    console.log("🔍 Buscando presença com filtros:", { date, classId, studentId })

    let whereClause: any = {}
    
    if (date) whereClause.date = date
    if (classId) whereClause.classId = classId
    if (studentId) whereClause.studentId = studentId

    const attendance = await db.attendance.findMany({
      where: whereClause,
      orderBy: [
        { date: "desc" },
        { studentId: "asc" }
      ]
    })

    console.log("📋 Presença encontrada:", attendance.length)

    return NextResponse.json({
      success: true,
      data: attendance
    })
  } catch (error) {
    console.error("❌ Erro ao buscar presença:", error)
    return NextResponse.json({
      success: false,
      error: "Erro ao buscar presença"
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  console.log("🔥 POST attendance request received - START")
  
  try {
    console.log("🔥 Parsing request body...")
    
    const body = await request.json()
    const { attendanceData } = body

    console.log("💾 Salvando presença:", attendanceData)

    if (!attendanceData || !Array.isArray(attendanceData)) {
      console.log("❌ Invalid attendance data format")
      return NextResponse.json({
        success: false,
        error: "Dados inválidos"
      }, { status: 400 })
    }

    const savedAttendance = []

    for (const attendance of attendanceData) {
      const {
        studentId,
        classId,
        date,
        status,
        observations
      } = attendance

      if (!studentId || !classId || !date || !status) {
        console.log("⚠️ Dados incompletos, pulando:", attendance)
        continue
      }

      // Verificar se já existe um registro para este aluno nesta data
      const existingAttendance = await db.attendance.findFirst({
        where: {
          studentId,
          date
        }
      })

      let savedRecord
      if (existingAttendance) {
        // Atualizar registro existente
        savedRecord = await db.attendance.update({
          where: { id: existingAttendance.id },
          data: {
            status,
            observations: observations || null,
            updatedAt: new Date()
          }
        })
        console.log("✅ Presença atualizada:", savedRecord.id)
      } else {
        // Criar novo registro
        savedRecord = await db.attendance.create({
          data: {
            studentId,
            classId,
            date,
            status,
            observations: observations || null
          }
        })
        console.log("✅ Presença criada:", savedRecord.id)
      }

      savedAttendance.push(savedRecord)
    }

    return NextResponse.json({
      success: true,
      message: `${savedAttendance.length} registro(s) de presença salvo(s) com sucesso!`,
      data: { savedCount: savedAttendance.length, attendance: savedAttendance }
    })
  } catch (error) {
    console.error("❌ Erro ao salvar presença:", error)
    return NextResponse.json({
      success: false,
      error: "Erro ao salvar presença"
    }, { status: 500 })
  }
}
