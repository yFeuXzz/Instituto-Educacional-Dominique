import { db } from '@/lib/db'

async function createTestStudent() {
  try {
    console.log('🔧 Creating test student for attendance...')

    const student = await db.student.create({
      data: {
        name: 'João Pedro Santos',
        email: 'joao.pedro@dominique',
        phone: '',
        address: '',
        birthDate: '',
        grade: '7ano',
        classId: '',
        enrollment: Date.now().toString(),
        password: 'test123',
        status: 'active'
      }
    })

    console.log('✅ Test student created:', student.id)
    console.log('📧 Email:', student.email)
    console.log('📊 Grade:', student.grade)
    
  } catch (error) {
    console.error('❌ Error creating test student:', error)
  } finally {
    await db.$disconnect()
  }
}

createTestStudent()