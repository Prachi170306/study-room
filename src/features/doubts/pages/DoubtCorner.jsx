
import { useState, useEffect } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '../../../firebase'
import {
  subscribeToDoubts,
  addDoubt,
  deleteDoubt,
  addAnswer,
  deleteAnswer,
  toggleAcceptedAnswer,
} from '../services/doubtService'

const MAX_FILE_SIZE = 500 * 1024

export default function DoubtCorner() {
  const [questions, setQuestions] = useState([])
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [search, setSearch] = useState('')
  const [answerInputs, setAnswerInputs] = useState({})
  const [linkInputs, setLinkInputs] = useState({})
  const [fileInputs, setFileInputs] = useState({})
  const [uploading, setUploading] = useState({})
  const [error, setError] = useState('')

  useEffect(() => {
    let unsubscribeDoubts = null

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (unsubscribeDoubts) {
        unsubscribeDoubts()
        unsubscribeDoubts = null
      }

      if (!user) {
        setQuestions([])
        setError('Please sign in to use Doubt Corner.')
        return
      }

      setError('')
      unsubscribeDoubts = subscribeToDoubts(
        (items) => {
          setQuestions(items.map((question) => ({
            ...question,
            answers: question.answers || [],
            acceptedAnswerId: question.acceptedAnswerId || null,
          })))
        },
        (err) => {
          console.error('Doubt Corner loading failed:', err)
          setError('Unable to load questions. Please try again.')
        }
      )
    })

    return () => {
      unsubscribeAuth()
      if (unsubscribeDoubts) unsubscribeDoubts()
    }
  }, [])


  const handlePostQuestion = async (e) => {
    e.preventDefault()
    if (!title.trim() || !description.trim()) return

    try {
      await addDoubt({
        title: title.trim(),
        description: description.trim(),
      })
      setTitle('')
      setDescription('')
    } catch (err) {
      alert(err.message || 'Unable to post question.')
    }
  }

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
        alert('File must be smaller than 500 KB.')
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

      await addAnswer(questionId, {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        text,
        link,
        attachment,
        createdAt: new Date().toLocaleDateString(),
      })

      setAnswerInputs((prev) => ({ ...prev, [questionId]: '' }))
      setLinkInputs((prev) => ({ ...prev, [questionId]: '' }))
      setFileInputs((prev) => ({ ...prev, [questionId]: null }))

      const input = document.getElementById(`answer-file-${questionId}`)
      if (input) input.value = ''
    } catch (err) {
      alert(err.message || 'Unable to post answer.')
    } finally {
      setUploading((prev) => ({ ...prev, [questionId]: false }))
    }
  }

  const handleDeleteQuestion = async (questionId) => {
    if (!window.confirm('Delete this question and all its answers?')) return

    try {
      await deleteDoubt(questionId)
    } catch (err) {
      alert(err.message || 'Unable to delete question.')
    }
  }

  const handleDeleteAnswer = async (questionId, answerId) => {
    if (!window.confirm('Delete this answer?')) return

    try {
      await deleteAnswer(questionId, answerId)
    } catch (err) {
      alert(err.message || 'Unable to delete answer.')
    }
  }

  const handleAcceptAnswer = async (questionId, answerId) => {
    try {
      await toggleAcceptedAnswer(questionId, answerId)
    } catch (err) {
      alert(err.message || 'Unable to update accepted answer.')
    }
  }

  const filteredQuestions = questions.filter((question) =>
    `${question.title} ${question.description}`
      .toLowerCase()
      .includes(search.toLowerCase())
  )

  const answeredCount = questions.filter(
    (question) => question.answers.length > 0
  ).length

  const inputStyle =
    'w-full rounded-lg border border-[#39364f] bg-[#11111b] px-4 py-3 text-white placeholder:text-[#8580a5] outline-none focus:border-violet-500'

  const primaryButton =
    'rounded-lg bg-violet-600 px-5 py-3 font-medium text-white hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50'

  return (
    <main className="w-full text-white">
      <div className="w-full">

        {/* Header */}
        <header className="mb-8">
          <h2 className="text-2xl font-semibold">Doubt Corner</h2>
          <p className="mt-2 text-sm text-[#aaa5c5]">
            Ask questions and help other students learn.
          </p>
        </header>

        {/* Statistics */}
        <section className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div className="rounded-xl border border-[#302e43] bg-[#1c1c2b] p-5">
            <p className="text-sm font-medium text-[#aaa5c5]">Total Questions</p>
            <p className="mt-3 text-4xl font-bold">{questions.length}</p>
            <p className="mt-2 text-xs text-violet-300">Community discussions</p>
          </div>

          <div className="rounded-xl border border-[#302e43] bg-[#1c1c2b] p-5">
            <p className="text-sm font-medium text-[#aaa5c5]">Answered Questions</p>
            <p className="mt-3 text-4xl font-bold text-emerald-400">{answeredCount}</p>
            <p className="mt-2 text-xs text-emerald-300">Questions with responses</p>
          </div>
        </section>

        {/* Ask Question */}
        <section className="mb-6 rounded-xl border border-[#302e43] bg-[#1c1c2b] p-5">
          <div className="mb-6">
            <span className="text-2xl">💡</span>
            <h2 className="mt-3 text-xl font-bold">Ask the Community</h2>
            <p className="mt-1 text-sm text-[#aaa5c5]">
              Explain your doubt clearly so others can help you.
            </p>
          </div>

          <form onSubmit={handlePostQuestion} className="space-y-4">
            <input
              type="text"
              placeholder="Give your question a clear title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={inputStyle}
              required
            />

            <textarea
              placeholder="Describe your doubt in detail..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              className={`${inputStyle} resize-y`}
              required
            />

            <div className="flex justify-end">
              <button type="submit" className={primaryButton}>
                + Post Question
              </button>
            </div>
          </form>
        </section>

        {/* Question List Header */}
        <section className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-bold">Community Questions</h2>
            <p className="mt-1 text-sm text-[#aaa5c5]">
              Browse questions and share your solutions.
            </p>
          </div>

          <input
            type="search"
            placeholder="Search questions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`${inputStyle} sm:max-w-sm`}
          />
        </section>

        {/* Questions */}
        {error && (
          <p className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
            {error}
          </p>
        )}
        <section className="space-y-6">
          {filteredQuestions.length > 0 ? (
            filteredQuestions.map((question) => (
              <article
                key={question.id}
                className="rounded-xl border border-[#302e43] bg-[#1c1c2b] p-5"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-violet-400">
                      Question
                    </p>
                    <h3 className="break-words text-lg font-bold leading-7 sm:text-xl">
                      {question.title}
                    </h3>
                  </div>

                  <span
                    className={`w-fit shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold ${
                      question.answers.length > 0
                        ? 'bg-emerald-500/15 text-emerald-300'
                        : 'bg-amber-500/15 text-amber-300'
                    }`}
                  >
                    {question.answers.length > 0 ? 'Answered' : 'Awaiting answers'}
                  </span>
                </div>

                <p className="mt-4 whitespace-pre-wrap break-words text-sm leading-7 text-[#c4bfe0]">
                  {question.description}
                </p>

                <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-b border-[#39364f] pb-5">
                  <span className="text-xs text-[#8580a5]">
                    Posted by {question.author} · {question.createdAt?.toDate
                      ? question.createdAt.toDate().toLocaleDateString()
                      : question.createdAt || 'Just now'}
                  </span>
                  {question.ownerId === auth.currentUser?.uid && (
                    <button
                      type="button"
                      onClick={() => handleDeleteQuestion(question.id)}
                      className="rounded-lg px-3 py-2 text-xs font-semibold text-red-400 transition hover:bg-red-500/10"
                    >
                      Delete Question
                    </button>
                  )}
                </div>

                {/* Answers */}
                <div className="mt-6">
                  <h4 className="mb-4 font-bold">
                    Answers <span className="text-violet-400">({question.answers.length})</span>
                  </h4>

                  {question.answers.length > 0 ? (
                    <div className="space-y-4">
                      {question.answers.map((answer, index) => {
                        const isAccepted = question.acceptedAnswerId === answer.id
                        const isQuestionOwner = question.ownerId === auth.currentUser?.uid

                        return (
                          <div
                            key={answer.id || index}
                            className={`rounded-xl border p-4 sm:p-5 ${
                              isAccepted
                                ? 'border-emerald-500/50 bg-emerald-500/5'
                                : 'border-[#39364f] bg-[#151522]'
                            }`}
                          >
                            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                              <span className="text-sm font-semibold">
                                {answer.author || 'Student'}
                              </span>

                              <div className="flex items-center gap-2">
                                {isAccepted && (
                                  <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-300">
                                    ✓ Accepted
                                  </span>
                                )}
                                {isQuestionOwner && (
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteAnswer(question.id, answer.id)}
                                    className="rounded-lg px-2 py-1 text-xs font-semibold text-red-400 hover:bg-red-500/10"
                                  >
                                    Delete
                                  </button>
                                )}
                              </div>
                            </div>

                            {answer.text && (
                              <p className="whitespace-pre-wrap break-words text-sm leading-7 text-[#d5d0e8]">
                                {answer.text}
                              </p>
                            )}

                            {answer.link && (
                              <a
                                href={answer.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-3 block break-all text-sm font-semibold text-violet-400 hover:underline"
                              >
                                🔗 {answer.link}
                              </a>
                            )}

                            {answer.attachment?.type?.startsWith('image/') && (
                              <div className="mt-4">
                                <img
                                  src={answer.attachment.dataUrl}
                                  alt={answer.attachment.name}
                                  className="max-h-72 max-w-full rounded-xl border border-[#39364f] object-contain"
                                />
                                <p className="mt-2 text-xs text-[#aaa5c5]">
                                  {answer.attachment.name}
                                </p>
                              </div>
                            )}

                            {answer.attachment?.type === 'application/pdf' && (
                              <a
                                href={answer.attachment.dataUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-4 flex items-center gap-3 rounded-xl border border-[#39364f] bg-[#1c1c2b] p-4 transition hover:border-violet-500"
                              >
                                <span className="text-3xl">📄</span>
                                <span className="min-w-0">
                                  <span className="block break-all text-sm font-semibold">
                                    {answer.attachment.name}
                                  </span>
                                  <span className="text-xs text-violet-400">Open PDF</span>
                                </span>
                              </a>
                            )}

                            <div className="mt-5 border-t border-[#39364f] pt-4">
                              {isQuestionOwner && (
                                <button
                                  type="button"
                                  onClick={() => handleAcceptAnswer(question.id, answer.id)}
                                  className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
                                    isAccepted
                                      ? 'bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20'
                                      : 'text-violet-300 hover:bg-violet-500/10'
                                  }`}
                                >
                                  {isAccepted ? '✓ Accepted Solution · Undo' : 'Mark as Accepted Answer'}
                                </button>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <p className="rounded-lg border border-dashed border-[#39364f] bg-[#151522] p-4 text-sm text-[#aaa5c5]">
                      No answers yet. Be the first to help!
                    </p>
                  )}
                </div>

                {/* Answer Composer */}
                <div className="mt-6 rounded-lg border border-[#39364f] bg-[#151522] p-4">
                  <h4 className="mb-4 font-semibold">
                    {question.answers.length > 0
                      ? 'Add another answer'
                      : 'Write the first answer'}
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
                      className={`${inputStyle} resize-y text-sm`}
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
                      className={`${inputStyle} text-sm`}
                    />

                    <label
                      htmlFor={`answer-file-${question.id}`}
                      className="flex cursor-pointer flex-wrap items-center gap-3 rounded-xl border border-dashed border-violet-500/40 bg-violet-500/5 p-4 text-sm text-violet-200 transition hover:bg-violet-500/10"
                    >
                      <span className="text-2xl">📎</span>
                      <span>
                        <span className="block font-semibold">Attach image or PDF</span>
                        <span className="mt-1 block text-xs text-[#aaa5c5]">
                          JPG, PNG, WEBP or PDF · Maximum 5 MB
                        </span>
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
                      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-[#11111b] p-3 text-sm">
                        <span className="min-w-0 break-all text-[#d5d0e8]">
                          📎 {fileInputs[question.id].name}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setFileInputs((prev) => ({ ...prev, [question.id]: null }))
                            const input = document.getElementById(`answer-file-${question.id}`)
                            if (input) input.value = ''
                          }}
                          className="text-red-400 hover:text-red-300"
                        >
                          Remove
                        </button>
                      </div>
                    )}

                    <div className="flex justify-end pt-2">
                      <button
                        type="submit"
                        disabled={uploading[question.id]}
                        className={primaryButton}
                      >
                        {uploading[question.id]
                          ? 'Adding...'
                          : question.answers.length > 0
                            ? 'Add Answer'
                            : 'Post Answer'}
                      </button>
                    </div>
                  </form>
                </div>
              </article>
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-[#39364f] bg-[#1c1c2b] px-5 py-20 text-center">
              <div className="mb-4 text-5xl">💡</div>
              <h2 className="text-xl font-bold">
                {questions.length === 0 ? 'No questions yet' : 'No matching questions'}
              </h2>
              <p className="mt-2 text-sm text-[#aaa5c5]">
                {questions.length === 0
                  ? 'Be the first to ask a question and start a discussion.'
                  : 'Try another search term.'}
              </p>
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
