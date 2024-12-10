'use client'

import { useState, useEffect } from 'react'
import { useQueryClient, useMutation, useQuery } from '@tanstack/react-query'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'

const formSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  teacherId: z.string().min(1, 'Please select a teacher'),
  subject: z.string().min(1, 'Subject is required'),
})

export function CreateClassDialog({ 
  open, 
  onOpenChange,
  classToEdit,
  onClose
}: { 
  open: boolean
  onOpenChange: (open: boolean) => void 
  classToEdit?: any
  onClose?: () => void
}) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const queryClient = useQueryClient()
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: classToEdit?.name || '',
      teacherId: classToEdit?.teacherId?._id || '',
      subject: classToEdit?.subject || '',
    }
  })

  useEffect(() => {
    if (classToEdit) {
      form.reset({
        name: classToEdit.name,
        teacherId: classToEdit.teacherId?._id,
        subject: classToEdit.subject,
      })
    }
  }, [classToEdit, form])

  const { data: teachers } = useQuery({
    queryKey: ['teachers'],
    queryFn: async () => {
      const res = await fetch('/api/dashboard/admin/teachers')
      if (!res.ok) throw new Error('Failed to fetch teachers')
      return res.json()
    },
  })

  const mutation = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      const url = classToEdit 
        ? `/api/dashboard/admin/classes/${classToEdit._id}`
        : '/api/dashboard/admin/classes'
      
      const method = classToEdit ? 'PUT' : 'POST'
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })
      if (!res.ok) throw new Error('Failed to save class')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes'] })
      toast.success(classToEdit ? 'Class updated successfully' : 'Class created successfully')
      form.reset()
      onOpenChange(false)
      if (onClose) onClose()
    },
    onError: (error) => {
      toast.error(`Failed to ${classToEdit ? 'update' : 'create'} class: ${error.message}`)
    }
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
          <DialogTitle>
            {classToEdit ? 'Edit Class' : 'Create New Class'}
          </DialogTitle>
          <DialogDescription>
            Add a new class to the system.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Class Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter class name..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="teacherId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Teacher</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a teacher" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {teachers?.map((teacher: any) => (
                        <SelectItem key={teacher._id} value={teacher._id}>
                          {teacher.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subject</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter subject..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (classToEdit ? 'Saving...' : 'Creating...') : (classToEdit ? 'Save Changes' : 'Create Class')}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}