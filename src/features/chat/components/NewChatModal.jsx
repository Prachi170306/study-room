
import { useState } from 'react'

export default function NewChatModal({ onClose, onCreate }) {
  const [studentName, setStudentName] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    if (!studentName.trim()) return

    onCreate(studentName.trim())
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl"
      >
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-xl font-bold text-slate-800">
            Start a New Chat
          </h2>
          <button type="button" onClick={onClose}>✕</button>
        </div>

        <label className="text-sm font-semibold text-slate-700">
          Student name
        </label>

        <input
          autoFocus
          value={studentName}
          onChange={e => setStudentName(e.target.value)}
          placeholder="Enter student name"
          className="w-full mt-2 mb-5 bg-slate-100 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-300"
          required
        />

        <p className="text-xs text-slate-400 mb-5">
          Demo mode: enter a student name to open a conversation.
        </p>

        <button
          type="submit"
          disabled={!studentName.trim()}
          className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold disabled:opacity-40"
        >
          Start Chat
        </button>
      </form>
    </div>
  )
}
