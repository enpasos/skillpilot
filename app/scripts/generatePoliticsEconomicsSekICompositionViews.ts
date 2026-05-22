import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

type CompositionNode =
  | {
      kind: 'structure'
      id: string
      label: string
      children: CompositionNode[]
    }
  | {
      kind: 'canonicalSubtree'
      goalId: string
      displayLabel?: string
    }
  | {
      kind: 'goalEntry'
      goalId: string
      displayLabel?: string
    }

interface CompositionView {
  viewId: string
  landscapeId: string
  scope: {
    schoolForm: string
    jurisdiction?: string
    stage: string
  }
  rootNodes: CompositionNode[]
}

interface LearningGoal {
  id: string
  tags?: string[]
}

interface LearningLandscape {
  goals: LearningGoal[]
}

const scriptDir = dirname(fileURLToPath(import.meta.url))
const repoRoot = resolve(scriptDir, '../..')
const shouldWrite = process.argv.includes('--write')
const shouldCheck = process.argv.includes('--check')
const compositionViewDir = resolve(repoRoot, 'curricula/DE/Gymnasium/composition-views/politik-und-wirtschaft')
const canonicalLandscapePath = resolve(
  repoRoot,
  'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_POLITIKWIRTSCHAFT.de.json',
)

const landscapeId = '51b60137-46e8-5498-973e-ea38bb32f327'
const motivationGoalId = 'b76a024a-55a6-5c77-85cd-b37ef10e5197'
const hessenSekIClusters = [
  'd027b097-957d-5426-a448-2fe93d718a55',
  '7747ef52-243e-5174-825f-f631281f4e65',
  '2bfd0028-2b6c-5b83-8866-2bb9d6f450a3',
  '4185ac70-f87b-5595-ae97-be36a902c4ff',
]
const policyJurisdictions = [
  'DE-BB',
  'DE-BE',
  'DE-HB',
  'DE-HE',
  'DE-HH',
  'DE-MV',
  'DE-NW',
  'DE-RP',
  'DE-SH',
  'DE-SL',
  'DE-SN',
  'DE-ST',
  'DE-TH',
]
const jurisdictionNames: Record<string, string> = {
  'DE-BB': 'Brandenburg',
  'DE-BE': 'Berlin',
  'DE-HB': 'Bremen',
  'DE-HE': 'Hessen',
  'DE-HH': 'Hamburg',
  'DE-MV': 'Mecklenburg-Vorpommern',
  'DE-NW': 'Nordrhein-Westfalen',
  'DE-RP': 'Rheinland-Pfalz',
  'DE-SH': 'Schleswig-Holstein',
  'DE-SL': 'Saarland',
  'DE-SN': 'Sachsen',
  'DE-ST': 'Sachsen-Anhalt',
  'DE-TH': 'Thueringen',
}

const readJson = <T>(path: string): T => JSON.parse(readFileSync(path, 'utf8')) as T
const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T
const jurisdictionSlug = (jurisdiction: string) => jurisdiction.toLowerCase()

const isSekIYearStructure = (node: CompositionNode) =>
  node.kind === 'structure'
  && (
    /-j(?:5|6|7|8|9|10)$/u.test(node.id)
    || /(?:Phase J|Jahrgangsstufe )(?:5|6|7|8|9|10)\b/u.test(node.label)
  )

const findStructureByIdSuffix = (nodes: CompositionNode[], suffix: string): CompositionNode | null => {
  for (const node of nodes) {
    if (node.kind !== 'structure') continue
    if (node.id.endsWith(suffix)) return node
    const match = findStructureByIdSuffix(node.children, suffix)
    if (match) return match
  }
  return null
}

const createMemoryStructure = (sourceRoot: CompositionNode | undefined, jurisdiction: string): CompositionNode => {
  const sourceMemory = sourceRoot?.kind === 'structure'
    ? findStructureByIdSuffix(sourceRoot.children, '-memory')
    : null
  return {
    kind: 'structure',
    id: `${jurisdictionSlug(jurisdiction)}-gym-politics-economics-seki-memory`,
    label: 'Lernkarten - Politik und Wirtschaft',
    children: clone(sourceMemory?.children ?? [
      {
        kind: 'goalEntry',
        goalId: 'mem_de_gym_powi_democracy_law',
        displayLabel: 'Lernkarten - Demokratie, Rechtsstaat und Recht',
      },
      {
        kind: 'goalEntry',
        goalId: 'mem_de_gym_powi_participation_media',
        displayLabel: 'Lernkarten - Beteiligung, Parteien und Medien',
      },
      {
        kind: 'goalEntry',
        goalId: 'mem_de_gym_powi_market_social_policy',
        displayLabel: 'Lernkarten - Markt, Geld und Sozialstaat',
      },
      {
        kind: 'goalEntry',
        goalId: 'mem_de_gym_powi_global_security',
        displayLabel: 'Lernkarten - Internationale Politik und Global Governance',
      },
      {
        kind: 'goalEntry',
        goalId: 'mem_de_gym_powi_europe_integration',
        displayLabel: 'Lernkarten - Europäische Union und Integration',
      },
    ]),
  }
}

