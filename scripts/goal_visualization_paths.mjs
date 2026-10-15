// SPDX-License-Identifier: Apache-2.0
const PREFIX = '/assets/goal-visualizations/'

/** Literal authored asset paths; no decoding or traversal normalization. */
export function goalVisualizationAssetSegments(url) {
  if (typeof url !== 'string' || !url.startsWith(PREFIX)) return null
  const suffix = url.slice(PREFIX.length)
  // Negative character testing also rejects a final newline, unlike `$`.
  // This matches the authored ASCII path contract used by the book runtime.
  if (!suffix || /[^A-Za-z0-9/_.-]/u.test(suffix)) return null
  const segments = suffix.split('/')
  if (segments.length < 3 || segments.some((segment) => (
    !segment || segment === '.' || segment === '..'
  ))) return null
  return segments
}
