export const requestCanonicalGymnasiumCutover = (
  fetcher: typeof fetch,
  apiBase: string,
  skillpilotId: string,
) => {
  const url = apiBase
    ? `${apiBase}/api/ui/learners/${skillpilotId}/cutover/canonical-gymnasium`
    : `/api/ui/learners/${skillpilotId}/cutover/canonical-gymnasium`
  return fetcher(url, { method: 'POST' })
}
