
import { useState } from 'react'

export default function NewChatModal({
  isOpen,
  onClose,
  onCreate,
  students = [],
}) {
  const [selectedStudentId, setSelectedStudentId] = useState('')

  if (!isOpen) return null

  function handleCreate() {
    const selectedStudent = students.find(
      student => student.id === selectedStudentId
    )

    if (!selectedStudent) return

    onCreate(selectedStudent)
    setSelectedStudentId('')
    onClose()
  }

  function handleClose() {
    setSelectedStudentId('')
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">

        <h2 className="mb-4 text-xl font-bold text-slate-800">
          Start a New Chat
        </h2>

        <label className="mb-2 block text-sm font-medium text-slate-700">
          Select a student
        </label>

        <select
          value={selectedStudentId}
          onChange={event => setSelectedStudentId(event.target.value)}
          className="w-full rounded-xl border border-slate-300 bg-white text-slate-900 p-3 outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="" className="bg-white text-slate-900">
            Select a student
          </option>

          {students.map(student => (
            <option
              key={student.id}
              value={student.id}
              className="bg-white text-slate-900"
            >
              {student.name}
            </option>
          ))}
        </select>

        {students.length === 0 && (
          <p className="mt-3 text-sm text-slate-500">
            No other registered students found.
          </p>
        )}

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={handleClose}
            className="rounded-xl border border-slate-300 px-4 py-2 text-slate-700 hover:bg-slate-100"
          >
            Cancel
          </button>

          <button
            onClick={handleCreate}
            disabled={!selectedStudentId}
            className="rounded-xl bg-indigo-600 px-4 py-2 font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Start Chat
          </button>
        </div>

      </div>
    </div>
  )
}
