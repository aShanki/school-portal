'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import LoadingSpinner from '@/components/LoadingSpinner'
import { fetchData } from '@/lib/data-fetching'
import {
  Table,
  TableBody,
  TableCell,
TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export default function StudentDashboardPage() {
  const { data: session } = useSession()
  const router = useRouter()

  const { data: classes, isLoading } = useQuery<any[]>({
    queryKey: ['classes'],
    queryFn: () => fetchData('/api/dashboard/student/classes'),
    enabled: !!session
  })

  if (isLoading) {
    return <LoadingSpinner />
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">My Classes</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Subject</TableHead>
            <TableHead>Teacher</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {classes?.map((cls) => (
            <TableRow key={cls._id}>
              <TableCell>{cls.name}</TableCell>
              <TableCell>{cls.subject}</TableCell>
              <TableCell>{cls.teacherId?.name}</TableCell>
              <TableCell>
                <button
                  className="text-blue-600 hover:text-blue-800"
                  onClick={() => router.push(`/dashboard/student/classes/${cls._id}`)}
                >
                  View Grades →
                </button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}