
export function formatMessageTime(date = new Date()) {
  return new Date(date).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function getLastMessage(chat) {
  return chat.messages?.[chat.messages.length - 1] || null
}

export function getChatAvatar(type) {
  return type === 'group' ? '👥' : '👤'
}

export function getChatPreview(chat) {
  const lastMessage = getLastMessage(chat)

  if (!lastMessage) return 'Start a conversation'

  return `${lastMessage.sender === 'You' ? 'You: ' : ''}${lastMessage.text}`
}
