import { execFileSync } from 'node:child_process'
import { createReadStream, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, isAbsolute, relative, resolve, sep } from 'node:path'
import { createInterface } from 'node:readline'
import { fileURLToPath } from 'node:url'

type CliOptions = {
  rdfPath: string
  outDir: string
  focus: string
  depth: number
  limit: number
  help: boolean
}

type TripleObject =
  | { kind: 'iri'; value: string }
  | { kind: 'literal'; value: string; datatype?: string; lang?: string }

type ParsedTriple = {
  subject: string
  predicate: string
  object: TripleObject
}

type Edge = {
  source: string
  predicate: 'contains' | 'requires'
  target: string
}

type SourceSample = {
  resource: string
  label?: string
  sourceText?: string
  sourceRef?: string
  sourceDocumentUrl?: string
  sourceDocumentTitle?: string
  topicCode?: string
}

const scriptDir = dirname(fileURLToPath(import.meta.url))
const repoRoot = resolve(scriptDir, '../..')

const DEFAULT_BASE = 'tmp/roundtrip/mem-fwu/skillpilot-de-gymnasium-mathematik-v0.1.0'
const DEFAULT_RDF = `${DEFAULT_BASE}/slim/bundle.nt`
const DEFAULT_OUT_DIR = `${DEFAULT_BASE}/visualizations`

const RDF = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#'
const RDFS = 'http://www.w3.org/2000/01/rdf-schema#'
const DCTERMS = 'http://purl.org/dc/terms/'
const LP = 'https://w3id.org/lehrplan/ontology/'
const SP = 'https://skillpilot.de/ns/roundtrip#'

const PREDICATES = {
  type: `${RDF}type`,
  label: `${RDFS}label`,
  description: `${DCTERMS}description`,
  containsGoal: `${SP}containsGoal`,
  legacyDidacticRequires: `${SP}didacticRequires`,
  hasReference: `${LP}LP_0030071`,
  refersTo: `${LP}LP_0030072`,
  sourceText: `${SP}sourceText`,
  sourceRef: `${SP}sourceRef`,
  sourceDocumentUrl: `${SP}sourceDocumentUrl`,
  sourceDocumentTitle: `${SP}sourceDocumentTitle`,
  topicCode: `${SP}topicCode`,
}

const TYPES = {
  learningGoal: `${SP}LearningGoal`,
  clusterGoal: `${SP}ClusterGoal`,
  atomicGoal: `${SP}AtomicGoal`,
  sourceGoalReference: `${SP}SourceGoalReference`,
  didacticPrerequisite: `${LP}LP_0000554`,
}

const usage = () => `Usage:
  npm run roundtrip:mem-fwu:visualize -- [--focus "Lineare Funktionen"]

Options:
  --rdf <path>       RDF N-Triples file. Default: ${DEFAULT_RDF}
  --out-dir <path>   Output directory. Default: ${DEFAULT_OUT_DIR}
  --focus <text>     Goal id or label fragment. Default: Lineare Funktionen
  --depth <number>   Neighborhood depth. Default: 2
  --limit <number>   Maximum graph nodes. Default: 55
  --help
`

const isInsideRepo = (absolutePath: string) => {
  const relativePath = relative(repoRoot, absolutePath)
  return relativePath === '' || (!relativePath.startsWith('..') && !isAbsolute(relativePath))
}

const resolveInsideRepo = (inputPath: string) => {
  const candidates = [resolve(repoRoot, inputPath), resolve(process.cwd(), inputPath)]
  const absolutePath = candidates.find(isInsideRepo)
  if (!absolutePath) {
    throw new Error(`Path must be inside the repository: ${inputPath}`)
  }
  return absolutePath
}

const toPosixPath = (path: string) => path.split(sep).join('/')

const repoRelative = (absolutePath: string) => {
  const relativePath = toPosixPath(relative(repoRoot, absolutePath))
  if (relativePath === '' || relativePath.startsWith('..')) {
    throw new Error(`Path is outside the repository: ${absolutePath}`)
  }
  return relativePath
}

