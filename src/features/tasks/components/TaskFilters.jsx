
export default function TaskFilters({
  search,
  setSearch,
  statusFilter,
  setStatusFilter,
  priorityFilter,
  setPriorityFilter,
}) {
  return (
    <div className="bg-[#222235] border border-white/10 rounded-2xl p-4 shadow-lg">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">

        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
            ⌕
          </span>

          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search tasks or subjects..."
            className="w-full bg-[#171725] border border-white/10 text-white placeholder-slate-500 rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>

        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="bg-[#171725] border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-200 outline-none focus:border-indigo-400"
        >
          <option value="all">All Statuses</option>
          <option value="todo">To Do</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>

        <select
          value={priorityFilter}
          onChange={e => setPriorityFilter(e.target.value)}
          className="bg-[#171725] border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-200 outline-none focus:border-indigo-400"
        >
          <option value="all">All Priorities</option>
          <option value="high">High Priority</option>
          <option value="medium">Medium Priority</option>
          <option value="low">Low Priority</option>
        </select>

      </div>
    </div>
  )
}
