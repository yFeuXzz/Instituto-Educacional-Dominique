import { db } from '@/lib/db'

async function deleteAllStudentUsers() {
  try {
    console.log('🗑️ Deleting all student users from database...')
    
    // Delete all users with STUDENT role
    const result = await db.user.deleteMany({
      where: { role: 'STUDENT' }
    })
    
    console.log(`✅ Deleted ${result.count} student users from database`)
    
    // Verify deletion
    const remainingStudentUsers = await db.user.count({
      where: { role: 'STUDENT' }
    })
    console.log(`📊 Remaining student users: ${remainingStudentUsers}`)
    
    // Show remaining users
    const allUsers = await db.user.findMany({
      select: { email: true, role: true }
    })
    console.log('👥 Remaining users:', allUsers)
    
  } catch (error) {
    console.error('❌ Error deleting student users:', error)
  } finally {
    await db.$disconnect()
  }
}

deleteAllStudentUsers()