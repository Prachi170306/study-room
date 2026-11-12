
import TaskCard from './TaskCard'

export default function TaskList({
  tasks,
  onEdit,
  onDelete,
  onStatusChange,
  onAddTask,
}) {
  if (tasks.length === 0) {
    return (
      <div className="bg-white border border-dashed border-slate-300 rounded-2xl p-12 text-center">
        <div className="text-5xl mb-4">📋</div>

        <h3 className="text-lg font-bold text-slate-800">
          No tasks found
        </h3>

        <p className="text-sm text-slate-500 mt-2">
          Try changing your filters or create a new task.
        </p>

        <button
          onClick={onAddTask}
          className="mt-5 bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-indigo-700"
        >
          + Create Task
        </button>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
      {tasks.map(task => (
        <TaskCard
          key={task.id}
          task={task}
          onEdit={onEdit}
          onDelete={onDelete}
          onStatusChange={onStatusChange}
        />
      ))}
    </div>
  )
}
