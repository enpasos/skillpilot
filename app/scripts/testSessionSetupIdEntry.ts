import { readFileSync } from 'node:fs'

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message)
}

const sessionSetupSource = readFileSync(
  new URL('../src/components/SessionSetup.tsx', import.meta.url),
  'utf8',
)
const germanLocaleSource = readFileSync(
  new URL('../src/locales/de.ts', import.meta.url),
  'utf8',
)
const englishLocaleSource = readFileSync(
  new URL('../src/locales/en.ts', import.meta.url),
  'utf8',
)
const learnerViewSource = readFileSync(
  new URL('../src/views/LearnerView.tsx', import.meta.url),
  'utf8',
)
const learnerDataManagementSource = readFileSync(
  new URL('../src/utils/learnerDataManagement.ts', import.meta.url),
  'utf8',
)
const ciWorkflowSource = readFileSync(
  new URL('../../.github/workflows/ci.yml', import.meta.url),
  'utf8',
)

const openLearnerStart = sessionSetupSource.match(
  /const openLearnerStart = \(\) => \{([\s\S]*?)\n {2}\}\n\n {2}return/u,
)?.[1] ?? ''

assert(openLearnerStart, 'learner start handler exists')
assert(
  openLearnerStart.includes('resetTransientSetupState(true)'),
  'learner start clears any previously held SkillPilot ID',
)
assert(
  !openLearnerStart.includes("localStorage.getItem('skillpilot_id')"),
  'learner start does not prefill the SkillPilot ID from browser storage',
)
assert(
  !sessionSetupSource.includes('localSkillpilotLogin')
    && !sessionSetupSource.includes('storedLogin'),
  'legacy saved-access flow is not wired into SessionSetup',
)
assert(
  !germanLocaleSource.includes('Gespeicherten Zugang verwenden')
    && !englishLocaleSource.includes('Use saved access'),
  'legacy saved-access copy is absent in both languages',
)

const skillpilotIdInput = sessionSetupSource.match(
  /<input\s+id="skillpilotIdInput"([\s\S]*?)\/>/u,
)?.[1] ?? ''

assert(skillpilotIdInput, 'SkillPilot ID input exists')
assert(
  skillpilotIdInput.includes('bg-white')
    && !skillpilotIdInput.includes('bg-sky-50'),
  'SkillPilot ID input uses a white light-mode background',
)

const learnerCockpitLink = sessionSetupSource.match(
  /<a\b([^>]*)>\s*<Compass size=\{16\} \/>\s*\{t\.startPage\.login\.cockpitButton\}\s*<\/a>/u,
)?.[1] ?? ''

assert(learnerCockpitLink, 'learner cockpit control is a link')
assert(
  learnerCockpitLink.includes('href={personalCurriculumReady ? learnerCockpitHref : undefined}')
    && learnerCockpitLink.includes('target="_blank"')
    && learnerCockpitLink.includes('rel="noopener noreferrer"'),
  'learner cockpit opens safely in a new browser tab',
)
assert(
  learnerCockpitLink.includes('onClick={handleOpenLearnerCockpit}')
    && sessionSetupSource.includes('persistLearnerStart(sanitizedLearnerId)'),
  'learner cockpit persists the confirmed learner setup before opening',
)

assert(
  sessionSetupSource.includes(
    'const checkLearner = async (id: string, markActivity = false): Promise<boolean>',
  )
    && sessionSetupSource.includes('if (markActivity) {')
    && sessionSetupSource.includes('await requestLearnerResume(fetch, apiBase, sanitizedId)'),
  'learner resume is an explicit opt-in boundary of the ID check',
)

const continueHandler = sessionSetupSource.slice(
  sessionSetupSource.indexOf('const handleContinueToCurriculum = async () => {'),
  sessionSetupSource.indexOf('React.useEffect(() => {', sessionSetupSource.indexOf('const handleContinueToCurriculum = async () => {')),
)
assert(
  continueHandler.includes('checkLearner(sanitizedId, true)'),
  'continuing with a confirmed ID records successful resume activity',
)

