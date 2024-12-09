import { connectToDb } from '@/lib/mongodb'
import Class from '@/models/Class'
import ClassDetailsClient from './ClassDetailsClient'

export default async function ClassDetailsPage({
  params
}: {
  params: { id: string }
}) {
  await connectToDb()
  
  const classData = await Class.findById(params.id)
    .populate('teacherId', 'name email')
    .populate('studentIds', 'name email')
    .lean()

  if (!classData) {
    throw new Error('Class not found')
  }

  // Convert MongoDB document to plain object and ensure proper ID handling
  const serializedData = {
    ...classData,
    _id: classData._id.toString(),
    studentIds: classData.studentIds.map((student: any) => ({
      ...student,
      _id: student._id.toString()
    })),
    teacherId: classData.teacherId ? {
      ...classData.teacherId,
      _id: classData.teacherId._id.toString()
    } : null
  }

  return <ClassDetailsClient initialData={serializedData} classId={params.id} />
}