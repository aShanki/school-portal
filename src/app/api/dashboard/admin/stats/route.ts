
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectToDb } from '@/lib/mongodb'
import User from '@/models/User'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    if (session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 })
    }

    await connectToDb()

    const stats = {
      totalUsers: await User.countDocuments(),
      roleBreakdown: {
        teachers: await User.countDocuments({ role: 'TEACHER' }),
        students: await User.countDocuments({ role: 'STUDENT' }),
        parents: await User.countDocuments({ role: 'PARENT' })
      }
    }

    return NextResponse.json(stats)

  } catch (error) {
    console.error("Error fetching admin stats:", error)
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    )
  }
}