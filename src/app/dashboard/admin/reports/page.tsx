'use client'

import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface ReportData {
  gradeDistribution: {
    labels: string[]
    data: number[]
  }
  attendance: {
    labels: string[]
    data: number[]
  }
}

export default function ReportsPage() {
  const { data: reports, isLoading, error } = useQuery<ReportData>({
    queryKey: ['reports'],
    queryFn: async () => {
      const res = await fetch('/api/dashboard/admin/reports')
      if (!res.ok) throw new Error('Failed to fetch reports')
      return res.json()
    }
  })

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-1/4 bg-gray-200 rounded"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 text-red-500 p-4 rounded">
          Error loading reports: {error.message}
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Reports</h1>
        <Button>Generate New Report</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Grade Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Add chart/visualization component here */}
            <p>Grade distribution visualization will go here</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Attendance Report</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Add chart/visualization component here */}
            <p>Attendance report visualization will go here</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
