async function testAttendanceAPI() {
  try {
    console.log('🧪 Testing attendance API...')
    
    const testData = {
      attendanceData: [
        {
          studentId: 'cmh18xp2h0000nussyzc4o6tl',
          studentName: 'João Pedro Santos',
          classId: '7ano',
          date: new Date().toISOString().split('T')[0],
          status: 'present',
          observations: 'Teste de presença'
        }
      ]
    }
    
    console.log('📦 Sending data:', testData)
    
    const response = await fetch('http://localhost:3000/api/attendance', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    })
    
    const result = await response.json()
    console.log('📋 Response:', result)
    
    if (result.success) {
      console.log('✅ Attendance saved successfully!')
    } else {
      console.log('❌ Error saving attendance:', result.error)
    }
    
  } catch (error) {
    console.error('❌ Error testing attendance API:', error)
  }
}

testAttendanceAPI()