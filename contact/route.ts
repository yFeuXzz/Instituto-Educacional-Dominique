import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, phone, message } = body

    // Validação básica
    if (!name || !email || !phone || !message) {
      return NextResponse.json(
        { error: 'Todos os campos são obrigatórios' },
        { status: 400 }
      )
    }

    // Validação de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Email inválido' },
        { status: 400 }
      )
    }

    // Salvar mensagem no banco de dados
    const contactMessage = await db.contactMessage.create({
      data: {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        message: message.trim(),
        status: 'new'
      }
    })

    // Aqui você poderia adicionar:
    // 1. Envio de email para a escola
    // 2. Envio de email de confirmação para o cliente
    // 3. Notificação por WhatsApp
    // 4. Integração com CRM

    return NextResponse.json({
      success: true,
      message: 'Mensagem enviada com sucesso!',
      data: {
        id: contactMessage.id,
        name: contactMessage.name,
        email: contactMessage.email
      }
    })

  } catch (error) {
    console.error('Erro ao processar mensagem de contato:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor. Tente novamente mais tarde.' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    // Endpoint para visualizar mensagens (para admin)
    const messages = await db.contactMessage.findMany({
      orderBy: {
        createdAt: 'desc'
      },
      take: 50 // Limitar às últimas 50 mensagens
    })

    return NextResponse.json({
      success: true,
      data: messages
    })

  } catch (error) {
    console.error('Erro ao buscar mensagens:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}