import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
} from 'firebase/firestore'

import { auth, db } from '../../../firebase'

const getBookmarkCollection = () => {
  const user = auth.currentUser

  if (!user) throw new Error('Please sign in first.')

  return collection(db, 'users', user.uid, 'bookmarks')
}

export const getBookmarks = async () => {
  const snapshot = await getDocs(getBookmarkCollection())
  return snapshot.docs.map((item) => item.id)
}

export const toggleBookmark = async (resourceId) => {
  const bookmarks = getBookmarkCollection()
  const bookmarkRef = doc(bookmarks, resourceId)

  const snapshot = await getDocs(bookmarks)
  const exists = snapshot.docs.some((item) => item.id === resourceId)

  if (exists) {
    await deleteDoc(bookmarkRef)
  } else {
    await setDoc(bookmarkRef, {
      resourceId,
      createdAt: new Date(),
    })
  }

  return getBookmarks()
}
