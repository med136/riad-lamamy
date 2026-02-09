import { LucideIcon } from 'lucide-react'

interface StatCardProps {
  title: string
  value: string | number
  change: string
  icon: LucideIcon
  color: string
}

export default function StatCard({ title, value, change, icon: Icon, color }: StatCardProps) {
  return (
    <div className="bg-white p-6 rounded-xl shadow border hover-lift">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-2xl font-bold mt-2">{value}</p>
          <p className="text-sm text-green-600 mt-1">{change}</p>
        </div>
        <div className={`p-3 rounded-lg bg-${color}-100`}>
          <Icon className={`text-${color}-600`} size={24} />
        </div>
      </div>
    </div>
  )
}
