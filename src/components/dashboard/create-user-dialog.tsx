'use client'

import { useState, useEffect } from 'react'
import { useQueryClient, useMutation, useQuery } from '@tanstack/react-query'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Checkbox } from '@/components/ui/checkbox'

interface User {
  _id: string
  name: string
  email: string
  role: 'ADMIN' | 'TEACHER' | 'STUDENT' | 'PARENT'
}

const formSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Must be a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['ADMIN', 'TEACHER', 'STUDENT', 'PARENT'], {
    required_error: 'Please select a role',
  }),
  parentIds: z.array(z.string()).optional(),
})

export function CreateUserDialog({ 
  open, 
  onOpenChange,
  user,
  onClose
}: { 
  open: boolean
  onOpenChange: (open: boolean) => void
  user?: User | null
  onClose?: () => void
}) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const queryClient = useQueryClient()
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      role: 'TEACHER',
      parentIds: [],
    },
  })

  useEffect(() => {
    if (user) {
      form.reset({
        name: user.name,
        email: user.email,
        password: '',
        role: user.role,
      })
    }
  }, [user, form])

  const { data: parents } = useQuery({
    queryKey: ['parents'],
    queryFn: async () => {
      const res = await fetch('/api/dashboard/admin/users?role=PARENT')
      if (!res.ok) throw new Error('Failed to fetch parents')
      return res.json()
    },
    enabled: form.watch('role') === 'STUDENT'
  })

  const mutation = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      const url = user ? `/api/dashboard/admin/users/${user._id}` : '/api/dashboard/admin/users'
      const method = user ? 'PATCH' : 'POST'
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })
      if (!res.ok) throw new Error('Failed to save user')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      toast.success(user ? 'User updated successfully' : 'User created successfully')
      form.reset()
      onOpenChange(false)
      if (onClose) onClose()
    },
    onError: (error) => {
      toast.error(`Failed to ${user ? 'update' : 'create'} user: ${error.message}`)
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true)
    try {
      await mutation.mutateAsync(values)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{user ? 'Edit User' : 'Create New User'}</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter name..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="Enter email..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="Enter password..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <Select 
                    onValueChange={(value) => {
                      field.onChange(value)
                      if (value !== 'STUDENT') {
                        form.setValue('parentIds', [])
                      }
                    }} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="ADMIN">Admin</SelectItem>
                      <SelectItem value="TEACHER">Teacher</SelectItem>
                      <SelectItem value="STUDENT">Student</SelectItem>
                      <SelectItem value="PARENT">Parent</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {form.watch('role') === 'STUDENT' && (
              <FormField
                control={form.control}
                name="parentIds"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Parents</FormLabel>
                    <div className="space-y-2 border rounded-md p-4 max-h-[200px] overflow-y-auto">
                      {parents?.map((parent: User) => (
                        <div key={parent._id} className="flex items-center space-x-2">
                          <Checkbox
                            checked={field.value?.includes(parent._id)}
                            onCheckedChange={(checked) => {
                              const currentValues = field.value || []
                              const newValues = checked
                                ? [...currentValues, parent._id]
                                : currentValues.filter((id) => id !== parent._id)
                              field.onChange(newValues)
                            }}
                          />
                          <label className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            {parent.name}
                          </label>
                        </div>
                      ))}
                      {!parents?.length && (
                        <p className="text-sm text-muted-foreground">No parents available</p>
                      )}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : user ? 'Save Changes' : 'Create User'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}