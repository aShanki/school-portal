import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectToDb } from '@/lib/mongodb'
import Attendance from '@/models/Attendance'

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')
    const { id } = await context.params

    await connectToDb()
    const attendance = await Attendance.find({
      classId: id,
      date: new Date(date as string)
    })
    return NextResponse.json(attendance)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch attendance' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { id } = await context.params
    await connectToDb()

    const attendance = await Attendance.findOneAndUpdate(
      {
        classId: id,
        studentId: body.studentId,
        date: new Date(body.date)
      },
      {
        $set: {
          status: body.status,
          teacherId: session.user.id
        }
      },
      { upsert: true, new: true }
    )

    return NextResponse.json(attendance)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update attendance' },
      { status: 500 }
    )
  }
}