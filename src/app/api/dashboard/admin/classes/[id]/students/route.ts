import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectToDb } from '@/lib/mongodb'
import Class from '@/models/Class'
import { isValidObjectId } from 'mongoose'

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (session?.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!isValidObjectId(params.id)) {
      return NextResponse.json({ error: 'Invalid class ID' }, { status: 400 })
    }

    const { studentId } = await request.json()

    if (!isValidObjectId(studentId)) {
      return NextResponse.json({ error: 'Invalid student ID' }, { status: 400 })
    }

    await connectToDb()

    const updatedClass = await Class.findByIdAndUpdate(
      params.id,
      { $addToSet: { studentIds: studentId } },
      { new: true }
    )

    if (!updatedClass) {
      return NextResponse.json({ error: 'Class not found' }, { status: 404 })
    }

    return NextResponse.json(updatedClass)
  } catch (error) {
    console.error('Add student error:', error)
    return NextResponse.json(
      { error: 'Failed to add student' },
      { status: 500 }
    )
  }
}