const createRoot = (jurisdiction: string, children: CompositionNode[], sourceRoot?: CompositionNode): CompositionNode => ({
  kind: 'structure',
  id: `${jurisdictionSlug(jurisdiction)}-powi-seki-root`,
  label: `Politik und Wirtschaft ${jurisdictionNames[jurisdiction] ?? jurisdiction}`,
  children: [
    {
      kind: 'goalEntry',
      goalId: motivationGoalId,
      displayLabel: 'Warum Politik und Wirtschaft?',
    },
    createMemoryStructure(sourceRoot, jurisdiction),
    {
      kind: 'structure',
      id: `${jurisdictionSlug(jurisdiction)}-powi-seki`,
      label: 'Sekundarstufe I',
      children,
    },
  ],
})

const createView = (jurisdiction: string, root: CompositionNode): CompositionView => ({
  viewId: `${jurisdictionSlug(jurisdiction)}-gym-politics-economics-seki`,
  landscapeId,
  scope: {
    schoolForm: 'Gymnasium',
    jurisdiction,
    stage: 'SekI',
  },
  rootNodes: [root],
})

const canonicalLandscape = readJson<LearningLandscape>(canonicalLandscapePath)
const goalById = new Map(canonicalLandscape.goals.map((goal) => [goal.id, goal]))

const createFromCrossStage = (jurisdiction: string): CompositionView => {
  const sourcePath = resolve(
    compositionViewDir,
    `${jurisdictionSlug(jurisdiction)}-gym-politics-economics-crossstage.view.json`,
  )
  const source = readJson<CompositionView>(sourcePath)
  const sourceRoot = source.rootNodes[0]
  if (!sourceRoot || sourceRoot.kind !== 'structure') {
    throw new Error(`${source.viewId} has no structure root`)
  }

  const yearStructures = sourceRoot.children.filter(isSekIYearStructure)
  const sekiChildren = yearStructures.length > 0
    ? clone(yearStructures)
    : clone((findStructureByIdSuffix(sourceRoot.children, '-weitere-ziele')?.children ?? []).filter((node) => {
      if (node.kind !== 'goalEntry') return false
      const tags = goalById.get(node.goalId)?.tags ?? []
      return tags.includes('SekI') && tags.includes(jurisdiction)
    }))

  if (sekiChildren.length === 0) {
    throw new Error(`No Sek-I children found for ${jurisdiction}`)
  }

  return createView(jurisdiction, createRoot(jurisdiction, sekiChildren, sourceRoot))
}

const createHessenView = (): CompositionView => createView(
  'DE-HE',
  createRoot('DE-HE', hessenSekIClusters.map((goalId) => ({ kind: 'canonicalSubtree', goalId }))),
)

const generatedViews = new Map<string, CompositionView>()
for (const jurisdiction of policyJurisdictions) {
  const view = jurisdiction === 'DE-HE' ? createHessenView() : createFromCrossStage(jurisdiction)
  generatedViews.set(`${view.viewId}.view.json`, view)
}

let differences = 0
for (const [fileName, view] of generatedViews) {
  const targetPath = resolve(compositionViewDir, fileName)
  const nextContent = `${JSON.stringify(view, null, 2)}\n`
  const currentContent = existsSync(targetPath) ? readFileSync(targetPath, 'utf8') : ''
  if (currentContent !== nextContent) {
    differences += 1
    if (shouldWrite) {
      writeFileSync(targetPath, nextContent)
      console.log(`wrote ${fileName}`)
    } else {
      console.log(`pending ${fileName}`)
    }
  }
}

if (shouldCheck && differences > 0) {
  console.error(`${differences} Politik/Wirtschaft Sek-I composition view file(s) are not up to date.`)
  process.exit(1)
}

console.log(`Politik/Wirtschaft Sek-I composition views: ${generatedViews.size} checked, ${differences} changed`)
