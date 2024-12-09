import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectToDb } from '@/lib/mongodb'
import User from '@/models/User'
import Grade from '@/models/Grade'
import Attendance from '@/models/Attendance'
import { Types } from 'mongoose'

const calculateAttendanceRate = (records: any[]) => {
  if (records.length === 0) return 0
  const presentCount = records.filter(r => r.status === 'present' || r.status === 'late').length
  return Math.round((presentCount / records.length) * 100)
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    console.log('Session:', session)
    
    if (!session || session.user?.role !== 'PARENT') {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Parent access required' }, 
        { status: 401 }
      )
    }

    await connectToDb()
    
    console.log('Looking for children with parentId:', session.user.id)
    const parentId = new Types.ObjectId(session.user.id)

    const children = await User.find({
      role: 'STUDENT',
      parentIds: parentId
    })
    .select('name email')
    .lean()

    console.log('Found children:', children)

    let totalGrades = 0
    let totalAttendance = 0
    let totalClasses = 0

    for (const child of children) {
      const grades = await Grade.find({ studentId: child._id }).lean()
      const attendanceRecords = await Attendance.find({
        studentId: child._id,
        date: { $gte: new Date(Date.now() - 30*24*60*60*1000) }
      }).lean()

      let totalPoints = 0
      let totalMaxPoints = 0
      grades.forEach(grade => {
        totalPoints += grade.points || 0
        totalMaxPoints += grade.totalPoints || 100
      })

      const childGrades = totalMaxPoints > 0 ? (totalPoints / totalMaxPoints) * 100 : 0
      const childAttendance = calculateAttendanceRate(attendanceRecords)

      child.averageGrade = Math.round(childGrades)
      child.attendanceRate = childAttendance

      totalGrades += childGrades
      totalAttendance += childAttendance
      totalClasses += 1
    }

    const stats = {
      childrenCount: children.length,
      averageGrade: Math.round(totalClasses > 0 ? totalGrades / totalClasses : 0),
      averageAttendance: Math.round(totalClasses > 0 ? totalAttendance / totalClasses : 0)
    }

    return NextResponse.json({ children, stats })
  } catch (error) {
    console.error('Parent dashboard error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    )
  }
}