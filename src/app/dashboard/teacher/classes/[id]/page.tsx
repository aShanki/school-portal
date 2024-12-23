import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { fetchWithAuth } from '@/lib/data-fetching'
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

// Add this sorting function before the component
function sortAssignments(assignments: Assignment[]): Assignment[] {
  return [...assignments].sort((a, b) => {
    // Check if either assignment is participation
    const isAParticipation = a.category.toLowerCase().includes('participation');
    const isBParticipation = b.category.toLowerCase().includes('participation');
    
    // If one is participation and the other isn't, sort participation last
    if (isAParticipation && !isBParticipation) return 1;
    if (!isAParticipation && isBParticipation) return -1;
    
    // If neither or both are participation, maintain original order
    return 0;
  });
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
  const requestId = Math.random().toString(36).substring(7)
  console.log(`[Page ${requestId}] Loading class details:`, { params })
  
  const { id } = await params
  const session = await getServerSession(authOptions)
  
  console.log(`[Page ${requestId}] Auth check:`, {
    hasSession: !!session,
    userId: session?.user?.id,
    userRole: session?.user?.role
  })

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
    console.time(`[Page ${requestId}] Fetch class ${id}`)
    const classData = (await fetchWithAuth(
      `/api/dashboard/teacher/classes/${id}`,
      session,
      { cache: 'no-store' }
    )) as ClassData

    // Sort the assignments before passing to GradesTable
    const sortedClassData = {
      ...classData,
      assignments: sortAssignments(classData.assignments)
    }

    console.timeEnd(`[Page ${requestId}] Fetch class ${id}`)

    console.log(`[Page ${requestId}] Class data loaded:`, {
      id,
      name: sortedClassData.name,
      studentsCount: sortedClassData.studentIds.length,
      assignmentsCount: sortedClassData.assignments.length
    })

    return <GradesTable classData={sortedClassData} classId={id} />
  } catch (error) {
    console.error(`[Page ${requestId}] Error loading class:`, { 
      id, 
      error,
      errorName: error.name,
      errorMessage: error.message,
      errorStack: error.stack 
    })
    redirect('/dashboard')
  }
}