
export default function TaskHeader({ onAddTask }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">

      <div>
        <div className="flex items-center gap-2 text-sm text-indigo-400 font-medium mb-3">
          <span>StudySphere</span>
          <span className="text-slate-600">/</span>
          <span>Tasks</span>
        </div>

        <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
          My Tasks
        </h1>

        <p className="text-slate-400 mt-2 text-sm md:text-base">
          Organize your work, manage deadlines and stay productive.
        </p>
      </div>

      <button
        onClick={onAddTask}
        className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 rounded-xl font-semibold shadow-lg shadow-indigo-950/40 transition"
      >
        <span className="text-xl">+</span>
        Add New Task
      </button>
    </div>
  )
}
