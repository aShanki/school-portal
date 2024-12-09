import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectToDb } from '@/lib/mongodb'
import Class from '@/models/Class'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user?.role !== 'STUDENT') {
      return NextResponse.json(
        { error: 'Unauthorized' }, 
        { status: 401 }
      )
    }

    await connectToDb()

    // Find all classes where student is enrolled
    const classes = await Class.find({
      studentIds: session.user.id
    })
    .populate('teacherId', 'name email')
    .lean()

    return NextResponse.json(classes)

  } catch (error) {
    console.error('Student classes GET error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch classes' },
      { status: 500 }
    )
  }
}