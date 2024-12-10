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
  const startTime = Date.now()
  const params = await context.params
  const { id } = params

  try {
    console.log('[API] Class request:', { 
      id,
      method: request.method,
      url: request.url
    })

    if (!isValidObjectId(id)) {
      return NextResponse.json({ error: 'Invalid class ID' }, { status: 400 })
    }

    // Get auth from either session or headers
    const session = await getServerSession(authOptions)
    const authHeader = request.headers.get('Authorization')
    const userId = session?.user?.id || authHeader?.replace('Bearer ', '')
    const userRole = session?.user?.role || request.headers.get('x-user-role')
    
    console.log('[API] Auth check:', { 
      hasSession: !!session,
      hasAuthHeader: !!authHeader,
      userId,
      userRole 
    })

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (userRole !== 'TEACHER') {
      return NextResponse.json({ error: 'Unauthorized - Not a teacher' }, { status: 403 })
    }

    await connectToDb()
    
    const classData = await Class.findById(id)
      .populate('studentIds', 'name email')
      .select('name subject schedule grades studentIds teacherId')
    
    if (!classData) {
      return NextResponse.json({ error: 'Class not found' }, { status: 404 })
    }

    if (classData.teacherId.toString() !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const assignments = await Assignment.find({ 
      classId: new Types.ObjectId(id) 
    }).lean()

    const grades = await Grade.find({ 
      classId: new Types.ObjectId(id)
    }).lean()

    console.log('[API] Response:', {
      id,
      found: !!classData,
      assignmentsCount: assignments.length,
      gradesCount: grades.length,
      responseTime: Date.now() - startTime
    })

    return NextResponse.json({
      ...classData.toObject(),
      assignments,
      grades
    })
  } catch (error) {
    console.error('[API] Error:', {
      id,  // Use the extracted id variable instead of context.params.id
      error,
      responseTime: Date.now() - startTime
    })
    return NextResponse.json(
      { error: 'Failed to fetch class' }, 
      { status: 500 }
    )
  }
}