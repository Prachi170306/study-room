
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
  indigo: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/20',
  amber: 'bg-amber-500/15 text-amber-300 border-amber-500/20',
  blue: 'bg-blue-500/15 text-blue-300 border-blue-500/20',
  emerald: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/20',
}

export default function TaskStats({ stats }) {
  return (
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
      {statItems.map(item => (
        <div
          key={item.key}
          className="bg-[#1c1c2b] border border-white/10 rounded-2xl p-5 shadow-lg shadow-black/10 hover:border-indigo-500/30 hover:-translate-y-1 transition duration-200"
        >
          <div className="flex items-center justify-between">
            <div className={`w-11 h-11 rounded-xl border flex items-center justify-center text-xl font-bold ${styles[item.color]}`}>
              {item.icon}
            </div>

            <span className="text-xs text-slate-500">
              Overview
            </span>
          </div>

          <p className="text-3xl font-bold text-white mt-5">
            {stats[item.key]}
          </p>

          <h3 className="text-sm font-semibold text-slate-200 mt-1">
            {item.label}
          </h3>

          <p className="text-xs text-slate-500 mt-1">
            {item.description}
          </p>
        </div>
      ))}
    </div>
  )
}
