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

console.log('fresh SkillPilot ID entry tests passed')