const parseArgs = (argv: string[]): CliOptions => {
  const options: CliOptions = {
    rdfPath: resolveInsideRepo(DEFAULT_RDF),
    outDir: resolveInsideRepo(DEFAULT_OUT_DIR),
    focus: 'Lineare Funktionen',
    depth: 2,
    limit: 55,
    help: false,
  }

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index]
    const nextValue = argv[index + 1]
    const readValue = (name: string) => {
      if (!nextValue || nextValue.startsWith('--')) {
        throw new Error(`Missing value for ${name}`)
      }
      index += 1
      return nextValue
    }

    if (arg === '--help' || arg === '-h') {
      options.help = true
      continue
    }
    if (arg === '--rdf') {
      options.rdfPath = resolveInsideRepo(readValue(arg))
      continue
    }
    if (arg === '--out-dir') {
      options.outDir = resolveInsideRepo(readValue(arg))
      continue
    }
    if (arg === '--focus') {
      options.focus = readValue(arg)
      continue
    }
    if (arg === '--depth') {
      options.depth = Number(readValue(arg))
      continue
    }
    if (arg === '--limit') {
      options.limit = Number(readValue(arg))
      continue
    }
    throw new Error(`Unknown argument: ${arg}`)
  }

  if (!Number.isInteger(options.depth) || options.depth < 1 || options.depth > 5) {
    throw new Error('--depth must be an integer between 1 and 5.')
  }
  if (!Number.isInteger(options.limit) || options.limit < 5 || options.limit > 300) {
    throw new Error('--limit must be an integer between 5 and 300.')
  }

  return options
}

const unescapeLiteral = (value: string) => {
  let result = ''
  for (let index = 0; index < value.length; index += 1) {
    const char = value[index]
    if (char !== '\\') {
      result += char
      continue
    }
    const next = value[index + 1]
    index += 1
    if (next === 'n') result += '\n'
    else if (next === 'r') result += '\r'
    else if (next === 't') result += '\t'
    else if (next === 'u') {
      const hex = value.slice(index + 1, index + 5)
      result += String.fromCharCode(Number.parseInt(hex, 16))
      index += 4
    } else if (next === 'U') {
      const hex = value.slice(index + 1, index + 9)
      result += String.fromCodePoint(Number.parseInt(hex, 16))
      index += 8
    } else if (next === '"' || next === '\\') result += next
    else result += next ?? ''
  }
  return result
}

const parseObject = (input: string): TripleObject => {
  if (input.startsWith('<')) {
    const end = input.indexOf('>')
    if (end < 0) {
      throw new Error(`Invalid IRI object: ${input}`)
    }
    return { kind: 'iri', value: input.slice(1, end) }
  }
  if (!input.startsWith('"')) {
    throw new Error(`Invalid literal object: ${input}`)
  }
  let escaped = false
  let end = -1
  for (let index = 1; index < input.length; index += 1) {
    const char = input[index]
    if (escaped) {
      escaped = false
      continue
    }
    if (char === '\\') {
      escaped = true
      continue
    }
    if (char === '"') {
      end = index
      break
    }
  }
  if (end < 0) {
    throw new Error(`Unterminated literal object: ${input}`)
  }
  const suffix = input.slice(end + 1)
  const datatypeMatch = suffix.match(/^\^\^<([^>]+)>/u)
  const langMatch = suffix.match(/^@([a-zA-Z-]+)/u)
  return {
    kind: 'literal',
    value: unescapeLiteral(input.slice(1, end)),
    datatype: datatypeMatch?.[1],
    lang: langMatch?.[1],
  }
}

const parseTriple = (line: string): ParsedTriple | null => {
  const trimmed = line.trim()
  if (!trimmed || trimmed.startsWith('#')) {
    return null
  }
  const match = trimmed.match(/^<([^>]*)> <([^>]*)> (.*) \.$/u)
  if (!match) {
    throw new Error(`Invalid N-Triples line: ${trimmed.slice(0, 200)}`)
  }
  return {
    subject: match[1],
    predicate: match[2],
    object: parseObject(match[3]),
  }
}

const literalValue = (object: TripleObject) => object.kind === 'literal' ? object.value : null

const iriValue = (object: TripleObject) => object.kind === 'iri' ? object.value : null

