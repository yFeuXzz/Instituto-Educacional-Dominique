import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/get-session'

export async function PUT(request: NextRequest) {
  try {
    const { name, email, phone } = await request.json()

    // Obter o usuário logado
    const currentUser = await getCurrentUser()
    
    if (!currentUser || !currentUser.id) {
      return NextResponse.json(
        { success: false, message: 'Não autorizado' },
        { status: 401 }
      )
    }

    // Buscar o usuário logado
    const user = await db.user.findUnique({
      where: { id: currentUser.id },
      include: {
        teacher: true
      }
    })

    if (!user || !user.teacher) {
      return NextResponse.json(
        { success: false, message: 'Professor não encontrado' },
        { status: 404 }
      )
    }

    // Verificar se o email já está em uso por outro usuário
    if (email !== user.email) {
      const existingUser = await db.user.findFirst({
        where: {
          email: email,
          id: { not: user.id }
        }
      })

      if (existingUser) {
        return NextResponse.json(
          { success: false, message: 'Este email já está em uso' },
          { status: 400 }
        )
      }
    }

    // Atualizar usuário
    const updatedUser = await db.user.update({
      where: { id: user.id },
      data: {
        name: name,
        email: email,
      }
    })

    // Atualizar teacher
    const updatedTeacher = await db.teacher.update({
      where: { userId: user.id },
      data: {
        phone: phone || null
      },
      include: {
        user: true
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Perfil atualizado com sucesso',
      data: {
        teacher: {
          id: updatedTeacher.id,
          name: updatedUser.name,
          email: updatedUser.email,
          phone: updatedTeacher.phone,
          subjects: updatedTeacher.subjects,
          grades: updatedTeacher.grades,
          status: updatedTeacher.status
        }
      }
    })

  } catch (error) {
    console.error('Erro ao atualizar perfil:', error)
    return NextResponse.json(
      { success: false, message: 'Erro ao atualizar perfil' },
      { status: 500 }
    )
  }
}