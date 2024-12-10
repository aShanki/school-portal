import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectToDb } from '@/lib/mongodb'
import Class from '@/models/Class'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' }, 
        { status: 401 }
      )
    }

    if (session.user.role !== 'TEACHER') {
      return NextResponse.json(
        { error: 'Not authorized' },
        { status: 403 }  
      )
    }

    await connectToDb()

    // Get classes taught by this teacher
    const classes = await Class.find({ teacherId: session.user.id })
      .populate('studentIds')
      .lean()

    // Calculate stats
    const totalClasses = classes.length
    const totalStudents = classes.reduce((acc, cls) => 
      acc + (cls.studentIds?.length || 0), 0
    )

    return NextResponse.json({
      totalClasses,
      totalStudents
    })

  } catch (error) {
    console.error('Teacher stats GET error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    )
  }
}