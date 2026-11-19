
import {
  getChatAvatar,
  getChatPreview,
  getLastMessage,
} from '../utils/chatHelpers'

export default function ChatListItem({
  conversation,
  active,
  onClick,
}) {
  const lastMessage = getLastMessage(conversation)

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-4 text-left border-b border-slate-200 transition ${
        active
          ? 'bg-indigo-100 border-l-4 border-l-indigo-600'
          : 'hover:bg-slate-200 border-l-4 border-l-transparent'
      }`}
    >
      <div
        className={`w-12 h-12 shrink-0 rounded-full flex items-center justify-center text-xl ${
          conversation.type === 'group'
            ? 'bg-purple-100 text-purple-700'
            : 'bg-indigo-100 text-indigo-700'
        }`}
      >
        {getChatAvatar(conversation.type)}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-semibold text-slate-900 truncate">
            {conversation.name}
          </h3>

          <span className="text-xs text-slate-500 shrink-0">
            {lastMessage?.time || ''}
          </span>
        </div>

        <div className="flex items-center justify-between gap-2 mt-1">
          <p className="text-sm text-slate-600 truncate">
            {getChatPreview(conversation)}
          </p>

          {conversation.unread > 0 && (
            <span className="bg-indigo-600 text-white text-xs rounded-full min-w-5 h-5 px-1 flex items-center justify-center">
              {conversation.unread}
            </span>
          )}
        </div>
      </div>
    </button>
  )
}
