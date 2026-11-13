
export default function GroupInfo({ conversation, onClose }) {
  if (!conversation) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-xl font-bold text-slate-800">
            {conversation.type === 'group' ? 'Group Information' : 'Contact Information'}
          </h2>

          <button onClick={onClose} className="text-slate-400 text-xl">
            ✕
          </button>
        </div>

        <div className="text-center mb-5">
          <div className="w-16 h-16 rounded-full bg-indigo-100 mx-auto flex items-center justify-center text-3xl">
            {conversation.type === 'group' ? '👥' : '👤'}
          </div>

          <h3 className="font-bold text-lg mt-3">
            {conversation.name}
          </h3>
          <p className="text-sm text-slate-400">
            {conversation.members.length} members
          </p>
        </div>

        <h4 className="font-semibold text-sm mb-3">Members</h4>

        <div className="space-y-3">
          {conversation.members.map(member => (
            <div key={member} className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-indigo-50 flex items-center justify-center">
                👤
              </div>
              <span className="text-sm text-slate-700">{member}</span>
            </div>
          ))}
        </div>

        <button
          onClick={onClose}
          className="w-full mt-6 bg-indigo-600 text-white py-3 rounded-xl font-semibold"
        >
          Close
        </button>
      </div>
    </div>
  )
}
