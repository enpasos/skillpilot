import { mkdtemp, readFile, readdir, rm } from 'node:fs/promises'
import type { IncomingMessage, ServerResponse } from 'node:http'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createServer } from 'vite'
import { generateClaudePluginPublication } from '../../scripts/generate_claude_plugin_publication.mjs'
import type {
  PersonalizationCompletedDecision,
  PersonalizationOption,
  PersonalizationPlan,
} from '../src/utils/personalCurriculumEditorApi'

// Local capture server for public quickstart media. Profile and session data
// are synthetic and live only in this process. Curriculum copy comes from the
// repository. Start from app/ with npx tsx scripts/serveQuickstartCapture.ts.
const curriculumDirectory = new URL('../../curricula/DE/Gymnasium/canonical/', import.meta.url)
const overviewFilename = 'DE_DEU_S_GYM_CANONICAL_OVERVIEW.de.json'
const readJson = async (url: URL) => JSON.parse(await readFile(url, 'utf8'))
const overview = await readJson(new URL(overviewFilename, curriculumDirectory))
const mit = await readJson(new URL('../../curricula/US/MIT_OCW/json/US_MAS_U_MIT_OCW_FOUNDATIONS.en.json', import.meta.url))
const otherSchool = await readJson(new URL('../../curricula/DE/BY/DE_BY_Mittelschule_Overview.json', import.meta.url))
const subjects = await Promise.all((await readdir(curriculumDirectory))
  .filter((filename) => filename.endsWith('.de.json') && filename !== overviewFilename)
  .map((filename) => readJson(new URL(filename, curriculumDirectory))))
const stages = overview.personalizationFlow.stages
const subjectStage = stages.find(({ id }: { id: string }) => id === 'subject')
const subjectOrder: string[] = subjectStage.groups[0].source.landscapeIds
const subjectsById = new Map(subjects.map((subject) => [subject.landscapeId, subject]))
// Options from the isolated repository-backed Spring/H2 plan for Hessen, G9,
// Sekundarstufe I. The full authored list remains visible below the offers.
const hesseLowerSecondarySubjects = new Set([
  'Mathematik', 'Physik', 'Chemie', 'Biologie', 'Informatik', 'Geschichte', 'Deutsch',
  'Politik und Wirtschaft', 'Latein', 'Wirtschaftswissenschaften',
])
const status = await readJson(new URL('../../docs/qa-ci/status/curriculum-quality-status.json', import.meta.url))
const quality = new Map<string, string>(status.curricula.map((row: { landscapeId: string; maturity: string }) => [row.landscapeId, row.maturity]))
const qualityStatus = (landscapeId: string) => {
  const maturity = quality.get(landscapeId)
  if (!maturity) return null
  return ['M5', 'M6', 'M7'].includes(maturity) ? 'machine_qa' : 'experimental'
}

const publicationDirectory = await mkdtemp(join(tmpdir(), 'skillpilot-quickstart-capture-'))
const publicationRoot = join(publicationDirectory, 'claude-plugin-publication')
const claudePublication = await (async () => {
  try {
    generateClaudePluginPublication({ publicationRoot })
    return JSON.parse(await readFile(join(publicationRoot, 'index.json'), 'utf8'))
  } finally {
    await rm(publicationDirectory, { recursive: true, force: true })
  }
})()

