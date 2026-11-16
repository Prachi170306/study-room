
import { useEffect, useState } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '../../../firebase'

import {
  subscribeToStudents,
  subscribeToConversations,
  subscribeToMessages,
  createOrGetDirectChat,
  createGroupChat,
  sendChatMessage,
} from '../services/chatService'

export default function useConversations() {
  const [currentUser, setCurrentUser] = useState(null)
  const [conversations, setConversations] = useState([])
  const [selectedId, setSelectedId] = useState(null)
  const [students, setStudents] = useState([])
  const [search, setSearch] = useState('')
  const [error, setError] = useState('')

  // Listen for authentication and Firestore data
  useEffect(() => {
    let unsubscribeConversations = null
    let unsubscribeStudents = null

    const unsubscribeAuth = onAuthStateChanged(auth, user => {
      unsubscribeConversations?.()
      unsubscribeStudents?.()

      unsubscribeConversations = null
      unsubscribeStudents = null

      setCurrentUser(user)
      setConversations([])
      setStudents([])
      setSelectedId(null)
      setError('')

      if (!user) return

      unsubscribeStudents = subscribeToStudents(
        user.uid,
        setStudents,
        err => {
          console.error('Error loading students:', err)
          setError(err.message)
        }
      )

      unsubscribeConversations = subscribeToConversations(
        user.uid,
        list => {
          setConversations(list)

          setSelectedId(previous =>
            previous && list.some(chat => chat.id === previous)
              ? previous
              : list[0]?.id || null
          )
        },
        err => {
          console.error('Error loading conversations:', err)
          setError(err.message)
        }
      )
    })

    return () => {
      unsubscribeAuth()
      unsubscribeConversations?.()
      unsubscribeStudents?.()
    }
  }, [])

  // Listen to messages in the selected conversation
  useEffect(() => {
    if (!selectedId || !currentUser) return

    const activeChatId = selectedId

    const unsubscribe = subscribeToMessages(
      activeChatId,
      currentUser.uid,
      messages => {
        setConversations(previous =>
          previous.map(chat =>
            chat.id === activeChatId
              ? { ...chat, messages }
              : chat
          )
        )
      },
      err => {
        console.error('Error loading messages:', err)
        setError(err.message)
      }
    )

    return () => unsubscribe()
  }, [selectedId, currentUser])

  const selectedConversation = conversations.find(
    chat => chat.id === selectedId
  ) || null

  const filteredConversations = conversations.filter(chat =>
    chat.name.toLowerCase().includes(search.toLowerCase())
  )

  function selectConversation(id) {
    setSelectedId(id)
  }

  async function sendMessage(text) {
    if (!text.trim() || !selectedId || !currentUser) return

    try {
      setError('')
      await sendChatMessage(selectedId, currentUser, text)
    } catch (err) {
      console.error('Error sending message:', err)
      setError(err.message)
    }
  }

  async function createPersonalChat(student) {
    if (!currentUser || !student?.id) return

    try {
      setError('')
      const chatId = await createOrGetDirectChat(
        currentUser,
        student
      )
      setSelectedId(chatId)
    } catch (err) {
      console.error('Error creating personal chat:', err)
      setError(err.message)
    }
  }

  async function createGroup(name, members) {
    if (!currentUser || !name.trim() || members.length < 2) return

    try {
      setError('')
      const chatId = await createGroupChat(
        currentUser,
        name,
        members
      )
      setSelectedId(chatId)
    } catch (err) {
      console.error('Error creating group:', err)
      setError(err.message)
    }
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
    currentUser,
    error,
  }
}
