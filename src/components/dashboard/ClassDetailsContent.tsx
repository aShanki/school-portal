'use client'

import { useSession } from 'next-auth/react'
import { useQuery, UseQueryOptions } from '@tanstack/react-query'
import { fetchData } from '@/lib/data-fetching'
import LoadingSpinner from '@/components/LoadingSpinner'
import { useRouter } from 'next/navigation'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useEffect } from 'react'

interface Assignment {
  _id: string;
  name: string;
  description: string;
  totalPoints: number;
}

interface Grade {
  assignmentId: string;
  points: number;
}

interface ClassDetails {
  name: string;
  assignments: Assignment[];
  grades: Grade[];
}

interface ClassDetailsContentProps {
  id: string
}

export default function ClassDetailsContent({ id }: ClassDetailsContentProps) {
  const { data: session, status } = useSession()
  const router = useRouter()

  const queryOptions: UseQueryOptions<ClassDetails, Error> = {
    queryKey: ['class', id],
    queryFn: () => fetchData(`/api/dashboard/student/classes/${id}`, session),
    enabled: !!session && !!id,
    retry: false
  }

  const { data: classDetails, isLoading, error } = useQuery<ClassDetails, Error>(queryOptions)

  useEffect(() => {
    if (error) {
      router.push('/api/auth/signin')
    } else if (classDetails === undefined) {
      router.push('/dashboard')
    }
  }, [error, classDetails, router])

  const calculateTotalGrade = () => {
    if (!classDetails?.assignments?.length || !classDetails?.grades?.length) return 0
    
    const totalPoints = classDetails.assignments.reduce((sum: number, assignment: Assignment) => 
      sum + assignment.totalPoints, 0)
    
    const earnedPoints = classDetails.grades.reduce((sum: number, grade: Grade) => 
      sum + grade.points, 0)
    
    return Math.round((earnedPoints / totalPoints) * 100)
  }

  if (status === 'loading' || isLoading) {
    return <LoadingSpinner />
  }

  if (error || !classDetails) {
    return (
      <div className="p-6">
        <div className="text-red-500">
          {error instanceof Error ? error.message : 'Failed to load class details'}
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">{classDetails?.name}</h1>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Assignment</TableHead>
            <TableHead>Description</TableHead>
            <TableHead className="text-right">Grade</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {classDetails?.assignments?.map((assignment) => {
            const grade = classDetails.grades?.find(
              (g) => g.assignmentId === assignment._id
            )
            return (
              <TableRow key={assignment._id}>
                <TableCell>{assignment.name}</TableCell>
                <TableCell>{assignment.description}</TableCell>
                <TableCell className="text-right">
                  {grade ? `${grade.points}/${assignment.totalPoints}` : 'Not graded'}
                </TableCell>
              </TableRow>
            )
          })}
          <TableRow>
            <TableCell colSpan={3} className="border-t-2">
              <div className="flex justify-between items-center">
                <span className="font-bold">Total Grade:</span>
                <span className="font-bold">{calculateTotalGrade()}%</span>
              </div>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  )
}