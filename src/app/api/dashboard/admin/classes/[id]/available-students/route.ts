import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectToDb } from '@/lib/mongodb'
import User from '@/models/User'
import Class from '@/models/Class'
import { isValidObjectId } from 'mongoose'

export async function GET(
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

    await connectToDb()

    // Get current class's student IDs
    const currentClass = await Class.findById(params.id)
    if (!currentClass) {
      return NextResponse.json({ error: 'Class not found' }, { status: 404 })
    }

    // Find all students not in the class
    const availableStudents = await User.find({
      role: 'STUDENT',
      _id: { $nin: currentClass.studentIds }
    })
    .select('name email')
    .lean()

    return NextResponse.json(availableStudents)

  } catch (error) {
    console.error('Available students fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch available students' },
      { status: 500 }
    )
  }
}