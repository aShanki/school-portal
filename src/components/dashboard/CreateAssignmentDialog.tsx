'use client'

import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from '@/hooks/use-toast'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'

const formSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  category: z.enum(['Homework', 'Seatwork', 'Unit Test', 'Term Test', 'Research Work']),
  totalPoints: z.number().min(0, 'Points must be positive'),
  description: z.string().optional()
})

const ASSIGNMENT_CATEGORIES = [
  'Homework',
  'Seatwork',
  'Unit Test',
  'Term Test',
  'Research Work'
] as const

export function CreateAssignmentDialog({ 
  classId, 
  open, 
  onOpenChange 
}: { 
  classId: string
  open: boolean
  onOpenChange: (open: boolean) => void 
}) {
  const queryClient = useQueryClient()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      category: 'Homework',
      totalPoints: 100,
      description: ''
    }
  })

  const createMutation = useMutation({
    mutationFn: async (data: z.infer<typeof formSchema>) => {
      const res = await fetch('/api/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, classId })
      })
      if (!res.ok) throw new Error('Failed to create assignment')
      return res.json()
    },
    onSuccess: () => {
      // Invalidate both queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ['assignments'] })
      queryClient.invalidateQueries({ queryKey: ['class', classId] })
      
      toast({
        title: 'Success',
        description: 'Assignment created successfully'
      })
      form.reset()
      onOpenChange(false)
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      })
    }
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Assignment</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <label htmlFor="name">Assignment Name</label>
            <Input
              id="name"
              {...form.register('name')}
            />
            {form.formState.errors.name && <p>{form.formState.errors.name.message}</p>}
          </div>
          <div className="grid gap-2">
            <label>Category</label>
            <Select
              value={form.watch('category')}
              onValueChange={(value) => form.setValue('category', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {ASSIGNMENT_CATEGORIES.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.category && <p>{form.formState.errors.category.message}</p>}
          </div>
          <div className="grid gap-2">
            <label>Total Points</label>
            <Input
              type="number"
              {...form.register('totalPoints', { valueAsNumber: true })}
            />
            {form.formState.errors.totalPoints && <p>{form.formState.errors.totalPoints.message}</p>}
          </div>
          <div className="grid gap-2">
            <label>Description</label>
            <Textarea
              {...form.register('description')}
            />
            {form.formState.errors.description && <p>{form.formState.errors.description.message}</p>}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={form.handleSubmit((data) => createMutation.mutate(data))}>Create</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
