
import { useState } from 'react'
import {
  getDemoConversations,
  getDemoStudents,
} from '../services/chatService'
import { formatMessageTime } from '../utils/chatHelpers'

export default function useConversations() {
  const [conversations, setConversations] = useState(
    () => getDemoConversations()
  )

  const [selectedId, setSelectedId] = useState('c1')
  const [search, setSearch] = useState('')

  const students = getDemoStudents()

  const selectedConversation = conversations.find(
    conversation => conversation.id === selectedId
  )

  const filteredConversations = conversations.filter(conversation =>
    conversation.name.toLowerCase().includes(search.toLowerCase())
  )

  function selectConversation(id) {
    setSelectedId(id)

    setConversations(previous =>
      previous.map(conversation =>
        conversation.id === id
          ? { ...conversation, unread: 0 }
          : conversation
      )
    )
  }

  function sendMessage(text) {
    if (!text.trim() || !selectedConversation) return

    const newMessage = {
      id: crypto.randomUUID(),
      sender: 'You',
      text: text.trim(),
      time: formatMessageTime(),
      mine: true,
    }

    setConversations(previous =>
      previous.map(conversation =>
        conversation.id === selectedId
          ? {
              ...conversation,
              messages: [...conversation.messages, newMessage],
            }
          : conversation
      )
    )
  }

  function createPersonalChat(name) {
    const cleanName = name.trim()
    if (!cleanName) return

    const existing = conversations.find(
      conversation =>
        conversation.type === 'personal' &&
        conversation.name.toLowerCase() === cleanName.toLowerCase()
    )

    if (existing) {
      selectConversation(existing.id)
      return
    }

    const newConversation = {
      id: crypto.randomUUID(),
      name: cleanName,
      type: 'personal',
      members: [cleanName],
      unread: 0,
      messages: [],
    }

    setConversations(previous => [newConversation, ...previous])
    setSelectedId(newConversation.id)
  }

  function createGroup(name, members) {
    const cleanName = name.trim()

    if (!cleanName || members.length < 2) return

    const newGroup = {
      id: crypto.randomUUID(),
      name: cleanName,
      type: 'group',
      members,
      unread: 0,
      messages: [],
    }

    setConversations(previous => [newGroup, ...previous])
    setSelectedId(newGroup.id)
  }

  return {
    conversations,
    filteredConversations,
    selectedConversation,
    selectedId,
    search,
    setSearch,
    students,
    selectConversation,
    sendMessage,
    createPersonalChat,
    createGroup,
  }
}
