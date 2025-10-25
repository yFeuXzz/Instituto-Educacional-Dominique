'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from "@/components/ui/card"

export default function DebugGradesPage() {
  const [grades, setGrades] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedBimester, setSelectedBimester] = useState('1')
  const [selectedSubject, setSelectedSubject] = useState('ciencias')

  useEffect(() => {
    const loadGrades = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/grades')
        const data = await response.json()
        console.log('📊 Dados recebidos:', data)
        setGrades(data.data || [])
      } catch (error) {
        console.error('Erro:', error)
      } finally {
        setLoading(false)
      }
    }

    loadGrades()
  }, [])

  const filtered = grades.filter(g => 
    g.bimester === parseInt(selectedBimester) && 
    g.subject === selectedSubject
  )

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">🔍 Debug de Notas</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold">Total de Notas</h3>
            <p className="text-2xl font-bold">{grades.length}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold">Filtradas</h3>
            <p className="text-2xl font-bold">{filtered.length}</p>
            <p className="text-sm text-gray-500">
              {selectedSubject} - {selectedBimester}º Bim
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold">Status</h3>
            <p className="text-sm">{loading ? 'Carregando...' : 'Carregado'}</p>
          </CardContent>
        </Card>
      </div>

      <div className="mb-6 flex gap-4">
        <select 
          value={selectedBimester} 
          onChange={(e) => setSelectedBimester(e.target.value)}
          className="border rounded p-2"
        >
          <option value="1">1º Bimestre</option>
          <option value="2">2º Bimestre</option>
          <option value="3">3º Bimestre</option>
          <option value="4">4º Bimestre</option>
        </select>
        
        <select 
          value={selectedSubject} 
          onChange={(e) => setSelectedSubject(e.target.value)}
          className="border rounded p-2"
        >
          <option value="ciencias">Ciências</option>
          <option value="matematica">Matemática</option>
          <option value="portugues">Português</option>
          <option value="historia">História</option>
          <option value="geografia">Geografia</option>
        </select>
      </div>

      <div className="space-y-2">
        <h3 className="font-semibold mb-2">Notas Filtradas:</h3>
        {filtered.map(grade => (
          <div key={grade.id} className="border rounded p-3 bg-gray-50">
            <p><strong>{grade.studentName}</strong></p>
            <p className="text-sm">
              {grade.subject} - {grade.classId} - {grade.bimester}º Bimestre
            </p>
            <p className="text-sm">
              Notas: {grade.note1} | {grade.note2} | {grade.note3} = {grade.average?.toFixed(2)}
            </p>
          </div>
        ))}
        
        {filtered.length === 0 && (
          <p className="text-gray-500">Nenhuma nota encontrada com estes filtros.</p>
        )}
      </div>

      <div className="mt-6">
        <h3 className="font-semibold mb-2">Todas as Notas:</h3>
        <div className="space-y-1 max-h-64 overflow-y-auto">
          {grades.map(grade => (
            <div key={grade.id} className="text-xs border-b pb-1">
              {grade.studentName} - {grade.subject} - {grade.bimester}º Bim
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
