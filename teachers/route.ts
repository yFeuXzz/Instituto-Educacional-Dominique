import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function GET() {
  try {
    const teachers = await db.teacher.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
            createdAt: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Parse JSON fields
    const formattedTeachers = teachers.map(teacher => ({
      ...teacher,
      subjects: JSON.parse(teacher.subjects || '[]'),
      grades: JSON.parse(teacher.grades || '[]')
    }))

    return NextResponse.json({
      success: true,
      data: formattedTeachers
    })
  } catch (error) {
    console.error('❌ Erro ao buscar professores:', error)
    return NextResponse.json({
      success: false,
      error: 'Erro ao buscar professores'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, password, phone, subjects, grades } = body

    console.log('📝 Criando professor:', { name, email, subjects, grades })

    // Validar campos obrigatórios
    if (!name || !email || !password || !subjects || !grades) {
      return NextResponse.json({
        success: false,
        error: 'Todos os campos são obrigatórios'
      }, { status: 400 })
    }

    // Verificar se email já existe
    const existingUser = await db.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json({
        success: false,
        error: 'Email já cadastrado'
      }, { status: 400 })
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 10)

    // Criar usuário
    const user = await db.user.create({
      data: {
        email,
        password: hashedPassword,
        role: 'TEACHER'
      }
    })

    // Criar professor
    const teacher = await db.teacher.create({
      data: {
        userId: user.id,
        name,
        email,
        phone: phone || null,
        subjects: JSON.stringify(subjects),
        grades: JSON.stringify(grades)
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
            createdAt: true
          }
        }
      }
    })

    const formattedTeacher = {
      ...teacher,
      subjects: JSON.parse(teacher.subjects),
      grades: JSON.parse(teacher.grades)
    }

    console.log('✅ Professor criado:', formattedTeacher.name)

    return NextResponse.json({
      success: true,
      message: 'Professor criado com sucesso!',
      data: formattedTeacher
    })
  } catch (error) {
    console.error('❌ Erro ao criar professor:', error)
    return NextResponse.json({
      success: false,
      error: 'Erro ao criar professor'
    }, { status: 500 })
  }
}
