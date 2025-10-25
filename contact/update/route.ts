import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    console.log('POST request received for contact update')
    
    const body = await request.json()
    const { id, status } = body

    console.log('Request body:', { id, status })

    // Validação básica
    if (!id || !status) {
      console.log('Error: ID and status are required')
      return NextResponse.json(
        { error: 'ID e status são obrigatórios' },
        { status: 400 }
      )
    }

    // Validar status permitidos
    const allowedStatuses = ['new', 'read', 'replied']
    if (!allowedStatuses.includes(status)) {
      console.log('Error: Invalid status:', status)
      return NextResponse.json(
        { error: 'Status inválido. Status permitidos: ' + allowedStatuses.join(', ') },
        { status: 400 }
      )
    }

    console.log('Checking if message exists...')
    
    // Verificar se a mensagem existe
    const existingMessage = await db.contactMessage.findUnique({
      where: { id }
    })

    if (!existingMessage) {
      console.log('Error: Message not found:', id)
      return NextResponse.json(
        { error: 'Mensagem não encontrada' },
        { status: 404 }
      )
    }

    console.log('Message found:', existingMessage.id, 'current status:', existingMessage.status)

    // Atualizar o status
    const updatedMessage = await db.contactMessage.update({
      where: { id },
      data: { 
        status,
        updatedAt: new Date()
      }
    })

    console.log('Message updated successfully:', updatedMessage.status)

    return NextResponse.json({
      success: true,
      message: 'Status atualizado com sucesso!',
      data: updatedMessage
    })

  } catch (error) {
    console.error('Erro completo ao atualizar status da mensagem:', error)
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    )
  }
}