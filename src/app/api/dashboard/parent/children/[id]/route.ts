import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectToDb } from '@/lib/mongodb'
import User from '@/models/User'
import Class from '@/models/Class'
import Grade from '@/models/Grade'
import Assignment from '@/models/Assignment'
import mongoose from 'mongoose'

interface IClass {
  _id: mongoose.Types.ObjectId;
  name: string;
  subject: string;
  studentIds: mongoose.Types.ObjectId[];
  teacherId: {
    name: string;
    email: string;
  };
}


interface IClassDocument {
  _id: mongoose.Types.ObjectId;
  name: string;
  subject: string;
  studentIds: mongoose.Types.ObjectId[];
  teacherId: mongoose.Types.ObjectId;
  __v: number;
}

interface IClassPopulated extends Omit<IClassDocument, 'teacherId'> {
  teacherId: {
    _id: mongoose.Types.ObjectId;
    name: string;
    email: string;
  };
}

interface IGradeDocument {
  _id: mongoose.Types.ObjectId;
  classId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  points: number;
  __v: number;
}

interface IAssignmentDocument {
  _id: mongoose.Types.ObjectId;
  classId: mongoose.Types.ObjectId;
  totalPoints: number;
  __v: number;
}

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const session = await getServerSession(authOptions)
    if (!session || session.user?.role !== 'PARENT') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    await connectToDb()
    
    const childId = new mongoose.Types.ObjectId(id)
    const parentId = new mongoose.Types.ObjectId(session.user.id)

    // Verify this is the parent's child
    const child = await User.findOne({
      _id: childId,
      parentIds: parentId,
      role: 'STUDENT'
    })
    .select('name email')
    .lean()

    if (!child) {
      return NextResponse.json(
        { error: 'Child not found' },
        { status: 404 }
      )
    }

    // Get child's classes
    const classes = await Class.find({
      studentIds: childId
    })
    .populate<{ teacherId: { name: string; email: string } }>('teacherId', 'name email')
    .lean<IClassPopulated[]>()

    // Get grades and assignments for all classes
    const grades = await Grade.find({
      studentId: childId
    }).lean<IGradeDocument[]>()

    const assignments = await Assignment.find({
      classId: { $in: classes.map(c => c._id) }
    }).lean<IAssignmentDocument[]>()

    // Calculate stats per class
    const classStats = await Promise.all(classes.map(async (cls: IClass) => {
      const classGrades = grades.filter(g => g.classId.toString() === cls._id.toString())
      const classAssignments = assignments.filter(a => a.classId.toString() === cls._id.toString())
      
      const totalEarnedPoints = classGrades.reduce((sum, g) => sum + g.points, 0)
      const totalPossiblePoints = classAssignments.reduce((sum, a) => sum + a.totalPoints, 0)
      
      const averageGrade = totalPossiblePoints > 0
        ? Math.round((totalEarnedPoints / totalPossiblePoints) * 100)
        : 0

      return {
        _id: cls._id,
        name: cls.name,
        teacher: cls.teacherId,
        subject: cls.subject,
        averageGrade
      }
    }))

    // Calculate overall average using the same percentage-based method
    const overallAverage = classStats.length > 0
      ? Math.round(classStats.reduce((sum, c) => sum + c.averageGrade, 0) / classStats.length)
      : 0

    return NextResponse.json({
      child,
      classes: classStats,
      overallStats: {
        totalClasses: classes.length,
        averageGrade: overallAverage
      }
    })

  } catch (error) {
    console.error('Child details error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch child details' },
      { status: 500 }
    )
  }
}
