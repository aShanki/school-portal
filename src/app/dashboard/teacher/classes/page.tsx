'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import LoadingSpinner from '@/components/LoadingSpinner'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface ClassData {
  _id: string
  name: string
  subject: string
  studentIds: string[]
}

export default function TeacherClassesPage() {
  useSession({
    required: true,
    onUnauthenticated() {
      router.push('/auth/signin')
    }
  })
  const router = useRouter()

  const { data: classes, isLoading } = useQuery<ClassData[]>({
    queryKey: ['teacherClasses'],
    queryFn: async () => {
      const res = await fetch('/api/dashboard/teacher/classes')
      if (!res.ok) throw new Error('Failed to fetch classes')
      return res.json()
    }
  })

  if (isLoading) return <LoadingSpinner />

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">My Classes</h1>

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
          {classes?.map((cls: ClassData) => (
            <TableRow key={cls._id}>
              <TableCell>{cls.name}</TableCell>
              <TableCell>{cls.subject}</TableCell>
              <TableCell>{cls.studentIds?.length || 0}</TableCell>
              <TableCell>
                <Button
                  data-testid="view-button"
                  variant="ghost"
                  aria-label="view"
                  role="button"
                  onClick={() => router.push(`/dashboard/teacher/classes/${cls._id}`)}
                >
                  View
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
