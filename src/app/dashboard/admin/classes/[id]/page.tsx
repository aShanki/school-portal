import { connectToDb } from '@/lib/mongodb'
import Class from '@/models/Class'
import ClassDetailsClient from './ClassDetailsClient'
import ClassStudentsClient from './ClassStudentsClient'
import { Types } from 'mongoose'

interface Teacher {
  _id: string;
  name: string;
  email: string;
}

interface Student {
  _id: string;
  name: string;
  email: string;
}

interface ClassData {
  _id: string;
  name: string;
  subject: string;
  teacherId: Teacher;
  studentIds: Student[];
}

interface User {
  _id: Types.ObjectId;
  name: string;
  email: string;
}

interface SerializedStudent extends Omit<User, '_id'> {
  _id: string;
}

interface ClassDocument extends Document {
  _id: Types.ObjectId;
  name: string;
  subject: string;
  teacherId: User;
  studentIds: User[];
  [key: string]: unknown;
}

export default async function ClassDetailsPage(
  props: {
    params: Promise<{ id: string }>
  }
) {
  const params = await props.params;
  await connectToDb()

  const classData = (await Class.findById(params.id)
    .populate('teacherId', 'name email')
    .populate('studentIds', 'name email')
    .lean()) as unknown as ClassDocument

  if (!classData) {
    throw new Error('Class not found')
  }

  if (!classData.teacherId) {
    throw new Error('Class must have a teacher')
  }

  const serializedData: ClassData = {
    ...classData,
    _id: classData._id.toString(),
    studentIds: classData.studentIds.map((student: User) => ({
      ...student,
      _id: student._id.toString()
    })),
    teacherId: {
      ...classData.teacherId,
      _id: classData.teacherId._id.toString()
    }
  }

  return <ClassDetailsClient initialData={serializedData} classId={params.id} />
}

export async function ClassStudentsPage(
  props: { params: { id: string } }
) {
  await connectToDb()

  const classData = await Class.findById(props.params.id)
    .populate('teacherId', 'name email')
    .populate('studentIds', 'name email')
    .lean()

  if (!classData) {
    throw new Error('Class not found')
  }

  const serializedData = {
    ...classData,
    _id: classData._id.toString(),
    teacherId: classData.teacherId ? {
      ...classData.teacherId,
      _id: classData.teacherId._id.toString()
    } : null,
    studentIds: (classData.studentIds || []).map((student: SerializedStudent) => ({
      ...student,
      _id: student._id.toString()
    }))
  }

  return <ClassStudentsClient initialData={serializedData} classId={props.params.id} />
}