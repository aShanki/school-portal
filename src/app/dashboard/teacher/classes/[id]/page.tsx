import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { fetchData } from '@/lib/data-fetching'
import { GradesTable } from '@/components/dashboard/GradesTable'

interface Student {
  _id: string;
  name: string;
  email: string;
}

interface Assignment {
  _id: string;
  name: string;
  description: string;
  totalPoints: number;
  dueDate: string;
  weight: number;
  category: string;
  status: string;
}

interface Grade {
  _id: string;
  assignmentId: string;
  studentId: string;
  points: number;
  totalPoints: number;
  grade: number;
  score: number;
  updatedAt: string;
}

interface ClassData {
  name: string;
  subject: string;
  assignments: Assignment[];
  grades: Grade[];
  studentIds: Student[];
}

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function ClassDetailsPage({ params }: PageProps) {
  const { id } = await params
  const session = await getServerSession()
  
  if (session?.user?.role !== 'teacher') {
    redirect('/auth/signin')
  }

  const classData = (await fetchData(`/api/dashboard/teacher/classes/${id}`)) as ClassData

  return <GradesTable classData={classData} classId={id} />
}