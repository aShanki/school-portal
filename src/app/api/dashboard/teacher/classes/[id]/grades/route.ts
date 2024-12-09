import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectToDb } from '@/lib/mongodb'
import { PARTICIPATION_ASSIGNMENT_ID } from '@/lib/constants'
import Grade from '@/models/Grade'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    await connectToDb()
    const grades = await Grade.find({ classId: id })
    return NextResponse.json(grades)
  } catch (error) {
    console.error('Error fetching grades:', error)
    return NextResponse.json(
      { error: 'Failed to fetch grades' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    await connectToDb()

    const grade = await Grade.findOneAndUpdate(
      {
        classId: id,
        studentId: body.studentId,
        assignmentId: body.assignmentId === 'participation' 
          ? PARTICIPATION_ASSIGNMENT_ID 
          : body.assignmentId
      },
      {
        $set: {
          points: body.points,
          totalPoints: body.totalPoints || 100,
          updatedAt: new Date()
        }
      },
      { upsert: true, new: true }
    )

    return NextResponse.json(grade)
  } catch (error) {
    console.error('Grade update error:', error)
    return NextResponse.json(
      { error: 'Failed to update grade' },
      { status: 500 }
    )
  }
}