const send = (response: ServerResponse, status: number, body?: unknown) => {
  response.writeHead(status, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' })
  response.end(body === undefined ? undefined : JSON.stringify(body))
}

const readBody = async (request: IncomingMessage) => {
  let body = ''
  for await (const chunk of request) body += chunk
  return JSON.parse(body || '{}')
}

type Profile = {
  curriculum: string | null
  decisions: PersonalizationCompletedDecision[]
  selection: PersonalizationOption[]
}

const profile = (): Profile => ({ curriculum: null, decisions: [], selection: [] })
const profiles = new Map<string, Profile>()
let nextId = 1

function summary(landscape: typeof overview, english: boolean) {
  return {
    ...landscape,
    loadMode: 'summary',
    curriculumId: landscape.landscapeId,
    filename: overviewFilename,
    goals: undefined,
    title: english ? landscape.titleEn ?? landscape.title : landscape.title,
    description: english ? landscape.descriptionEn ?? landscape.description : landscape.description,
    type: landscape.schoolType,
    level: landscape.schoolType,
    subjectQuality: landscape === overview ? subjects.map((subject) => ({ qualityStatus: qualityStatus(subject.landscapeId) })) : [],
    qualityStatus: qualityStatus(landscape.landscapeId),
  }
}

function planFor(state: Profile): PersonalizationPlan {
  const steps = ['jurisdiction', 'durationModel', 'stage', 'subject']
  const step = state.curriculum === overview.landscapeId ? steps[state.decisions.length] : undefined
  const authoredStage = stages.find(({ id }: { id: string }) => id === step)
  const group = authoredStage?.groups[0]
  const plan: PersonalizationPlan = {
    stage: group ? 'SELECTION' : 'COMPLETE',
    stageId: step ?? null,
    stageLabel: authoredStage?.label ?? null,
    groupId: step ?? null,
    groupLabel: group?.label ?? null,
    groupInstanceId: step ? `${step}:demo` : null,
    minSelections: group?.minSelections ?? 0,
    maxSelections: group?.maxSelections ?? 0,
    selectedCount: state.selection.length,
    options: [],
    displayOptions: [],
    navigationOptions: [],
    currentSelectedOptions: state.selection,
    currentRewindId: null,
    completedDecisions: state.decisions,
    preservedDecisions: [],
    pendingDecisions: [],
    canReopenMigratedPersonalization: false,
    problemCode: null,
  }
  const option = (id: string, fields: Partial<PersonalizationOption>): PersonalizationOption => ({
    optionId: id,
    stageId: plan.stageId,
    groupId: plan.groupId,
    groupInstanceId: plan.groupInstanceId,
    landscapeId: overview.landscapeId,
    landscapeLabel: overview.subject,
    filterId: null,
    filterLabel: null,
    scopeKey: null,
    scopeValue: null,
    scopeLabel: null,
    kind: 'VALUE',
    ...fields,
  })
  if (step === 'jurisdiction') {
    plan.options = overview.filters.map(({ id, label }: { id: string; label: string }) => (
      option(id, { filterId: id, filterLabel: label })
    ))
  } else if (step === 'durationModel' || step === 'stage') {
    plan.options = group.source.values.map(({ value, label }: { value: string; label: string }) => (
      option(value, { kind: 'SCOPE_VALUE', scopeKey: step, scopeValue: value, scopeLabel: label })
    ))
  } else if (step === 'subject') {
    plan.displayOptions = subjectOrder.map((id) => option(id, {
      landscapeId: id,
      landscapeLabel: subjectsById.get(id)?.subject ?? null,
      qualityStatus: qualityStatus(id),
    }))
    plan.options = plan.displayOptions.filter(({ optionId, landscapeLabel }) => (
      hesseLowerSecondarySubjects.has(landscapeLabel ?? '')
      && !state.selection.some((selected) => selected.optionId === optionId)
    ))
  }
  if (step !== 'subject') plan.displayOptions = [...plan.options]
  if (step === 'subject' && state.selection.length >= plan.minSelections) {
    plan.options.push(option('finish', { kind: 'COMPLETE_GROUP', landscapeId: null, landscapeLabel: null }))
  }
  return plan
}

async function demoApi(request: IncomingMessage, response: ServerResponse) {
  const url = new URL(request.url ?? '/', 'http://127.0.0.1')
  if (url.pathname === '/api/public/claude/plugins/index.json' && request.method === 'GET') {
    send(response, 200, claudePublication)
    return
  }
  if (url.pathname === '/api/ui/landscapes' && request.method === 'GET') {
    const english = url.searchParams.get('lang') === 'en'
    send(response, 200, { summaries: [overview, otherSchool, mit].map((landscape) => summary(landscape, english)) })
    return
  }
  if (url.pathname === '/api/ui/learners' && request.method === 'POST') {
    const skillpilotId = `00000000-0000-4000-8000-${String(nextId++).padStart(12, '0')}`
    profiles.set(skillpilotId, profile())
    send(response, 201, { state: { skillpilotId } })
    return
  }

  const match = /^\/api\/ui\/learners\/(00000000-0000-4000-8000-[0-9]{12})(?:\/(.+))?$/u.exec(url.pathname)
  const id = match?.[1] ?? ''
  const action = match?.[2] ?? ''
  const state = profiles.get(id)
  if (!state) {
    send(response, 404, { message: 'Unavailable in the local Quickstart demo' })
    return
  }
  if (!action && request.method === 'DELETE') {
    profiles.delete(id)
    send(response, 204)
  } else if (!action && request.method === 'GET') {
    send(response, 200, { selectedCurriculum: state.curriculum })
  } else if (action === 'curriculum' && request.method === 'PUT') {
    const { curriculumId } = await readBody(request)
    state.curriculum = curriculumId
    state.decisions = []
    state.selection = []
    send(response, 200, { status: 'updated' })
  } else if (action === 'resume' && request.method === 'POST') {
    send(response, 200, { lastActivityAt: '2026-11-24T08:00:00Z', scheduledDeletionAt: '2027-11-24T08:00:00Z' })
  } else if (action === 'personalization-plan' || action === 'personalization-options') {
    const plan = planFor(state)
    if (action === 'personalization-options') {
      const { optionId } = await readBody(request)
      const chosen = plan.options.find((option) => option.optionId === optionId)
      if (!chosen) {
        send(response, 400, { message: 'Unknown demo curriculum option' })
        return
      }
      if (chosen.kind !== 'COMPLETE_GROUP') state.selection.push(chosen)
      if (plan.groupId !== 'subject' || chosen.kind === 'COMPLETE_GROUP') {
        state.decisions.push({
          rewindId: `demo-${plan.groupId}`,
          stageId: plan.stageId,
          stageLabel: plan.stageLabel,
          groupId: plan.groupId,
          groupLabel: plan.groupLabel,
          groupInstanceId: plan.groupInstanceId,
          selectedOptions: state.selection,
        })
        state.selection = []
      }
    }
    send(response, 200, planFor(state))
  } else {
    send(response, 404, { message: 'Unavailable in the local Quickstart demo' })
  }
}

const server = await createServer({
  root: fileURLToPath(new URL('../', import.meta.url)),
  define: { 'import.meta.env.VITE_API_BASE': '""' },
  server: { host: '127.0.0.1', port: Number(process.argv[2] ?? 4177), strictPort: true, hmr: false, watch: null },
  plugins: [{
    name: 'quickstart-capture-fixtures',
    enforce: 'pre',
    configureServer(vite) {
      vite.middlewares.use((request, response, next) => {
        if (request.url === '/__quickstart_capture__') return send(response, 200, 'skillpilot-local-quickstart-fixtures')
        if (!/^\/(?:api|login|oauth2)(?:\/|$)/u.test(request.url ?? '')) return next()
        void demoApi(request, response).catch((error: unknown) => {
          console.error(error)
          if (!response.headersSent) send(response, 500, { message: 'Local capture fixture error' })
        })
      })
    },
  }],
})

await server.listen()
server.printUrls()
