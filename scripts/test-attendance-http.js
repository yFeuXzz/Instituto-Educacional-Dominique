const http = require('http')

const data = JSON.stringify({
  attendanceData: [
    {
      studentId: 'cmh18xp2h0000nussyzc4o6tl',
      classId: '7ano',
      date: '2025-10-22',
      status: 'present',
      observations: 'Teste de presença'
    }
  ]
})

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/attendance',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
}

const req = http.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`)
  console.log(`Headers: ${JSON.stringify(res.headers)}`)
  
  let body = ''
  res.on('data', (chunk) => {
    body += chunk
  })
  
  res.on('end', () => {
    console.log('Response:', body)
    try {
      const result = JSON.parse(body)
      if (result.success) {
        console.log('✅ Attendance saved successfully!')
      } else {
        console.log('❌ Error saving attendance:', result.error)
      }
    } catch (e) {
      console.log('❌ Invalid JSON response:', body)
    }
  })
})

req.on('error', (error) => {
  console.error('❌ Request error:', error)
})

req.write(data)
req.end()