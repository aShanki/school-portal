'use client'

import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import LoadingSpinner from '@/components/LoadingSpinner'

interface Props {
  studentId: string
  classId: string
}

interface Assignment {
  _id: string
  name: string
  totalPoints: number
}

interface Grade {
  assignmentId: string
  points: number
}

export default function ClassDetailsClient({ studentId, classId }: Props) {
  const router = useRouter()

  const { data, isLoading } = useQuery({
    queryKey: ['childClass', studentId, classId],
    queryFn: async () => {
      const res = await fetch(`/api/dashboard/parent/children/${studentId}/classes/${classId}`)
      if (!res.ok) throw new Error('Failed to fetch class data')
      return res.json()
    }
  })

  const calculateGradePercentage = (points: number, totalPoints: number) => {
    return Math.round((points / totalPoints) * 100)
  }

  const calculateOverallGrade = () => {
    if (!data?.grades || !data?.assignments) return 0
    const totalEarnedPoints = data.grades.reduce((sum: number, grade: any) => sum + grade.points, 0)
    const totalPossiblePoints = data.assignments.reduce((sum: number, assignment: any) => sum + assignment.totalPoints, 0)
    return calculateGradePercentage(totalEarnedPoints, totalPossiblePoints)
  }

  if (isLoading) return <LoadingSpinner />

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">{data?.class?.name}</h1>
        <button
          onClick={() => router.back()}
          className="px-4 py-2 text-sm bg-gray-100 rounded-md hover:bg-gray-200"
        >
          Back
        </button>
      </div>

      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-3">Class Information</h2>
        <p>Teacher: {data?.class?.teacherId?.name}</p>
        <p>Subject: {data?.class?.subject}</p>
        <p>Overall Grade: {calculateOverallGrade()}%</p>
      </div>

      <div className="bg-white rounded-lg shadow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Assignment</TableHead>
              <TableHead>Points</TableHead>
              <TableHead>Grade</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.assignments?.map((assignment: Assignment) => {
              const grade = data.grades.find((g: Grade) => g.assignmentId.toString() === assignment._id.toString())
              return (
                <TableRow key={assignment._id}>
                  <TableCell>{assignment.name}</TableCell>
                  <TableCell>{grade?.points ?? '-'} / {assignment.totalPoints}</TableCell>
                  <TableCell>
                    {grade 
                      ? `${calculateGradePercentage(grade.points, assignment.totalPoints)}%`
                      : 'Not graded'
                    }
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}