import { NextResponse } from "next/server";
import { db } from '@/lib/db'

export async function GET() {
  try {
    // Test database connection
    const userCount = await db.user.count()
    
    // Get environment variables
    const envVars = {
      NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
      NEXTAUTH_URL: process.env.NEXTAUTH_URL,
      DATABASE_URL: !!process.env.DATABASE_URL
    }
    
    return NextResponse.json({ 
      message: "Good!",
      timestamp: new Date().toISOString(),
      database: {
        connected: true,
        userCount
      },
      environment: envVars
    });
  } catch (error) {
    return NextResponse.json({ 
      message: "Error!",
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}