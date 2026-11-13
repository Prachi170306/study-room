
import { useState } from 'react'

export default function CreateGroupModal({
  students,
  onClose,
  onCreate,
}) {
  const [groupName, setGroupName] = useState('')
  const [members, setMembers] = useState([])

  function toggleMember(student) {
    setMembers(previous =>
      previous.includes(student)
        ? previous.filter(member => member !== student)
        : [...previous, student]
    )
  }

  function handleSubmit(e) {
    e.preventDefault()

    if (!groupName.trim() || members.length < 2) return

    onCreate(groupName.trim(), members)
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
            Create a Study Group
          </h2>

          <button type="button" onClick={onClose}>✕</button>
        </div>

        <label className="text-sm font-semibold text-slate-700">
          Group name
        </label>

        <input
          value={groupName}
          onChange={e => setGroupName(e.target.value)}
          placeholder="e.g. Java Study Group"
          className="w-full mt-2 mb-5 bg-slate-100 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-300"
          required
        />

        <p className="text-sm font-semibold text-slate-700 mb-3">
          Select members (at least 2)
        </p>

        <div className="space-y-3 max-h-48 overflow-y-auto mb-5">
          {students.map(student => (
            <label
              key={student.id}
              className="flex items-center gap-3 text-sm text-slate-700"
            >
              <input
                type="checkbox"
                checked={members.includes(student.name)}
                onChange={() => toggleMember(student.name)}
                className="w-4 h-4 accent-indigo-600"
              />
              {student.name}
            </label>
          ))}
        </div>

        <button
          type="submit"
          disabled={!groupName.trim() || members.length < 2}
          className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold disabled:opacity-40"
        >
          Create Group
        </button>
      </form>
    </div>
  )
}
