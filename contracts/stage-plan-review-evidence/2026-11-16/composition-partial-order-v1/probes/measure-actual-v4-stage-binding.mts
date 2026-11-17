import { isExactSourceExaminationCollection, isCanonicalPhysicsThematicBoard } from './measurement-board-semantics-v4.ts'
// Read-only baseline of the learner map below "Physik · Sekundarstufe II".
// Uses the product projection (createLearnerUnitMapCache) and the product
// subject filter (filterLearnerUnitMapToSubjects) on views exported by the
// backend's CompositionViewService. Writes only into its own directory.
import assert from 'node:assert/strict'
import { readFileSync, readdirSync, writeFileSync, mkdirSync } from 'node:fs'
import { resolve } from 'node:path'
import { createHash } from 'node:crypto'
import { prepareLandscapeEntries } from '/home/enpasos/projects/skillpilot/app/src/hooks/useLandscapes.ts'
import { applyCompositionViewProjection, applyPersonalCurriculumProjection } from '/home/enpasos/projects/skillpilot/app/src/utils/compositionViewRuntime.ts'
import { normalizeLearnerProjectedEntries, collapseLearnerSubjectRoots } from '/home/enpasos/projects/skillpilot/app/src/utils/learnerTreeProjection.ts'
import { buildDirectChildrenMap } from '/home/enpasos/projects/skillpilot/app/src/utils/treeProjectionRuntime.ts'
import { createLearnerUnitMapCache, deriveLearnerUnitMapPreview } from '/home/enpasos/projects/skillpilot/app/src/components/learningUnitMap/learnerUnitMapPreview.ts'
import { filterLearnerUnitMapToSubjects } from '/home/enpasos/projects/skillpilot/app/src/components/learningUnitMap/learnerUnitMapProjection.ts'
import { createLearnerRequirementResolver } from '/home/enpasos/projects/skillpilot/app/src/components/learningUnitMap/learnerMapProjection.ts'
import { collectCompositionProjectionRoleGoalIds } from '/home/enpasos/projects/skillpilot/app/src/utils/authoring/compositionViewAuthoring.ts'

const [directory, rootArgument = '.', outputArgument = directory] = process.argv.slice(2), inputDirectory = resolve(directory), out = resolve(outputArgument), root = resolve(rootArgument)
mkdirSync(out, { recursive: true })
const read = (p: string) => JSON.parse(readFileSync(p, 'utf8'))
const MATH = '68a8ac50-f5f5-4e24-8aa9-5e408ca01ced', PHYSICS = '7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a'
const native = read(inputDirectory + '/native-views.json')
const backendScopes = new Map(read(inputDirectory + '/backend-scopes.json').map((scope: any) => [scope.key,scope]))
const catalogs = readdirSync(root + '/curricula/DE/Gymnasium/canonical').filter(f => f.endsWith('.json')).map(f => read(root + '/curricula/DE/Gymnasium/canonical/' + f))
const source = prepareLandscapeEntries(catalogs), canonical = new Map(source.flatMap(e => e.goals).map(g => [g.id, g]))
const resolver = createLearnerRequirementResolver(canonical, canonical, () => {})
const short = (id: string) => id.startsWith('__unit__:') ? id : id.slice(0, 8)

