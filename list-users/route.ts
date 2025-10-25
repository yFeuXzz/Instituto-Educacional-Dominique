import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const users = await db.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({
      success: true,
      users: users.map(user => ({
        ...user,
        role: user.role.toLowerCase()
      }))
    })
  } catch (error) {
    console.error('Erro ao listar usuários:', error)
    return NextResponse.json(
      { success: false, error: 'Erro ao listar usuários' },
      { status: 500 }
    )
  }
}