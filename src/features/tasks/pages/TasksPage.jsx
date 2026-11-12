
import { useState } from 'react'

import useTasks from '../hooks/useTasks'
import TaskHeader from '../components/TaskHeader'
import TaskStats from '../components/TaskStats'
import TaskFilters from '../components/TaskFilters'
import TaskList from '../components/TaskList'
import TaskModal from '../components/TaskModal'

export default function TasksPage() {
  const {
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
  } = useTasks()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState(null)

  function handleAddTask() {
    setEditingTask(null)
    setIsModalOpen(true)
  }

  function handleEditTask(task) {
    setEditingTask(task)
    setIsModalOpen(true)
  }

  function handleSaveTask(taskData) {
    if (editingTask) {
      updateTask(editingTask.id, taskData)
    } else {
      addTask(taskData)
    }
  }

  function handleDeleteTask(id) {
    const shouldDelete = window.confirm(
      'Are you sure you want to delete this task?'
    )

    if (shouldDelete) {
      deleteTask(id)
    }
  }

  return (
    <main className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-7">

      <TaskHeader onAddTask={handleAddTask} />

      <TaskStats stats={stats} />

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-800">
              Your Workspace
            </h2>

            <p className="text-sm text-slate-500 mt-1">
              Track and manage your study activities.
            </p>
          </div>

          <span className="text-sm text-slate-500">
            {filteredTasks.length} of {tasks.length} tasks
          </span>
        </div>

        <TaskFilters
          search={search}
          setSearch={setSearch}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          priorityFilter={priorityFilter}
          setPriorityFilter={setPriorityFilter}
        />

        <TaskList
          tasks={filteredTasks}
          onEdit={handleEditTask}
          onDelete={handleDeleteTask}
          onStatusChange={updateTaskStatus}
          onAddTask={handleAddTask}
        />
      </section>

      {isModalOpen && (
        <TaskModal
          task={editingTask}
          onClose={() => {
            setIsModalOpen(false)
            setEditingTask(null)
          }}
          onSave={handleSaveTask}
        />
      )}

    </main>
  )
}
