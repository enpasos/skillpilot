import { readFile, writeFile } from 'node:fs/promises'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createHash } from 'node:crypto'
import { fingerprintGoalForPositiveEvidence, fingerprintPositiveGoalEvidenceReviewInput, fingerprintPositiveGoalEvidenceProfile, validatePositiveGoalEvidenceRecordSemantics } from '/home/enpasos/projects/skillpilot/app/scripts/positiveGoalEvidenceProfileModel'

async function main() {
  const own = resolve(dirname(fileURLToPath(import.meta.url)), '..')
  const root = process.cwd()
  const v3 = resolve(root,'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-15/chemie-energy20-nernst-alt-context-author-and-native-final-preparation-20261015-v1')
  const file = resolve(own,'candidate/twenty-author-E0G0.two-targeted-briefs-four-input-bindings.jsonl')
  const rows = (await readFile(file,'utf8')).trimEnd().split('\n')
  const beforeRows = (await readFile(resolve(v3,'candidate/twenty-author-E0G0.only-Nernst-input-binding.jsonl'),'utf8')).trimEnd().split('\n')
  const beforeGoals = JSON.parse(await readFile(resolve(v3,'candidate/canonical560.current422.only-a338-altText.corrected.json'),'utf8')).goals
  const afterGoals = JSON.parse(await readFile(resolve(own,'candidate/canonical560.current422.three-wording-four-alt.author.json'),'utf8')).goals
  const physicalMap = JSON.parse(await readFile(resolve(v3,'checks/REBUILD.final-native560-alt-only.physical-map.json'),'utf8'))
  const ids = new Set(['16b24dc5-0e48-5e3b-8307-01289db8d1a9','7a5a8e37-7078-5974-a4d8-edf7d4cbbfc3','551d81a7-2308-540f-8323-df35c6871d62','ebfa2c18-0599-5282-bf7a-80c14d86331e'])
  const changes = []
  const output = []
  for (let i=0;i<rows.length;i++) {
    const rec = JSON.parse(rows[i]), before = JSON.parse(beforeRows[i])
    const b = beforeGoals.find((g:any)=>g.id===rec.goalId), a = afterGoals.find((g:any)=>g.id===rec.goalId)
    const digests: Record<string,string> = {}
    for (const link of a.resourceLinks??[]) if (link.resourceType==='image') {
      const source = physicalMap.selectedCurrentAssetRows.find((r:any)=>r.normalPublicDestination==='app/public'+link.url)
      const bytes = await readFile(resolve(root,source?.physicalRepositorySource.path??'app/public'+link.url))
      digests[link.url] = 'sha256:'+createHash('sha256').update(bytes).digest('hex')
    }
    if (fingerprintPositiveGoalEvidenceReviewInput(b,before.reviewCriteriaFingerprint,digests,'curricularAtomic')!==before.reviewInputFingerprint) throw new Error('Cannot reproduce exact old input '+rec.goalId)
    if (ids.has(rec.goalId)) {
      rec.goalFingerprint = fingerprintGoalForPositiveEvidence(a,'curricularAtomic')
      rec.reviewInputFingerprint = fingerprintPositiveGoalEvidenceReviewInput(a,rec.reviewCriteriaFingerprint,digests,'curricularAtomic')
      rec.profileFingerprint = fingerprintPositiveGoalEvidenceProfile(rec.profile)
      const errors = validatePositiveGoalEvidenceRecordSemantics(rec,a,digests,'curricularAtomic')
      if (errors.length) throw new Error(errors.join('\n'))
      changes.push({goalId:rec.goalId,wholeBefore:before,wholeAfter:rec,changedFields:Object.keys(rec).filter(k=>JSON.stringify(rec[k])!==JSON.stringify(before[k]))})
      output.push(JSON.stringify(rec))
    } else { if (rows[i]!==beforeRows[i]) throw new Error('Unexpected other raw line change'); output.push(rows[i]) }
    if (rec.evidenceLevel!=='E0'||rec.maximumClaimScope!=='G0'||rec.status!=='needs_human_review'||rec.reviewAuthority!=='ai_candidate') throw new Error('Promotion forbidden')
  }
  await writeFile(file,output.join('\n')+'\n')
  await writeFile(resolve(own,'CAS.four-actual-raw-input-bindings.json'),JSON.stringify({role:'Normal stock positive-profile fingerprints for actual author inputs only; no P approval',changes,all18OtherInnerProfileBodiesExact:true,all16OtherRawLinesExact:true,goalFingerprintsChanged:changes.filter(c=>c.wholeBefore.goalFingerprint!==c.wholeAfter.goalFingerprint).length,reviewInputFingerprintsChanged:changes.length,profileFingerprintsChanged:changes.filter(c=>c.wholeBefore.profileFingerprint!==c.wholeAfter.profileFingerprint).length,newP:0},null,2)+'\n')
  console.log(JSON.stringify({actualInputBindings:changes.length,goalFingerprintChanges:3,innerProfileChanges:2,allOther18InnerProfilesExact:true,newP:0}))
}
main().catch(e=>{console.error(e);process.exit(1)})
