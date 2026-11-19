import { getResourceFile } from '../services/resourceService'

export default function ResourceCard({
  resource,
  isBookmarked,
  onToggleBookmark,
  onDeleteResource,
  canDelete = false,
}) {
  const isPDF = resource.fileType === 'application/pdf'

  const handleDownload = async () => {
    try {
      const file = await getResourceFile(resource.fileId)

      if (!file) {
        alert(
          'This file is stored in the uploader’s browser and is not available on this device.'
        )
        return
      }

      const url = URL.createObjectURL(file)
      const link = document.createElement('a')

      link.href = url
      link.download = resource.fileName || 'resource'
      document.body.appendChild(link)
      link.click()
      link.remove()

      setTimeout(() => URL.revokeObjectURL(url), 1000)
    } catch (error) {
      console.error('Download failed:', error)
      alert('Unable to download this resource.')
    }
  }

  return (
    <div className="rounded-2xl border border-[#39364f] bg-[#1c1c2b] p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">

      <div className="mb-4 flex items-center justify-between">
        <span className="text-3xl">
          {isPDF ? '📄' : '🖼️'}
        </span>

        <button
          onClick={() => onToggleBookmark(resource.id)}
          className="rounded-lg border px-3 py-2 text-sm hover:bg-indigo-50"
        >
          {isBookmarked ? '★ Bookmarked' : '☆ Bookmark'}
        </button>
      </div>

      <h3 className="font-bold text-white">
        {resource.title}
      </h3>

      <p className="mt-2 text-sm text-[#aaa5c5]">
        {resource.description || 'No description provided.'}
      </p>

      <p className="mt-4 truncate text-xs text-violet-400">
        {resource.fileName}
      </p>

      {resource.fileId ? (
        <button
          type="button"
          onClick={handleDownload}
          className="mt-3 inline-block rounded-lg bg-indigo-50 px-4 py-2 text-sm font-semibold text-violet-400 hover:bg-indigo-100"
        >
          ↓ Download Resource
        </button>
      ) : resource.fileUrl ? (
        <a
          href={resource.fileUrl}
          target="_blank"
          rel="noopener noreferrer"
          download={resource.fileName}
          className="mt-3 inline-block rounded-lg bg-indigo-50 px-4 py-2 text-sm font-semibold text-violet-400 hover:bg-indigo-100"
        >
          ↓ Download Resource
        </a>
      ) : null}

      {canDelete && (
        <button
          onClick={() => {
            if (window.confirm('Are you sure you want to delete this resource?')) {
              onDeleteResource(resource)
            }
          }}
          className="mt-3 ml-2 rounded-lg bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-100"
        >
          Delete
        </button>
      )}

      <div className="mt-4 border-t pt-4">
        <span className="text-xs text-[#aaa5c5]">
          {isPDF ? 'PDF Document' : 'Image Resource'}
        </span>
      </div>

    </div>
  )
}
