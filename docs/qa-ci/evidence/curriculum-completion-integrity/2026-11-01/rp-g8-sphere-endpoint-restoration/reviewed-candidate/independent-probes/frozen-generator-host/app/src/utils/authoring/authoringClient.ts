export const requestJson = async <T,>(url: string, init?: RequestInit): Promise<T> => {
  const response = await fetch(url, init)
  if (!response.ok) {
    const details = await response.text()
    throw new Error(details || `Request failed: ${response.status}`)
  }
  return (await response.json()) as T
}
