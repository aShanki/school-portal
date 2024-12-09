import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectToDb } from "@/lib/mongodb"
import Student from "@/models/Student"
import Assignment from "@/models/Assignment"
import mongoose from "mongoose"
import Class from '@/models/Class'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Log session data to debug
    console.log("Session:", session)
    console.log("User role:", session.user?.role)

    if (session.user?.role !== "TEACHER") {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 })
    }

    await connectToDb()
    
    const teacherId = new mongoose.Types.ObjectId(session.user.id)
    const totalStudents = await Student.countDocuments({ teacherId })
    const assignmentsPending = await Assignment.countDocuments({ 
      teacherId,
      status: "PENDING" 
    })

    // Get all classes where teacher is assigned
    const teacherClasses = await Class.find({ teacherId: session.user.id })

    // Get unique student IDs from all classes
    const studentIds = new Set(
      teacherClasses.flatMap(cls => cls.studentIds)
    )

    const stats = {
      totalStudents: studentIds.size,
      totalClasses: teacherClasses.length,
      assignmentsPending: 0, // Implement when assignments are added
      averageGrade: 0, // Implement when grades are added
      attendanceRate: '0%' // Implement when attendance is added
    }

    return NextResponse.json(stats)

  } catch (error) {
    console.error("Error fetching teacher stats:", error)
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    )
  }
}
