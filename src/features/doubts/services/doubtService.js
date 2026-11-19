import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  updateDoc,
  runTransaction,
} from 'firebase/firestore'

import { auth, db } from '../../../firebase'

const doubtsCollection = collection(db, 'doubts')

export const subscribeToDoubts = (onData, onError) => {
  const q = query(doubtsCollection, orderBy('createdAt', 'desc'))

  return onSnapshot(
    q,
    (snapshot) => {
      onData(snapshot.docs.map((item) => ({
        id: item.id,
        ...item.data(),
      })))
    },
    onError
  )
}

export const addDoubt = async (question) => {
  const user = auth.currentUser
  if (!user) throw new Error('Please sign in first.')

  const newQuestion = {
    title: question.title,
    description: question.description,
    ownerId: user.uid,
    author: user.displayName || user.email?.split('@')[0] || 'Student',
    createdAt: serverTimestamp(),
    answers: [],
    acceptedAnswerId: null,
  }

  return addDoc(doubtsCollection, newQuestion)
}

export const deleteDoubt = async (questionId) => {
  const user = auth.currentUser
  if (!user) throw new Error('Please sign in first.')

  const questionRef = doc(db, 'doubts', questionId)

  await runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(questionRef)

    if (!snapshot.exists()) throw new Error('Question not found.')

    if (snapshot.data().ownerId !== user.uid) {
      throw new Error('You can only delete your own questions.')
    }

    transaction.delete(questionRef)
  })
}

export const addAnswer = async (questionId, answer) => {
  const user = auth.currentUser
  if (!user) throw new Error('Please sign in first.')

  const questionRef = doc(db, 'doubts', questionId)

  await runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(questionRef)
    if (!snapshot.exists()) throw new Error('Question not found.')

    const answers = snapshot.data().answers || []

    transaction.update(questionRef, {
      answers: [...answers, {
        ...answer,
        authorId: user.uid,
        author: user.displayName || user.email?.split('@')[0] || 'Student',
      }],
    })
  })
}

export const deleteAnswer = async (questionId, answerId) => {
  const user = auth.currentUser
  if (!user) throw new Error('Please sign in first.')

  const questionRef = doc(db, 'doubts', questionId)

  await runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(questionRef)
    if (!snapshot.exists()) throw new Error('Question not found.')

    const data = snapshot.data()
    const answer = (data.answers || []).find((item) => item.id === answerId)

    if (!answer) throw new Error('Answer not found.')

    if (data.ownerId !== user.uid) {
      throw new Error('Only the question owner can delete answers.')
    }

    transaction.update(questionRef, {
      answers: data.answers.filter((item) => item.id !== answerId),
      acceptedAnswerId:
        data.acceptedAnswerId === answerId ? null : data.acceptedAnswerId,
    })
  })
}

export const toggleAcceptedAnswer = async (questionId, answerId) => {
  const user = auth.currentUser
  if (!user) throw new Error('Please sign in first.')

  const questionRef = doc(db, 'doubts', questionId)

  await runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(questionRef)
    if (!snapshot.exists()) throw new Error('Question not found.')

    const data = snapshot.data()

    if (data.ownerId !== user.uid) {
      throw new Error('Only the question owner can accept an answer.')
    }

    const exists = (data.answers || []).some((item) => item.id === answerId)
    if (!exists) throw new Error('Answer not found.')

    transaction.update(questionRef, {
      acceptedAnswerId:
        data.acceptedAnswerId === answerId ? null : answerId,
    })
  })
}
