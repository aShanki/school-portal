'use client'

import { useQuery } from '@tanstack/react-query'
import LoadingSpinner from '@/components/LoadingSpinner'
import { useRouter } from 'next/navigation'
import { Class } from '@/types'

export default function ChildDetailsClient({ childId }: { childId: string }) {
  const router = useRouter()
  const { data, isLoading } = useQuery({
    queryKey: ['childDetails', childId],
    queryFn: async () => {
      const res = await fetch(`/api/dashboard/parent/children/${childId}`)
      if (!res.ok) throw new Error('Failed to fetch child data')
      return res.json()
    }
  })

  if (isLoading) return <LoadingSpinner />
  if (!data) return <div>Could not fetch child's data</div>

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">{data.child?.name}'s Details</h1>
      
      <div className="space-y-6">
        {/* Overall Stats */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-3">Overall Statistics</h2>
          <p>Total Classes: {data.overallStats.totalClasses}</p>
          <p>Average Grade: {data.overallStats.averageGrade}%</p>
        </div>

        {/* Classes List */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Classes</h2>
          {data.classes.map((cls: Class) => (
            <div 
              key={cls._id} 
              className="bg-white p-4 rounded-lg shadow cursor-pointer hover:bg-gray-50"
              onClick={() => router.push(`/dashboard/parent/children/${childId}/classes/${cls._id}`)}
            >
              <h3 className="font-medium">{cls.name}</h3>
              <p>Subject: {cls.subject}</p>
              <p>Teacher: {cls.teacher.name}</p>
              <p>Average Grade: {cls.averageGrade}%</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}