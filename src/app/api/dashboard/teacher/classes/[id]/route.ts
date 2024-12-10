import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectToDb } from '@/lib/mongodb'
import Class from '@/models/Class'
import Assignment from '@/models/Assignment'
import Grade from '@/models/Grade'
import { isValidObjectId, Types } from 'mongoose'

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params
    const { id } = params
    
    if (!isValidObjectId(id)) {
      return NextResponse.json({ error: 'Invalid class ID' }, { status: 400 })
    }

    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized - No session' }, { status: 401 })
    }

    if (session.user.role !== 'TEACHER') {
      return NextResponse.json({ error: 'Unauthorized - Not a teacher' }, { status: 403 })
    }

    await connectToDb()
    
    const classData = await Class.findById(id)
      .populate('studentIds', 'name email')
      .select('name subject schedule grades studentIds teacherId')
    
    if (!classData) {
      return NextResponse.json({ error: 'Class not found' }, { status: 404 })
    }

    if (classData.teacherId.toString() !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Fetch assignments for this class
    const assignments = await Assignment.find({ 
      classId: new Types.ObjectId(id) 
    }).lean()

    // Get grades without debug logging
    const grades = await Grade.find({ 
      classId: new Types.ObjectId(id)
    }).lean()

    const responseData = {
      ...classData.toObject(),
      assignments,
      grades
    }

    return NextResponse.json(responseData)
  } catch (error) {
    return NextResponse.json(
      { 
        error: 'Failed to fetch class', 
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    )
  }
}