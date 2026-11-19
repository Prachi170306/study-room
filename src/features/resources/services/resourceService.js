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

import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage'

import { auth, db, storage } from '../../../firebase'

const resourcesCollection = collection(db, 'resources')

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

  const safeFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
  const filePath = `resources/${user.uid}/${crypto.randomUUID()}-${safeFileName}`
  const fileRef = ref(storage, filePath)

  await uploadBytes(fileRef, file, {
    contentType: file.type,
  })

  try {
    const fileUrl = await getDownloadURL(fileRef)

    const resource = {
      title,
      description,
      fileUrl,
      filePath,
      fileName: file.name,
      fileType: file.type,
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
    await deleteObject(fileRef).catch(() => {})
    throw error
  }
}

export const deleteResource = async (resource) => {
  const user = auth.currentUser

  if (!user || resource.ownerId !== user.uid) {
    throw new Error('You can only delete your own resources.')
  }

  await deleteDoc(doc(db, 'resources', resource.id))

  if (resource.filePath) {
    await deleteObject(ref(storage, resource.filePath)).catch((error) => {
      console.error('File cleanup failed:', error)
    })
  }
}
