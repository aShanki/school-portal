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
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function ParentAttendancePage() {
  const router = useRouter()
  const { data: session } = useSession({
    required: true,
    onUnauthenticated() {
      router.push('/auth/signin')
    }
  })

  const { data, isLoading, error } = useQuery({
    queryKey: ['parentAttendance'],
    queryFn: async () => {
      const res = await fetch('/api/dashboard/parent/attendance')
      if (!res.ok) {
        const error = await res.text()
        console.error('Attendance fetch error:', error)
        throw new Error('Failed to fetch attendance data')
      }
      const data = await res.json()
      console.log('Attendance data:', data)
      return data
    },
    enabled: !!session
  })

  if (isLoading) return <LoadingSpinner />
  if (error) return <div>Error: {error.message}</div>
  if (!data?.children?.length) return <div>No attendance data found</div>

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Children's Attendance</h1>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Class</TableHead>
            <TableHead>Teacher</TableHead>
            <TableHead>Present</TableHead>
            <TableHead>Late</TableHead>
            <TableHead>Absent</TableHead>
            <TableHead>Attendance Rate</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data?.children?.map((child: any) => 
            child.classes?.map((cls: any) => (
              <TableRow key={`${child._id}-${cls._id}`}>
                <TableCell className="font-medium">{child.name}</TableCell>
                <TableCell>{cls.name}</TableCell>
                <TableCell>{cls.teacherId?.name}</TableCell>
                <TableCell>{cls.attendance.present}</TableCell>
                <TableCell>{cls.attendance.late}</TableCell>
                <TableCell>{cls.attendance.absent}</TableCell>
                <TableCell>{cls.attendance.rate}%</TableCell>
                <TableCell>
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/dashboard/parent/attendance/${child._id}/${cls._id}`}>
                      View Details
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}