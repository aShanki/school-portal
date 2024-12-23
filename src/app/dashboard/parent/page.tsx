'use client'

import { useSession } from 'next-auth/react'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import LoadingSpinner from '@/components/LoadingSpinner'
import { useRouter } from 'next/navigation'

interface Child {
  _id: string
  name: string
  email: string
  averageGrade: number
  attendanceRate: number
}

type DashboardData = {
  children: Array<Child>
  stats: {
    childrenCount: number
    averageGrade: number
    averageAttendance: number
  }
}

export default function ParentDashboard() {
  const router = useRouter()
  const { data: session } = useSession({
    required: true,
    onUnauthenticated() {
      router.push('/auth/signin')
    }
  })

  const { data, isLoading, error } = useQuery({
    queryKey: ['parentDashboard'],
    queryFn: async () => {
      const res = await fetch('/api/dashboard/parent')
      if (!res.ok) {
        throw new Error('Failed to fetch dashboard data')
      }
      const data = await res.json()
      console.log('Dashboard data:', data)
      return data
    },
    enabled: !!session
  })

  if (isLoading) return <LoadingSpinner />

  if (error) {
    return (
      <div className="p-6">
        <p className="text-red-500">Error loading dashboard</p>
      </div>
    )
  }

  if (!data?.children?.length) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold">Parent Dashboard</h1>
        <p className="mt-4">No children found associated with your account.</p>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Parent Dashboard</h1>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Children</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data?.stats.childrenCount}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Average Grade</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data?.stats.averageGrade}%
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Average Attendance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data?.stats.averageAttendance}%
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {data?.children?.map((child: Child) => (
          <Card 
            key={child._id} 
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => router.push(`/dashboard/parent/children/${child._id}`)}
          >
            <CardHeader>
              <CardTitle>{child.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">{child.email}</p>
                <div className="flex justify-between text-sm">
                  <span>Grade: {child.averageGrade}%</span>
                  <span>Attendance: {child.attendanceRate}%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
