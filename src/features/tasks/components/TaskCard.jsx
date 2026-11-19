
const priorityStyles = {
  high: 'bg-red-500/15 text-red-300 border-red-500/20',
  medium: 'bg-amber-500/15 text-amber-300 border-amber-500/20',
  low: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/20',
}

const statusStyles = {
  todo: 'bg-slate-500/15 text-slate-300',
  'in-progress': 'bg-blue-500/15 text-blue-300',
  completed: 'bg-emerald-500/15 text-emerald-300',
}

const statusLabels = {
  todo: 'To Do',
  'in-progress': 'In Progress',
  completed: 'Completed',
}

function formatDate(date) {
  if (!date) return 'No deadline'

  return new Date(`${date}T00:00:00`).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export default function TaskCard({
  task,
  onEdit,
  onDelete,
  onStatusChange,
}) {
  const today = new Date().toLocaleDateString('en-CA')

  const isOverdue =
    task.dueDate &&
    task.dueDate < today &&
    task.status !== 'completed'

  return (
    <article className="bg-[#222235] border border-white/10 rounded-2xl p-5 hover:border-indigo-500/40 hover:shadow-lg hover:shadow-black/20 transition">

      <div className="flex items-start justify-between gap-3">

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-3">

            <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${priorityStyles[task.priority]}`}>
              {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority
            </span>

            <span className={`text-xs font-semibold px-3 py-1 rounded-full ${statusStyles[task.status]}`}>
              {statusLabels[task.status]}
            </span>

          </div>

          <h3 className={`text-base font-bold ${
            task.status === 'completed'
              ? 'text-slate-400 line-through'
              : 'text-white'
          }`}>
            {task.title}
          </h3>

          <p className="text-sm text-slate-300 mt-2 leading-relaxed">
            {task.description || 'No description added.'}
          </p>
        </div>

        <div className="flex items-center gap-1 shrink-0">

          <button
            onClick={() => onEdit(task)}
            title="Edit task"
            className="w-9 h-9 rounded-lg hover:bg-indigo-500/15 text-slate-400 hover:text-indigo-300 transition"
          >
            ✎
          </button>

          <button
            onClick={() => onDelete(task.id)}
            title="Delete task"
            className="w-9 h-9 rounded-lg hover:bg-red-500/15 text-slate-400 hover:text-red-300 transition"
          >
            ×
          </button>

        </div>
      </div>

      <div className="border-t border-white/10 mt-5 pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">

        <div className="flex flex-wrap items-center gap-3 text-xs">

          <span className="text-indigo-300 font-semibold bg-indigo-500/15 border border-indigo-500/20 px-3 py-1.5 rounded-lg">
            {task.subject || 'General'}
          </span>

          <span className={isOverdue ? 'text-red-400 font-semibold' : 'text-slate-400'}>
            {isOverdue ? '⚠ Overdue · ' : '◷ '}
            {formatDate(task.dueDate)}
          </span>

        </div>

        <select
          aria-label={`Change status for ${task.title}`}
          value={task.status}
          onChange={e => onStatusChange(task.id, e.target.value)}
          className="bg-[#171725] border border-white/10 rounded-lg px-3 py-2 text-xs font-medium text-slate-200 outline-none focus:border-indigo-400"
        >
          <option value="todo">To Do</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>

      </div>
    </article>
  )
}
