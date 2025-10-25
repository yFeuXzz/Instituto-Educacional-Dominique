import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { getCurrentUser } from '@/lib/get-session'

export async function PUT(request: NextRequest) {
  try {
    const { currentPassword, newPassword } = await request.json()

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { success: false, message: 'Todos os campos são obrigatórios' },
        { status: 400 }
      )
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { success: false, message: 'A senha deve ter pelo menos 6 caracteres' },
        { status: 400 }
      )
    }

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

    // Verificar senha atual
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password || '')
    
    if (!isCurrentPasswordValid) {
      return NextResponse.json(
        { success: false, message: 'Senha atual incorreta' },
        { status: 400 }
      )
    }

    // Gerar hash da nova senha
    const hashedNewPassword = await bcrypt.hash(newPassword, 10)

    // Atualizar senha
    await db.user.update({
      where: { id: user.id },
      data: {
        password: hashedNewPassword
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Senha alterada com sucesso'
    })

  } catch (error) {
    console.error('Erro ao alterar senha:', error)
    return NextResponse.json(
      { success: false, message: 'Erro ao alterar senha' },
      { status: 500 }
    )
  }
}