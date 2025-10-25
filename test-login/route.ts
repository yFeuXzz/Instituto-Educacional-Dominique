import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const { email, password, role } = await request.json()

    if (!email || !password || !role) {
      return NextResponse.json(
        { success: false, message: 'Email, senha e tipo são obrigatórios' },
        { status: 400 }
      )
    }

    let user = null

    if (role === 'ADMIN') {
      user = await db.user.findFirst({
        where: { 
          email: email,
          role: 'ADMIN'
        }
      })
    } else if (role === 'TEACHER') {
      user = await db.teacher.findUnique({
        where: { email: email }
      })
    } else if (role === 'STUDENT') {
      user = await db.student.findUnique({
        where: { email: email }
      })
    }

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Usuário não encontrado' },
        { status: 404 }
      )
    }

    if (user.password !== password) {
      return NextResponse.json(
        { success: false, message: 'Senha incorreta' },
        { status: 401 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Login realizado com sucesso',
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: role
      }
    })

  } catch (error) {
    console.error('Erro no login:', error)
    return NextResponse.json(
      { success: false, message: 'Erro ao fazer login' },
      { status: 500 }
    )
  }
}