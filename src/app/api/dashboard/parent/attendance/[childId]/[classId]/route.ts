import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectToDb } from '@/lib/mongodb'
import User from '@/models/User'
import Class from '@/models/Class'
import Attendance from '@/models/Attendance'
import { UserDocument, ClassDocument, AttendanceDocument } from '@/models/types'
import { Types } from 'mongoose'

// Add type guards at the top of the file
function isUserDocument(obj: any): obj is UserDocument {
  return obj && typeof obj.name === 'string';
}

function isClassDocument(obj: any): obj is ClassDocument {
  return obj && typeof obj.name === 'string' && obj.teacherId && typeof obj.teacherId.name === 'string';
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ childId: string; classId: string }> }
) {
  try {
    const { childId, classId } = await params;
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectToDb()

    const [child, classInfo, records] = await Promise.all([
      User.findById(childId).select('name email').lean(),
      Class.findById(classId)
        .populate('teacherId', 'name email')
        .select('name teacherId')
        .lean(),
      Attendance.find({
        studentId: new Types.ObjectId(childId),
        classId: new Types.ObjectId(classId)
      }).lean()
    ])

    if (!child || !classInfo || !isUserDocument(child) || !isClassDocument(classInfo)) {
      return NextResponse.json({ 
        error: 'Invalid data retrieved from database'
      }, { status: 500 })
    }

    return NextResponse.json({
      childName: child.name,
      className: classInfo.name,
      teacherName: classInfo.teacherId.name,
      records: records.map(record => ({
        _id: record._id,
        date: record.date,
        status: record.status,
        remarks: record.remarks
      }))
    })
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}