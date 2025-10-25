import { db } from '@/lib/db'

async function deleteAllStudents() {
  try {
    console.log('🗑️ Deleting all students from database...')
    
    // Delete all students
    const result = await db.student.deleteMany({})
    
    console.log(`✅ Deleted ${result.count} students from database`)
    
    // Verify deletion
    const remainingStudents = await db.student.count()
    console.log(`📊 Remaining students: ${remainingStudents}`)
    
  } catch (error) {
    console.error('❌ Error deleting students:', error)
  } finally {
    await db.$disconnect()
  }
}

deleteAllStudents()