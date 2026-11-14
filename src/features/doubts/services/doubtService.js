
const STORAGE_KEY = 'studysphere_doubts'

export const getDoubts = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
  } catch {
    return []
  }
}

export const saveDoubts = (questions) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(questions))
    return true
  } catch {
    return false
  }
}

export const addDoubt = (question) => {
  const questions = getDoubts()
  const updatedQuestions = [question, ...questions]
  saveDoubts(updatedQuestions)
  return updatedQuestions
}

export const deleteDoubt = (questionId) => {
  const updatedQuestions = getDoubts().filter(
    (question) => question.id !== questionId
  )
  saveDoubts(updatedQuestions)
  return updatedQuestions
}
