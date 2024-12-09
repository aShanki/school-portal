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

export default function ParentChildrenPage() {
  const router = useRouter()
  const { data: session } = useSession({
    required: true,
    onUnauthenticated() {
      router.push('/auth/signin')
    }
  })

  const { data, isLoading } = useQuery({
    queryKey: ['parentChildren'],
    queryFn: async () => {
      const res = await fetch('/api/dashboard/parent')
      if (!res.ok) throw new Error('Failed to fetch children')
      return res.json()
    },
    enabled: !!session
  })

  if (isLoading) return <LoadingSpinner />

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">My Children</h1>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Average Grade</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data?.children?.map((child: any) => (
            <TableRow key={child._id}>
              <TableCell className="font-medium">{child.name}</TableCell>
              <TableCell>{child.email}</TableCell>
              <TableCell>
                {child.averageGrade !== undefined && child.averageGrade !== null
                  ? `${Number(child.averageGrade).toFixed(1)}%`
                  : 'N/A'}
              </TableCell>
              <TableCell>
                <button
                  onClick={() => router.push(`/dashboard/parent/children/${child._id}`)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  View Details →
                </button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}