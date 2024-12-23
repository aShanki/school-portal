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
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectToDb()
    
    const classes = await Class.find({ teacherId: session.user.id })
      .populate('studentIds', 'name email')
      .lean()

    const classesWithAttendance = await Promise.all(
      classes.map(async (cls) => {
        const lastAttendance = await Attendance.findOne({ 
          classId: cls._id 
        })
        .sort({ date: -1 })
        .select('date')
        .lean() as AttendanceDocument | null;

        return {
          ...cls,
          lastAttendance: lastAttendance?.date || null
        }
      })
    )
    
    return NextResponse.json(classesWithAttendance)
  } catch (err) {
    console.error('Error fetching classes:', err)
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
  } catch (err) {
    console.error('Error fetching classes:', err)
    return NextResponse.json(
      { error: 'Failed to fetch classes' },
      { status: 500 }
    )
  }
}
