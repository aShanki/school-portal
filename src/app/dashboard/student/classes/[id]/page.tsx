'use client'

import { use } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import LoadingSpinner from '@/components/LoadingSpinner'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export default function ClassDetailsPage({
  params
}: {
  params: { id: string }
}) {
  const id = use(params).id
  const router = useRouter()
  
  const { data: session } = useSession({
    required: true,
    onUnauthenticated() {
      router.push('/auth/signin')
    }
  })

  const { data: classData, isLoading } = useQuery({
    queryKey: ['class', id],
    queryFn: async () => {
      const res = await fetch(`/api/dashboard/student/classes/${id}`)
      if (!res.ok) throw new Error('Failed to fetch class')
      return res.json()
    }
  })

  if (isLoading) return <LoadingSpinner />

  const calculateFinalGrade = () => {
    if (!classData?.assignments?.length) return 'N/A'
    
    let totalPoints = 0
    let maxPoints = 0

    classData.assignments.forEach(assignment => {
      const grade = classData.grades?.find(g => g.assignmentId === assignment._id)
      if (grade) {
        totalPoints += grade.points
        maxPoints += assignment.totalPoints
      }
    })

    return maxPoints === 0 ? 'N/A' : `${Math.round((totalPoints / maxPoints) * 100)}%`
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">{classData?.name}</h1>
        <button
          className="text-blue-600 hover:text-blue-800"
          onClick={() => router.back()}
        >
          ← Back to Classes
        </button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Assignment</TableHead>
            <TableHead>Description</TableHead>
            <TableHead className="text-right">Grade</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {classData?.assignments?.map((assignment) => {
            const grade = classData.grades?.find(g => g.assignmentId === assignment._id)
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
          <TableRow className="border-t-2">
            <TableCell colSpan={2} className="font-bold">
              Final Grade
            </TableCell>
            <TableCell className="text-right font-bold">
              {calculateFinalGrade()}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  )
}