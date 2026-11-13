
const notificationStyles = {
  message: {
    icon: '💬',
    background: 'bg-blue-50',
    color: 'text-blue-600',
    label: 'Message',
  },
  task: {
    icon: '✓',
    background: 'bg-emerald-50',
    color: 'text-emerald-600',
    label: 'Task Update',
  },
  group: {
    icon: '👥',
    background: 'bg-purple-50',
    color: 'text-purple-600',
    label: 'Group Activity',
  },
}

export default function NotificationItem({
  notification,
  onMarkRead,
  onMarkUnread,
  onDelete,
}) {
  const style = notificationStyles[notification.type] || notificationStyles.message

  return (
    <article className={`group bg-white border rounded-2xl p-4 sm:p-5 transition hover:shadow-md ${
      notification.read
        ? 'border-slate-200'
        : 'border-indigo-200 bg-indigo-50/30'
    }`}>
      <div className="flex items-start gap-4">
        <div className={`w-12 h-12 shrink-0 rounded-xl flex items-center justify-center text-xl ${style.background}`}>
          {style.icon}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-bold text-slate-800">
              {notification.title}
            </h3>

            {!notification.read && (
              <span className="w-2 h-2 rounded-full bg-indigo-600" />
            )}
          </div>

          <p className="text-sm text-slate-500 mt-1 leading-relaxed">
            {notification.message}
          </p>

          <div className="flex flex-wrap items-center gap-3 mt-3">
            <span className="text-xs text-slate-400">
              {notification.time}
            </span>

            <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${style.background} ${style.color}`}>
              {style.label}
            </span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-1">
          <button
            onClick={() =>
              notification.read
                ? onMarkUnread(notification.id)
                : onMarkRead(notification.id)
            }
            title={notification.read ? 'Mark as unread' : 'Mark as read'}
            className="w-9 h-9 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition"
          >
            {notification.read ? '◉' : '✓'}
          </button>

          <button
            onClick={() => onDelete(notification.id)}
            title="Delete notification"
            className="w-9 h-9 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
          >
            ×
          </button>
        </div>
      </div>
    </article>
  )
}
