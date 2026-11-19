
import ChatList from './ChatList'

export default function ChatSidebar({
  conversations,
  selectedId,
  onSelect,
  search,
  setSearch,
  onNewChat,
  onNewGroup,
}) {
  const filtered = conversations.filter(conversation =>
    conversation.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <aside className="w-full md:w-80 shrink-0 bg-slate-100 border-r border-slate-200 flex flex-col">

      <div className="p-5 border-b border-slate-200">

        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              Messages
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Your study conversations
            </p>
          </div>
          <span className="text-2xl">💬</span>
        </div>

        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="🔍 Search conversations..."
          className="w-full mt-5 bg-white border border-slate-300 text-slate-900 placeholder-slate-400 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
        />

        <div className="flex gap-2 mt-3">
          <button
            onClick={onNewChat}
            className="flex-1 bg-indigo-600 text-white rounded-xl py-2.5 text-sm font-semibold hover:bg-indigo-700 transition"
          >
            + New Chat
          </button>

          <button
            onClick={onNewGroup}
            className="flex-1 bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl py-2.5 text-sm font-semibold hover:bg-indigo-200 transition"
          >
            + Create Group
          </button>
        </div>
      </div>

      <ChatList
        conversations={filtered}
        selectedId={selectedId}
        onSelect={onSelect}
      />
    </aside>
  )
}
