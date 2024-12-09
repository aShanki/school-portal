'use client'

import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'

export default function AssignmentForm() {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('Homework')
  const [totalPoints, setTotalPoints] = useState(100)
  const queryClient = useQueryClient()

  const { mutate, isLoading } = useMutation({
    mutationFn: async (data: { name: string; description: string; category: string; totalPoints: number }) => {
      const res = await fetch('/api/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Failed to create assignment')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacherStats'] })
      setName('')
      setDescription('')
      setCategory('Homework')
      setTotalPoints(100)
    },
  })

  return (
    <form 
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault()
        mutate({ name, description, category, totalPoints })
      }}
    >
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
          required
        />
      </div>
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
          rows={3}
          required
        />
      </div>
      <div>
        <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category</label>
        <select
          id="category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
          required
        >
          <option value="Homework">Homework</option>
          <option value="Quiz">Quiz</option>
          <option value="Test">Test</option>
          <option value="Project">Project</option>
        </select>
      </div>
      <div>
        <label htmlFor="totalPoints" className="block text-sm font-medium text-gray-700">Total Points</label>
        <input
          type="number"
          id="totalPoints"
          value={totalPoints}
          onChange={(e) => setTotalPoints(parseInt(e.target.value))}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
          required
        />
      </div>
      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
      >
        {isLoading ? 'Creating...' : 'Create Assignment'}
      </button>
    </form>
  )
}
