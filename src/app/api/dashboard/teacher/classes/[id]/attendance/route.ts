import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/dbConnect'
import Attendance from '@/models/Attendance'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { startOfDay, endOfDay } from 'date-fns'

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

    // Use start of day and end of day for the query
    const queryStartDate = startOfDay(new Date(startDate!))
    const queryEndDate = endOfDay(new Date(endDate!))

    const records = await Attendance.find({
      classId: id,
      date: {
        $gte: queryStartDate,
        $lte: queryEndDate
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

    // Convert the incoming date to start of day for consistent comparison
    const attendanceDate = startOfDay(new Date(body.date))

    // First check if there's an existing record for this date
    const existingAttendance = await Attendance.findOne({
      classId: id,
      studentId: body.studentId,
      date: {
        $gte: attendanceDate,
        $lt: endOfDay(attendanceDate)
      }
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
        date: {
          $gte: attendanceDate,
          $lt: endOfDay(attendanceDate)
        }
      },
      {
        $set: {
          status: body.status,
          teacherId: session.user.id,
          date: attendanceDate // Store the start of day
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