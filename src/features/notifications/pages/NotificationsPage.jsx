
import useNotifications from '../hooks/useNotifications'

import NotificationHeader from '../components/NotificationHeader'
import NotificationStats from '../components/NotificationStats'
import NotificationFilters from '../components/NotificationFilters'
import NotificationList from '../components/NotificationList'

export default function NotificationsPage() {
  const {
    notifications,
    filteredNotifications,
    stats,
    search,
    setSearch,
    filter,
    setFilter,
    markAsRead,
    markAsUnread,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
  } = useNotifications()

  function handleClearAll() {
    const confirmed = window.confirm(
      'Are you sure you want to clear all notifications?'
    )

    if (confirmed) {
      clearAllNotifications()
    }
  }

  return (
    <main className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-7">

      <NotificationHeader
        unreadCount={stats.unread}
        onMarkAllRead={markAllAsRead}
        onClearAll={handleClearAll}
      />

      <NotificationStats stats={stats} />

      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-slate-800">
            Your Activity
          </h2>

          <p className="text-sm text-slate-500 mt-1">
            Important updates from your StudySphere workspace.
          </p>
        </div>

        <NotificationFilters
          search={search}
          setSearch={setSearch}
          filter={filter}
          setFilter={setFilter}
        />

        <div className="flex items-center justify-between text-sm text-slate-500 px-1">
          <span>
            Showing {filteredNotifications.length} of {notifications.length} notifications
          </span>

          <span>
            {stats.unread} unread
          </span>
        </div>

        <NotificationList
          notifications={filteredNotifications}
          onMarkRead={markAsRead}
          onMarkUnread={markAsUnread}
          onDelete={deleteNotification}
          onClearAll={handleClearAll}
        />
      </section>

    </main>
  )
}
