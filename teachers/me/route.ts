import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { db } from "@/lib/db"

export async function GET() {
  try {
    const session = await getServerSession()
    
    if (!session?.user?.email) {
      return NextResponse.json({
        success: false,
        error: "Não autenticado"
      }, { status: 401 })
    }

    // Buscar usuário
    const user = await db.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({
        success: false,
        error: "Usuário não encontrado"
      }, { status: 404 })
    }

    // Se for professor, buscar informações do professor
    if (user.role === "TEACHER") {
      const teacher = await db.teacher.findUnique({
        where: { userId: user.id },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              role: true,
              createdAt: true
            }
          }
        }
      })

      if (!teacher) {
        return NextResponse.json({
          success: false,
          error: "Professor não encontrado"
        }, { status: 404 })
      }

      const formattedTeacher = {
        ...teacher,
        subjects: JSON.parse(teacher.subjects || "[]"),
        grades: JSON.parse(teacher.grades || "[]")
      }

      return NextResponse.json({
        success: true,
        data: {
          user: formattedTeacher.user,
          teacher: formattedTeacher
        }
      })
    }

    // Para outros papéis
    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt
        }
      }
    })
  } catch (error) {
    console.error("❌ Erro ao buscar perfil:", error)
    return NextResponse.json({
      success: false,
      error: "Erro ao buscar perfil"
    }, { status: 500 })
  }
}
