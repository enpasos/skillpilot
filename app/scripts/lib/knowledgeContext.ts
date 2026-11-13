// SPDX-License-Identifier: Apache-2.0
/**
 * Knowledge context of a learning goal: what a learner can be assumed to know
 * there (docs/concept/skill-graph/knowledge-context.md, AGENTS.md §2.5).
 *
 * The context is a deterministic projection of the canonical skill graph. It
 * stores nothing and reads no learner state. For an atomic goal g with the
 * normative prerequisite relation of Graph Definition §2.3 (inherit, expand to
 * atoms, close):
 *
 *   secured    the ordinary goals g requires directly or transitively
 *   builds on  the secured goals that no other secured goal requires
 *   leads to   the ordinary goals that require g directly and no other such goal
 *   not yet    the first ordinary goals of the same area outside the secured
 *              goals: those that require no other such goal
 *
 * Assessment, memory and orientation goals on a prerequisite path carry the
 * path but are not listed: they develop no subject matter of their own.
 *
 * The projection is exactly as good as the edges. It says what the graph
 * secures, not whether that suffices to learn the goal.
 */
import { UnitGraph, type AtomicGoalKind, type UnitGraphLandscape } from './learningUnitContracts'

export interface ContextLandscape extends UnitGraphLandscape { subject?: unknown; title?: unknown }

export interface ContextGoalRef { key: string; id: string; landscapeId: string; title: string }
/** Secured goals of one landscape that share their areas. */
export interface SecuredGroup { landscapeId: string; subject: string; areas: ContextGoalRef[]; goals: ContextGoalRef[] }
export interface KnowledgeContext {
  goal: ContextGoalRef & { description: string; kind: AtomicGoalKind }
  subject: string
  buildsOn: ContextGoalRef[]
  secured: SecuredGroup[]
  securedCount: number
  leadsTo: ContextGoalRef[]
  /** The areas of the goal: the clusters directly below the subject root, or a separate root. */
  areas: ContextGoalRef[]
  notYet: ContextGoalRef[]
}
export interface ContextSizeSummary {
  landscapeId: string
  subject: string
  ordinaryGoals: number
  withoutPrerequisite: number
  /** Median, 90th percentile and maximum per part, over the ordinary goals. */
  buildsOn: [number, number, number]
  secured: [number, number, number]
  leadsTo: [number, number, number]
  notYet: [number, number, number]
  /** Characters of the titles in the core rendering (builds on, leads to, not yet). */
  coreTitleCharacters: [number, number, number]
}

export class KnowledgeContextError extends Error {}

const byCodeUnit = (left: string, right: string): number => left < right ? -1 : left > right ? 1 : 0
const text = (value: unknown): string => typeof value === 'string' ? value.trim() : ''

export class KnowledgeContextIndex {
  readonly graph: UnitGraph
  private readonly subjects = new Map<string, string>()
  private readonly subjectRoots = new Map<string, string>()
  private readonly dependents = new Map<string, string[]>()
  private readonly securedMemo = new Map<string, string[]>()

  constructor(catalog: ContextLandscape[], graph: UnitGraph = new UnitGraph(catalog)) {
    this.graph = graph
    for (const landscape of catalog) {
      this.subjects.set(landscape.landscapeId, text(landscape.subject) || text(landscape.title) || landscape.landscapeId)
      // The subject root is the root with the most atomic descendants; ties resolve to the smaller key.
      const roots = graph.rootKeys(landscape.landscapeId)
      let best: string | undefined, bestSize = -1
      for (const root of roots) {
        const size = graph.atoms(root).length
        if (size > bestSize) { best = root; bestSize = size }
      }
      if (best) this.subjectRoots.set(landscape.landscapeId, best)
      for (const key of graph.atomicKeys(landscape.landscapeId)) {
        for (const required of graph.directAtomicRequires(key)) {
          const list = this.dependents.get(required)
          if (list) list.push(key)
          else this.dependents.set(required, [key])
        }
      }
    }
  }

  landscapeIds(): string[] { return [...this.subjects.keys()].sort(byCodeUnit) }
  subject(landscapeId: string): string { return this.subjects.get(landscapeId) ?? landscapeId }

  /** Resolves a goal ID or `landscapeId:goalId` to the key of an atomic goal. */
  resolveAtomicGoal(reference: string): string {
    let key: string | undefined
    if (this.graph.has(reference)) key = reference
    else {
      const matches = this.landscapeIds().map((landscapeId) => `${landscapeId}:${reference}`).filter((candidate) => this.graph.has(candidate))
      if (matches.length > 1) throw new KnowledgeContextError(`Goal ${reference} exists in ${matches.length} landscapes; use landscapeId:goalId`)
      key = matches[0]
    }
    if (!key) throw new KnowledgeContextError(`Unknown goal ${reference}`)
    if (!this.graph.isAtomic(key)) {
      throw new KnowledgeContextError(`Goal ${reference} is a cluster; a knowledge context exists for atomic goals only`)
    }
    return key
  }

