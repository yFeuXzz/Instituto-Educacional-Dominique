import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'

async function createTestStudent() {
  try {
    console.log('🔧 Creating test student user...')

    const studentPassword = await bcrypt.hash('student123', 10)
    const student = await db.user.upsert({
      where: { email: 'student@dominique.com' },
      update: {},
      create: {
        email: 'student@dominique.com',
        name: 'Aluno Teste',
        password: studentPassword,
        role: 'STUDENT'
      }
    })

    console.log('✅ Test student created:')
    console.log('📧 student@dominique.com - student123')

    // Test password
    const isValid = await bcrypt.compare('student123', student.password)
    console.log('🔑 Password test:', isValid ? '✅' : '❌')

  } catch (error) {
    console.error('❌ Error creating test student:', error)
  } finally {
    await db.$disconnect()
  }
}

createTestStudent()