import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    console.log('DELETE request received for class:', (await params).id)
    
    const classId = (await params).id

    // Verificar se a turma existe
    const classData = await db.class.findUnique({
      where: { id: classId },
      include: {
        _count: {
          select: {
            students: true,
            activities: true
          }
        }
      }
    })

    if (!classData) {
      console.log('Error: Class not found:', classId)
      return NextResponse.json(
        { error: 'Turma não encontrada' },
        { status: 404 }
      )
    }

    // Verificar se a turma tem alunos ou atividades associadas
    if (classData._count.students > 0 || classData._count.activities > 0) {
      return NextResponse.json(
        { 
          error: 'Não é possível apagar esta turma. Ela possui alunos ou atividades associadas.' 
        },
        { status: 400 }
      )
    }

    // Apagar a turma
    await db.class.delete({
      where: { id: classId }
    })

    console.log('Class deleted successfully:', classId)

    return NextResponse.json({
      success: true,
      message: 'Turma apagada com sucesso!'
    })

  } catch (error) {
    console.error('Erro ao apagar turma:', error)
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    console.log('PUT request received for class:', (await params).id)
    
    const classId = (await params).id
    const body = await request.json()
    const { name, description, subject, teacher, schedule, capacity, status } = body

    // Validação básica
    if (!name || !subject || !teacher) {
      return NextResponse.json(
        { error: 'Nome, disciplina e professor são obrigatórios' },
        { status: 400 }
      )
    }

    // Verificar se a turma existe
    const existingClass = await db.class.findUnique({
      where: { id: classId }
    })

    if (!existingClass) {
      return NextResponse.json(
        { error: 'Turma não encontrada' },
        { status: 404 }
      )
    }

    // Atualizar turma
    const updatedClass = await db.class.update({
      where: { id: classId },
      data: {
        name,
        description,
        subject,
        teacher,
        schedule,
        capacity: capacity || 30,
        status: status || 'active'
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

    console.log('Class updated successfully:', classId)

    return NextResponse.json({
      success: true,
      message: 'Turma atualizada com sucesso!',
      data: updatedClass
    })

  } catch (error) {
    console.error('Erro ao atualizar turma:', error)
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    )
  }
}