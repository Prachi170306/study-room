
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
    <aside className="w-full md:w-80 shrink-0 bg-white border-r border-slate-200 flex flex-col">

      <div className="p-5 border-b border-slate-100">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">
              Messages
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              Your study conversations
            </p>
          </div>
          <span className="text-2xl">💬</span>
        </div>

        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="🔍 Search conversations..."
          className="w-full mt-5 bg-slate-100 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-300"
        />

        <div className="flex gap-2 mt-3">
          <button
            onClick={onNewChat}
            className="flex-1 bg-indigo-600 text-white rounded-xl py-2.5 text-sm font-semibold hover:bg-indigo-700"
          >
            + New Chat
          </button>

          <button
            onClick={onNewGroup}
            className="flex-1 bg-indigo-50 text-indigo-700 rounded-xl py-2.5 text-sm font-semibold hover:bg-indigo-100"
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
