import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'

async function createTestUsers() {
  try {
    console.log('🔧 Creating test users...')

    // Admin user
    const adminPassword = await bcrypt.hash('admin123', 10)
    const admin = await db.user.upsert({
      where: { email: 'admin@dominique.com' },
      update: {},
      create: {
        email: 'admin@dominique.com',
        name: 'Administrador',
        password: adminPassword,
        role: 'ADMIN'
      }
    })

    // Teacher user
    const teacherPassword = await bcrypt.hash('teacher123', 10)
    const teacher = await db.user.upsert({
      where: { email: 'teacher@dominique.com' },
      update: {},
      create: {
        email: 'teacher@dominique.com',
        name: 'Professor Teste',
        password: teacherPassword,
        role: 'TEACHER'
      }
    })

    // Student user
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

    console.log('✅ Test users created:')
    console.log('📧 admin@dominique.com - admin123')
    console.log('📧 teacher@dominique.com - teacher123')
    console.log('📧 student@dominique.com - student123')

  } catch (error) {
    console.error('❌ Error creating test users:', error)
  } finally {
    await db.$disconnect()
  }
}

createTestUsers()