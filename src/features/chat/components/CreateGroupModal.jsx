
import { useState } from 'react'

export default function CreateGroupModal({
  isOpen,
  onClose,
  onCreate,
  students = [],
}) {
  const [groupName, setGroupName] = useState('')
  const [selectedMembers, setSelectedMembers] = useState([])

  if (!isOpen) return null

  function toggleMember(student) {
    setSelectedMembers(previous =>
      previous.includes(student.id)
        ? previous.filter(id => id !== student.id)
        : [...previous, student.id]
    )
  }

  function handleCreate() {
    const selectedStudents = students.filter(student =>
      selectedMembers.includes(student.id)
    )

    if (!groupName.trim() || selectedStudents.length < 2) return

    onCreate(groupName.trim(), selectedStudents)

    setGroupName('')
    setSelectedMembers([])
    onClose()
  }

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>Create Study Group</h2>

        <input
          type="text"
          placeholder="Enter group name"
          value={groupName}
          onChange={event => setGroupName(event.target.value)}
        />

        <h3>Select Students</h3>

        {students.length === 0 ? (
          <p>No other registered students found.</p>
        ) : (
          <div>
            {students.map(student => (
              <label key={student.id}>
                <input
                  type="checkbox"
                  checked={selectedMembers.includes(student.id)}
                  onChange={() => toggleMember(student)}
                />
                {student.name}
              </label>
            ))}
          </div>
        )}

        <p>Select at least 2 students.</p>

        <div className="modal-actions">
          <button onClick={onClose}>Cancel</button>

          <button
            onClick={handleCreate}
            disabled={
              !groupName.trim() || selectedMembers.length < 2
            }
          >
            Create Group
          </button>
        </div>
      </div>
    </div>
  )
}
