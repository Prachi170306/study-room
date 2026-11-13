
import { useMemo, useState } from 'react'
import { getDemoNotifications } from '../services/notificationService'

export default function useNotifications() {
  const [notifications, setNotifications] = useState(
    () => getDemoNotifications()
  )

  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')

  const stats = useMemo(() => ({
    total: notifications.length,
    unread: notifications.filter(item => !item.read).length,
    messages: notifications.filter(item => item.type === 'message').length,
    tasks: notifications.filter(item => item.type === 'task').length,
  }), [notifications])

  const filteredNotifications = useMemo(() => {
    return notifications.filter(item => {
      const searchText = search.toLowerCase()

      const matchesSearch =
        item.title.toLowerCase().includes(searchText) ||
        item.message.toLowerCase().includes(searchText)

      const matchesFilter =
        filter === 'all' ||
        (filter === 'unread' && !item.read) ||
        (filter === 'read' && item.read) ||
        item.type === filter

      return matchesSearch && matchesFilter
    })
  }, [notifications, search, filter])

  function markAsRead(id) {
    setNotifications(previous =>
      previous.map(item =>
        item.id === id ? { ...item, read: true } : item
      )
    )
  }

  function markAsUnread(id) {
    setNotifications(previous =>
      previous.map(item =>
        item.id === id ? { ...item, read: false } : item
      )
    )
  }

  function markAllAsRead() {
    setNotifications(previous =>
      previous.map(item => ({ ...item, read: true }))
    )
  }

  function deleteNotification(id) {
    setNotifications(previous =>
      previous.filter(item => item.id !== id)
    )
  }

  function clearAllNotifications() {
    setNotifications([])
  }

  return {
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
  }
}
