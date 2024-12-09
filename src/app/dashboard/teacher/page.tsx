'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import StatsCard from '@/components/dashboard/StatsCard'
import LoadingSpinner from '@/components/LoadingSpinner'

export default function TeacherDashboard() {
  const { data: session } = useSession({
    required: true,
    onUnauthenticated() {
      router.push('/auth/signin')
    }
  })
  const router = useRouter()

  const { data: stats, isLoading } = useQuery({
    queryKey: ['teacherStats'],
    queryFn: async () => {
      const res = await fetch('/api/dashboard/teacher/stats')
      if (!res.ok) throw new Error('Failed to fetch stats')
      return res.json()
    },
    enabled: !!session
  })

  if (isLoading) return <LoadingSpinner />

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Teacher Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StatsCard 
          title="Active Classes"
          value={stats?.totalClasses || 0}
          icon="📚"
        />
        <StatsCard 
          title="Total Students"
          value={stats?.totalStudents || 0}
          icon="👥"
        />
      </div>
    </div>
  )
}