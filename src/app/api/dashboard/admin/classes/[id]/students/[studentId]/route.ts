import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectToDb } from '@/lib/mongodb'
import Class from '@/models/Class'
import { isValidObjectId } from 'mongoose'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; studentId: string }> }
) {
  try {
    const { id, studentId } = await params
    const session = await getServerSession(authOptions)
    if (session?.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!isValidObjectId(id) || !isValidObjectId(studentId)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })
    }

    await connectToDb()

    const updatedClass = await Class.findByIdAndUpdate(
      id,
      { $pull: { studentIds: studentId } },
      { new: true }
    )

    if (!updatedClass) {
      return NextResponse.json({ error: 'Class not found' }, { status: 404 })
    }

    return NextResponse.json(updatedClass)
  } catch (error) {
    console.error('Remove student error:', error)
    return NextResponse.json(
      { error: 'Failed to remove student' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string; studentId: string }> }
) {
  try {
    const { id, studentId } = await params
    const session = await getServerSession(authOptions)
    if (session?.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectToDb()
    
    const updatedClass = await Class.findByIdAndUpdate(
      id,
      { $addToSet: { studentIds: studentId } },
      { new: true }
    ).populate('studentIds', 'name email')

    if (!updatedClass) {
      return NextResponse.json({ error: 'Class not found' }, { status: 404 })
    }

    return NextResponse.json(updatedClass)
  } catch (error: unknown) {
    console.error('Add student error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}