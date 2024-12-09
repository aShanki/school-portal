import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectToDb } from '@/lib/mongodb'
import User from '@/models/User'
import Class from '@/models/Class'
import Attendance from '@/models/Attendance'
import { Types } from 'mongoose'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user?.role !== 'PARENT') {
      return NextResponse.json(
        { error: 'Unauthorized' }, 
        { status: 401 }
      )
    }

    await connectToDb()

    console.log('Looking for children with parentId:', session.user.id)
    const parentId = new Types.ObjectId(session.user.id)

    const children = await User.find({
      role: 'STUDENT',
      parentIds: parentId
    }).select('name email').lean()

    console.log('Found children:', children)

    if (!children.length) {
      return NextResponse.json({
        children: [],
        debug: {
          parentId: session.user.id,
          reason: 'No children found with this parentId'
        }
      })
    }

    // Add debug logging
    console.log('Found children:', children.length)

    // Get attendance data for each child
    const childrenWithAttendance = await Promise.all(children.map(async (child) => {
      // Get all classes for this child
      const classes = await Class.find({
        studentIds: child._id
      })
      .populate('teacherId', 'name')
      .lean()

      console.log(`Found ${classes.length} classes for child ${child.name}`)

      // Get attendance for each class
      const classesWithAttendance = await Promise.all(classes.map(async (cls) => {
        const attendance = await Attendance.find({
          studentId: child._id,
          classId: cls._id,
          date: { 
            $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
          }
        }).lean()

        console.log(`Found ${attendance.length} attendance records for class ${cls.name}`)

        // Calculate attendance stats
        const total = attendance.length
        const present = attendance.filter(a => a.status === 'present').length
        const late = attendance.filter(a => a.status === 'late').length
        const absent = attendance.filter(a => a.status === 'absent').length
        const rate = total > 0 ? Math.round(((present + late) / total) * 100) : 0

        return {
          ...cls,
          attendance: {
            present,
            late,
            absent,
            total,
            rate
          }
        }
      }))

      return {
        ...child,
        classes: classesWithAttendance
      }
    }))

    return NextResponse.json({
      children: childrenWithAttendance
    })

  } catch (error) {
    console.error('Parent attendance error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch attendance data' },
      { status: 500 }
    )
  }
}