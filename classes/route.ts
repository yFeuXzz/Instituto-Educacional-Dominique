import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    console.log('GET request received for classes')
    
    const classes = await db.class.findMany({
      include: {
        students: {
          select: {
            id: true,
            name: true,
            status: true
          }
        },
        _count: {
          select: {
            students: true,
            activities: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    console.log(`Found ${classes.length} classes`)

    return NextResponse.json({
      success: true,
      data: classes
    })

  } catch (error) {
    console.error('Erro ao buscar turmas:', error)
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
    console.log('POST request received for classes')
    
    const body = await request.json()
    const { name, description, subject, teacher, schedule, capacity } = body

    console.log('Request body:', { name, description, subject, teacher, schedule, capacity })

    // Validação básica
    if (!name || !subject || !teacher) {
      console.log('Error: Missing required fields')
      return NextResponse.json(
        { error: 'Nome, disciplina e professor são obrigatórios' },
        { status: 400 }
      )
    }

    // Criar turma
    const newClass = await db.class.create({
      data: {
        name,
        description,
        subject,
        teacher,
        schedule,
        capacity: capacity || 30,
        status: 'active'
      },
      include: {
        students: {
          select: {
            id: true,
            name: true,
            status: true
          }
        },
        _count: {
          select: {
            students: true,
            activities: true
          }
        }
      }
    })

    console.log('Class created successfully:', newClass.id)

    return NextResponse.json({
      success: true,
      message: 'Turma criada com sucesso!',
      data: newClass
    })

  } catch (error) {
    console.error('Erro completo ao criar turma:', error)
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    )
  }
}