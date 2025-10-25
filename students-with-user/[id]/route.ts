import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('DELETE request received for student:', params.id)
    
    const studentId = params.id

    if (!studentId) {
      return NextResponse.json(
        { error: 'ID do aluno é obrigatório' },
        { status: 400 }
      )
    }

    // 1. Primeiro, encontrar o student para obter informações
    const student = await db.student.findUnique({
      where: { id: studentId }
    })

    if (!student) {
      return NextResponse.json(
        { error: 'Aluno não encontrado' },
        { status: 404 }
      )
    }

    console.log('Found student:', student)

    // 2. Apagar o student primeiro
    await db.student.delete({
      where: { id: studentId }
    })
    console.log('Student deleted successfully')

    // 3. Se o student tiver um userId associado, apagar o user também
    if (student.userId) {
      try {
        await db.user.delete({
          where: { id: student.userId }
        })
        console.log('User deleted successfully:', student.userId)
      } catch (userError) {
        console.log('Could not delete user (may not exist):', userError)
        // Não falhar se não conseguir apagar o user
      }
    }

    // 4. Tentar apagar user pelo email do student (fallback)
    if (student.email) {
      try {
        const userByEmail = await db.user.findUnique({
          where: { email: student.email }
        })
        
        if (userByEmail) {
          await db.user.delete({
            where: { id: userByEmail.id }
          })
          console.log('User deleted by email:', userByEmail.id)
        }
      } catch (emailError) {
        console.log('Could not delete user by email:', emailError)
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Aluno excluído com sucesso!'
    })

  } catch (error) {
    console.error('Erro ao excluir aluno:', error)
    
    let errorMessage = 'Erro interno do servidor'
    if (error instanceof Error) {
      errorMessage = error.message
    }

    return NextResponse.json(
      { 
        error: errorMessage,
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    )
  }
}