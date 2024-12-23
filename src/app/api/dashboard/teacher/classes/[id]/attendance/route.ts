import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/dbConnect'
import Attendance from '@/models/Attendance'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect()
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const { id } = await params

    const records = await Attendance.find({
      classId: id,
      date: {
        $gte: new Date(startDate!),
        $lte: new Date(endDate!)
      }
    })

    return NextResponse.json(records)
  } catch (err: unknown) {
    console.error('Attendance fetch error:', err)
    return NextResponse.json({ error: 'Failed to fetch attendance' }, { status: 500 })
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { id } = await params
    await dbConnect()

    // First check if there's an existing record with the same status
    const existingAttendance = await Attendance.findOne({
      classId: id,
      studentId: body.studentId,
      date: new Date(body.date)
    })

    // If existing record has the same status, remove it
    if (existingAttendance && existingAttendance.status === body.status) {
      await Attendance.findByIdAndDelete(existingAttendance._id)
      return NextResponse.json({ message: 'Attendance record removed' })
    }

    // Otherwise, update or create new record
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
  } catch (error: unknown) {
    console.error('Failed to update attendance:', error)
    return NextResponse.json(
      { error: 'Failed to update attendance' },
      { status: 500 }
    )
  }
}