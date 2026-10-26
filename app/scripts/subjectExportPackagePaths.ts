import { createHash } from 'node:crypto'

// Leave room for the versioned archive root and the jurisdiction/stage folders
// within the unchanged 180-character Windows extraction-path contract.
const MAX_MAPPING_FILE_NAME_LENGTH = 72

export const subjectExportSourceArtifactFileName = (repositoryRelativeSourcePath: string): string => {
  const path = repositoryRelativeSourcePath.replaceAll('\\', '/')
  if (path.startsWith('/') || /^[A-Za-z]:/u.test(path)
    || path.split('/').some((part) => part === '' || part === '.' || part === '..')) {
    throw new Error('Source artifact identity requires a repository-relative path without traversal')
  }
  return `source-${createHash('sha256').update(path).digest('hex')}.json`
}

export const subjectExportMappingFileName = (fileName: string): string => {
  const readable = fileName
    .replace(/lower_secondary/gu, 'lower')
    .replace(/upper_secondary/gu, 'upper')
    .replace(/source_extraction/gu, 'src')
    .replace(/full_src/gu, 'fullsrc')
    .replace(/to_canonical/gu, 'to')
    .replace(/politics_economics/gu, 'powi')
    .replace(/politik_wirtschaftslehre/gu, 'powi')
    .replace(/wirtschaftswissenschaft/gu, 'wirtschaft')
  if (readable.length <= MAX_MAPPING_FILE_NAME_LENGTH) return readable
  const suffix = readable.endsWith('.review.json') ? '.review.json' : '.json'
  const digest = createHash('sha256').update(fileName).digest('hex').slice(0, 20)
  const prefixLength = MAX_MAPPING_FILE_NAME_LENGTH - suffix.length - digest.length - 1
  return `${readable.slice(0, prefixLength).replace(/[._-]+$/u, '')}-${digest}${suffix}`
}

export const subjectExportGoalVisualizationPath = (
  subjectSlug: string,
  goalId: string,
  extension: string,
): string => `assets/goal-visualizations/${subjectSlug}/${goalId}/image${extension}`

export const legacySubjectExportGoalVisualizationPath = (
  subjectSlug: string,
  goalId: string,
  extension: string,
): string => `assets/goal-visualizations/${subjectSlug}/${goalId}/${goalId}${extension}`

export const isSubjectExportGoalVisualizationPath = (
  path: string,
  subjectSlug: string,
  goalId: string,
  extension: string,
): boolean => path === subjectExportGoalVisualizationPath(subjectSlug, goalId, extension)
  || path === legacySubjectExportGoalVisualizationPath(subjectSlug, goalId, extension)
