
export default function NotificationHeader({
  unreadCount,
  onMarkAllRead,
  onClearAll,
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <div className="flex items-center gap-2 text-sm text-indigo-600 font-medium mb-2">
          <span>StudySphere</span>
          <span className="text-slate-300">/</span>
          <span>Notifications</span>
        </div>

        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
          Notifications
        </h1>

        <p className="text-slate-500 mt-2">
          Stay updated with your study activities and conversations.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={onMarkAllRead}
          disabled={unreadCount === 0}
          className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-40"
        >
          ✓ Mark all read
        </button>

        <button
          onClick={onClearAll}
          className="px-4 py-2.5 rounded-xl border border-red-100 text-sm font-semibold text-red-600 hover:bg-red-50"
        >
          Clear all
        </button>
      </div>
    </div>
  )
}
