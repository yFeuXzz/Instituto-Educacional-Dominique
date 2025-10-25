import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    // Buscar dados do aluno associado ao usuário pelo email
    const student = await db.student.findUnique({
      where: {
        email: session.user.email
      }
    })

    if (!student) {
      return NextResponse.json(
        { error: 'Aluno não encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      message: 'Dados do aluno encontrados',
      data: {
        id: student.id,
        name: student.name,
        email: student.email,
        grade: student.grade || 'Não definido',
        enrollment: student.enrollment,
        status: student.status,
        createdAt: student.createdAt.toISOString(),
        updatedAt: student.updatedAt.toISOString()
      }
    })

  } catch (error) {
    console.error('Erro ao buscar dados do aluno:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}