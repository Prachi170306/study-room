
import NotificationItem from './NotificationItem'

export default function NotificationList({
  notifications,
  onMarkRead,
  onMarkUnread,
  onDelete,
  onClearAll,
}) {
  if (notifications.length === 0) {
    return (
      <div className="bg-white border border-dashed border-slate-300 rounded-2xl p-12 text-center">
        <div className="text-5xl mb-4">🔔</div>

        <h3 className="text-lg font-bold text-slate-800">
          You're all caught up!
        </h3>

        <p className="text-sm text-slate-500 mt-2">
          No notifications found. New updates will appear here.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <h2 className="font-bold text-slate-800">
          Recent Activity
        </h2>

        <button
          onClick={onClearAll}
          className="text-xs font-semibold text-red-500 hover:text-red-700"
        >
          Clear visible notifications
        </button>
      </div>

      {notifications.map(notification => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onMarkRead={onMarkRead}
          onMarkUnread={onMarkUnread}
          onDelete={onDelete}
        />
      ))}
    </div>
  )
}
