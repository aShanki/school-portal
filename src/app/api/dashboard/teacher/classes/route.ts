import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectToDb } from '@/lib/mongodb'
import Class from '@/models/Class'
import Attendance from '@/models/Attendance'

// Add interface for Attendance document
interface AttendanceDocument {
  _id: string;
  date: Date;
  classId: string;
}

export async function GET() {
  console.log('API ROUTE HIT: /api/dashboard/teacher/classes') // Add this at the very start
  
  try {
    console.log('API - GET /api/dashboard/teacher/classes - Start')
    
    const session = await getServerSession(authOptions)
    console.log('API - Session:', session)
    
    if (!session?.user?.id) {
      console.log('API - No valid user found in session')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectToDb()
    console.log('API - Connected to DB')
    
    const classes = await Class.find({ teacherId: session.user.id })
      .populate('studentIds', 'name email')
      .lean()
    
    console.log('API - Classes found:', classes.length)
    console.log('API - Raw classes data:', JSON.stringify(classes, null, 2))

    // Get last attendance for each class
    const classesWithAttendance = await Promise.all(
      classes.map(async (cls) => {
        const lastAttendance = await Attendance.findOne({ 
          classId: cls._id 
        })
        .sort({ date: -1 })
        .select('date')
        .lean() as AttendanceDocument | null;

        const result = {
          ...cls,
          lastAttendance: lastAttendance?.date || null
        }
        console.log(`API - Class ${cls._id} processed:`, JSON.stringify(result, null, 2))
        return result
      })
    )
    
    console.log('API - Final response:', JSON.stringify(classesWithAttendance, null, 2))
    return NextResponse.json(classesWithAttendance)
  } catch (error) {
    console.error('API - Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    })
    return NextResponse.json(
      { error: 'Failed to fetch classes' },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    await connectToDb()

    const newClass = await Class.create({
      ...body,
      teacherId: session.user.id,
    })

    return NextResponse.json(newClass)
  } catch (error) {
    console.error('Classes POST error:', error)
    return NextResponse.json(
      { error: 'Failed to create class' },
      { status: 500 }
    )
  }
}