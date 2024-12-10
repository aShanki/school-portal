'use client'

interface Class {
  _id: string
  name: string
  subject: string
  teacherId?: { name: string }
  studentIds?: string[]
}

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { CreateClassDialog } from './create-class-dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { MoreHorizontal, Pencil, Trash } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { toast } from 'sonner'

export default function ClassesPage() {
  const router = useRouter()
  const { data: session } = useSession({
    required: true,
    onUnauthenticated() {
      router.push('/auth/signin')
    }
  })
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [selectedClass, setSelectedClass] = useState<Class | null>(null)
  const [selectedMenu, setSelectedMenu] = useState<string | null>(null)
  const queryClient = useQueryClient()

  const { data: classes, isLoading, error } = useQuery({
    queryKey: ['classes'],
    queryFn: async () => {
      const res = await fetch('/api/dashboard/admin/classes')
      if (!res.ok) throw new Error('Failed to fetch classes')
      return res.json()
    }
  })

  const deleteClassMutation = useMutation({
    mutationFn: async (classId: string) => {
      const res = await fetch(`/api/dashboard/admin/classes/${classId}`, {
        method: 'DELETE',
      })
      if (!res.ok) throw new Error('Failed to delete class')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes'] })
      toast.success('Class deleted successfully')
    },
    onError: () => {
      toast.error('Failed to delete class')
    }
  })

  const handleDelete = async (classId: string) => {
    if (confirm('Are you sure you want to delete this class? This action cannot be undone.')) {
      deleteClassMutation.mutate(classId)
    }
  }

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 text-red-500 p-4 rounded-md">
          Error loading classes: {error.message}
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Class Management</h1>
        <Button onClick={() => setShowCreateDialog(true)}>Create Class</Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Teacher</TableHead>
            <TableHead>Subject</TableHead>
            <TableHead>Students</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {classes?.map((cls: Class) => (
            <TableRow key={cls._id}>
              <TableCell>{cls.name}</TableCell>
              <TableCell>{cls.teacherId?.name}</TableCell>
              <TableCell>{cls.subject}</TableCell>
              <TableCell>{cls.studentIds?.length || 0}</TableCell>
              <TableCell>
                <DropdownMenu open={!!selectedMenu} onOpenChange={setSelectedMenu}>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      data-testid={`class-menu-${cls._id}`}
                      onClick={() => setSelectedMenu(cls._id)}
                      aria-label={`Actions for ${cls.name}`}
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  {selectedMenu === cls._id && (
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => {
                        setSelectedClass(cls)
                        setShowCreateDialog(true)
                      }}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        data-testid={`delete-class-${cls._id}`}
                        onClick={() => handleDelete(cls._id)}
                        className="text-red-600"
                      >
                        <Trash className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  )}
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <CreateClassDialog 
        open={showCreateDialog} 
        onOpenChange={setShowCreateDialog}
        classToEdit={selectedClass}
        onClose={() => setSelectedClass(null)}
      />
    </div>
  )
}
