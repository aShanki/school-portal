'use client'

import React from 'react'
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
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'

interface AttendanceRecord {
  _id: string
  date: string
  status: 'present' | 'late' | 'absent'
  notes?: string
}

interface AttendanceData {
  childName: string
  className: string
  teacherName: string
  records: AttendanceRecord[]
}

const getStatusBadgeClasses = (status: string) => {
  switch (status) {
    case 'present':
      return 'bg-green-100 text-green-800'
    case 'late':
      return 'bg-yellow-100 text-yellow-800'
    case 'absent':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

export default function AttendanceDetailsPage({
  params,
}: {
  params: Promise<{ childId: string; classId: string }>
}) {
  const router = useRouter()
  const { childId, classId } = React.use(params)
  
  const { data: session } = useSession({
    required: true,
    onUnauthenticated() {
      router.push('/auth/signin')
    }
  })

  const { data, isLoading, error } = useQuery<AttendanceData, Error>({
    queryKey: ['attendanceDetails', childId, classId],
    queryFn: async () => {
      try {
        const res = await fetch(`/api/dashboard/parent/attendance/${childId}/${classId}`)
        if (!res.ok) {
          throw new Error(await res.text() || 'Failed to fetch attendance details')
        }
        return res.json()
      } catch (err) {
        throw err instanceof Error ? err : new Error('An error occurred')
      }
    },
    enabled: Boolean(session?.user?.id && childId && classId),
    retry: false
  })

  if (isLoading) return <LoadingSpinner />
  if (error) return (
    <div className="p-6">
      <div className="bg-red-50 text-red-500 p-4 rounded-md">
        {(error as Error).message}
      </div>
    </div>
  )
  if (!data?.records?.length) return <div className="p-6">No attendance records found</div>

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Attendance Details</h1>
        <Button variant="outline" onClick={() => router.back()}>
          Back
        </Button>
      </div>

      <div className="space-y-2">
        <p><strong>Student:</strong> {data.childName}</p>
        <p><strong>Class:</strong> {data.className}</p>
        <p><strong>Teacher:</strong> {data.teacherName}</p>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Notes</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.records?.map((record) => (
            <TableRow key={record._id}>
              <TableCell>{format(new Date(record.date), 'MMMM d, yyyy')}</TableCell>
              <TableCell>
                <span className={`px-2 py-1 rounded-full text-sm ${getStatusBadgeClasses(record.status)}`}>
                  {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                </span>
              </TableCell>
              <TableCell>{record.notes || '-'}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}