const idFileHandlers = sessionSetupSource.slice(
  sessionSetupSource.indexOf('const handleSkillpilotIdFileChange = async'),
  sessionSetupSource.indexOf('const requestNewId = async'),
)
assert(
  idFileHandlers.includes('decryptSkillpilotIdFileContent')
    && !idFileHandlers.includes('requestLearnerResume')
    && !idFileHandlers.includes('/resume'),
  'selecting or decrypting an ID file does not itself record activity',
)

const cockpitResumeEffect = learnerViewSource.slice(
  learnerViewSource.indexOf('const resumeId = skillpilotId'),
  learnerViewSource.indexOf(
    'const queryParams = useMemo',
    learnerViewSource.indexOf('const resumeId = skillpilotId'),
  ),
)
assert(
  cockpitResumeEffect.includes('learnerResumeAttemptedIdRef.current === resumeId')
    && cockpitResumeEffect.includes('learnerResumeAttemptedIdRef.current = resumeId')
    && cockpitResumeEffect.includes('await requestLearnerResume(fetch, apiBase, resumeId)'),
  'the mounted cockpit records resume exactly once per learner ID change',
)
assert(
  !cockpitResumeEffect.includes('setInterval')
    && !cockpitResumeEffect.includes('setTimeout'),
  'cockpit activity tracking is a mount boundary, not a background timer',
)
assert(
  cockpitResumeEffect.includes('const retention = await requestLearnerResume(fetch, apiBase, resumeId)')
    && cockpitResumeEffect.includes('setLearnerRetention(retention)'),
  'the cockpit resume response immediately supplies the displayed retention status',
)

const deletionHandler = learnerViewSource.slice(
  learnerViewSource.indexOf('const handleLearnerDeletion = useCallback'),
  learnerViewSource.indexOf('\n\n  return (', learnerViewSource.indexOf('const handleLearnerDeletion = useCallback')),
)
assert(
  deletionHandler.indexOf('await requestLearnerDeletion(fetch, apiBase, skillpilotId)')
    < deletionHandler.indexOf('clearDeletedLearnerBrowserState('),
  'manual deletion never clears browser state before the server result',
)
assert(
  deletionHandler.includes('error instanceof LearnerDataApiError && error.status === 404')
    && deletionHandler.includes('clearDeletedLearnerBrowserState(')
    && deletionHandler.includes("setLearnerDeleteError(\n        'failed',"),
  'an already deleted learner is locally closed out while other failures preserve browser state',
)
assert(
  learnerDataManagementSource.includes('body: JSON.stringify({ confirmationSkillpilotId: id })'),
  'manual deletion carries the exact ID confirmation body',
)

const exportHandler = learnerViewSource.slice(
  learnerViewSource.indexOf('const handleExport = useCallback'),
  learnerViewSource.indexOf('const syncClientData = useCallback'),
)
assert(
  exportHandler.indexOf("downloadJsonPayload(exportPayload, 'learner_data')")
    < exportHandler.indexOf('await loadLearnerRetentionRef.current()')
    && exportHandler.indexOf('await loadLearnerRetentionRef.current()')
      < exportHandler.indexOf("onNotify?.('success', t.notifications.learnerExported)"),
  'a completed learner export reloads visible retention before reporting success',
)
assert(
  !exportHandler.slice(exportHandler.indexOf('} else {')).includes('loadLearnerRetentionRef.current'),
  'failed exports do not claim activity by refreshing retention',
)
assert(
  ciWorkflowSource.includes('run: npm run test:learner-data-management'),
  'learner data management coverage is wired into frontend CI',
)

assert(
  learnerViewSource.includes('let localRestoreComplete = true')
    && learnerViewSource.includes('localRestoreComplete = persisted.every(Boolean)')
    && learnerViewSource.includes('t.notifications.learnerImportPartial'),
  'a partial local flashcard restore is not reported as a complete backup import',
)
assert(
  germanLocaleSource.includes('Die signierten serverseitigen Lerndaten wurden importiert')
    && englishLocaleSource.includes('The signed server-side learner data was imported'),
  'partial import outcomes are explained consistently in German and English',
)

console.log('fresh SkillPilot ID entry tests passed')
