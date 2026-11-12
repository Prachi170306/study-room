
export default function TaskHeader({ onAddTask }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <div className="flex items-center gap-2 text-sm text-indigo-600 font-medium mb-2">
          <span>StudySphere</span>
          <span className="text-slate-300">/</span>
          <span>Tasks</span>
        </div>

        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
          My Tasks
        </h1>

        <p className="text-slate-500 mt-2">
          Organize your work, manage deadlines and stay productive.
        </p>
      </div>

      <button
        onClick={onAddTask}
        className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 rounded-xl font-semibold shadow-lg shadow-indigo-200 transition"
      >
        <span className="text-xl">+</span>
        Add New Task
      </button>
    </div>
  )
}
