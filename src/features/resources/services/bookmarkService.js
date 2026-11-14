const STORAGE_KEY = 'studysphere_bookmarks'

export const getBookmarks = () => {
  return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
}

export const toggleBookmark = (resourceId) => {
  const bookmarks = getBookmarks()

  const updatedBookmarks = bookmarks.includes(resourceId)
    ? bookmarks.filter((id) => id !== resourceId)
    : [...bookmarks, resourceId]

  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedBookmarks))

  return updatedBookmarks
}