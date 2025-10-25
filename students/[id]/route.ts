import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    console.log('DELETE request received for student:', (await params).id)
    
    const studentId = (await params).id

    // Verificar se o aluno existe
    const student = await db.student.findUnique({
      where: { id: studentId },
      include: {
        user: true
      }
    })

    if (!student) {
      console.log('Error: Student not found:', studentId)
      return NextResponse.json(
        { error: 'Aluno não encontrado' },
        { status: 404 }
      )
    }

    // Verificar se o aluno tem notas ou presenças associadas
    const gradesCount = await db.grade.count({
      where: { studentId }
    })

    const attendanceCount = await db.attendance.count({
      where: { studentId }
    })

    if (gradesCount > 0 || attendanceCount > 0) {
      return NextResponse.json(
        { 
          error: 'Não é possível apagar este aluno. Ele possui notas ou presenças registradas.' 
        },
        { status: 400 }
      )
    }

    // Apagar o aluno (o usuário associado será mantido por segurança de dados)
    await db.student.delete({
      where: { id: studentId }
    })

    console.log('Student deleted successfully:', studentId)

    return NextResponse.json({
      success: true,
      message: 'Aluno apagado com sucesso!'
    })

  } catch (error) {
    console.error('Erro ao apagar aluno:', error)
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
    console.log('PUT request received for student:', (await params).id)
    
    const studentId = (await params).id
    const body = await request.json()
    const { name, email, phone, address, birthDate, classId, enrollment } = body

    // Validação básica
    if (!name || !email || !phone || !enrollment) {
      return NextResponse.json(
        { error: 'Nome, email, telefone e matrícula são obrigatórios' },
        { status: 400 }
      )
    }

    // Verificar se o aluno existe
    const existingStudent = await db.student.findUnique({
      where: { id: studentId }
    })

    if (!existingStudent) {
      return NextResponse.json(
        { error: 'Aluno não encontrado' },
        { status: 404 }
      )
    }

    // Verificar se email ou matrícula já existem (exceto para este aluno)
    const duplicateStudent = await db.student.findFirst({
      where: {
        OR: [
          { email },
          { enrollment }
        ],
        NOT: {
          id: studentId
        }
      }
    })

    if (duplicateStudent) {
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
        return NextResponse.json(
          { error: 'Turma não encontrada' },
          { status: 404 }
        )
      }
    }

    // Atualizar aluno
    const updatedStudent = await db.student.update({
      where: { id: studentId },
      data: {
        name,
        email,
        phone,
        address,
        birthDate,
        classId,
        enrollment
      },
      include: {
        class: true,
        user: {
          select: {
            id: true,
            email: true,
            createdAt: true
          }
        }
      }
    })

    // Atualizar usuário associado
    if (updatedStudent.user) {
      await db.user.update({
        where: { id: updatedStudent.user.id },
        data: {
          email,
          name
        }
      })
    }

    console.log('Student updated successfully:', studentId)

    return NextResponse.json({
      success: true,
      message: 'Aluno atualizado com sucesso!',
      data: updatedStudent
    })

  } catch (error) {
    console.error('Erro ao atualizar aluno:', error)
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    )
  }
}