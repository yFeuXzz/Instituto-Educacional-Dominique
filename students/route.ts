import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    console.log('GET request received for students')
    
    const students = await db.student.findMany({
      // Removidos os includes temporariamente
      // include: {
      //   class: true,
      //   user: {
      //     select: {
      //       id: true,
      //       email: true,
      //       createdAt: true
      //     }
      //   }
      // },
      orderBy: {
        createdAt: 'desc'
      }
    })

    console.log(`Found ${students.length} students`)

    return NextResponse.json({
      success: true,
      data: students
    })

  } catch (error) {
    console.error('Erro ao buscar alunos:', error)
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('POST request received for students')
    
    const body = await request.json()
    const { name, email, phone, address, birthDate, grade, classId, enrollment, password, userId } = body

    console.log('Request body:', { name, email, phone, address, birthDate, grade, classId, enrollment, userId })

    // Validação básica
    if (!name || !email || !enrollment || !password) {
      console.log('Error: Missing required fields')
      return NextResponse.json(
        { error: 'Nome, email, matrícula e senha são obrigatórios' },
        { status: 400 }
      )
    }

    // Verificar se o usuário existe (se userId fornecido)
    if (userId) {
      const userExists = await db.user.findUnique({
        where: { id: userId }
      })

      if (!userExists) {
        console.log('Error: User not found:', userId)
        return NextResponse.json(
          { error: 'Usuário não encontrado' },
          { status: 404 }
        )
      }
    }

    // Verificar se email já existe
    const existingStudent = await db.student.findFirst({
      where: {
        OR: [
          { email },
          { enrollment }
        ]
      }
    })

    if (existingStudent) {
      console.log('Error: Student already exists')
      return NextResponse.json(
        { error: 'Email ou matrícula já cadastrados' },
        { status: 400 }
      )
    }

    // Verificar se a turma existe (se fornecida)
    if (classId) {
      const classExists = await db.class.findUnique({
        where: { id: classId }
      })

      if (!classExists) {
        console.log('Error: Class not found:', classId)
        return NextResponse.json(
          { error: 'Turma não encontrada' },
          { status: 404 }
        )
      }
    }

    // Criar aluno
    const student = await db.student.create({
      data: {
        name,
        email,
        phone: phone || '',
        address,
        birthDate,
        grade,
        classId,
        enrollment,
        password,
        status: 'active'
      },
      include: {
        class: true,
        user: userId ? {
          select: {
            id: true,
            email: true,
            createdAt: true
          }
        } : false
      }
    })

    console.log('Student created successfully:', student.id)

    return NextResponse.json({
      success: true,
      message: 'Aluno criado com sucesso!',
      data: student
    })

  } catch (error) {
    console.error('Erro completo ao criar aluno:', error)
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    )
  }
}