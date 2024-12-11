'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { useEffect } from 'react'
import StatsCard from '@/components/dashboard/StatsCard'
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

export default function TeacherDashboard() {
  const router = useRouter()
  const { data: session } = useSession({
    required: true,
    onUnauthenticated() {
      window.location.href = '/api/auth/signin?callbackUrl=/dashboard/teacher'
    }
  })

  const { data: stats, isLoading: isLoadingStats } = useQuery({
    queryKey: ['teacherStats'],
    queryFn: async () => {
      const res = await fetch('/api/dashboard/teacher/stats')
      if (!res.ok) throw new Error('Failed to fetch stats')
      return res.json()
    },
    enabled: !!session
  })

  const { data: classes, isLoading: isLoadingClasses } = useQuery<ClassData[]>({
    queryKey: ['teacherClasses'],
    queryFn: async () => {
      const res = await fetch('/api/dashboard/teacher/classes')
      if (!res.ok) throw new Error('Failed to fetch classes')
      return res.json()
    },
    enabled: !!session
  })

  if (isLoadingStats || isLoadingClasses) {
    return <LoadingSpinner />
  }

  if (!session) {
    return null
  }

  const statsData = {
    totalClasses: stats?.totalClasses ?? 0,
    totalStudents: stats?.totalStudents ?? 0
  }

  return (
    <div className="p-6 space-y-6">
      <h1 data-testid="dashboard-title" className="text-2xl font-bold">
        Teacher Dashboard
      </h1>
      
      <div data-testid="stats-grid" className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StatsCard 
          title="Active Classes"
          value={statsData.totalClasses}
          icon="📚"
        />
        <StatsCard 
          title="Total Students"
          value={statsData.totalStudents}
          icon="👥"
        />
      </div>

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
                  variant="ghost"
                  onClick={() => router.push(`/dashboard/teacher/classes/${cls._id}`)}
                  aria-label="view"
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