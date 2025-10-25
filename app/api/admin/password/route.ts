import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const { currentPassword, newPassword, email } = await request.json()

    if (!currentPassword || !newPassword || !email) {
      return NextResponse.json(
        { success: false, message: 'Senha atual, nova senha e email são obrigatórios' },
        { status: 400 }
      )
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { success: false, message: 'A nova senha deve ter pelo menos 6 caracteres' },
        { status: 400 }
      )
    }

    // Buscar admin pelo email
    const admin = await db.user.findFirst({
      where: { 
        email: email,
        role: 'ADMIN'
      }
    })

    if (!admin) {
      return NextResponse.json(
        { success: false, message: 'Administrador não encontrado' },
        { status: 404 }
      )
    }

    // Verificar senha atual (comparando com hash)
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, admin.password)
    
    if (!isCurrentPasswordValid) {
      return NextResponse.json(
        { success: false, message: 'Senha atual incorreta' },
        { status: 401 }
      )
    }

    // Hash da nova senha
    const hashedNewPassword = await bcrypt.hash(newPassword, 12)

    // Atualizar senha com hash
    await db.user.update({
      where: { id: admin.id },
      data: { password: hashedNewPassword }
    })

    return NextResponse.json({
      success: true,
      message: 'Senha alterada com sucesso'
    })

  } catch (error) {
    console.error('Erro ao alterar senha do admin:', error)
    return NextResponse.json(
      { success: false, message: 'Erro ao alterar senha' },
      { status: 500 }
    )
  }
}