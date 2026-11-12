
export default function MessageBubble({ message, isGroup }) {
  return (
    <div className={`flex ${
      message.mine ? 'justify-end' : 'justify-start'
    }`}>
      <div className={`max-w-[85%] md:max-w-[65%] px-4 py-3 rounded-2xl shadow-sm ${
        message.mine
          ? 'bg-indigo-600 text-white rounded-br-sm'
          : 'bg-white text-slate-800 rounded-bl-sm'
      }`}>
        {!message.mine && isGroup && (
          <p className="text-xs font-bold text-indigo-600 mb-1">
            {message.sender}
          </p>
        )}

        <p className="text-sm whitespace-pre-wrap wrap-break-word">
          {message.text}
        </p>

        <p className={`text-[10px] text-right mt-1 ${
          message.mine ? 'text-indigo-200' : 'text-slate-400'
        }`}>
          {message.time}
        </p>
      </div>
    </div>
  )
}
