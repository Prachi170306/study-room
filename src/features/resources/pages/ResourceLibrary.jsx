
import { useState } from 'react'
import ResourceCard from '../components/ResourceCard'
import UploadResource from '../components/UploadResource'
import { getBookmarks, toggleBookmark } from '../services/bookmarkService'
import { getResources, addResource, deleteResource } from '../services/resourceService'

export default function ResourceLibrary() {
  const [search, setSearch] = useState('')
  const [activeFilter, setActiveFilter] = useState('All')
  const [resources, setResources] = useState(() => getResources())
  const [showUpload, setShowUpload] = useState(false)
  const [bookmarks, setBookmarks] = useState(() => getBookmarks())

  const handleToggleBookmark = (resourceId) => {
    const updated = toggleBookmark(resourceId)
    setBookmarks(updated)
  }
  const handleDeleteResource = (resourceId) => {
  const updatedResources = deleteResource(resourceId)
  setResources(updatedResources)
}
  const filteredResources = resources.filter((resource) => {
    const matchesSearch = resource.title
      .toLowerCase()
      .includes(search.toLowerCase())

    const matchesFilter =
      activeFilter === 'All' ||
      (activeFilter === 'PDF' && resource.fileType === 'application/pdf') ||
      (activeFilter === 'Images' && resource.fileType.startsWith('image/')) ||
      (activeFilter === 'Documents' &&
        resource.fileType !== 'application/pdf' &&
        !resource.fileType.startsWith('image/')) ||
      (activeFilter === 'Bookmarks' && bookmarks.includes(resource.id))

    return matchesSearch && matchesFilter
  })

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10">
      <div className="mx-auto max-w-7xl">

        <div className="mb-10">
          <p className="text-sm font-semibold text-indigo-600">
            STUDYSPHERE / LEARNING
          </p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">
            Resource Library
          </h1>
          <p className="mt-2 text-slate-500">
            Discover, share and organize learning resources with your study community.
          </p>
        </div>

        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          {[
            { label: 'Total Resources', value: resources.length },
            { label: 'My Uploads', value: resources.length },
            { label: 'Bookmarked', value: bookmarks.length },
          ].map((stat) => (
            <div key={stat.label} className="rounded-2xl bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">{stat.label}</p>
              <h2 className="mt-2 text-3xl font-bold text-slate-900">
                {stat.value}
              </h2>
            </div>
          ))}
        </div>

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <input
            type="text"
            placeholder="Search resources..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-indigo-500 sm:max-w-md"
          />

          <button
            onClick={() => setShowUpload(true)}
            className="rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white hover:bg-indigo-700"
          >
            + Upload Resource
          </button>
        </div>

        <div className="mb-6 flex flex-wrap gap-3">
          {['All', 'PDF', 'Images', 'Documents', 'Bookmarks'].map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`rounded-full px-5 py-2 text-sm font-medium ${
                activeFilter === filter
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-slate-600 hover:bg-slate-100'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {filteredResources.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filteredResources.map((resource) => (
              <ResourceCard
                key={resource.id}
                resource={resource}
                isBookmarked={bookmarks.includes(resource.id)}
                onToggleBookmark={handleToggleBookmark}
                onDeleteResource={handleDeleteResource}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-20 text-center">
            <div className="mb-4 text-5xl">📚</div>
            <h2 className="text-xl font-bold text-slate-800">
              {resources.length === 0
                ? 'No resources yet'
                : 'No matching resources'}
            </h2>
            <p className="mt-2 text-slate-500">
              {resources.length === 0
                ? 'Be the first to share a useful study resource with your room.'
                : 'Try another search or filter.'}
            </p>
          </div>
        )}

        {showUpload && (
          <UploadResource
            onClose={() => setShowUpload(false)}
            onUpload={(resource) => {
              const savedResources = addResource(resource)
              setResources(savedResources)
            }}
          />
        )}

      </div>
    </div>
  )
}
