// Testar API como se fosse o frontend
const testData = {
  attendanceData: [
    {
      studentId: 'cmh18xp2h0000nussyzc4o6tl',
      classId: '7ano',
      date: '2025-10-22',
      status: 'present',
      observations: 'Teste via script'
    }
  ]
}

console.log('Enviando dados para API:', JSON.stringify(testData, null, 2))

fetch('http://localhost:3000/api/attendance', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(testData)
})
.then(response => {
  console.log('Status:', response.status)
  console.log('Headers:', Object.fromEntries(response.headers.entries()))
  return response.text()
})
.then(text => {
  console.log('Response:', text)
  try {
    const json = JSON.parse(text)
    console.log('JSON:', json)
  } catch (e) {
    console.log('Não é JSON:', text)
  }
})
.catch(error => {
  console.error('Erro:', error)
})