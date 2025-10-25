import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'

async function checkUserPassword() {
  try {
    console.log('🔍 Checking admin user...')
    
    const user = await db.user.findUnique({
      where: { email: 'admin@dominique.com' }
    })

    if (!user) {
      console.log('❌ Admin user not found')
      return
    }

    console.log('👤 User found:', user.email, 'Role:', user.role)
    console.log('🔑 Hashed password:', user.password)
    
    // Test password comparison
    const testPassword = 'admin123'
    const isValid = await bcrypt.compare(testPassword, user.password)
    console.log('🔑 Password comparison result:', isValid)
    
    if (!isValid) {
      console.log('🔧 Recreating admin password...')
      const newHash = await bcrypt.hash('admin123', 10)
      await db.user.update({
        where: { email: 'admin@dominique.com' },
        data: { password: newHash }
      })
      console.log('✅ Admin password updated')
      
      // Test again
      const testAgain = await bcrypt.compare('admin123', newHash)
      console.log('🔑 New password test:', testAgain)
    }

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await db.$disconnect()
  }
}

checkUserPassword()