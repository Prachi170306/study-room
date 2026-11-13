
const statItems = [
  {
    key: 'total',
    label: 'Total Tasks',
    icon: '▤',
    color: 'indigo',
    description: 'All your tasks',
  },
  {
    key: 'todo',
    label: 'To Do',
    icon: '◷',
    color: 'amber',
    description: 'Waiting to start',
  },
  {
    key: 'inProgress',
    label: 'In Progress',
    icon: '↗',
    color: 'blue',
    description: 'Currently working',
  },
  {
    key: 'completed',
    label: 'Completed',
    icon: '✓',
    color: 'emerald',
    description: 'Successfully done',
  },
]

const styles = {
  indigo: 'bg-indigo-50 text-indigo-600',
  amber: 'bg-amber-50 text-amber-600',
  blue: 'bg-blue-50 text-blue-600',
  emerald: 'bg-emerald-50 text-emerald-600',
}

export default function TaskStats({ stats }) {
  return (
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
      {statItems.map(item => (
        <div
          key={item.key}
          className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition"
        >
          <div className="flex items-center justify-between">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl font-bold ${styles[item.color]}`}>
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

          <p className="text-xs text-slate-400 mt-1">
            {item.description}
          </p>
        </div>
      ))}
    </div>
  )
}
