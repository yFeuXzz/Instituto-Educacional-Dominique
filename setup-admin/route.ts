import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    console.log('🔧 SETUP ADMIN: Starting setup...')
    
    // Verificar se já existe um admin
    const existingAdmin = await db.user.findFirst({
      where: { role: 'ADMIN' }
    })

    if (!existingAdmin) {
      // Criar admin
      const hashedPassword = await bcrypt.hash('admin123', 10)
      
      const admin = await db.user.create({
        data: {
          name: 'Administrador',
          email: 'admin@dominique.com',
          password: hashedPassword,
          role: 'ADMIN'
        }
      })
      
      console.log('🔧 SETUP ADMIN: Admin user created')
    }

    // Verificar se já existe um estudante
    const existingStudent = await db.user.findFirst({
      where: { email: 'joao.silva@dominique.com' }
    })

    if (!existingStudent) {
      // Criar estudante
      const hashedStudentPassword = await bcrypt.hash('aluno123', 10)
      
      const student = await db.user.create({
        data: {
          name: 'João Silva',
          email: 'joao.silva@dominique.com',
          password: hashedStudentPassword,
          role: 'STUDENT'
        }
      })
      
      console.log('🔧 SETUP ADMIN: Student user created')
    }

    // Retornar todos os usuários criados
    const users = await db.user.findMany({
      where: {
        OR: [
          { email: 'admin@dominique.com' },
          { email: 'joao.silva@dominique.com' }
        ]
      },
      select: {
        email: true,
        name: true,
        role: true
      }
    })

    return NextResponse.json({
      message: 'Usuários de demonstração configurados com sucesso',
      data: users,
      credentials: [
        { email: 'admin@dominique.com', password: 'admin123', role: 'ADMIN' },
        { email: 'joao.silva@dominique.com', password: 'aluno123', role: 'STUDENT' }
      ]
    })

  } catch (error) {
    console.error('💥 SETUP ADMIN ERROR:', error)
    return NextResponse.json(
      { error: 'Erro ao configurar usuários' },
      { status: 500 }
    )
  }
}