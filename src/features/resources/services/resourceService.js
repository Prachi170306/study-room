import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore'

import { ref, deleteObject } from 'firebase/storage'
import { auth, db, storage } from '../../../firebase'

const resourcesCollection = collection(db, 'resources')

const DB_NAME = 'studysphere-resources'
const STORE_NAME = 'files'

const openResourceDB = () =>
  new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1)

    request.onupgradeneeded = () => {
      const database = request.result
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME, { keyPath: 'id' })
      }
    }

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })

const saveLocalFile = async (id, file) => {
  const database = await openResourceDB()

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, 'readwrite')

    transaction.objectStore(STORE_NAME).put({
      id,
      blob: file,
      name: file.name,
      type: file.type,
    })

    transaction.oncomplete = () => {
      database.close()
      resolve()
    }

    transaction.onerror = () => {
      database.close()
      reject(transaction.error)
    }

    transaction.onabort = () => {
      database.close()
      reject(transaction.error)
    }
  })
}

export const getResourceFile = async (id) => {
  const database = await openResourceDB()

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, 'readonly')
    const request = transaction.objectStore(STORE_NAME).get(id)

    request.onsuccess = () => {
      database.close()
      resolve(request.result?.blob || null)
    }

    request.onerror = () => {
      database.close()
      reject(request.error)
    }
  })
}

const deleteLocalFile = async (id) => {
  if (!id) return

  const database = await openResourceDB()

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, 'readwrite')
    transaction.objectStore(STORE_NAME).delete(id)

    transaction.oncomplete = () => {
      database.close()
      resolve()
    }

    transaction.onerror = () => {
      database.close()
      reject(transaction.error)
    }
  })
}

export const subscribeToResources = (onData, onError) => {
  const q = query(resourcesCollection, orderBy('createdAt', 'desc'))

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

export const addResource = async ({ title, description, file }) => {
  const user = auth.currentUser

  if (!user) throw new Error('Please sign in before uploading.')
  if (!file) throw new Error('Please select a file.')

  const fileId = crypto.randomUUID()

  await saveLocalFile(fileId, file)

  try {
    const resource = {
      title,
      description,
      fileId,
      fileName: file.name,
      fileType: file.type,
      fileStorage: 'indexeddb',
      ownerId: user.uid,
      uploaderName:
        user.displayName || user.email?.split('@')[0] || 'Student',
      createdAt: serverTimestamp(),
    }

    const result = await addDoc(resourcesCollection, resource)

    return {
      id: result.id,
      ...resource,
      createdAt: new Date().toISOString(),
    }
  } catch (error) {
    await deleteLocalFile(fileId).catch(() => {})
    throw error
  }
}

export const deleteResource = async (resource) => {
  const user = auth.currentUser

  if (!user || resource.ownerId !== user.uid) {
    throw new Error('You can only delete your own resources.')
  }

  await deleteDoc(doc(db, 'resources', resource.id))

  if (resource.fileId) {
    await deleteLocalFile(resource.fileId).catch((error) => {
      console.error('Local file cleanup failed:', error)
    })
  }

  // Clean up files uploaded using the older Firebase Storage method.
  if (resource.filePath) {
    await deleteObject(ref(storage, resource.filePath)).catch((error) => {
      console.error('Legacy file cleanup failed:', error)
    })
  }
}