  private isOrdinary(key: string): boolean { return this.graph.kind(key) === 'ordinary' }
  private ref(key: string): ContextGoalRef {
    const goal = this.graph.goal(key)
    return { key, id: goal.id, landscapeId: this.graph.landscapeId(key), title: text(goal.title) || goal.id }
  }
  private refs(keys: Iterable<string>): ContextGoalRef[] {
    return [...new Set(keys)].map((key) => this.ref(key))
      .sort((left, right) => byCodeUnit(left.title, right.title) || byCodeUnit(left.key, right.key))
  }

  /** The ordinary goals an atomic goal requires directly or transitively. */
  securedKeys(key: string): string[] {
    const known = this.securedMemo.get(key)
    if (known) return known
    const secured = [...this.graph.reach(key)].filter((candidate) => this.isOrdinary(candidate)).sort(byCodeUnit)
    this.securedMemo.set(key, secured)
    return secured
  }

  /** Keys that no other key of the set requires. */
  private maximal(keys: string[]): string[] {
    return keys.filter((key) => !keys.some((other) => other !== key && this.graph.reach(other).has(key)))
  }
  /** Keys that require no other key of the set. */
  private minimal(keys: string[]): string[] {
    const set = new Set(keys)
    return keys.filter((key) => ![...this.graph.reach(key)].some((required) => required !== key && set.has(required)))
  }

  /**
   * Areas of a goal: its ancestors directly below the subject root, and any
   * separate root above it. A goal directly below the subject root has none.
   */
  areaKeys(key: string): string[] {
    const landscapeId = this.graph.landscapeId(key)
    const subjectRoot = this.subjectRoots.get(landscapeId)
    const local = (candidate: string): boolean => this.graph.landscapeId(candidate) === landscapeId
    // Only the goal's own landscape counts: an overview landscape that contains the subject roots is no area.
    return this.graph.ancestorKeys(key).filter((ancestor) => {
      if (!local(ancestor) || ancestor === subjectRoot) return false
      const parents = this.graph.parentKeys(ancestor).filter(local)
      return parents.length === 0 || (subjectRoot !== undefined && parents.includes(subjectRoot))
    })
  }

  context(reference: string): KnowledgeContext {
    const key = this.resolveAtomicGoal(reference)
    const goal = this.graph.goal(key)
    const securedKeys = this.securedKeys(key)
    const secured = new Set(securedKeys)
    const areas = this.areaKeys(key)

    const dependents = (this.dependents.get(key) ?? []).filter((dependent) => this.isOrdinary(dependent))
    const neighbours = new Set<string>()
    for (const area of areas) {
      for (const atom of this.graph.atoms(area)) {
        if (atom !== key && this.isOrdinary(atom) && !secured.has(atom)) neighbours.add(atom)
      }
    }

    const groups = new Map<string, SecuredGroup>()
    for (const securedKey of securedKeys) {
      const landscapeId = this.graph.landscapeId(securedKey)
      const areaRefs = this.refs(this.areaKeys(securedKey))
      const groupKey = `${landscapeId}|${areaRefs.map((area) => area.key).join(',')}`
      const group = groups.get(groupKey)
        ?? { landscapeId, subject: this.subject(landscapeId), areas: areaRefs, goals: [] }
      group.goals.push(this.ref(securedKey))
      groups.set(groupKey, group)
    }
    const areaLabel = (group: SecuredGroup): string => group.areas.map((area) => area.title).join(' / ')
    const securedGroups = [...groups.values()]
      .map((group) => ({ ...group, goals: this.refs(group.goals.map((entry) => entry.key)) }))
      .sort((left, right) => byCodeUnit(left.subject, right.subject) || byCodeUnit(areaLabel(left), areaLabel(right))
        || byCodeUnit(left.goals[0].key, right.goals[0].key))

    return {
      goal: { ...this.ref(key), description: text(goal.description), kind: this.graph.kind(key) },
      subject: this.subject(this.graph.landscapeId(key)),
      buildsOn: this.refs(this.maximal(securedKeys)),
      secured: securedGroups,
      securedCount: securedKeys.length,
      leadsTo: this.refs(this.minimal(dependents)),
      areas: this.refs(areas),
      notYet: this.refs(this.minimal([...neighbours].sort(byCodeUnit))),
    }
  }

