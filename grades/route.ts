import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 API de notas recebendo requisição...')
    
    const body = await request.json()
    const { gradesData } = body

    console.log('📦 Dados recebidos:', gradesData)

    if (!gradesData || !Array.isArray(gradesData) || gradesData.length === 0) {
      console.log('❌ Dados inválidos')
      return NextResponse.json(
        { success: false, error: 'Dados de notas inválidos' },
        { status: 400 }
      )
    }

    const savedGrades = []

    // Validar e salvar cada nota
    for (const gradeData of gradesData) {
      const { studentId, studentName, subject, classId, bimester, note1, note2, note3 } = gradeData

      if (!studentId || !subject || !classId || !bimester) {
        console.log('❌ Campos obrigatórios faltando')
        return NextResponse.json(
          { success: false, error: 'Campos obrigatórios faltando' },
          { status: 400 }
        )
      }

      // Validar valores das notas
      const validateNote = (note: any) => {
        if (note === null || note === undefined || note === '') return null
        const num = parseFloat(note)
        return (isNaN(num) || num < 0 || num > 10) ? null : num
      }

      const validatedNote1 = validateNote(note1)
      const validatedNote2 = validateNote(note2)
      const validatedNote3 = validateNote(note3)

      // Verificar se pelo menos uma nota foi informada
      if (validatedNote1 === null && validatedNote2 === null && validatedNote3 === null) {
        console.log('❌ Pelo menos uma nota deve ser informada')
        return NextResponse.json(
          { success: false, error: 'Pelo menos uma nota deve ser informada' },
          { status: 400 }
        )
      }

      // Calcular média
      const validNotes = [validatedNote1, validatedNote2, validatedNote3].filter(n => n !== null)
      const average = validNotes.length > 0 
        ? validNotes.reduce((sum, note) => sum + note, 0) / validNotes.length 
        : 0

      // Salvar no banco de dados
      try {
        const bimesterGrade = await db.bimesterGrade.create({
          data: {
            studentId,
            studentName,
            subject,
            classId,
            bimester,
            note1: validatedNote1,
            note2: validatedNote2,
            note3: validatedNote3,
            average,
            status: 'graded',
            gradedAt: new Date()
          }
        })

        console.log('💾 NOTA SALVA NO BANCO:', bimesterGrade)
        savedGrades.push(bimesterGrade)

      } catch (dbError) {
        console.error('❌ Erro ao salvar no banco:', dbError)
        return NextResponse.json(
          { success: false, error: 'Erro ao salvar no banco de dados' },
          { status: 500 }
        )
      }
    }

    console.log('✅ Todas as notas salvas com sucesso!')
    return NextResponse.json({
      success: true,
      message: `${savedGrades.length} nota(s) salva(s) com sucesso!`,
      data: {
        savedCount: savedGrades.length,
        grades: savedGrades
      }
    })

  } catch (error) {
    console.error('❌ Erro ao salvar notas:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get('studentId')
    const subject = searchParams.get('subject')
    const classId = searchParams.get('classId')
    const bimester = searchParams.get('bimester')

    console.log('🔍 Buscando notas com filtros:', { studentId, subject, classId, bimester })

    // Buscar notas do banco de dados
    const whereClause: any = {}
    if (studentId) whereClause.studentId = studentId
    if (subject) whereClause.subject = subject
    if (classId) whereClause.classId = classId
    if (bimester) whereClause.bimester = parseInt(bimester)

    const grades = await db.bimesterGrade.findMany({
      where: whereClause,
      orderBy: { gradedAt: 'desc' }
    })

    console.log('📋 Notas encontradas:', grades.length)

    return NextResponse.json({
      success: true,
      data: grades
    })

  } catch (error) {
    console.error('❌ Erro ao buscar notas:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}