'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import StatsCard from '@/components/dashboard/StatsCard'
import LoadingSpinner from '@/components/LoadingSpinner'

export default function AdminDashboard() {
  const { data: session } = useSession({
    required: true,
    onUnauthenticated() {
      router.push('/auth/signin')
    }
  })
  const router = useRouter()

  const { data: stats, isLoading } = useQuery({
    queryKey: ['adminStats'],
    queryFn: async () => {
      const res = await fetch('/api/dashboard/admin/stats')
      if (!res.ok) throw new Error('Failed to fetch stats')
      return res.json()
    }
  })

  if (isLoading) return <LoadingSpinner />

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard 
          title="Total Users"
          value={stats?.totalUsers || 0}
          icon="👥"
        />
        <StatsCard 
          title="Teachers"
          value={stats?.roleBreakdown?.teachers || 0}
          icon="👨‍🏫"
        />
        <StatsCard 
          title="Students"
          value={stats?.roleBreakdown?.students || 0}
          icon="👨‍🎓"
        />
        <StatsCard 
          title="Parents"
          value={stats?.roleBreakdown?.parents || 0}
          icon="👨‍👩‍👧‍👦"
        />
      </div>
    </div>
  )
}
