import { NextResponse } from 'next/server'
import { connectToDb } from '@/lib/mongodb'
import { Assignment } from '@/models/Assignment'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { name, category, totalPoints, description, classId } = body

    if (!name || !category || !totalPoints || !classId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    await connectToDb()

    const assignment = await Assignment.create({
      name,
      category,
      totalPoints,
      description,
      classId,
      createdBy: session.user.id,
      status: 'active'
    })

    return NextResponse.json(assignment, { status: 201 })
  } catch (error: any) {
    console.error('Assignment creation error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    )
  }
}
