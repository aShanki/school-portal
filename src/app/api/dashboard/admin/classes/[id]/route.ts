import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectToDb } from '@/lib/mongodb'
import Class from '@/models/Class'
import { isValidObjectId } from 'mongoose'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    if (!isValidObjectId(id)) {
      return NextResponse.json(
        { error: 'Invalid class ID format' },
        { status: 400 }
      )
    }

    const session = await getServerSession(authOptions)
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    await connectToDb()

    const classData = await Class.findById(id)
      .populate('teacherId', 'name email')
      .populate('studentIds', 'name email')
      .lean()

    if (!classData) {
      return NextResponse.json(
        { error: 'Class not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(classData)
  } catch (error) {
    console.error('Class GET error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch class' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    if (!isValidObjectId(id)) {
      return NextResponse.json(
        { error: 'Invalid class ID format' },
        { status: 400 }
      )
    }

    const session = await getServerSession(authOptions)
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()

    await connectToDb()

    const updatedClass = await Class.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true }
    )
    .populate('teacherId', 'name email')
    .populate('studentIds', 'name email')
    .lean()

    if (!updatedClass) {
      return NextResponse.json(
        { error: 'Class not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(updatedClass)
  } catch (error) {
    console.error('Class PATCH error:', error)
    return NextResponse.json(
      { error: 'Failed to update class' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    if (!isValidObjectId(id)) {
      return NextResponse.json(
        { error: 'Invalid class ID format' },
        { status: 400 }
      )
    }

    const session = await getServerSession(authOptions)
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    await connectToDb()

    const deletedClass = await Class.findByIdAndDelete(id)

    if (!deletedClass) {
      return NextResponse.json(
        { error: 'Class not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ message: 'Class deleted successfully' })
  } catch (error) {
    console.error('Class DELETE error:', error)
    return NextResponse.json(
      { error: 'Failed to delete class' },
      { status: 500 }
    )
  }
}