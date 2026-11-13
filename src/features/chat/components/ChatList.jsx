
import ChatListItem from './ChatListItem'

export default function ChatList({
  conversations,
  selectedId,
  onSelect,
}) {
  return (
    <div className="flex-1 overflow-y-auto">
      <p className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">
        All conversations ({conversations.length})
      </p>

      {conversations.map(conversation => (
        <ChatListItem
          key={conversation.id}
          conversation={conversation}
          active={selectedId === conversation.id}
          onClick={() => onSelect(conversation.id)}
        />
      ))}

      {conversations.length === 0 && (
        <p className="text-center text-sm text-slate-400 p-8">
          No conversations found.
        </p>
      )}
    </div>
  )
}
