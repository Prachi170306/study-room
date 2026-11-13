
import { useState } from 'react'
import useMessages from '../hooks/useMessages'
import MessageList from './MessageList'
import MessageInput from './MessageInput'
import GroupInfo from './GroupInfo'

export default function ChatWindow({
  conversation,
  onSend,
  onBack,
}) {
  const [showInfo, setShowInfo] = useState(false)

  const {
    message,
    setMessage,
    handleSend,
    bottomRef,
  } = useMessages(conversation, onSend)

  if (!conversation) {
    return (
      <div className="flex-1 flex items-center justify-center text-center">
        <div>
          <div className="text-6xl mb-4">💬</div>
          <h2 className="text-xl font-bold text-slate-700">
            Welcome to StudySphere Chat
          </h2>
          <p className="text-sm text-slate-400 mt-2">
            Select a conversation to start messaging.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 min-w-0 flex flex-col bg-slate-50">

      <header className="bg-white px-4 md:px-6 py-4 border-b border-slate-200 flex items-center gap-3">
        <button
          onClick={onBack}
          className="md:hidden text-indigo-600 text-xl"
        >
          ←
        </button>

        <div className="w-11 h-11 rounded-full bg-indigo-100 flex items-center justify-center text-xl">
          {conversation.type === 'group' ? '👥' : '👤'}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-slate-800 truncate">
            {conversation.name}
          </h3>

          <p className="text-xs text-slate-400">
            {conversation.type === 'group'
              ? `${conversation.members.length} members`
              : 'Personal conversation'}
          </p>
        </div>

        <button
          onClick={() => setShowInfo(true)}
          className="text-slate-400 text-xl"
          title="Conversation information"
        >
          ⓘ
        </button>
      </header>

      <MessageList
        conversation={conversation}
        bottomRef={bottomRef}
      />

      <MessageInput
        message={message}
        setMessage={setMessage}
        onSubmit={handleSend}
      />

      {showInfo && (
        <GroupInfo
          conversation={conversation}
          onClose={() => setShowInfo(false)}
        />
      )}
    </div>
  )
}
