import { useEffect, useState } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '../../../firebase'
import ResourceCard from '../components/ResourceCard'
import UploadResource from '../components/UploadResource'
import { getBookmarks, toggleBookmark } from '../services/bookmarkService'
import {
  subscribeToResources,
  addResource,
  deleteResource,
} from '../services/resourceService'

export default function ResourceLibrary() {
  const [search, setSearch] = useState('')
  const [activeFilter, setActiveFilter] = useState('All')
  const [resources, setResources] = useState([])
  const [showUpload, setShowUpload] = useState(false)
  const [bookmarks, setBookmarks] = useState([])
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    return onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
      if (!currentUser) {
        setLoading(false)
        setError('Please sign in to access the Resource Library.')
      }
    })
  }, [])

  useEffect(() => {
    if (!user) return

    setLoading(true)
    setError('')

    const unsubscribe = subscribeToResources(
      (data) => {
        setResources(data)
        setLoading(false)
      },
      (err) => {
        console.error('Resource loading failed:', err)
        setError(err.message || 'Unable to load resources.')
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [user])

  useEffect(() => {
    if (!user) return

    getBookmarks()
      .then(setBookmarks)
      .catch((err) => {
        console.error('Bookmark loading failed:', err)
        setError('Unable to load bookmarks.')
      })
  }, [user])

  const handleToggleBookmark = async (resourceId) => {
    try {
      const updated = await toggleBookmark(resourceId)
      setBookmarks(updated)
    } catch (err) {
      alert(err.message || 'Unable to update bookmark.')
    }
  }

  const handleDeleteResource = async (resource) => {
    try {
      await deleteResource(resource)
    } catch (err) {
      alert(err.message || 'Unable to delete resource.')
    }
  }

  const handleUpload = async (resource) => {
    try {
      await addResource(resource)
      setShowUpload(false)
    } catch (err) {
      console.error('Resource upload failed:', err)
      throw err
    }
  }

  const filteredResources = resources.filter((resource) => {
    const matchesSearch = (resource.title || '')
      .toLowerCase()
      .includes(search.toLowerCase())

    const matchesFilter =
      activeFilter === 'All' ||
      (activeFilter === 'PDF' && resource.fileType === 'application/pdf') ||
      (activeFilter === 'Images' && resource.fileType?.startsWith('image/')) ||
      (activeFilter === 'Documents' &&
        resource.fileType !== 'application/pdf' &&
        !resource.fileType?.startsWith('image/')) ||
      (activeFilter === 'Bookmarks' && bookmarks.includes(resource.id))

    return matchesSearch && matchesFilter
  })

  
  return (
    <div className="w-full text-white">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold">Resource Library</h2>
        <p className="mt-2 text-sm text-[#aaa5c5]">
          Discover, share and organize your study materials.
        </p>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          { label: 'Total Resources', value: resources.length },
          { label: 'My Uploads', value: resources.filter((r) => r.ownerId === user?.uid).length },
          { label: 'Bookmarked', value: bookmarks.length },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl border border-[#302e43] bg-[#1c1c2b] p-5">
            <p className="text-sm text-[#aaa5c5]">{stat.label}</p>
            <h3 className="mt-3 text-2xl font-semibold">{stat.value}</h3>
          </div>
        ))}
      </div>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row">
        <input
          type="search"
          placeholder="Search resources..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 rounded-lg border border-[#39364f] bg-[#1c1c2b] px-4 py-3 text-white outline-none focus:border-violet-500"
        />
        <button
          onClick={() => setShowUpload(true)}
          disabled={!user}
          className="rounded-lg bg-violet-600 px-5 py-3 font-medium text-white hover:bg-violet-700 disabled:opacity-50"
        >
          + Upload Resource
        </button>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {['All', 'PDF', 'Images', 'Documents', 'Bookmarks'].map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`rounded-lg px-4 py-2 text-sm ${
              activeFilter === filter
                ? 'bg-violet-600 text-white'
                : 'bg-[#1c1c2b] text-[#aaa5c5] hover:bg-[#29263d]'
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {error && (
        <p className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
          {error}
        </p>
      )}

      {loading ? (
        <p className="py-10 text-center text-[#aaa5c5]">Loading resources...</p>
      ) : filteredResources.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredResources.map((resource) => (
            <ResourceCard
              key={resource.id}
              resource={resource}
              isBookmarked={bookmarks.includes(resource.id)}
              onToggleBookmark={handleToggleBookmark}
              onDeleteResource={handleDeleteResource}
              canDelete={resource.ownerId === user?.uid}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-[#302e43] bg-[#1c1c2b] py-16 text-center">
          <p className="mb-3 text-4xl">📚</p>
          <h3 className="font-semibold">
            {resources.length === 0 ? 'No resources yet' : 'No matching resources'}
          </h3>
          <p className="mt-2 text-sm text-[#aaa5c5]">
            {resources.length === 0
              ? 'Be the first to share a useful study resource.'
              : 'Try another search or filter.'}
          </p>
        </div>
      )}

      {showUpload && (
        <UploadResource
          onClose={() => setShowUpload(false)}
          onUpload={handleUpload}
        />
      )}
    </div>
  )

}
