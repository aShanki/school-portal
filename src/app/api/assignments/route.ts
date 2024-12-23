import { NextResponse } from 'next/server'
import { connectToDb } from '@/lib/mongodb'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

import Assignment from '@/models/Assignment'

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
  } catch (error: unknown) {
    console.error('Assignment creation error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Internal Server Error'
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}
