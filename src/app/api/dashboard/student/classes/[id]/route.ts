import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectToDb } from '@/lib/mongodb'
import Class from '@/models/Class'
import Assignment from '@/models/Assignment'
import Grade from '@/models/Grade'
import { isValidObjectId } from 'mongoose'

export async function GET(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    const { id } = context.params

    if (!isValidObjectId(id)) {
      return NextResponse.json(
        { error: 'Invalid class ID format' },
        { status: 400 }
      )
    }

    const session = await getServerSession(authOptions)
    
    if (!session || session.user?.role !== 'STUDENT') {
      return NextResponse.json(
        { error: 'Unauthorized' }, 
        { status: 401 }
      )
    }

    await connectToDb()

    // Get class details
    const classData = await Class.findOne({
      _id: id,
      studentIds: session.user.id
    })
    .populate('teacherId', 'name email')
    .lean()

    if (!classData) {
      return NextResponse.json(
        { error: 'Class not found' },
        { status: 404 }
      )
    }

    // Get assignments and grades
    const assignments = await Assignment.find({
      classId: id
    }).lean()

    const grades = await Grade.find({
      classId: id,
      studentId: session.user.id
    }).lean()

    return NextResponse.json({
      ...classData,
      assignments,
      grades
    })

  } catch (error) {
    console.error('Class GET error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch class' },
      { status: 500 }
    )
  }
}