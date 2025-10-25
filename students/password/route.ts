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

    // Buscar estudante pelo email
    const student = await db.student.findUnique({
      where: { email: email }
    })

    if (!student) {
      return NextResponse.json(
        { success: false, message: 'Estudante não encontrado' },
        { status: 404 }
      )
    }

    // Verificar senha atual (comparando com hash)
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, student.password)
    
    if (!isCurrentPasswordValid) {
      return NextResponse.json(
        { success: false, message: 'Senha atual incorreta' },
        { status: 401 }
      )
    }

    // Hash da nova senha
    const hashedNewPassword = await bcrypt.hash(newPassword, 12)

    // Atualizar senha com hash
    await db.student.update({
      where: { id: student.id },
      data: { password: hashedNewPassword }
    })

    return NextResponse.json({
      success: true,
      message: 'Senha alterada com sucesso'
    })

  } catch (error) {
    console.error('Erro ao alterar senha do estudante:', error)
    return NextResponse.json(
      { success: false, message: 'Erro ao alterar senha' },
      { status: 500 }
    )
  }
}