
import { useEffect, useState } from 'react'

const emptyTask = {
  title: '',
  description: '',
  subject: '',
  priority: 'medium',
  status: 'todo',
  dueDate: '',
}

export default function TaskModal({
  task,
  onClose,
  onSave,
}) {
  const [form, setForm] = useState(emptyTask)

  useEffect(() => {
    setForm(task ? { ...emptyTask, ...task } : emptyTask)
  }, [task])

  function handleChange(e) {
    const { name, value } = e.target

    setForm(previous => ({
      ...previous,
      [name]: value,
    }))
  }

  function handleSubmit(e) {
    e.preventDefault()

    if (!form.title.trim()) return

    onSave({
      ...form,
      title: form.title.trim(),
      description: form.description.trim(),
      subject: form.subject.trim(),
    })

    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-sm flex items-center justify-center p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl"
      >
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              {task ? 'Edit Task' : 'Create New Task'}
            </h2>

            <p className="text-sm text-slate-500 mt-1">
              Organize your next study goal.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-lg hover:bg-slate-100 text-slate-500 text-xl"
          >
            ×
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Task title *
            </label>

            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="e.g. Complete React assignment"
              required
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Description
            </label>

            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows="3"
              placeholder="Add some details about this task..."
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none resize-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Subject / Category
            </label>

            <input
              name="subject"
              value={form.subject}
              onChange={handleChange}
              placeholder="e.g. Data Structures"
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Priority
              </label>

              <select
                name="priority"
                value={form.priority}
                onChange={handleChange}
                className="w-full border border-slate-200 rounded-xl px-3 py-3 text-sm outline-none focus:border-indigo-400"
              >
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Status
              </label>

              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="w-full border border-slate-200 rounded-xl px-3 py-3 text-sm outline-none focus:border-indigo-400"
              >
                <option value="todo">To Do</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Due date
            </label>

            <input
              type="date"
              name="dueDate"
              value={form.dueDate}
              onChange={handleChange}
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-indigo-400"
            />
          </div>
        </div>

        <div className="p-6 border-t border-slate-100 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 border border-slate-200 rounded-xl py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl py-3 text-sm font-semibold shadow-lg shadow-indigo-100"
          >
            {task ? 'Save Changes' : 'Create Task'}
          </button>
        </div>
      </form>
    </div>
  )
}
