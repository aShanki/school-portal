interface StatsCardProps {
  title: string
  value: string | number
  icon: string
}

export default function StatsCard({ title, value, icon }: StatsCardProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <div className="flex items-center justify-between">
        <div>
          <p data-testid="stats-title" className="text-sm text-gray-500">{title}</p>
          <p data-testid="stats-value" className="text-2xl font-semibold mt-1">{value}</p>
        </div>
        <span data-testid="stats-icon" className="text-2xl">{icon}</span>
      </div>
    </div>
  )
}