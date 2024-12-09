
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectToDb } from '@/lib/mongodb'
import Class from '@/models/Class'
import Assignment from '@/models/Assignment'
import Grade from '@/models/Grade'
import User from '@/models/User'
import mongoose from 'mongoose'

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string; classId: string }> }
) {
  try {
    const { id, classId } = await context.params
    const session = await getServerSession(authOptions)
    if (!session || session.user?.role !== 'PARENT') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    await connectToDb()
    
    const childId = new mongoose.Types.ObjectId(id)
    const parentId = new mongoose.Types.ObjectId(session.user.id)
    const classObjectId = new mongoose.Types.ObjectId(classId)

    // Verify this is the parent's child
    const child = await User.findOne({
      _id: childId,
      parentIds: parentId,
      role: 'STUDENT'
    })
    .select('name email')
    .lean()

    if (!child) {
      return NextResponse.json(
        { error: 'Child not found' },
        { status: 404 }
      )
    }

    // Get class details
    const cls = await Class.findOne({
      _id: classObjectId,
      studentIds: childId
    })
    .populate('teacherId', 'name email')
    .lean()

    if (!cls) {
      return NextResponse.json(
        { error: 'Class not found' },
        { status: 404 }
      )
    }

    // Get assignments and grades for the class
    const assignments = await Assignment.find({
      classId: classObjectId
    }).lean()

    const grades = await Grade.find({
      classId: classObjectId,
      studentId: childId
    }).lean()

    return NextResponse.json({
      child,
      class: cls,
      assignments,
      grades
    })

  } catch (error) {
    console.error('Class details error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch class details' },
      { status: 500 }
    )
  }
}