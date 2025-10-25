'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Mail, Phone, User, Clock, CheckCircle, Eye } from 'lucide-react'

interface ContactMessage {
  id: string
  name: string
  email: string
  phone: string
  message: string
  status: string
  createdAt: string
  updatedAt: string
}

export default function AdminMessages() {
  const [messages, setMessages] = useState<ContactMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null)
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null)

  useEffect(() => {
    fetchMessages()
  }, [])

  // Limpar notificações automaticamente
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(''), 5000)
      return () => clearTimeout(timer)
    }
  }, [error])

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(''), 3000)
      return () => clearTimeout(timer)
    }
  }, [success])

  const fetchMessages = async () => {
    try {
      const response = await fetch('/api/contact')
      const data = await response.json()
      
      if (response.ok) {
        setMessages(data.data)
      } else {
        setError('Erro ao carregar mensagens')
      }
    } catch (error) {
      setError('Erro de conexão')
    } finally {
      setLoading(false)
    }
  }

  const updateMessageStatus = async (messageId: string, newStatus: string) => {
    setUpdatingStatus(messageId)
    setError('')
    setSuccess('')
    
    try {
      console.log('Iniciando atualização:', { messageId, newStatus })
      
      // Verificar se o ID é válido
      if (!messageId || typeof messageId !== 'string') {
        throw new Error('ID da mensagem inválido')
      }
      
      // Verificar se o status é válido
      if (!newStatus || !['new', 'read', 'replied'].includes(newStatus)) {
        throw new Error('Status inválido')
      }
      
      const response = await fetch('/api/contact/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          id: messageId,
          status: newStatus 
        }),
      })

      console.log('Resposta recebida:', response.status, response.statusText)

      // Verificar se a resposta é OK antes de tentar parsear JSON
      if (!response.ok) {
        const errorText = await response.text()
        console.error('Resposta não OK:', errorText)
        throw new Error(`Erro ${response.status}: ${errorText}`)
      }

      const data = await response.json()
      console.log('Dados da resposta:', data)

      // Atualizar estado local
      setMessages(prev => 
        prev.map(msg => 
          msg.id === messageId ? { ...msg, status: newStatus } : msg
        )
      )
      
      if (selectedMessage?.id === messageId) {
        setSelectedMessage(prev => prev ? { ...prev, status: newStatus } : null)
      }
      
      setSuccess('Status atualizado com sucesso!')
      
    } catch (error) {
      console.error('Erro completo:', error)
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
      setError(`Falha ao atualizar: ${errorMessage}`)
    } finally {
      setUpdatingStatus(null)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800'
      case 'read': return 'bg-yellow-100 text-yellow-800'
      case 'replied': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'new': return 'Nova'
      case 'read': return 'Lida'
      case 'replied': return 'Respondida'
      default: return status
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="w-5 h-5" />
          Mensagens de Contato
        </CardTitle>
        <CardDescription>
          Gerencie as mensagens recebidas pelo site
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md text-red-800 flex justify-between items-center">
            <span>{error}</span>
            <button onClick={() => setError('')} className="text-red-600 hover:text-red-800">
              ✕
            </button>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md text-green-800 flex justify-between items-center">
            <span>{success}</span>
            <button onClick={() => setSuccess('')} className="text-green-600 hover:text-green-800">
              ✕
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Lista de mensagens */}
          <div className="lg:col-span-1">
            <div className="border rounded-lg p-4">
              <h3 className="font-medium mb-3">Todas as Mensagens ({messages.length})</h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`list-item-clickable p-3 border rounded-lg cursor-pointer transition-colors hover:bg-gray-50 ${
                      selectedMessage?.id === message.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                    }`}
                    onClick={() => setSelectedMessage(message)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-500" />
                        <span className="font-medium text-sm">{message.name}</span>
                      </div>
                      <Badge className={getStatusColor(message.status)}>
                        {getStatusText(message.status)}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-600 mb-1">{message.email}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(message.createdAt).toLocaleDateString('pt-BR')} • 
                      {new Date(message.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Detalhes da mensagem */}
          <div className="lg:col-span-2">
            {selectedMessage ? (
              <div className="border rounded-lg p-6">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">{selectedMessage.name}</h3>
                    <div className="space-y-1 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        {selectedMessage.email}
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        {selectedMessage.phone}
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        {new Date(selectedMessage.createdAt).toLocaleString('pt-BR')}
                      </div>
                    </div>
                  </div>
                  <Badge className={getStatusColor(selectedMessage.status)}>
                    {getStatusText(selectedMessage.status)}
                  </Badge>
                </div>

                <div className="mb-6">
                  <h4 className="font-medium mb-2">Mensagem:</h4>
                  <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">
                    {selectedMessage.message}
                  </p>
                </div>

                <div className="flex gap-2">
                  {selectedMessage.status === 'new' && (
                    <>
                      <Button
                        onClick={() => updateMessageStatus(selectedMessage.id, 'read')}
                        variant="outline"
                        size="sm"
                        disabled={updatingStatus === selectedMessage.id}
                        className="clickable"
                      >
                        {updatingStatus === selectedMessage.id ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                            Atualizando...
                          </>
                        ) : (
                          <>
                            <Eye className="w-4 h-4 mr-2" />
                            Marcar como Lida
                          </>
                        )}
                      </Button>
                      
                      {/* Botão de teste para debug */}
                      <Button
                        onClick={() => {
                          console.log('Botão de teste clicado para mensagem:', selectedMessage.id)
                          console.log('Status atual:', selectedMessage.status)
                        }}
                        variant="ghost"
                        size="sm"
                        className="text-xs text-gray-500"
                      >
                        Debug
                      </Button>
                    </>
                  )}
                  {selectedMessage.status === 'read' && (
                    <Button
                      onClick={() => updateMessageStatus(selectedMessage.id, 'replied')}
                      size="sm"
                      disabled={updatingStatus === selectedMessage.id}
                      className="clickable"
                    >
                      {updatingStatus === selectedMessage.id ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600 mr-2"></div>
                          Atualizando...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Marcar como Respondida
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <div className="border rounded-lg p-12 text-center">
                <Mail className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Selecione uma mensagem para ver os detalhes</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}