  /** Sizes of the contexts of the ordinary goals of one landscape. */
  summarize(landscapeId: string): ContextSizeSummary {
    const keys = this.graph.atomicKeys(landscapeId).filter((key) => this.isOrdinary(key))
    const contexts = keys.map((key) => this.context(key))
    const stats = (values: number[]): [number, number, number] => {
      if (values.length === 0) return [0, 0, 0]
      const ordered = [...values].sort((left, right) => left - right)
      const at = (share: number): number => ordered[Math.min(ordered.length - 1, Math.floor(share * ordered.length))]
      return [at(0.5), at(0.9), ordered[ordered.length - 1]]
    }
    const characters = (refs: ContextGoalRef[]): number => refs.reduce((sum, entry) => sum + entry.title.length, 0)
    return {
      landscapeId,
      subject: this.subject(landscapeId),
      ordinaryGoals: keys.length,
      withoutPrerequisite: contexts.filter((context) => context.securedCount === 0).length,
      buildsOn: stats(contexts.map((context) => context.buildsOn.length)),
      secured: stats(contexts.map((context) => context.securedCount)),
      leadsTo: stats(contexts.map((context) => context.leadsTo.length)),
      notYet: stats(contexts.map((context) => context.notYet.length)),
      coreTitleCharacters: stats(contexts.map((context) =>
        characters(context.buildsOn) + characters(context.leadsTo) + characters(context.notYet))),
    }
  }
}

export type ContextForm = 'core' | 'full'
export type ContextLanguage = 'de' | 'en'

const LABELS = {
  de: {
    heading: 'Wissenskontext',
    kinds: { ordinary: 'Lernziel', assessment: 'Prüfung', memory: 'Lernkartenziel', orientation: 'Orientierungsziel' },
    subject: 'Fach',
    description: 'Beschreibung',
    buildsOn: 'Baut auf',
    secured: 'Gesichert',
    leadsTo: 'Darauf baut auf',
    notYet: 'Noch nicht gesichert',
    area: 'im Bereich',
    none: 'keine',
    noArea: 'ohne Bereich',
    rule: 'Regel: Was ein Ziel des Katalogs erarbeitet, darf nur benutzt werden, wenn dieses Ziel gesichert ist. '
      + 'Was kein Ziel des Katalogs erarbeitet, gilt als Grundwissen und wird im Review beurteilt.',
    develops: 'Was dieses Ziel selbst erarbeitet, ist Gegenstand der Arbeit.',
    developsNothing: 'Dieses Ziel erarbeitet nichts Neues; sein Inhalt darf die gesicherten Ziele benutzen.',
    quote: (value: string): string => `„${value}“`,
  },
  en: {
    heading: 'Knowledge context',
    kinds: { ordinary: 'learning goal', assessment: 'assessment', memory: 'memory goal', orientation: 'orientation goal' },
    subject: 'Subject',
    description: 'Description',
    buildsOn: 'Builds on',
    secured: 'Secured',
    leadsTo: 'Leads to',
    notYet: 'Not yet secured',
    area: 'in the area',
    none: 'none',
    noArea: 'without area',
    rule: 'Rule: what some goal of the catalog develops may be used only if that goal is secured. '
      + 'What no goal of the catalog develops counts as baseline knowledge and is judged by review.',
    develops: 'What this goal itself develops is the subject of the work.',
    developsNothing: 'This goal develops nothing new; its content may use the secured goals.',
    quote: (value: string): string => `"${value}"`,
  },
} as const

/**
 * Renders a context as plain Markdown. The core form lists goal, builds on,
 * leads to and not yet; the full form adds the secured goals. Goal titles stay
 * in the language of the catalog.
 */
export function renderKnowledgeContext(
  context: KnowledgeContext,
  options: { form?: ContextForm; language?: ContextLanguage } = {},
): string {
  const labels = LABELS[options.language ?? 'de']
  const list = (heading: string, refs: ContextGoalRef[]): string[] => refs.length === 0
    ? [`${heading}: ${labels.none}`]
    : [`${heading} (${refs.length}):`, ...refs.map((entry) => `- ${entry.title}`)]
  const areaTitles = context.areas.map((area) => labels.quote(area.title)).join(', ')
  const lines = [
    `${labels.heading}: ${context.goal.title} (${labels.kinds[context.goal.kind]}, ${context.goal.id})`,
    `${labels.subject}: ${context.subject}`,
    ...(context.goal.description ? [`${labels.description}: ${context.goal.description}`] : []),
    '',
    ...list(labels.buildsOn, context.buildsOn),
    '',
    ...list(labels.leadsTo, context.leadsTo),
    '',
    ...list(`${labels.notYet}${areaTitles ? ` ${labels.area} ${areaTitles}` : ''}`, context.notYet),
  ]
  if ((options.form ?? 'core') === 'full') {
    lines.push('', context.securedCount === 0 ? `${labels.secured}: ${labels.none}` : `${labels.secured} (${context.securedCount}):`)
    for (const group of context.secured) {
      const area = group.areas.map((entry) => entry.title).join(' / ') || labels.noArea
      lines.push(`${group.subject} – ${area}:`, ...group.goals.map((entry) => `- ${entry.title}`))
    }
  }
  lines.push('', labels.rule, context.goal.kind === 'ordinary' ? labels.develops : labels.developsNothing)
  return `${lines.join('\n')}\n`
}
