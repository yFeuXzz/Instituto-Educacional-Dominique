import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'

async function fixAllPasswords() {
  try {
    console.log('🔧 Fixing all user passwords...')

    // Fix admin
    const adminHash = await bcrypt.hash('admin123', 10)
    await db.user.update({
      where: { email: 'admin@dominique.com' },
      data: { password: adminHash }
    })
    console.log('✅ Admin password fixed')

    // Fix teacher
    const teacherHash = await bcrypt.hash('teacher123', 10)
    await db.user.update({
      where: { email: 'teacher@dominique.com' },
      data: { password: teacherHash }
    })
    console.log('✅ Teacher password fixed')

    // Fix student
    const studentHash = await bcrypt.hash('student123', 10)
    await db.user.update({
      where: { email: 'student@dominique.com' },
      data: { password: studentHash }
    })
    console.log('✅ Student password fixed')

    // Test all
    const users = await db.user.findMany({
      where: {
        email: {
          in: ['admin@dominique.com', 'teacher@dominique.com', 'student@dominique.com']
        }
      }
    })

    for (const user of users) {
      let testPassword = ''
      if (user.email.includes('admin')) testPassword = 'admin123'
      else if (user.email.includes('teacher')) testPassword = 'teacher123'
      else if (user.email.includes('student')) testPassword = 'student123'

      const isValid = await bcrypt.compare(testPassword, user.password)
      console.log(`🔑 ${user.email}: ${isValid ? '✅' : '❌'}`)
    }

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await db.$disconnect()
  }
}

fixAllPasswords()