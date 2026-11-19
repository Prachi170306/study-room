
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  query,
  where,
  setDoc,
  serverTimestamp,
  writeBatch,
} from 'firebase/firestore'

import { db } from '../../../firebase'
import { formatMessageTime } from '../utils/chatHelpers'

// Get the latest display name from the public chat profile
async function getCurrentDisplayName(currentUser) {
  const profileRef = doc(db, 'chatProfiles', currentUser.uid)
  const profileSnap = await getDoc(profileRef)

  return profileSnap.exists()
    ? profileSnap.data().displayName || currentUser.displayName || 'Student'
    : currentUser.displayName || 'Student'
}

// Convert Firestore timestamps into JavaScript dates
function convertTimestamp(timestamp) {
  if (!timestamp) return new Date(0)
  return timestamp.toDate
    ? timestamp.toDate()
    : new Date(timestamp)
}

// Convert timestamps to milliseconds for sorting
function timestampMillis(timestamp) {
  if (!timestamp) return 0
  return timestamp.toMillis
    ? timestamp.toMillis()
    : new Date(timestamp).getTime()
}

// Convert Firestore messages into the format expected by the UI
function mapMessage(id, data, currentUserId) {
  return {
    id,
    sender: data.senderId === currentUserId
      ? 'You'
      : data.senderName || 'Student',
    text: data.text || '',
    time: formatMessageTime(convertTimestamp(data.createdAt)),
    mine: data.senderId === currentUserId,
  }
}

// Fetch registered students' public chat profiles
export function subscribeToStudents(currentUserId, callback, onError) {
  const studentsRef = collection(db, 'chatProfiles')

  return onSnapshot(
    studentsRef,
    snapshot => {
      const students = snapshot.docs
        .filter(student => student.id !== currentUserId)
        .map(student => ({
          id: student.id,
          name: student.data().displayName || 'Student',
        }))

      callback(students)
    },
    onError
  )
}

// Listen to conversations belonging to the logged-in user
export function subscribeToConversations(
  currentUserId,
  callback,
  onError
) {
  const chatsRef = collection(db, 'chats')

  const chatsQuery = query(
    chatsRef,
    where('members', 'array-contains', currentUserId)
  )

  return onSnapshot(
    chatsQuery,
    snapshot => {
      const sortedDocs = [...snapshot.docs].sort(
        (a, b) =>
          timestampMillis(b.data().updatedAt) -
          timestampMillis(a.data().updatedAt)
      )

      const conversations = sortedDocs.map(chatDoc => {
        const data = chatDoc.data()
        const members = data.members || []
        const memberInfo = data.memberInfo || {}

        const otherMemberId = members.find(
          memberId => memberId !== currentUserId
        )

        const lastMessage = data.lastMessage
          ? mapMessage('last-message', data.lastMessage, currentUserId)
          : null

        return {
          id: chatDoc.id,
          name: data.type === 'group'
            ? data.name
            : memberInfo[otherMemberId]?.displayName || 'Student',
          type: data.type,
          members: members.map(
            memberId =>
              memberInfo[memberId]?.displayName || 'Student'
          ),
          unread: 0,
          messages: lastMessage ? [lastMessage] : [],
        }
      })

      callback(conversations)
    },
    onError
  )
}

// Listen to messages in a selected conversation
export function subscribeToMessages(
  chatId,
  currentUserId,
  callback,
  onError
) {
  const messagesRef = collection(db, 'chats', chatId, 'messages')

  return onSnapshot(
    messagesRef,
    snapshot => {
      const sortedDocs = [...snapshot.docs].sort(
        (a, b) =>
          timestampMillis(a.data().createdAt) -
          timestampMillis(b.data().createdAt)
      )

      const messages = sortedDocs.map(messageDoc =>
        mapMessage(
          messageDoc.id,
          messageDoc.data(),
          currentUserId
        )
      )

      callback(messages)
    },
    onError
  )
}

// Create or open an existing personal conversation
export async function createOrGetDirectChat(currentUser, student) {
  const members = [
    currentUser.uid,
    student.id,
  ].sort()

  const chatId = `direct_${members.join('_')}`
  const chatRef = doc(db, 'chats', chatId)

  const existingChat = await getDoc(chatRef)

  if (!existingChat.exists()) {
    const currentDisplayName = await getCurrentDisplayName(currentUser)

    await setDoc(chatRef, {
      name: '',
      type: 'personal',
      members,
      memberInfo: {
        [currentUser.uid]: {
          displayName: currentDisplayName,
        },
        [student.id]: {
          displayName: student.name,
        },
      },
      createdBy: currentUser.uid,
      lastMessage: null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
  }

  return chatId
}

// Create a new group conversation
export async function createGroupChat(
  currentUser,
  groupName,
  selectedStudents
) {
  const currentDisplayName = await getCurrentDisplayName(currentUser)

  const members = [
    {
      id: currentUser.uid,
      name: currentDisplayName,
    },
    ...selectedStudents,
  ]

  const memberIds = [...new Set(members.map(member => member.id))]

  const memberInfo = {}

  members.forEach(member => {
    memberInfo[member.id] = {
      displayName: member.name,
    }
  })

  const chatRef = doc(collection(db, 'chats'))

  await setDoc(chatRef, {
    name: groupName.trim(),
    type: 'group',
    members: memberIds,
    memberInfo,
    createdBy: currentUser.uid,
    lastMessage: null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })

  return chatRef.id
}

// Send and persist a message
export async function sendChatMessage(chatId, currentUser, text) {
  const cleanText = text.trim()

  if (!cleanText) return

  const currentDisplayName = await getCurrentDisplayName(currentUser)

  const batch = writeBatch(db)

  const messageRef = doc(
    collection(db, 'chats', chatId, 'messages')
  )

  const chatRef = doc(db, 'chats', chatId)

  const messageData = {
    senderId: currentUser.uid,
    senderName: currentDisplayName,
    text: cleanText,
    createdAt: serverTimestamp(),
    readBy: [currentUser.uid],
  }

  batch.set(messageRef, messageData)

  batch.update(chatRef, {
    lastMessage: {
      senderId: currentUser.uid,
      senderName: currentDisplayName,
      text: cleanText,
      createdAt: serverTimestamp(),
    },
    updatedAt: serverTimestamp(),
  })

  await batch.commit()
}
