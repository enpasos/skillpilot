// Apache-2.0. Optional scoped deltas checked in memory; never adopted.
import assert from 'node:assert/strict'
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { prepareLandscapeEntries } from '../../../../../../../app/src/hooks/useLandscapes'
import { normalizeCanonicalLandscape, validateCanonicalLandscape } from '../../../../../../../app/src/utils/authoring/canonicalAuthoring'
import { fingerprintSemanticKindSourceGoal } from '../../../../../../../app/scripts/goalBookModel'
import { fingerprintGoalForEvidence } from '../../../../../../../app/scripts/goalEvidenceProfileModel'
const here=dirname(fileURLToPath(import.meta.url)),read=(n:string)=>JSON.parse(readFileSync(resolve(here,n),'utf8'))
const canonical=read('canonical.biologie.candidate.json'),optional=structuredClone(canonical),report=read('dna-five-paths.full-source-texts-and-options.candidate.json')
const goals=new Map<string,any>(optional.goals.map((g:any)=>[g.id,g])),original=new Map<string,any>(canonical.goals.map((g:any)=>[g.id,g]))
for(const d of report.options){assert.deepEqual(goals.get(d.goalId).requires,d.before);goals.get(d.goalId).requires=d.after}
const errors=validateCanonicalLandscape(normalizeCanonicalLandscape(optional)).filter(f=>f.severity==='error');assert.deepEqual(errors,[])
const native=new Map<string,any>(prepareLandscapeEntries([optional])[0].goals.map(g=>[g.id,g]))
const dna='0daa79f6-8f61-5506-98f9-65db83062ba8'
const hasDNA=(id:string,seen=new Set<string>()):boolean=>id===dna||!seen.has(id)&&(seen.add(id),(native.get(id)?.effectiveRequires??[]).some((r:string)=>hasDNA(r.replace(optional.landscapeId+':',''),seen)))
const results=report.fiveRecords.map((r:any)=>({goalId:r.targetGoalId,DNAPathAfterOptionalDeltas:hasDNA(r.targetGoalId)}))
assert.equal(results.filter((r:any)=>r.DNAPathAfterOptionalDeltas).length,2)
writeFileSync(resolve(here,'optional-dna-prerequisite-deltas.native-check.receipt.json'),JSON.stringify({status:'candidate',adopted:false,includedInNI5Base:false,canonicalErrors:errors,records:report.options.map((d:any)=>({goalId:d.goalId,requiresBefore:d.before,requiresAfter:d.after,semanticKindFingerprintBefore:fingerprintSemanticKindSourceGoal(original.get(d.goalId)),semanticKindFingerprintAfter:fingerprintSemanticKindSourceGoal(goals.get(d.goalId)),goalEvidenceFingerprintBefore:fingerprintGoalForEvidence(original.get(d.goalId),'goal-evidence-v1'),goalEvidenceFingerprintAfter:fingerprintGoalForEvidence(goals.get(d.goalId),'goal-evidence-v1')})),fivePathResults:results,curricularAtoms:368,canonicalRecords:446,scientificApprovalClaim:false,humanApproval:false,BookD2Passed:false,PContentsRead:false},null,2)+'\n')
console.log(JSON.stringify({optionalDag:'PASS',eliminatedDNAPaths:3,remainingDNAPaths:2,adopted:false}))