const digestFile = (path: string) => createHash('sha256').update(readFileSync(path)).digest('hex')
const metadata = {
  suppliedMeasurementSha256: digestFile(root + '/tmp/physik-sekii-baseline-20261116/measure-stages.mts'),
  auditScriptSha256: digestFile(import.meta.filename),
  boardSemanticsHelperSha256: digestFile(root + '/tmp/pipeline/laender-stufen/gesamt/measurement-board-semantics-v4.ts'),
  nativeViewsPath: inputDirectory + '/native-views.json', nativeViewsSha256: digestFile(inputDirectory + '/native-views.json'),
  backendScopesSha256: digestFile(inputDirectory + '/backend-scopes.json'),
  learningBasis: 'Actual LearnerService projection seeds; unpruned frontend closure must exactly equal actual backend learningAtomicGoalIds',
  canonicalFilesSha256: Object.fromEntries(readdirSync(root + '/curricula/DE/Gymnasium/canonical').filter(f => f.endsWith('.json')).sort().map(f => [f, digestFile(root + '/curricula/DE/Gymnasium/canonical/' + f)])),
  productSourceFilesSha256: Object.fromEntries([
    'app/src/hooks/useLandscapes.ts', 'app/src/utils/compositionViewRuntime.ts', 'app/src/utils/learnerTreeProjection.ts',
    'app/src/utils/treeProjectionRuntime.ts', 'app/src/components/learningUnitMap/learnerUnitMapPreview.ts',
    'app/src/components/learningUnitMap/learnerUnitMapProjection.ts', 'app/src/components/learningUnitMap/learnerMapProjection.ts',
    'app/src/utils/authoring/compositionViewAuthoring.ts',
  ].map(path => [path, digestFile(root + '/' + path)])),
}
const result: any = { at: new Date().toISOString(), auditScope: 'Product projection; temporal level1 boards allow one canonical entry and one memory, or a source-bound exact examination collection. Canonical Physics SekI has agreed thematic level0 units, whose level1 interiors may contain atoms. Every level0 and every E2/E3 check remains strict.', metadata, profiles: [] }
const canonicalAllowance = (id: string) => {
  const goal = canonical.get(id)
  const tags = (goal?.tags ?? []).map(tag => tag.toLowerCase())
  return goal?.nodeKind === 'memory' ? 'memory'
    : tags.some(tag => tag === 'motivation' || tag === 'orientation') ? 'entry-orientation'
    : null
}
for (const context of native.contexts) {
  // Canonical contexts keep the short course name; Land contexts are named by their full id.
  const profile = context.id
  if (!context.mathViewKey || !context.physicsViewKey) {
    result.profiles.push({ profile, status: 'unavailable', authorization: context.authorization, problems: [context.mathError, context.physicsError].filter(Boolean) })
    console.log(`${profile}: keine Sicht verfügbar (${[context.mathError, context.physicsError].filter(Boolean).join('; ')})`)
    continue
  }
  const views = [native.views[context.mathViewKey], native.views[context.physicsViewKey]]
  const backend: any = backendScopes.get(context.id)
  assert(backend?.learningScopeApplied, 'Missing actual native learning scope: ' + context.id)
  const seed = new Set<string>(backend.seedAtomicGoalIds)
  assert.equal(seed.size, backend.seedAtomicGoalCount)
  for (const id of seed) assert(canonical.has(id) && !resolver.isCanonicalCluster(id), 'Backend seed must be a canonical atom: ' + id)
  const paths = new Map([...seed].sort().map(id => [id, [id]])), queue = [...paths.keys()]
  for (let i = 0; i < queue.length; i++) for (const c of resolver.directRequirementContext(queue[i])) for (const id of c.sourceGoalIds) if (!paths.has(id)) { paths.set(id, [...paths.get(queue[i])!, id]); queue.push(id) }
  assert.deepEqual([...paths.keys()].sort(), backend.learningAtomicGoalIds, context.id + ': frontend canonical closure must exactly equal actual backend L')
  const scoped = source.map(e => ({ ...e, meta: { ...e.meta, personalCurriculumProjection: { revision: 'atomic-prerequisite-learning-v1', rootLandscapeId: 'physik-sekii-baseline', scopeRevision: context.id,
    seedAtomicGoalIds: [...seed].filter(id => canonical.get(id)?.landscapeId === e.meta.landscapeId), targetGoalIds: [...paths.keys()].filter(id => canonical.get(id)?.landscapeId === e.meta.landscapeId),
    requiredByPaths: Object.fromEntries([...paths].filter(([id, p]) => p.length > 1 && canonical.get(id)?.landscapeId === e.meta.landscapeId)) } } }))
  let projected = views.reduce((entries, view) => applyCompositionViewProjection(entries, view), source)
  projected = applyPersonalCurriculumProjection(normalizeLearnerProjectedEntries(projected), scoped as any)
  const index = new Map(projected.flatMap(e => e.goals).map(g => [g.id, g])), { childrenByParent } = collapseLearnerSubjectRoots(index, buildDirectChildrenMap(index))
  const roots = [...index.values()].filter(g => g.tags.includes('root')), visible = new Set<string>()
  const visit = (id: string) => { if (visible.has(id)) return; visible.add(id); (childrenByParent.get(id) ?? []).forEach(visit) }
  roots.forEach(g => visit(g.id))
  const input: any = { rootGoals: roots, goalIndexAll: index, canonicalGoalIndexAll: canonical, visibleGoalIds: visible, visibleChildrenByParent: childrenByParent, landscapeSources: source }
  const project = createLearnerUnitMapCache()
  const deepest = project(input, null), top = project(input, 1)
  mkdirSync(out + '/fixtures', { recursive: true })
  for (const [subject, subjectId] of [['mathematik', MATH], ['physik', PHYSICS]]) {
    const fixture = filterLearnerUnitMapToSubjects(deepest.fixture, new Set([subjectId]))
    const name = context.id.replaceAll(':', '_').replaceAll('+', '-') + '-' + subject
    writeFileSync(out + '/fixtures/' + name + '.json', JSON.stringify({context: context.id, fixture, counts: {seeds:seed.size,learning:paths.size}}) + '\n')
  }
  const unitPreview = deriveLearnerUnitMapPreview(input, deepest.step)
  const knownHesseExamViews = new Map<string, { subjectId: string; nodeId: string }>()
  const addKnownExamViews = (gk: string, lk: string, subjectId: string, nodeId: string) => {
    for (const viewId of [gk, lk, `merged:${lk}+${gk}`, `merged:${gk}+${lk}`]) knownHesseExamViews.set(viewId, { subjectId, nodeId })
  }
  for (const suffix of ['', '-g8', '-g9']) addKnownExamViews(`de-he-gym-math-gk${suffix}`, `de-he-gym-math-lk${suffix}`, MATH, 'abitur')
  addKnownExamViews('de-he-gym-sekii-math-gk', 'de-he-gym-sekii-math-lk', MATH, 'abitur')
  for (const suffix of ['-g8', '-g9']) addKnownExamViews('de-he-gym-physics-gk'+suffix, 'de-he-gym-physics-lk'+suffix, PHYSICS, 'physics-he-abitur')
  addKnownExamViews('de-he-gym-physics-gk', 'de-he-gym-physics-lk', PHYSICS, 'physics-he-abitur')
  addKnownExamViews('de-he-gym-sekii-physics-gk', 'de-he-gym-sekii-physics-lk', PHYSICS, 'physics-he-abitur')
  const canonicalAtomicDescendants = (rootId: string) => {
    const atoms = new Set<string>(), seen = new Set<string>(), pending = [rootId]
    while (pending.length) {
      const id = pending.pop()!
      if (seen.has(id)) continue
      seen.add(id)
      const goal = canonical.get(id)
      if (!goal) throw new Error(`Missing canonical examination goal ${id}`)
      if (goal.type === 'cluster' || goal.contains.length) pending.push(...goal.contains)
      else atoms.add(id)
    }
    return [...atoms].sort()
  }
  const physicsExamRoots: Record<string, string> = { GK: '61684ca7-b725-534f-944b-c7645cea1792', LK: '79028c45-90ae-57eb-8016-f5a96af18fa2' }
  const expectedPhysicsExamAtoms = new Set(String(context.scope.courseProfile).split('+').flatMap(course => {
    if (!physicsExamRoots[course]) throw new Error(`Unknown HE course ${course}`)
    return canonicalAtomicDescendants(physicsExamRoots[course])
  }))

  // Guard: the top board per subject filter must stay clean.
  const guard: any = {}
  for (const [name, subjectId] of [['mathematik', MATH], ['physik', PHYSICS]] as const) {
    const f = filterLearnerUnitMapToSubjects(top.fixture, new Set([subjectId]))
    const units = new Set(Object.values(f.unitEntryIds))
    const own = Object.values(f.entries).filter(e => e.kind !== 'unit' && e.id !== f.rootId && !e.children?.length)
    const outside = own.filter(e => !(f.entryPaths?.[e.id] ?? []).some(part => units.has(part)))
    const back = (f.scopeRelations?.[f.rootId] ?? []).filter(r => r.backward)
    guard[name] = { topBackwardArrows: back.length, topAtomicCauses: new Set(back.flatMap(r => r.provenance.flatMap(p => p.sourceGoalIds.map(s => p.dependentGoalId + '->' + s)))).size,
      atomsOutsideTopUnits: outside.length, atoms: own.length,
      topUnits: (f.entries[f.rootId].children ?? []).map(id => ({ title: f.entries[id].title, kind: f.entries[id].kind })) }
  }

  // Subject-filtered deepest map: every board below Sekundarstufe I and II, per subject.
  const subjects: any = {}
  let findings: any[] = []
  for (const [name, subjectId] of [['mathematik', MATH], ['physik', PHYSICS]] as const) {
    const f = filterLearnerUnitMapToSubjects(deepest.fixture, new Set([subjectId]))
    findings = f.findings.map(x => ({ kind: x.kind, message: x.message }))
    const E = f.entries
    const isUnit = (id: string) => E[id]?.kind === 'unit'
    const atomsUnder = (id: string): string[] => isUnit(id) || E[id].children?.length ? (E[id].children ?? []).flatMap(atomsUnder) : [id]
    const stages: any = {}
    for (const stageKey of ['sek1', 'sek2']) {
      const stageId = f.unitEntryIds[stageKey]
      if (!stageId || !E[stageId]) continue
      const stageSourceGoals = [...unitPreview.units].filter(([, identity]) => identity.key === stageKey)
        .map(([id]) => index.get(id)).filter(goal => goal?.landscapeId === subjectId)
      const stageSource = stageSourceGoals.length === 1 && stageSourceGoals[0]?.extendedData?.compositionViewId === views[1].viewId
        ? stageSourceGoals[0]?.extendedData?.compositionNodeId ?? null : null
      const boards: any[] = []
      const walk = (boardId: string, level: number, trail: string[]) => {
        const children = E[boardId].children ?? [], unitKids = children.filter(isUnit), looseKids = children.filter(id => !isUnit(id))
        const atoms = atomsUnder(boardId), relations = f.scopeRelations?.[boardId] ?? []
        const boardGoal = index.get(boardId)
        const sourceCompositionNodeId = boardGoal?.extendedData?.compositionNodeId ?? null
        const sourceCompositionViewId = boardGoal?.extendedData?.compositionViewId ?? null
        const canonicalExamAtom = (id: string) => {
          const goal = canonical.get(id)
          return !!goal && goal.type !== 'cluster' && goal.contains.length === 0 && (!!goal.examData || goal.nodeKind === 'exam')
        }
        const unitKey = Object.entries(f.unitEntryIds).find(([, entryId]) => entryId === boardId)?.[0] ?? null
        const sourceUnitNodes = [...unitPreview.units].filter(([, identity]) => identity.key === unitKey)
          .map(([id]) => index.get(id)!).filter(goal => goal?.landscapeId === subjectId)
          .map(goal => ({ goalId: goal.id, subjectId: goal.landscapeId,
            compositionViewId: goal.extendedData?.compositionViewId ?? null,
            compositionNodeId: goal.extendedData?.compositionNodeId ?? null }))
        const isKnownHesseExamSource = (source: typeof sourceUnitNodes[number]) => {
          const known = knownHesseExamViews.get(String(source.compositionViewId))
          return !!known && known.subjectId === source.subjectId && known.nodeId === source.compositionNodeId
        }
        const exactPhysicsExamSource = subjectId === PHYSICS && sourceUnitNodes.length === 1
          && isExactSourceExaminationCollection(sourceUnitNodes[0], views, expectedPhysicsExamAtoms, canonical)
        const unitEntryVerified = !!unitKey && f.unitEntryIds[unitKey] === boardId
          && (/:phase:abitur$/.test(unitKey) || exactPhysicsExamSource)
        const sourceIdentityVerified = subjectId === PHYSICS ? exactPhysicsExamSource : sourceUnitNodes.length > 0 && sourceUnitNodes.every(source => isKnownHesseExamSource(source) || (views.some((view: any) => view.viewId === source.compositionViewId) && String(source.compositionNodeId).includes('abitur')))
        const physicsCanonicalCollectionComplete = subjectId !== PHYSICS ||
          (atoms.length === expectedPhysicsExamAtoms.size && atoms.every(id => expectedPhysicsExamAtoms.has(id)))
        const dedicatedExaminationBoard = stageKey === 'sek2' && level === 1 && unitEntryVerified && sourceIdentityVerified
          && unitKids.length === 0 && atoms.length > 0 && atoms.every(canonicalExamAtom)
          && (subjectId !== PHYSICS || (physicsCanonicalCollectionComplete && exactPhysicsExamSource))
        const canonicalThematicBoard = isCanonicalPhysicsThematicBoard(context, views[1], subjectId, stageKey, level, PHYSICS, {
          unitEntryVerified: !!unitKey && f.unitEntryIds[unitKey] === boardId,
          stageSourceCompositionNodeId: stageSource, sourceUnitNodes })
        const auditDetails = { boardId, sourceCompositionNodeId, sourceCompositionViewId, unitKey,
          sourceUnitNodes, unitEntryVerified, sourceIdentityVerified, physicsCanonicalCollectionComplete,
          expectedPhysicsExaminationGoalIds: subjectId === PHYSICS && unitEntryVerified ? [...expectedPhysicsExamAtoms].sort() : [],
          stageSourceCompositionNodeId: stageSource, canonicalThematicBoard, exactPhysicsExamSource, dedicatedExaminationBoard, verifiedExaminationGoalIds: dedicatedExaminationBoard ? [...atoms].sort() : [] }
        const childOf = new Map<string, string>()
        for (const child of children) for (const atom of atomsUnder(child)) childOf.set(atom, child)
        const demand = new Map<string, { needs: string; neededBy: string; pairs: string[] }>()
        for (const atom of atoms) for (const c of resolver.directRequirementContext(atom)) for (const s of c.sourceGoalIds) {
          const x = childOf.get(s), y = childOf.get(atom)
          if (!x || !y || x === y) continue
          const key = x + '\u0000' + y, row = demand.get(key) ?? { needs: x, neededBy: y, pairs: [] }
          row.pairs.push(short(atom) + '->' + short(s)); demand.set(key, row)
        }
        const adj = new Map<string, Set<string>>(children.map(c => [c, new Set<string>()]))
        for (const d of demand.values()) adj.get(d.needs)!.add(d.neededBy)
        // E2 uses the union, including paths through own atomic children.
        for (const relation of relations) if (relation.unitOrder === 'declared' && adj.has(relation.source) && adj.has(relation.target)) {
          adj.get(relation.source)!.add(relation.target)
        }
        const reach = (from: string) => { const seen = new Set<string>(), stack = [from]; while (stack.length) for (const n of adj.get(stack.pop()!) ?? []) if (!seen.has(n)) { seen.add(n); stack.push(n) } return seen }
        const reachAll = new Map(children.map(c => [c, reach(c)])), done = new Set<string>(), circles: string[][] = []
        for (const c of children) { if (done.has(c)) continue; const group = children.filter(o => o === c || (reachAll.get(c)!.has(o) && reachAll.get(o)!.has(c))); group.forEach(g => done.add(g)); if (group.length > 1) circles.push(group) }
        // E3 is independent of layout and of derived demand arrows. Every
        // demand between two child units needs authored after reachability.
        const declaredAdj = new Map<string, Set<string>>(unitKids.map(id => [id, new Set<string>()]))
        for (const relation of relations) if (relation.unitOrder === 'declared' && declaredAdj.has(relation.source) && declaredAdj.has(relation.target)) {
          declaredAdj.get(relation.source)!.add(relation.target)
        }
        const declaredReach = (id: string) => {
          const seen = new Set<string>(), pending = [id]
          while (pending.length) for (const next of declaredAdj.get(pending.pop()!) ?? []) if (!seen.has(next)) { seen.add(next); pending.push(next) }
          return seen
        }
        const declaredClosure = new Map(unitKids.map(id => [id, declaredReach(id)]))
        // A direct requirement whose LCA child is an own atom is ordered by
        // that requirement itself. Do not invent U after V for U -> own x -> V.
        const missingDeclaredAfter = [...demand.values()]
          .filter(({ needs, neededBy }) => isUnit(needs) && isUnit(neededBy) && !declaredClosure.get(needs)!.has(neededBy))
          .map(({ needs, neededBy, pairs }) => ({ needs: E[needs].title, neededBy: E[neededBy].title,
            prerequisiteUnit: needs, dependentUnit: neededBy, atomicWitnessPairs: pairs }))
        const backward = relations.filter(r => r.backward).map(r => ({ laterUnit: E[r.source]?.title, earlierUnit: E[r.target]?.title,
          causes: [...new Set(r.provenance.flatMap(p => p.sourceGoalIds.map(s => p.dependentGoalId + '->' + s)))].map(pair => { const [d, s] = pair.split('->'); return { needs: canonical.get(s)?.title, neededBy: canonical.get(d)?.title, pair: short(d) + '->' + short(s) } }) }))
        const kinds: Record<string, number> = {}
        for (const id of looseKids) { const k = E[id].preparation ? 'preparation' : E[id].kind; kinds[k] = (kinds[k] ?? 0) + 1 }
        boards.push({ auditDetails, level, path: [...trail, E[boardId].title].join(' › '), title: E[boardId].title, atoms: atoms.length,
          missingDeclaredAfter, childUnits: unitKids.length, looseGoals: looseKids.length, looseKinds: kinds, mixed: unitKids.length > 0 && looseKids.length > 0,
          leaf: unitKids.length === 0, backwardArrows: backward.length, backwardCauses: backward.reduce((n, x) => n + x.causes.length, 0), backward,
          circles: circles.map(group => group.map(id => E[id].title)),
          children: children.map(id => ({ id, goalId: canonical.has(id) ? id : null, title: E[id].title,
            kind: E[id].preparation ? 'preparation' : E[id].kind, productKind: E[id].kind, preparation: !!E[id].preparation,
            canonicalTitle: canonical.get(id)?.title, canonicalTags: canonical.get(id)?.tags,
            canonicalNodeKind: canonical.get(id)?.nodeKind ?? null,
            looseAllowance: isUnit(id) ? null : dedicatedExaminationBoard ? 'verified-examination' : canonicalAllowance(id), atoms: atomsUnder(id).length,
            needs: [...demand.values()].filter(d => d.neededBy === id).map(d => E[d.needs].title), neededBy: [...demand.values()].filter(d => d.needs === id).map(d => E[d.neededBy].title) })) })
        for (const child of unitKids) walk(child, level + 1, [...trail, E[boardId].title])
      }
      walk(stageId, 0, [])
      stages[stageKey] = { atoms: atomsUnder(stageId).length, atomIds: atomsUnder(stageId).sort(), boards }
    }
    subjects[name] = stages
  }
  result.profiles.push({ profile, status: 'measured', authorization: context.authorization, views: views.map((v: any) => v.viewId), maxStep: deepest.maxStep, guard, seedCount: seed.size, learningCount: paths.size, subjects, findings })
  console.log(`${profile}: ` + Object.entries(subjects).map(([n, st]: any) => Object.entries(st).map(([k, v]: any) => `${n} ${k}: ${v.atoms} Ziele, ${v.boards[0].childUnits} Kästen + ${v.boards[0].looseGoals} lose, rot ${v.boards.reduce((x: number, b: any) => x + b.backwardArrows, 0)}/${v.boards.reduce((x: number, b: any) => x + b.backwardCauses, 0)}, Kreise ${v.boards.reduce((x: number, b: any) => x + b.circles.length, 0)}`).join(' | ')).join(' | '))
}
const looseAudit: any = { at: result.at, metadata, status: 'pass', profiles: [] }
for (const profile of result.profiles) {
  if (profile.status !== 'measured') { looseAudit.status = 'fail'; looseAudit.profiles.push(profile); continue }
  const boards: any[] = []
  for (const [subject, stages] of Object.entries(profile.subjects) as any) for (const [stage, data] of Object.entries(stages) as any) {
    for (const board of data.boards.filter((b: any) => b.level <= 1)) {
      const loose = board.children.filter((child: any) => child.productKind !== 'unit')
      const disallowed = loose.filter((child: any) => board.level === 0 || (!board.auditDetails.canonicalThematicBoard && !child.looseAllowance))
      const entryCount = loose.filter((child: any) => child.looseAllowance === 'entry-orientation').length
      const memoryCount = loose.filter((child: any) => child.looseAllowance === 'memory').length
      const tooManyEntries = board.level === 1 && entryCount > 1
      const tooManyMemories = board.level === 1 && memoryCount > 1
      const status = disallowed.length || tooManyEntries || tooManyMemories ? 'fail' : 'pass'
      if (status === 'fail') looseAudit.status = 'fail'
      boards.push({ subject, stage, level: board.level, path: board.path, status,
        auditDetails: board.auditDetails,
        directChildren: board.children.length, childUnits: board.childUnits, looseChildren: loose,
        disallowedLooseChildren: disallowed, entryCount, memoryCount, tooManyEntries, tooManyMemories,
        overTwentyChildren: board.children.length > 20,
      })
    }
  }
  looseAudit.profiles.push({ profile: profile.profile, authorization: profile.authorization, boards })
}
writeFileSync(out + '/stages.detail.actual.json', JSON.stringify(result, null, 1) + '\n')
writeFileSync(out + '/loose-children.audit.json', JSON.stringify(looseAudit, null, 1) + '\n')
const report = ['# Actual product-map direct-child audit', '', 'Inside year/phase level-1 boards, only one canonical orientation/motivation and one memory goal are allowed loose. Canonical Physics SekI has agreed thematic level-0 units; atoms within these themes are not loose year-level goals. Dedicated Abitur units must match product unitEntryIds and actual source composition identities, contain only canonical examination atoms and, for Physics, the complete expected course collection; the complete selected seed and learning set is checked independently against the actual backend. Every level-0 loose child fails. No title-based exceptions.', '',
  '| Context | Subject | Stage | Board | Level | Children | Units | Entries | Memory sets | Allowed-type loose IDs | Disallowed loose IDs | Result |',
  '| --- | --- | --- | --- | ---: | ---: | ---: | ---: | ---: | --- | --- | --- |']
