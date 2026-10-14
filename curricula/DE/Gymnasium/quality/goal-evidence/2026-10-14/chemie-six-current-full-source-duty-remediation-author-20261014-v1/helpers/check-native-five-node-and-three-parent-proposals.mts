import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
const here = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(here, '..')
let repo = root
while (!fs.existsSync(path.join(repo, 'AGENTS.md'))) repo = path.dirname(repo)
const { normalizeCanonicalLandscape, validateCanonicalLandscape } = await import(path.join(repo, 'app/src/utils/authoring/canonicalAuthoring.ts'))
const { fingerprintSemanticKindSourceGoal } = await import(path.join(repo, 'app/scripts/goalBookModel.ts'))
const load = (p: string) => JSON.parse(fs.readFileSync(path.join(root, p), 'utf8'))
const base = load('inputs/frozen-regular-originals/curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json')
const cand = load('candidate/canonical528.current402-plus-five-duty-atoms.author.inactive.json')
const cas = load('candidate/four-new-whole-goals-one-exact-reused-RP-goal-and-three-parent-CAS.author.json')
const baseDs = validateCanonicalLandscape(normalizeCanonicalLandscape(base))
const candidateDs = validateCanonicalLandscape(normalizeCanonicalLandscape(cand))
const source = new Map(cand.goals.map((g:any) => [g.id,g]))
const touched = [...cas.newWholeGoals,...cas.reusedExactPendingWholeGoals,...cas.existingWholeGoalCAS.map((c:any)=>c.proposedAfterWholeGoal)]
const data = {
  role: 'Stock technical checks; no semantic classifications or independent science votes',
  baseCanonicalDiagnostics: baseDs,
  candidateCanonicalDiagnostics: candidateDs,
  newErrorDiagnostics: candidateDs.filter((d:any)=>d.severity==='error' && !baseDs.some((b:any)=>JSON.stringify(b)===JSON.stringify(d))),
  proposedEightNativeSemanticFingerprints: touched.map((g:any)=>({goalId:g.id,sourceFingerprint:fingerprintSemanticKindSourceGoal(source.get(g.id)),status:'proposal_not_reviewed_semantic_decision'})),
  currentWholeNodeCount:base.goals.length,
  proposedWholeNodeCount:cand.goals.length,
  nativeCurricularAtomicProposalDelta:5,
  actualNativeDenominatorDelta:0,
  newNativeSemanticAuthorityRows:0,
  stockSourceBuilderRan:false,
  reasonNoSourceBuilder:'No operative source carriers, source scope metadata or registered composition config is changed. Conditional plans must not be fed into a compiler as approved source authority.',
  activeWrites:false,
}
if(data.newErrorDiagnostics.length) throw new Error(JSON.stringify(data.newErrorDiagnostics))
fs.mkdirSync(path.join(root,'checks'),{recursive:true})
fs.writeFileSync(path.join(root,'checks/stock-native-five-node-three-parent-proposals.actual.json'),JSON.stringify(data,null,2)+'\n')
console.log('Stock canonical graph: no new errors; eight native semantic fingerprints measured as proposals only.')
