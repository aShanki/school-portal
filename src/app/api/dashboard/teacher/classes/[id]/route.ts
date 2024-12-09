import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectToDb } from '@/lib/mongodb'
import Class from '@/models/Class'
import Assignment from '@/models/Assignment'
import Grade from '@/models/Grade'
import { isValidObjectId, Types } from 'mongoose'  // Add Types import

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
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectToDb()
    console.log('Connected to DB')
    
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

    // Debug existing grades
    const allGrades = await Grade.find({}).lean()
    console.log('All grades in DB:', allGrades)

    // Then get grades with explicit ObjectId query
    console.log('Querying grades with classId:', id)
    const grades = await Grade.find({ 
      classId: new Types.ObjectId(id)
    }).lean()
    
    console.log('Found grades for class:', {
      query: { classId: new Types.ObjectId(id) },
      count: grades?.length,
      grades
    })

    const responseData = {
      ...classData.toObject(),
      assignments,
      grades
    }

    return NextResponse.json(responseData)
  } catch (error) {
    console.error('Class GET error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch class', details: error.message }, 
      { status: 500 }
    )
  }
}