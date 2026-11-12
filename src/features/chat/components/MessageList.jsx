
import MessageBubble from './MessageBubble'

export default function MessageList({
  conversation,
  bottomRef,
}) {
  if (conversation.messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-center">
        <div>
          <div className="text-5xl mb-3">💬</div>
          <h3 className="font-semibold text-slate-700">
            Start your conversation
          </h3>
          <p className="text-sm text-slate-400 mt-1">
            Send a message to get started!
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
      {conversation.messages.map(message => (
        <MessageBubble
          key={message.id}
          message={message}
          isGroup={conversation.type === 'group'}
        />
      ))}

      <div ref={bottomRef} />
    </div>
  )
}
