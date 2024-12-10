import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getToken } from 'next-auth/jwt'
import { redirect } from 'next/navigation'
import { fetchServerData } from '@/lib/data-fetching'
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
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    redirect('/auth/signin')
  }

  if (!session.user.role) {
    redirect('/auth/signin')
  }

  if (session.user.role !== 'TEACHER') {
    redirect('/auth/signin')
  }

  try {
    const classData = (await fetchServerData(`/api/dashboard/teacher/classes/${id}`, {
      cache: 'no-store',
      headers: {
        'x-user-id': session.user.id || '',
        'x-user-role': session.user.role || ''
      } satisfies Record<string, string>
    })) as ClassData

    return <GradesTable classData={classData} classId={id} />
  } catch (error) {
    redirect('/dashboard')
  }
}