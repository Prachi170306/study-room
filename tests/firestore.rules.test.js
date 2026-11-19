import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import {
  initializeTestEnvironment,
  assertSucceeds,
  assertFails,
} from '@firebase/rules-unit-testing'
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  Timestamp,
} from 'firebase/firestore'

test('Doubt Corner Firestore security rules', async (t) => {
  const env = await initializeTestEnvironment({
    projectId: 'demo-study-room-cc',
    firestore: {
      rules: readFileSync('backend/firestore.rules', 'utf8'),
    },
  })

  try {
    const owner = env.authenticatedContext('question-owner').firestore()
    const student = env.authenticatedContext('answer-student').firestore()
    const questionRef = doc(owner, 'doubts', 'test-question')
    const studentQuestionRef = doc(student, 'doubts', 'test-question')

    await t.test('Question owner can create a question', async () => {
      await assertSucceeds(setDoc(questionRef, {
        title: 'Test question',
        description: 'Testing Doubt Corner',
        ownerId: 'question-owner',
        author: 'Owner',
        createdAt: Timestamp.now(),
        answers: [],
        acceptedAnswerId: null,
      }))
    })

    await t.test('Other signed-in students can read questions', async () => {
      await assertSucceeds(getDoc(studentQuestionRef))
    })

    await t.test('Another student can post their own answer', async () => {
      await assertSucceeds(updateDoc(studentQuestionRef, {
        answers: [{
          id: 'answer-1',
          text: 'Test answer',
          author: 'Student',
          authorId: 'answer-student',
        }],
      }))
    })

    await t.test('Answer author cannot accept their own answer', async () => {
      await assertFails(updateDoc(studentQuestionRef, {
        acceptedAnswerId: 'answer-1',
      }))
    })

    await t.test('Answer author cannot delete the question', async () => {
      await assertFails(deleteDoc(studentQuestionRef))
    })

    await t.test('Question owner can accept an answer', async () => {
      await assertSucceeds(updateDoc(questionRef, {
        acceptedAnswerId: 'answer-1',
      }))
    })

    await t.test('Question owner can delete an answer', async () => {
      await assertSucceeds(updateDoc(questionRef, {
        answers: [],
        acceptedAnswerId: null,
      }))
    })

    await t.test('Question owner can delete their question', async () => {
      await assertSucceeds(deleteDoc(questionRef))
    })
  } finally {
    await env.cleanup()
  }
})
