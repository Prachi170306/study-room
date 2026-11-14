const STORAGE_KEY = 'studysphere_resources'

export const getResources = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
  } catch {
    return []
  }
}

export const saveResources = (resources) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(resources))
  return resources
}

export const addResource = (resource) => {
  const resources = getResources()
  const updatedResources = [...resources, resource]

  return saveResources(updatedResources)
}
export const deleteResource = (resourceId) => {
  const resources = getResources()
  const updatedResources = resources.filter(
    (resource) => resource.id !== resourceId
  )

  return saveResources(updatedResources)
}