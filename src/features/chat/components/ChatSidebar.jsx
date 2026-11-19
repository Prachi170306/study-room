
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
    <aside className="w-full md:w-80 shrink-0 bg-[#1c1c2b] border-r border-white/10 flex flex-col">

      <div className="p-5 border-b border-white/10">

        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">
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
          className="w-full mt-5 bg-[#11111b] border border-white/10 text-white placeholder-slate-500 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
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
            className="flex-1 bg-indigo-500/15 text-indigo-300 border border-indigo-500/20 rounded-xl py-2.5 text-sm font-semibold hover:bg-indigo-500/25 transition"
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