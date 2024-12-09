import { useQuery } from '@tanstack/react-query'

export default function RecentActivity() {
  const { data: assignments } = useQuery({
    queryKey: ['recentAssignments'],
    queryFn: async () => {
      const res = await fetch('/api/assignments')
      if (!res.ok) throw new Error('Failed to fetch assignments')
      return res.json()
    }
  })

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold mb-4">Recent Activities</h2>
      <div className="space-y-4">
        {assignments?.slice(0, 5).map((assignment: any) => (
          <div key={assignment._id} className="flex items-center justify-between">
            <div>
              <p className="font-medium">{assignment.name}</p>
              <p className="text-sm text-gray-500">
                {assignment.category}
              </p>
            </div>
            <span className={`px-2 py-1 rounded text-sm ${
              assignment.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
              assignment.status === 'SUBMITTED' ? 'bg-blue-100 text-blue-800' :
              'bg-green-100 text-green-800'
            }`}>
              {assignment.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}