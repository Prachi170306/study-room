import { useState } from 'react'

export default function UploadResource({ onUpload, onClose }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [file, setFile] = useState(null)
  const [error, setError] = useState('')
  const [uploading, setUploading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!title.trim()) {
      setError('Please enter a resource title.')
      return
    }

    if (!file) {
      setError('Please select a file.')
      return
    }

    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/webp',
    ]

    if (!allowedTypes.includes(file.type)) {
      setError('Only PDF, JPG, PNG and WEBP files are allowed.')
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be below 10 MB.')
      return
    }

    setUploading(true)

    try {
      await onUpload({
        title: title.trim(),
        description: description.trim(),
        file,
      })
    } catch (err) {
      setError(err.message || 'Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-lg rounded-2xl bg-[#1c1c2b] p-6 shadow-xl"
      >
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">
            Upload Resource
          </h2>

          <button type="button" onClick={onClose} disabled={uploading}>
            ✕
          </button>
        </div>

        <label className="mb-2 block text-sm font-medium">
          Resource Title
        </label>

        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter resource title"
          disabled={uploading}
          className="mb-4 w-full rounded-lg border p-3"
        />

        <label className="mb-2 block text-sm font-medium">
          Description
        </label>

        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe your resource"
          disabled={uploading}
          className="mb-4 w-full rounded-lg border p-3"
          rows="3"
        />

        <label className="mb-2 block text-sm font-medium">
          Select PDF or Image
        </label>

        <input
          type="file"
          accept=".pdf,.jpg,.jpeg,.png,.webp"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          disabled={uploading}
          className="mb-4 w-full rounded-lg border p-3"
        />

        {file && (
          <p className="mb-4 text-sm text-green-600">
            Selected: {file.name}
          </p>
        )}

        {error && (
          <p className="mb-4 text-sm text-red-400">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={uploading}
          className="w-full rounded-xl bg-violet-600 py-3 font-semibold text-white hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {uploading ? 'Uploading...' : 'Upload Resource'}
        </button>
      </form>
    </div>
  )
}
