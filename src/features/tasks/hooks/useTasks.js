
import { useMemo, useState } from 'react'
import { getDemoTasks } from '../services/taskService'

export default function useTasks() {
  const [tasks, setTasks] = useState(() => getDemoTasks())

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')

  const stats = useMemo(() => ({
    total: tasks.length,
    todo: tasks.filter(task => task.status === 'todo').length,
    inProgress: tasks.filter(task => task.status === 'in-progress').length,
    completed: tasks.filter(task => task.status === 'completed').length,
  }), [tasks])

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const searchText = search.toLowerCase()

      const matchesSearch =
        task.title.toLowerCase().includes(searchText) ||
        task.subject.toLowerCase().includes(searchText) ||
        task.description.toLowerCase().includes(searchText)

      const matchesStatus =
        statusFilter === 'all' || task.status === statusFilter

      const matchesPriority =
        priorityFilter === 'all' || task.priority === priorityFilter

      return matchesSearch && matchesStatus && matchesPriority
    })
  }, [tasks, search, statusFilter, priorityFilter])

  function addTask(taskData) {
    const newTask = {
      ...taskData,
      id: crypto.randomUUID(),
    }

    setTasks(previous => [newTask, ...previous])
  }

  function updateTask(id, updatedData) {
    setTasks(previous =>
      previous.map(task =>
        task.id === id ? { ...task, ...updatedData } : task
      )
    )
  }

  function deleteTask(id) {
    setTasks(previous => previous.filter(task => task.id !== id))
  }

  function updateTaskStatus(id, status) {
    updateTask(id, { status })
  }

  return {
    tasks,
    filteredTasks,
    stats,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    priorityFilter,
    setPriorityFilter,
    addTask,
    updateTask,
    deleteTask,
    updateTaskStatus,
  }
}
