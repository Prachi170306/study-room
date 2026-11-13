
const statItems = [
  {
    key: 'total',
    label: 'Total Notifications',
    icon: '▤',
    color: 'indigo',
  },
  {
    key: 'unread',
    label: 'Unread',
    icon: '●',
    color: 'rose',
  },
  {
    key: 'messages',
    label: 'Messages',
    icon: '✉',
    color: 'blue',
  },
  {
    key: 'tasks',
    label: 'Task Updates',
    icon: '✓',
    color: 'emerald',
  },
]

const colors = {
  indigo: 'bg-indigo-50 text-indigo-600',
  rose: 'bg-rose-50 text-rose-600',
  blue: 'bg-blue-50 text-blue-600',
  emerald: 'bg-emerald-50 text-emerald-600',
}

export default function NotificationStats({ stats }) {
  return (
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
      {statItems.map(item => (
        <div
          key={item.key}
          className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition"
        >
          <div className="flex justify-between items-center">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl font-bold ${colors[item.color]}`}>
              {item.icon}
            </div>
            <span className="text-xs text-slate-400">Overview</span>
          </div>

          <p className="text-3xl font-bold text-slate-900 mt-4">
            {stats[item.key]}
          </p>

          <h3 className="text-sm font-semibold text-slate-700 mt-1">
            {item.label}
          </h3>
        </div>
      ))}
    </div>
  )
}
