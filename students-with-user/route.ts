import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function GET(request: NextRequest) {
  try {
    console.log('GET request received for students-with-user')
    
    const students = await db.student.findMany()

    // Para cada student, tentar encontrar o user correspondente
    const studentsWithUsers = await Promise.all(
      students.map(async (student) => {
        let user = null
        
        // Tentar encontrar pelo userId se existir
        if (student.userId) {
          user = await db.user.findUnique({
            where: { id: student.userId },
            select: {
              id: true,
              email: true,
              createdAt: true
            }
          })
        }
        
        // Fallback: tentar encontrar pelo email
        if (!user && student.email) {
          user = await db.user.findUnique({
            where: { email: student.email },
            select: {
              id: true,
              email: true,
              createdAt: true
            }
          })
        }

        return {
          ...student,
          user
        }
      })
    )

    return NextResponse.json({
      success: true,
      data: studentsWithUsers
    })

  } catch (error) {
    console.error('Erro ao buscar alunos com usuários:', error)
    
    return NextResponse.json(
      { 
        error: 'Erro ao buscar alunos',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('POST request received for students-with-user')
    
    const body = await request.json()
    const { name, grade } = body

    console.log('Request body:', { name, grade })

    // Validação básica
    if (!name || !grade) {
      console.log('Error: Missing required fields')
      return NextResponse.json(
        { error: 'Nome e série são obrigatórios' },
        { status: 400 }
      )
    }

    // Gerar credenciais automáticas
    const nameForEmail = name.toLowerCase().replace(/\s+/g, '')
    const userEmail = `${nameForEmail}@dominique`
    const userPassword = nameForEmail
    const enrollment = Date.now().toString()

    console.log('Generated credentials:', { userEmail, userPassword })

    // Abordagem final: Criar student sem userId
    try {
      console.log('=== INÍCIO DO PROCESSO ===')
      
      // 1. Apagar registros existentes na ordem correta
      const existingStudent = await db.student.findFirst({
        where: {
          OR: [
            { email: userEmail },
            { enrollment }
          ]
        }
      })

      if (existingStudent) {
        console.log('Found existing student, deleting:', existingStudent.id)
        
        // Apagar student primeiro
        await db.student.delete({
          where: { id: existingStudent.id }
        })
        console.log('Deleted existing student:', existingStudent.id)
      }

      // 2. Verificar user existente
      const existingUser = await db.user.findUnique({
        where: { email: userEmail }
      })

      if (existingUser) {
        console.log('Found existing user, deleting:', existingUser.id)
        await db.user.delete({
          where: { id: existingUser.id }
        })
        console.log('Deleted existing user:', existingUser.id)
      }

      // 3. Criar user primeiro
      const hashedPassword = await bcrypt.hash(userPassword, 10)
      console.log('Creating user...')
      
      const user = await db.user.create({
        data: {
          name: name.trim(),
          email: userEmail,
          password: hashedPassword,
          role: 'STUDENT'
        }
      })

      console.log('User created successfully:', user.id)

      // 4. Esperar um pouco para garantir que o user foi commitado
      await new Promise(resolve => setTimeout(resolve, 100))

      // 5. Verificar se o user realmente existe
      const verifyUser = await db.user.findUnique({
        where: { id: user.id }
      })

      if (!verifyUser) {
        throw new Error('User not found after creation')
      }

      console.log('User verified:', verifyUser.id)

      // 6. Criar student SEM userId (temporariamente)
      console.log('Creating student without userId')
      
      const student = await db.student.create({
        data: {
          // userId: user.id, // Removido temporariamente
          name: name.trim(),
          email: userEmail,
          phone: '',
          address: '',
          birthDate: '',
          grade,
          classId: '',
          enrollment,
          password: hashedPassword, // Adicionar password aqui
          status: 'active'
        }
        // Removido include temporariamente
        // include: {
        //   class: true
        // }
      })

      console.log('Student created successfully:', student.id)

      // 7. Buscar informações do user separadamente
      const userInfo = await db.user.findUnique({
        where: { id: user.id },
        select: {
          id: true,
          email: true,
          createdAt: true
        }
      })

      // 8. Combinar os dados
      const completeStudent = {
        ...student,
        user: userInfo
      }

      console.log('=== PROCESSO CONCLUÍDO COM SUCESSO ===')
      
      return NextResponse.json({
        success: true,
        message: 'Aluno e conta de acesso criados com sucesso! (Registros antigos foram substituídos)',
        data: {
          student: completeStudent,
          credentials: {
            email: userEmail,
            password: userPassword
          }
        }
      })

    } catch (error) {
      console.error('=== ERRO NO PROCESSO ===')
      console.error('Error details:', error)
      console.error('Error message:', error instanceof Error ? error.message : 'Unknown error')
      throw error
    }

    return NextResponse.json({
      success: true,
      message: 'Aluno e conta de acesso criados com sucesso! (Registros antigos foram substituídos)',
      data: {
        student: result.student,
        credentials: {
          email: userEmail,
          password: userPassword
        }
      }
    })

  } catch (error) {
    console.error('Erro completo ao criar aluno com usuário:', error)
    
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