import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectToDb } from '@/lib/mongodb'
import Class from '@/models/Class'
import User from '@/models/User'

// Get students in a class
export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const session = await getServerSession(authOptions)
    if (!session || session.user?.role !== 'TEACHER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectToDb()

    const classData = await Class.findOne({ 
      _id: id,
      teacherId: session.user.id 
    }).populate('studentIds', 'name email')

    if (!classData) {
      return NextResponse.json({ error: 'Class not found' }, { status: 404 })
    }

    return NextResponse.json(classData.studentIds)
  } catch (error) {
    console.error('Students GET error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch students' },
      { status: 500 }
    )
  }
}

// Add student to class
export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const session = await getServerSession(authOptions)
    if (!session || session.user?.role !== 'TEACHER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    if (!body.studentId) {
      return NextResponse.json(
        { error: 'Student ID is required' },
        { status: 400 }
      )
    }

    await connectToDb()

    const updatedClass = await Class.findOneAndUpdate(
      { 
        _id: id,
        teacherId: session.user.id 
      },
      { $addToSet: { studentIds: body.studentId } },
      { new: true }
    ).populate('studentIds', 'name email')

    if (!updatedClass) {
      return NextResponse.json({ error: 'Class not found' }, { status: 404 })
    }

    return NextResponse.json(updatedClass.studentIds)
  } catch (error) {
    console.error('Students POST error:', error)
    return NextResponse.json(
      { error: 'Failed to add student' },
      { status: 500 }
    )
  }
}

// Remove student from class
export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string; studentId: string }> }
) {
  try {
    const { id, studentId } = await context.params
    const session = await getServerSession(authOptions)
    if (!session || session.user?.role !== 'TEACHER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectToDb()

    const updatedClass = await Class.findOneAndUpdate(
      { 
        _id: id,
        teacherId: session.user.id 
      },
      { $pull: { studentIds: studentId } },
      { new: true }
    ).populate('studentIds', 'name email')

    if (!updatedClass) {
      return NextResponse.json({ error: 'Class not found' }, { status: 404 })
    }

    return NextResponse.json(updatedClass.studentIds)
  } catch (error) {
    console.error('Students DELETE error:', error)
    return NextResponse.json(
      { error: 'Failed to remove student' },
      { status: 500 }
    )
  }
}