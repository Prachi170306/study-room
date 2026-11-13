
const priorityStyles = {
  high: 'bg-red-50 text-red-600 border-red-100',
  medium: 'bg-amber-50 text-amber-700 border-amber-100',
  low: 'bg-emerald-50 text-emerald-700 border-emerald-100',
}

const statusStyles = {
  todo: 'bg-slate-100 text-slate-600',
  'in-progress': 'bg-blue-50 text-blue-700',
  completed: 'bg-emerald-50 text-emerald-700',
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
    <article className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-indigo-200 hover:shadow-md transition">
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
              : 'text-slate-800'
          }`}>
            {task.title}
          </h3>

          <p className="text-sm text-slate-500 mt-2 leading-relaxed">
            {task.description || 'No description added.'}
          </p>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => onEdit(task)}
            title="Edit task"
            className="w-9 h-9 rounded-lg hover:bg-indigo-50 text-slate-400 hover:text-indigo-600"
          >
            ✎
          </button>

          <button
            onClick={() => onDelete(task.id)}
            title="Delete task"
            className="w-9 h-9 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600"
          >
            ×
          </button>
        </div>
      </div>

      <div className="border-t border-slate-100 mt-5 pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <span className="text-indigo-600 font-semibold bg-indigo-50 px-3 py-1.5 rounded-lg">
            {task.subject || 'General'}
          </span>

          <span className={isOverdue ? 'text-red-600 font-semibold' : 'text-slate-500'}>
            {isOverdue ? '⚠ Overdue · ' : '◷ '}
            {formatDate(task.dueDate)}
          </span>
        </div>

        <select
          aria-label={`Change status for ${task.title}`}
          value={task.status}
          onChange={e => onStatusChange(task.id, e.target.value)}
          className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 outline-none focus:border-indigo-400"
        >
          <option value="todo">To Do</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
      </div>
    </article>
  )
}
