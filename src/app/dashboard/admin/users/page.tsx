'use client'

import { useState } from 'react'
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreHorizontal, Pencil, Trash } from 'lucide-react'
import { toast } from 'sonner'
import { CreateUserDialog } from '@/components/dashboard/create-user-dialog'

interface User {
  _id: string
  name: string
  email: string
  role: 'ADMIN' | 'TEACHER' | 'STUDENT' | 'PARENT'
}

export default function UsersPage() {
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [selectedMenu, setSelectedMenu] = useState<string | null>(null)
  const queryClient = useQueryClient()
  
  const { data: users } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const res = await fetch('/api/dashboard/admin/users')
      return res.json()
    }
  })

  const deleteUser = useMutation({
    mutationFn: async (userId: string) => {
      const res = await fetch(`/api/dashboard/admin/users/${userId}`, {
        method: 'DELETE',
      })
      if (!res.ok) throw new Error('Failed to delete user')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      toast.success('User deleted successfully')
    },
    onError: () => {
      toast.error('Failed to delete user')
    }
  })

  const handleEdit = (user: User) => {
    setSelectedUser(user)
    setShowCreateDialog(true)
  }

  const handleDelete = async (userId: string) => {
    if (confirm('Are you sure you want to delete this user?')) {
      deleteUser.mutate(userId)
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">User Management</h1>
        <Button onClick={() => setShowCreateDialog(true)}>Create User</Button>
      </div>
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users?.map((user: User) => (
            <TableRow key={user._id}>
              <TableCell>{user.name}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.role}</TableCell>
              <TableCell>
                <DropdownMenu open={!!selectedMenu} onOpenChange={setSelectedMenu}>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      data-testid={`user-menu-${user._id}`}
                      onClick={() => setSelectedMenu(user._id)}
                      aria-label={`Actions for ${user.name}`}
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  {selectedMenu === user._id && (
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEdit(user)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleDelete(user._id)}
                        className="text-red-600"
                        data-testid={`delete-user-${user._id}`}
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
      <CreateUserDialog 
        open={showCreateDialog} 
        onOpenChange={setShowCreateDialog}
        user={selectedUser}
        onClose={() => setSelectedUser(null)}
      />
    </div>
  )
}
