'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import LoadingSpinner from '@/components/LoadingSpinner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export default function ParentAttendancePage() {
  const router = useRouter()
  const { data: session } = useSession({
    required: true,
    onUnauthenticated() {
      router.push('/auth/signin')
    }
  })

  const { data, isLoading } = useQuery({
    queryKey: ['parentAttendance'],
    queryFn: async () => {
      const res = await fetch('/api/dashboard/parent/attendance')
      if (!res.ok) throw new Error('Failed to fetch attendance data')
      return res.json()
    },
    enabled: !!session
  })

  if (isLoading) return <LoadingSpinner />

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Children's Attendance</h1>

      <div className="grid gap-4">
        {data?.children?.map((child: any) => (
          <Card key={child._id}>
            <CardHeader>
              <CardTitle>{child.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Class</TableHead>
                    <TableHead>Present</TableHead>
                    <TableHead>Absent</TableHead>
                    <TableHead>Late</TableHead>
                    <TableHead>Attendance Rate</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {child.classes?.map((cls: any) => (
                    <TableRow key={cls._id}>
                      <TableCell>{cls.name}</TableCell>
                      <TableCell>{cls.attendance.present}</TableCell>
                      <TableCell>{cls.attendance.absent}</TableCell>
                      <TableCell>{cls.attendance.late}</TableCell>
                      <TableCell>{cls.attendance.rate}%</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}