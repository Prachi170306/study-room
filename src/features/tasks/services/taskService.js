
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore'

import { db } from '../../../firebase'

// Listen for real-time task updates
export function subscribeToTasks(userId, callback, onError) {
  const tasksRef = collection(db, 'users', userId, 'tasks')

  return onSnapshot(
    tasksRef,
    (snapshot) => {
      const tasks = snapshot.docs.map((item) => ({
        id: item.id,
        ...item.data(),
      }))

      callback(tasks)
    },
    onError
  )
}

// Add a new task
export async function addTaskToFirestore(userId, taskData) {
  const tasksRef = collection(db, 'users', userId, 'tasks')

  const docRef = await addDoc(tasksRef, {
    ...taskData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })

  return docRef.id
}

// Update an existing task
export async function updateTaskInFirestore(
  userId,
  taskId,
  updatedData
) {
  const taskRef = doc(db, 'users', userId, 'tasks', taskId)

  await updateDoc(taskRef, {
    ...updatedData,
    updatedAt: serverTimestamp(),
  })
}

// Delete a task
export async function deleteTaskFromFirestore(userId, taskId) {
  const taskRef = doc(db, 'users', userId, 'tasks', taskId)

  await deleteDoc(taskRef)
}
