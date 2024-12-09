'use client'

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

interface Class {
  _id: string
  name: string
  subject: string
  studentIds: string[]
}

export default function TeacherAttendancePage() {
  const router = useRouter()
  const { data: session } = useSession({
    required: true,
    onUnauthenticated() {
      router.push('/auth/signin')
    }
  })

  const { data: classes, isLoading } = useQuery({
    queryKey: ['teacherClasses'],
    queryFn: async () => {
      const res = await fetch('/api/dashboard/teacher/classes')
      if (!res.ok) throw new Error('Failed to fetch classes')
      return res.json()
    },
    enabled: !!session
  })

  if (isLoading) return <LoadingSpinner />

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Class Attendance</h1>
        <span className="text-sm text-gray-500">
          {classes?.length || 0} Classes Total
        </span>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Subject</TableHead>
            <TableHead>Students</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {classes?.map((cls) => (
            <TableRow key={cls._id}>
              <TableCell>{cls.name}</TableCell>
              <TableCell>{cls.subject}</TableCell>
              <TableCell>{cls.studentIds?.length || 0}</TableCell>
              <TableCell>
                <button
                  className="text-blue-600 hover:text-blue-900"
                  onClick={() => router.push(`/dashboard/teacher/classes/${cls._id}/attendance`)}
                >
                  Take Attendance →
                </button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
