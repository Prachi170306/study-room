
const filters = [
  { value: 'all', label: 'All' },
  { value: 'unread', label: 'Unread' },
  { value: 'read', label: 'Read' },
  { value: 'message', label: 'Messages' },
  { value: 'task', label: 'Tasks' },
  { value: 'group', label: 'Groups' },
]

export default function NotificationFilters({
  search,
  setSearch,
  filter,
  setFilter,
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-4">
      <input
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="⌕  Search notifications..."
        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
      />

      <div className="flex gap-2 overflow-x-auto pb-1">
        {filters.map(item => (
          <button
            key={item.value}
            onClick={() => setFilter(item.value)}
            className={`shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition ${
              filter === item.value
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  )
}
