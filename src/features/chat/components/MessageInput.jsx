
export default function MessageInput({ message, setMessage, onSubmit }) {
  return (
    <form
      onSubmit={onSubmit}
      className="bg-[#1c1c2b] p-3 md:p-4 border-t border-white/10 flex items-center gap-2"
    >
      <input
        value={message}
        onChange={e => setMessage(e.target.value)}
        placeholder="Type your message..."
        className="flex-1 min-w-0 bg-[#11111b] border border-white/10 text-white placeholder-slate-500 rounded-full px-5 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
      />

      <button
        type="submit"
        disabled={!message.trim()}
        className="bg-indigo-600 text-white px-5 py-3 rounded-full font-semibold text-sm hover:bg-indigo-700 transition disabled:opacity-40"
      >
        Send ➤
      </button>
    </form>
  )
}
