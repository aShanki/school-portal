import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectToDb } from '@/lib/mongodb'
import User from '@/models/User' // Replace Student with User
import Class from '@/models/Class'
import Attendance from '@/models/Attendance'
import { Types } from 'mongoose'

export async function GET(
  req: Request,
  context: { params: Promise<{ childId: string; classId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user?.role !== 'PARENT') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    await connectToDb()

    const { childId, classId } = await context.params
    const parentId = new Types.ObjectId(session.user.id)

    // Verify the IDs are valid ObjectIDs
    if (!Types.ObjectId.isValid(childId) || !Types.ObjectId.isValid(classId)) {
      return NextResponse.json({ error: 'Invalid ID format' }, { status: 400 })
    }

    // Get the child and verify parent relationship
    const child = await User.findOne({
      _id: childId,
      parentIds: parentId,
      role: 'STUDENT'
    }).lean()

    if (!child) {
      return NextResponse.json(
        { error: 'Child not found', debug: { childId, parentId: session.user.id } },
        { status: 404 }
      )
    }

    // Get the class
    const classInfo = await Class.findOne({
      _id: classId,
      studentIds: childId
    }).populate('teacherId', 'name').lean()

    if (!classInfo) {
      return NextResponse.json({ error: 'Class not found' }, { status: 404 })
    }

    // Get attendance records
    const records = await Attendance.find({
      studentId: childId,
      classId: classId
    })
    .sort({ date: -1 })
    .lean()

    return NextResponse.json({
      childName: child.name,
      className: classInfo.name,
      teacherName: classInfo.teacherId.name,
      records: records.map(record => ({
        _id: record._id,
        date: record.date,
        status: record.status,
        notes: record.notes
      }))
    })

  } catch (error) {
    console.error('Attendance details error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch attendance data' },
      { status: 500 }
    )
  }
}