const htmlEscape = (value: string) => value
  .replace(/&/gu, '&amp;')
  .replace(/</gu, '&lt;')
  .replace(/>/gu, '&gt;')
  .replace(/"/gu, '&quot;')
  .replace(/'/gu, '&#39;')

const dotEscape = (value: string) => value
  .replace(/\\/gu, '\\\\')
  .replace(/"/gu, '\\"')
  .replace(/\n/gu, '\\n')

const compact = (value: string | undefined, max = 90) => {
  if (!value) {
    return ''
  }
  const normalized = value.replace(/\s+/gu, ' ').trim()
  return normalized.length > max ? `${normalized.slice(0, max - 1)}...` : normalized
}

const shortId = (resource: string) => decodeURIComponent(resource.split('/').pop() ?? resource)

const edgeLabel = (predicate: Edge['predicate']) => predicate

const readSemanticGraph = async (rdfPath: string) => {
  const labels = new Map<string, string>()
  const descriptions = new Map<string, string>()
  const types = new Map<string, Set<string>>()
  const edges: Edge[] = []
  const referenceSources = new Map<string, string[]>()
  const referenceTargets = new Map<string, string[]>()
  const sourceSamples = new Map<string, SourceSample>()

  const addType = (resource: string, type: string) => {
    const values = types.get(resource) ?? new Set<string>()
    values.add(type)
    types.set(resource, values)
  }

  const ensureSourceSample = (resource: string) => {
    const existing = sourceSamples.get(resource)
    if (existing) {
      return existing
    }
    const sample: SourceSample = { resource }
    sourceSamples.set(resource, sample)
    return sample
  }

  const reader = createInterface({
    input: createReadStream(rdfPath, { encoding: 'utf8' }),
    crlfDelay: Infinity,
  })

  for await (const line of reader) {
    if (line.includes(`${SP}lineText`)) {
      continue
    }
    const triple = parseTriple(line)
    if (!triple) {
      continue
    }
    if (triple.predicate === PREDICATES.type) {
      const type = iriValue(triple.object)
      if (type) {
        addType(triple.subject, type)
      }
      continue
    }
    if (triple.predicate === PREDICATES.label) {
      const label = literalValue(triple.object)
      if (label) {
        labels.set(triple.subject, label)
        const sample = sourceSamples.get(triple.subject)
        if (sample) sample.label = label
      }
      continue
    }
    if (triple.predicate === PREDICATES.description) {
      const description = literalValue(triple.object)
      if (description) {
        descriptions.set(triple.subject, description)
      }
      continue
    }
    // Visualize the authored direct graph only. FWU's BFO has-part relation is
    // transitive and may contain reasoner-materialized indirect descendants.
    if (triple.predicate === PREDICATES.containsGoal) {
      const target = iriValue(triple.object)
      if (target) {
        edges.push({ source: triple.subject, predicate: 'contains', target })
      }
      continue
    }
    if (triple.predicate === PREDICATES.legacyDidacticRequires) {
      const target = iriValue(triple.object)
      if (target) edges.push({ source: triple.subject, predicate: 'requires', target })
      continue
    }
    if (triple.predicate === PREDICATES.hasReference) {
      const reference = iriValue(triple.object)
      if (reference) referenceSources.set(reference, [...(referenceSources.get(reference) ?? []), triple.subject])
      continue
    }
    if (triple.predicate === PREDICATES.refersTo) {
      const target = iriValue(triple.object)
      if (target) referenceTargets.set(triple.subject, [...(referenceTargets.get(triple.subject) ?? []), target])
      continue
    }
    if (
      triple.predicate === PREDICATES.sourceText
      || triple.predicate === PREDICATES.sourceRef
      || triple.predicate === PREDICATES.sourceDocumentUrl
      || triple.predicate === PREDICATES.sourceDocumentTitle
      || triple.predicate === PREDICATES.topicCode
    ) {
      const value = literalValue(triple.object)
      if (!value) {
        continue
      }
      const sample = ensureSourceSample(triple.subject)
      if (triple.predicate === PREDICATES.sourceText) sample.sourceText = value
      if (triple.predicate === PREDICATES.sourceRef) sample.sourceRef = value
      if (triple.predicate === PREDICATES.sourceDocumentUrl) sample.sourceDocumentUrl = value
      if (triple.predicate === PREDICATES.sourceDocumentTitle) sample.sourceDocumentTitle = value
      if (triple.predicate === PREDICATES.topicCode) sample.topicCode = value
    }
  }

  for (const [reference, referenceTypes] of types) {
    if (!referenceTypes.has(TYPES.didacticPrerequisite)) continue
    for (const source of referenceSources.get(reference) ?? []) {
      for (const target of referenceTargets.get(reference) ?? []) {
        edges.push({ source, predicate: 'requires', target })
      }
    }
  }

  const learningGoals = new Set([...types.entries()]
    .filter(([, values]) => values.has(TYPES.learningGoal))
    .map(([resource]) => resource))
  const normalizedEdges = edges
    .filter((edge) => learningGoals.has(edge.source) && learningGoals.has(edge.target))
    .filter((edge, index, allEdges) => allEdges.findIndex((candidate) => (
      candidate.source === edge.source
      && candidate.target === edge.target
      && candidate.predicate === edge.predicate
    )) === index)

  return { labels, descriptions, types, edges: normalizedEdges, sourceSamples }
}

const hasType = (types: Map<string, Set<string>>, resource: string, type: string) => types.get(resource)?.has(type) ?? false

const findFocus = (params: {
  focus: string
  labels: Map<string, string>
  types: Map<string, Set<string>>
  edges: Edge[]
}) => {
  const focus = params.focus.toLocaleLowerCase('de')
  const learningGoals = [...params.types.entries()]
    .filter(([, values]) => values.has(TYPES.learningGoal))
    .map(([resource]) => resource)

  return learningGoals.find((resource) => resource.toLocaleLowerCase('de').includes(focus))
    ?? learningGoals.find((resource) => (params.labels.get(resource) ?? '').toLocaleLowerCase('de').includes(focus))
    ?? params.edges.find((edge) => edge.predicate === 'requires')?.source
    ?? learningGoals[0]
}

const selectNeighborhood = (params: {
  focusResource: string
  edges: Edge[]
  depth: number
  limit: number
}) => {
  const selected = new Set<string>([params.focusResource])
  const queue: Array<{ resource: string; depth: number }> = [{ resource: params.focusResource, depth: 0 }]
  const relevantEdges: Edge[] = []

  while (queue.length > 0 && selected.size < params.limit) {
    const current = queue.shift()
    if (!current) {
      break
    }
    params.edges.forEach((edge) => {
      const adjacent = edge.source === current.resource
        ? edge.target
        : edge.target === current.resource
          ? edge.source
          : null
      if (!adjacent) {
        return
      }
      relevantEdges.push(edge)
      if (current.depth >= params.depth || selected.has(adjacent) || selected.size >= params.limit) {
        return
      }
      selected.add(adjacent)
      queue.push({ resource: adjacent, depth: current.depth + 1 })
    })
  }

  return {
    nodes: selected,
    edges: relevantEdges.filter((edge, index, allEdges) => (
      selected.has(edge.source)
      && selected.has(edge.target)
      && allEdges.findIndex((candidate) => (
        candidate.source === edge.source
        && candidate.target === edge.target
        && candidate.predicate === edge.predicate
      )) === index
    )),
  }
}

const buildDot = (params: {
  focusResource: string
  nodes: Set<string>
  edges: Edge[]
  labels: Map<string, string>
  types: Map<string, Set<string>>
}) => {
  const nodeLines = [...params.nodes]
    .sort((left, right) => (params.labels.get(left) ?? left).localeCompare(params.labels.get(right) ?? right, 'de'))
    .map((resource) => {
      const label = compact(params.labels.get(resource) ?? shortId(resource), 42)
      const isFocus = resource === params.focusResource
      const isCluster = hasType(params.types, resource, TYPES.clusterGoal)
      const fill = isFocus ? '#fff1a8' : isCluster ? '#d8ecff' : '#e9f7ef'
      const shape = isCluster ? 'box' : 'ellipse'
      return `  "${dotEscape(resource)}" [label="${dotEscape(label)}", shape=${shape}, style="filled,rounded", fillcolor="${fill}", color="#2f3a45"];`
    })

  const edgeLines = params.edges.map((edge) => {
    const isRequires = edge.predicate === 'requires'
    const color = isRequires ? '#b54708' : '#1d4ed8'
    const style = isRequires ? 'dashed' : 'solid'
    return `  "${dotEscape(edge.source)}" -> "${dotEscape(edge.target)}" [label="${edgeLabel(edge.predicate)}", color="${color}", fontcolor="${color}", style="${style}"];`
  })

  return `digraph MemFwuSubgraph {
  graph [rankdir=LR, bgcolor="transparent", margin=0.15, nodesep=0.5, ranksep=0.7];
  node [fontname="Arial", fontsize=10, margin=0.08];
  edge [fontname="Arial", fontsize=9, arrowsize=0.7];
${nodeLines.join('\n')}
${edgeLines.join('\n')}
}
`
}

const renderSourceTable = (sourceSamples: Map<string, SourceSample>) => {
  const rows = [...sourceSamples.values()]
    .filter((sample) => sample.sourceText && sample.sourceRef)
    .slice(0, 30)
    .map((sample) => `<tr>
      <td><code>${htmlEscape(shortId(sample.resource))}</code></td>
      <td>${htmlEscape(sample.topicCode ?? '')}</td>
      <td>${htmlEscape(compact(sample.sourceText, 140))}</td>
      <td>${htmlEscape(compact(sample.sourceRef, 150))}</td>
      <td>${sample.sourceDocumentUrl ? `<a href="${htmlEscape(sample.sourceDocumentUrl)}">${htmlEscape(compact(sample.sourceDocumentTitle ?? sample.sourceDocumentUrl, 90))}</a>` : ''}</td>
    </tr>`)
    .join('\n')

  return `<table>
    <thead><tr><th>Source goal</th><th>Topic</th><th>Official span</th><th>Locator</th><th>Document</th></tr></thead>
    <tbody>${rows}</tbody>
  </table>`
}

const renderHtml = (params: {
  focusResource: string
  svg: string
  nodes: Set<string>
  edges: Edge[]
  labels: Map<string, string>
  descriptions: Map<string, string>
  sourceSamples: Map<string, SourceSample>
  rdfPath: string
  dotPath: string
  svgPath: string
}) => {
  const focusLabel = params.labels.get(params.focusResource) ?? shortId(params.focusResource)
  const nodeRows = [...params.nodes]
    .sort((left, right) => (params.labels.get(left) ?? left).localeCompare(params.labels.get(right) ?? right, 'de'))
    .map((resource) => `<tr>
      <td>${resource === params.focusResource ? '<strong>focus</strong>' : ''}</td>
      <td>${htmlEscape(params.labels.get(resource) ?? shortId(resource))}</td>
      <td><code>${htmlEscape(shortId(resource))}</code></td>
      <td>${htmlEscape(compact(params.descriptions.get(resource), 170))}</td>
    </tr>`)
    .join('\n')

  return `<!doctype html>
<html lang="de">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>SkillPilot MEM/FWU RDF Subgraph</title>
  <style>
    body { margin: 0; font-family: Arial, sans-serif; color: #18212f; background: #f6f7f9; }
    header { padding: 24px 28px 16px; background: #ffffff; border-bottom: 1px solid #d9dee7; }
    main { padding: 20px 28px 36px; }
    h1 { font-size: 24px; margin: 0 0 8px; }
    h2 { font-size: 18px; margin: 26px 0 10px; }
    p { max-width: 980px; line-height: 1.45; }
    code { font-size: 12px; background: #eef1f5; padding: 2px 4px; border-radius: 4px; }
    .meta { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 12px; }
    .pill { background: #eef4ff; border: 1px solid #c7dbff; border-radius: 999px; padding: 6px 10px; font-size: 13px; }
    .graph { overflow: auto; background: #ffffff; border: 1px solid #d9dee7; border-radius: 8px; padding: 18px; }
    .graph svg { max-width: none; }
    table { border-collapse: collapse; width: 100%; background: #ffffff; border: 1px solid #d9dee7; }
    th, td { border-bottom: 1px solid #e4e8ef; padding: 8px 10px; vertical-align: top; font-size: 13px; text-align: left; }
    th { background: #eef1f5; font-weight: 700; }
    pre { overflow: auto; background: #18212f; color: #f5f7fb; padding: 14px; border-radius: 8px; }
  </style>
</head>
<body>
  <header>
    <h1>SkillPilot MEM/FWU RDF Subgraph</h1>
    <p>Fokussierter Ausschnitt aus der semantischen RDF-Spur. Die verlustfreie Paket-Textspur wird fuer diese Visualisierung ignoriert.</p>
    <div class="meta">
      <div class="pill">Focus: ${htmlEscape(focusLabel)}</div>
      <div class="pill">Nodes: ${params.nodes.size}</div>
      <div class="pill">Edges: ${params.edges.length}</div>
      <div class="pill">RDF: ${htmlEscape(repoRelative(params.rdfPath))}</div>
    </div>
  </header>
  <main>
    <h2>Goal Graph</h2>
    <p><strong>Blau/solid</strong> = <code>contains</code>, <strong>orange/dashed</strong> = <code>requires</code>. Boxen sind Cluster-Ziele, Ellipsen atomare Ziele.</p>
    <div class="graph">${params.svg}</div>

    <h2>Visible Nodes</h2>
    <table>
      <thead><tr><th></th><th>Label</th><th>SkillPilot ID</th><th>Description</th></tr></thead>
      <tbody>${nodeRows}</tbody>
    </table>

    <h2>Source Spans In RDF</h2>
    <p>Beispielhafte offizielle Source-Spans aus derselben RDF-Datei. Diese Tabelle zeigt, dass die Source-Verfolgung nicht nur als abstrakte ID vorliegt.</p>
    ${renderSourceTable(params.sourceSamples)}

    <h2>Same Idea As SPARQL</h2>
    <pre>SELECT ?goal ?title ?requiredGoal ?requiredTitle
WHERE {
  ?goal &lt;${PREDICATES.hasReference}&gt; ?prerequisiteRef .
  ?prerequisiteRef a &lt;${TYPES.didacticPrerequisite}&gt; ;
                   &lt;${PREDICATES.refersTo}&gt; ?requiredGoal .
  OPTIONAL { ?goal &lt;${PREDICATES.label}&gt; ?title . }
  OPTIONAL { ?requiredGoal &lt;${PREDICATES.label}&gt; ?requiredTitle . }
}
LIMIT 100</pre>

    <h2>Generated Files</h2>
    <p>DOT: <code>${htmlEscape(repoRelative(params.dotPath))}</code><br />SVG: <code>${htmlEscape(repoRelative(params.svgPath))}</code></p>
  </main>
</body>
</html>
`
}

const run = async () => {
  const options = parseArgs(process.argv.slice(2))
  if (options.help) {
    process.stdout.write(usage())
    return
  }

  const graph = await readSemanticGraph(options.rdfPath)
  const focusResource = findFocus({
    focus: options.focus,
    labels: graph.labels,
    types: graph.types,
    edges: graph.edges,
  })
  if (!focusResource) {
    throw new Error(`No focus goal found for: ${options.focus}`)
  }

  const neighborhood = selectNeighborhood({
    focusResource,
    edges: graph.edges,
    depth: options.depth,
    limit: options.limit,
  })
  mkdirSync(options.outDir, { recursive: true })

  const dot = buildDot({
    focusResource,
    nodes: neighborhood.nodes,
    edges: neighborhood.edges,
    labels: graph.labels,
    types: graph.types,
  })
  const dotPath = resolve(options.outDir, 'goal-subgraph.dot')
  const svgPath = resolve(options.outDir, 'goal-subgraph.svg')
  const htmlPath = resolve(options.outDir, 'index.html')
  writeFileSync(dotPath, dot)
  execFileSync('dot', ['-Tsvg', dotPath, '-o', svgPath], { stdio: ['ignore', 'ignore', 'pipe'] })

  const html = renderHtml({
    focusResource,
    svg: readFileSync(svgPath, 'utf8'),
    nodes: neighborhood.nodes,
    edges: neighborhood.edges,
    labels: graph.labels,
    descriptions: graph.descriptions,
    sourceSamples: graph.sourceSamples,
    rdfPath: options.rdfPath,
    dotPath,
    svgPath,
  })
  writeFileSync(htmlPath, html)

  process.stdout.write(`Generated ${repoRelative(htmlPath)}\n`)
  process.stdout.write(`Focus: ${graph.labels.get(focusResource) ?? shortId(focusResource)}\n`)
  process.stdout.write(`Nodes: ${neighborhood.nodes.size}, edges: ${neighborhood.edges.length}\n`)
}

run().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error)
  process.stderr.write(`${message}\n`)
  process.exitCode = 1
})
