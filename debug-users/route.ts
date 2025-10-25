import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function GET(request: NextRequest) {
  try {
    const users = await db.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        password: true,
        createdAt: true
      }
    })

    // Verificar senhas hash
    const usersWithPasswordInfo = users.map(user => ({
      ...user,
      hasPassword: !!user.password,
      passwordLength: user.password?.length || 0,
      passwordStart: user.password?.substring(0, 20) + '...'
    }))

    return NextResponse.json({
      success: true,
      count: users.length,
      users: usersWithPasswordInfo
    })

  } catch (error) {
    console.error('Erro ao buscar usuários:', error)
    return NextResponse.json(
      { 
        error: 'Erro ao buscar usuários',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Criar usuários de demonstração se não existirem
    const adminEmail = 'admin@dominique.com'
    const studentEmail = 'joao.silva@dominique.com'

    // Verificar se admin existe
    const existingAdmin = await db.user.findUnique({
      where: { email: adminEmail }
    })

    if (!existingAdmin) {
      const hashedAdminPassword = await bcrypt.hash('admin123', 10)
      await db.user.create({
        data: {
          email: adminEmail,
          name: 'Administrador',
          password: hashedAdminPassword,
          role: 'ADMIN'
        }
      })
    }

    // Verificar se estudante existe
    const existingStudent = await db.user.findUnique({
      where: { email: studentEmail }
    })

    if (!existingStudent) {
      const hashedStudentPassword = await bcrypt.hash('aluno123', 10)
      await db.user.create({
        data: {
          email: studentEmail,
          name: 'João Silva',
          password: hashedStudentPassword,
          role: 'STUDENT'
        }
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Usuários de demonstração criados/verificados com sucesso'
    })

  } catch (error) {
    console.error('Erro ao criar usuários:', error)
    return NextResponse.json(
      { 
        error: 'Erro ao criar usuários',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    )
  }
}