
import { useState, useEffect } from 'react'
import { getDoubts, saveDoubts } from '../services/doubtService'

const MAX_FILE_SIZE = 5 * 1024 * 1024

export default function DoubtCorner() {
  const [questions, setQuestions] = useState(() => {
    const saved = getDoubts()

    return saved.map((question) => ({
      ...question,
      answers: (question.answers || []).map((answer, index) => {
        if (typeof answer === 'string') {
          return {
            id: `legacy-${question.id}-${index}`,
            text: answer,
            author: 'You',
            link: '',
            attachment: null,
          }
        }

        return {
          ...answer,
          id: answer.id || `legacy-${question.id}-${index}`,
          text: answer.text || '',
          author: answer.author || 'You',
          link: answer.link || '',
          attachment: answer.attachment || null,
        }
      }),
      acceptedAnswerId: question.acceptedAnswerId || null,
    }))
  })

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [search, setSearch] = useState('')
  const [answerInputs, setAnswerInputs] = useState({})
  const [linkInputs, setLinkInputs] = useState({})
  const [fileInputs, setFileInputs] = useState({})
  const [uploading, setUploading] = useState({})

  // Save questions through the service
  useEffect(() => {
    const saved = saveDoubts(questions)

    if (!saved) {
      alert('Storage is full. Please remove some attachments.')
    }
  }, [questions])

  // Create question
  const handlePostQuestion = (e) => {
    e.preventDefault()

    if (!title.trim() || !description.trim()) return

    const newQuestion = {
      id: Date.now(),
      title: title.trim(),
      description: description.trim(),
      author: 'You',
      createdAt: new Date().toLocaleDateString(),
      answers: [],
      acceptedAnswerId: null,
    }

    setQuestions((prev) => [newQuestion, ...prev])
    setTitle('')
    setDescription('')
  }

  // Create answer
  const handlePostAnswer = async (e, questionId) => {
    e.preventDefault()

    const text = answerInputs[questionId]?.trim() || ''
    const rawLink = linkInputs[questionId]?.trim() || ''
    const file = fileInputs[questionId]

    if (!text && !rawLink && !file) {
      alert('Please enter an answer, add a link or attach a file.')
      return
    }

    let link = ''

    if (rawLink) {
      try {
        const parsed = new URL(rawLink)

        if (!['http:', 'https:'].includes(parsed.protocol)) {
          throw new Error('Invalid link')
        }

        link = parsed.href
      } catch {
        alert('Please enter a valid link starting with https://')
        return
      }
    }

    if (file) {
      const allowedTypes = [
        'application/pdf',
        'image/jpeg',
        'image/png',
        'image/webp',
      ]

      if (!allowedTypes.includes(file.type)) {
        alert('Only PDF, JPG, PNG and WEBP files are allowed.')
        return
      }

      if (file.size > MAX_FILE_SIZE) {
        alert('File must be smaller than 5 MB.')
        return
      }
    }

    setUploading((prev) => ({ ...prev, [questionId]: true }))

    try {
      let attachment = null

      if (file) {
        attachment = await new Promise((resolve, reject) => {
          const reader = new FileReader()

          reader.onload = () =>
            resolve({
              name: file.name,
              type: file.type,
              dataUrl: reader.result,
            })

          reader.onerror = reject
          reader.readAsDataURL(file)
        })
      }

      const newAnswer = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        text,
        author: 'You',
        link,
        attachment,
        createdAt: new Date().toLocaleDateString(),
      }

      setQuestions((prev) =>
        prev.map((question) =>
          question.id === questionId
            ? {
                ...question,
                answers: [...question.answers, newAnswer],
              }
            : question
        )
      )

      setAnswerInputs((prev) => ({ ...prev, [questionId]: '' }))
      setLinkInputs((prev) => ({ ...prev, [questionId]: '' }))
      setFileInputs((prev) => ({ ...prev, [questionId]: null }))

      const input = document.getElementById(`answer-file-${questionId}`)
      if (input) input.value = ''
    } catch {
      alert('Unable to read the attachment. Please try again.')
    } finally {
      setUploading((prev) => ({ ...prev, [questionId]: false }))
    }
  }

  // Delete question
  const handleDeleteQuestion = (questionId) => {
    if (!window.confirm('Delete this question and all its answers?')) return

    setQuestions((prev) =>
      prev.filter((question) => question.id !== questionId)
    )
  }

  // Delete answer
  const handleDeleteAnswer = (questionId, answerIndex) => {
    if (!window.confirm('Delete this answer?')) return

    setQuestions((prev) =>
      prev.map((question) =>
        question.id === questionId
          ? {
              ...question,
              answers: question.answers.filter(
                (_, index) => index !== answerIndex
              ),
              acceptedAnswerId:
                question.answers[answerIndex]?.id === question.acceptedAnswerId
                  ? null
                  : question.acceptedAnswerId,
            }
          : question
      )
    )
  }

  // Accept answer
  const handleAcceptAnswer = (questionId, answerId) => {
    setQuestions((prev) =>
      prev.map((question) =>
        question.id === questionId
          ? {
              ...question,
              acceptedAnswerId:
                question.acceptedAnswerId === answerId ? null : answerId,
            }
          : question
      )
    )
  }

  // Search
  const filteredQuestions = questions.filter((question) =>
    `${question.title} ${question.description}`
      .toLowerCase()
      .includes(search.toLowerCase())
  )

  const answeredCount = questions.filter(
    (question) => question.answers.length > 0
  ).length

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10">
      <div className="mx-auto max-w-7xl">

        <div className="mb-10">
          <p className="text-sm font-semibold text-indigo-600">
            STUDYSPHERE / COMMUNITY
          </p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">
            Doubt Corner
          </h1>
          <p className="mt-2 text-slate-500">
            Ask questions, share knowledge and learn together.
          </p>
        </div>

        {/* Statistics */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Total Questions</p>
            <h2 className="mt-2 text-3xl font-bold text-slate-900">
              {questions.length}
            </h2>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Answered Questions</p>
            <h2 className="mt-2 text-3xl font-bold text-green-600">
              {answeredCount}
            </h2>
          </div>
        </div>

        {/* Question Form */}
        <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-xl font-bold text-slate-900">
            Ask a Question
          </h2>

          <form onSubmit={handlePostQuestion} className="space-y-4">
            <input
              type="text"
              placeholder="Enter your question title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-indigo-500"
              required
            />

            <textarea
              placeholder="Explain your doubt in detail..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-indigo-500"
              required
            />

            <button
              type="submit"
              className="rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white hover:bg-indigo-700"
            >
              + Post Question
            </button>
          </form>
        </div>

        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search questions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-indigo-500 sm:max-w-md"
          />
        </div>

        {/* Questions */}
        <div className="space-y-5">
          {filteredQuestions.length > 0 ? (
            filteredQuestions.map((question) => (
              <div
                key={question.id}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  <h3 className="text-lg font-bold text-slate-900">
                    {question.title}
                  </h3>

                  <span
                    className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
                      question.answers.length > 0
                        ? 'bg-green-50 text-green-700'
                        : 'bg-amber-50 text-amber-700'
                    }`}
                  >
                    {question.answers.length > 0 ? 'Answered' : 'Open'}
                  </span>
                </div>

                <p className="mt-3 text-sm leading-6 text-slate-600">
                  {question.description}
                </p>

                <div className="mt-4 flex items-center justify-between">
                  <span className="text-xs text-slate-400">
                    {question.author} • {question.createdAt}
                  </span>

                  <button
                    onClick={() => handleDeleteQuestion(question.id)}
                    className="text-sm font-semibold text-red-600 hover:text-red-800"
                  >
                    Delete Question
                  </button>
                </div>

                {/* Answers */}
                <div className="mt-6 border-t border-slate-200 pt-5">
                  <h4 className="mb-4 font-bold text-slate-800">
                    Answers ({question.answers.length})
                  </h4>

                  {question.answers.length > 0 ? (
                    <div className="space-y-4">
                      {question.answers.map((answer, index) => {
                        const isAccepted =
                          question.acceptedAnswerId === answer.id

                        return (
                          <div
                            key={answer.id || index}
                            className={`rounded-xl border p-4 ${
                              isAccepted
                                ? 'border-green-200 bg-green-50'
                                : 'border-slate-100 bg-slate-50'
                            }`}
                          >
                            <div className="mb-3 flex items-center justify-between gap-3">
                              <span className="text-sm font-semibold text-slate-800">
                                {answer.author || 'Student'}
                              </span>

                              <button
                                onClick={() =>
                                  handleDeleteAnswer(question.id, index)
                                }
                                className="text-xs font-semibold text-red-600 hover:text-red-800"
                              >
                                Delete
                              </button>
                            </div>

                            {answer.text && (
                              <p className="whitespace-pre-wrap text-sm leading-6 text-slate-700">
                                {answer.text}
                              </p>
                            )}

                            {answer.link && (
                              <a
                                href={answer.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-3 block break-all text-sm font-semibold text-indigo-600 hover:underline"
                              >
                                🔗 {answer.link}
                              </a>
                            )}

                            {answer.attachment?.type?.startsWith('image/') && (
                              <div className="mt-4">
                                <img
                                  src={answer.attachment.dataUrl}
                                  alt={answer.attachment.name}
                                  className="max-h-72 rounded-xl border object-contain"
                                />
                                <p className="mt-2 text-xs text-slate-500">
                                  {answer.attachment.name}
                                </p>
                              </div>
                            )}

                            {answer.attachment?.type === 'application/pdf' && (
                              <a
                                href={answer.attachment.dataUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-4 flex items-center gap-3 rounded-xl border bg-white p-4 hover:bg-indigo-50"
                              >
                                <span className="text-3xl">📄</span>
                                <span>
                                  <span className="block text-sm font-semibold text-slate-800">
                                    {answer.attachment.name}
                                  </span>
                                  <span className="text-xs text-indigo-600">
                                    Open PDF
                                  </span>
                                </span>
                              </a>
                            )}

                            <div className="mt-4 border-t border-slate-200 pt-3">
                              <button
                                onClick={() =>
                                  handleAcceptAnswer(question.id, answer.id)
                                }
                                className={`text-sm font-semibold ${
                                  isAccepted
                                    ? 'text-green-700'
                                    : 'text-indigo-600 hover:text-indigo-800'
                                }`}
                              >
                                {isAccepted
                                  ? '✓ Accepted Solution'
                                  : 'Mark as Accepted Answer'}
                              </button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
                      No answers yet. Be the first to help!
                    </p>
                  )}
                </div>

                {/* Answer Composer */}
                <div className="mt-6 rounded-xl border border-slate-200 p-4">
                  <h4 className="mb-4 font-semibold text-slate-900">
                    {question.answers.length > 0
                      ? 'Add Another Answer'
                      : 'Write the First Answer'}
                  </h4>

                  <form
                    onSubmit={(e) => handlePostAnswer(e, question.id)}
                    className="space-y-3"
                  >
                    <textarea
                      placeholder="Write your explanation or solution..."
                      rows={3}
                      value={answerInputs[question.id] || ''}
                      onChange={(e) =>
                        setAnswerInputs((prev) => ({
                          ...prev,
                          [question.id]: e.target.value,
                        }))
                      }
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500"
                    />

                    <input
                      type="url"
                      placeholder="Add a website link (optional) — https://..."
                      value={linkInputs[question.id] || ''}
                      onChange={(e) =>
                        setLinkInputs((prev) => ({
                          ...prev,
                          [question.id]: e.target.value,
                        }))
                      }
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500"
                    />

                    <label
                      htmlFor={`answer-file-${question.id}`}
                      className="flex cursor-pointer flex-wrap items-center gap-2 rounded-xl border border-dashed border-indigo-300 bg-indigo-50 p-4 text-sm text-indigo-700 hover:bg-indigo-100"
                    >
                      <span className="text-xl">📎</span>
                      <span className="font-semibold">
                        Attach Image or PDF
                      </span>
                      <span className="text-xs text-slate-500">
                        JPG, PNG, WEBP or PDF · Max 5 MB
                      </span>
                    </label>

                    <input
                      id={`answer-file-${question.id}`}
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png,.webp"
                      className="hidden"
                      onChange={(e) =>
                        setFileInputs((prev) => ({
                          ...prev,
                          [question.id]: e.target.files?.[0] || null,
                        }))
                      }
                    />

                    {fileInputs[question.id] && (
                      <div className="flex items-center justify-between rounded-lg bg-slate-50 p-3 text-sm">
                        <span className="truncate text-slate-700">
                          📎 {fileInputs[question.id].name}
                        </span>

                        <button
                          type="button"
                          onClick={() => {
                            setFileInputs((prev) => ({
                              ...prev,
                              [question.id]: null,
                            }))

                            const input = document.getElementById(
                              `answer-file-${question.id}`
                            )
                            if (input) input.value = ''
                          }}
                          className="ml-3 text-red-600"
                        >
                          Remove
                        </button>
                      </div>
                    )}

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={uploading[question.id]}
                        className="rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
                      >
                        {uploading[question.id]
                          ? 'Adding...'
                          : question.answers.length > 0
                            ? 'Add More'
                            : 'Post Answer'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center">
              <div className="mb-4 text-5xl">💡</div>
              <h2 className="text-xl font-bold text-slate-800">
                {questions.length === 0
                  ? 'No questions yet'
                  : 'No matching questions'}
              </h2>
              <p className="mt-2 text-slate-500">
                Be the first to ask a question!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