for (const profile of looseAudit.profiles) for (const board of profile.boards ?? []) {
  report.push('| ' + [profile.profile, board.subject, board.stage, board.path, board.level,
    board.directChildren, board.childUnits, board.entryCount, board.memoryCount,
    board.looseChildren.filter((child: any) => child.looseAllowance).map((child: any) => child.goalId + ' (' + child.looseAllowance + ')').join(', ') || 'none',
    board.disallowedLooseChildren.map((child: any) => child.goalId ?? child.id).join(', ') || 'none',
    board.status + (board.tooManyEntries ? '; multiple entry goals' : '') + (board.tooManyMemories ? '; multiple memory sets' : '') + (board.overTwentyChildren ? '; >20 children: justification required' : ''),
  ].map(value => String(value).replaceAll('|', '/')).join(' | ') + ' |')
}
report.push('', 'Overall loose-child result: ' + looseAudit.status.toUpperCase(), '')
writeFileSync(out + '/loose-children.audit.md', report.join('\n'))
console.log('Actual product-map direct-child audit: ' + looseAudit.status.toUpperCase() + '; details in ' + out)
if (looseAudit.status !== 'pass') process.exitCode = 1

// This actual-backend audit adds a fail-closed structural acceptance result;
// the historical supplied raw measurement stays untouched.
const structuralProblems: any[] = []
let stageBoards = 0, nestedBoards = 0
for (const profile of result.profiles) {
  if (profile.status !== 'measured') { structuralProblems.push({profile:profile.profile,unavailable:true}); continue }
  for (const [subject, guard] of Object.entries(profile.guard) as any) {
    if (guard.topBackwardArrows || guard.atomsOutsideTopUnits) structuralProblems.push({profile:profile.profile,subject,scope:'top-step1',guard})
  }
  for (const [subject, stages] of Object.entries(profile.subjects) as any) for (const [stage, data] of Object.entries(stages) as any) {
    for (const board of data.boards) {
      if (board.level===0) stageBoards++; else nestedBoards++
      if (board.backwardArrows || board.circles.length || board.missingDeclaredAfter.length) structuralProblems.push({profile:profile.profile,subject,stage,path:board.path,backward:board.backward,circles:board.circles,missingDeclaredAfter:board.missingDeclaredAfter})
    }
  }
}
const acceptance = {metadata,profiles:result.profiles.length,stageBoards,nestedBoards,
  status:looseAudit.status==='pass' && structuralProblems.length===0 ? 'pass':'fail',
  looseChildStatus:looseAudit.status,structuralProblems}
writeFileSync(out+'/actual-backend-acceptance.json',JSON.stringify(acceptance,null,2)+'\n')
console.log('Actual backend all-scope structural acceptance: '+acceptance.status.toUpperCase()+'; '+stageBoards+' stage boards, '+nestedBoards+' nested boards; '+structuralProblems.length+' structural problems')
if (acceptance.status!=='pass') process.exitCode=1
