'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import LoadingSpinner from '@/components/LoadingSpinner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Search } from 'lucide-react'

type Student = {
  _id: string
  name: string
  email: string
}

type Teacher = {
  _id: string
  name: string
  email: string
}

type ClassData = {
  _id: string
  name: string
  subject: string
  teacherId: Teacher
  studentIds: Student[]
}

type ClassDetailsClientProps = {
  initialData: ClassData
  classId: string
}

export default function ClassDetailsClient({ initialData, classId }: ClassDetailsClientProps) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [searchQuery, setSearchQuery] = useState('')
  const [showAddDialog, setShowAddDialog] = useState(false)

  useSession({
    required: true,
    onUnauthenticated() {
      router.push('/auth/signin')
    }
  })

  const { data: classData, isLoading } = useQuery({
    queryKey: ['class', classId],
    queryFn: async () => {
      const res = await fetch(`/api/dashboard/admin/classes/${classId}`)
      if (!res.ok) throw new Error('Failed to fetch class')
      return res.json()
    },
    initialData
  })

  const { data: students } = useQuery({
    queryKey: ['available-students'],
    queryFn: async () => {
      const res = await fetch('/api/dashboard/admin/students?available=true')
      if (!res.ok) throw new Error('Failed to fetch students')
      return res.json()
    }
  })

  const addStudentMutation = useMutation({
    mutationFn: async (studentId: string) => {
      const res = await fetch(`/api/dashboard/admin/classes/${classId}/students`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId })
      })
      if (!res.ok) throw new Error('Failed to add student')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['class', classId] })
    }
  })

  const removeStudentMutation = useMutation({
    mutationFn: async (studentId: string) => {
      const res = await fetch(`/api/admin/classes/${classId}/students/${studentId}`, {
        method: 'DELETE'
      })
      if (!res.ok) throw new Error('Failed to remove student')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['class', classId] })
    }
  })

  const filteredStudents = students?.filter((student: Student) => 
    student.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (isLoading) return <LoadingSpinner />

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Class Details</h1>
        <Button variant="outline" onClick={() => router.back()}>
          Back
        </Button>
      </div>

      <div className="grid gap-4">
        <div>
          <h2 className="font-semibold">Name</h2>
          <p>{classData?.name}</p>
        </div>
        <div>
          <h2 className="font-semibold">Teacher</h2>
          <p>{classData?.teacherId?.name}</p>
        </div>
        <div>
          <h2 className="font-semibold">Subject</h2>
          <p>{classData?.subject}</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Students ({classData?.studentIds?.length || 0})</h2>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button>Add Student</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Student to Class</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Search className="w-4 h-4" />
                  <Input
                    placeholder="Search students..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <ScrollArea className="h-72">
                  <div className="space-y-2">
                    {filteredStudents?.map((student: Student) => (
                      <div key={student._id} className="flex items-center justify-between p-2 hover:bg-accent rounded-md">
                        <span>{student.name}</span>
                        <Button size="sm" onClick={() => {
                          addStudentMutation.mutate(student._id)
                          setShowAddDialog(false)
                        }}>Add</Button>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="border rounded-md">
          {classData?.studentIds?.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              No students assigned to this class
            </div>
          ) : (
            classData?.studentIds?.map((student: Student) => (
              <div key={student._id} className="flex items-center justify-between p-4 border-b last:border-b-0">
                <span>{student.name}</span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => removeStudentMutation.mutate(student._id)}
                >
                  Remove
                </Button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}