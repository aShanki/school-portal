'use client'

import { useQuery } from '@tanstack/react-query'
import LoadingSpinner from '@/components/LoadingSpinner'

export default function StudentList() {
  const { data: students, isLoading } = useQuery({
    queryKey: ['students'],
    queryFn: async () => {
      const res = await fetch('/api/students')
      if (!res.ok) throw new Error('Failed to fetch students')
      return res.json()
    }
  })

  if (isLoading) return <LoadingSpinner />

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="grid grid-cols-4 gap-4 p-4 font-medium border-b">
        <div>Name</div>
        <div>Grade</div>
        <div>Attendance</div>
        <div>Status</div>
      </div>
      <div className="divide-y">
        {students?.map((student: any) => (
          <div key={student._id} className="grid grid-cols-4 gap-4 p-4">
            <div>{student.name}</div>
            <div>{student.grade}</div>
            <div>{student.attendance}%</div>
            <div>
              <span className={`px-2 py-1 rounded-full text-sm ${
                student.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {student.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
