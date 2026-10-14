import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { normalizeGoalVisualizationAiReview } from '/home/enpasos/projects/skillpilot/app/scripts/goalVisualizationQaModel.ts'
import { isAiApprovedForCurrentAsset } from '/home/enpasos/projects/skillpilot/app/src/utils/goalVisualizationQaStatus.ts'
import { stableGoalEvidenceJson, normalizeGoalEvidenceText as norm } from '/home/enpasos/projects/skillpilot/app/scripts/goalEvidenceProfileModel.ts'
const own=path.dirname(new URL(import.meta.url).pathname)
const read=(n:string)=>JSON.parse(fs.readFileSync(path.join(own,n),'utf8'))
const records=(n:string)=>fs.readFileSync(path.join(own,n),'utf8').trim().split('\n').map(x=>JSON.parse(x))
const hash=(p:any)=>'sha256:'+crypto.createHash('sha256').update(stableGoalEvidenceJson(p)).digest('hex')
const candidate=read('candidate/canonical551.prospective419.on-final542.exact-reviewed-NAT9.inactive.json')
const goals=new Map(candidate.goals.map((x:any)=>[x.id,x]))
const mr=records('M/M419.original408-plus-two-reviewed-Rest-and-nine-reviewed-NAT.candidate.jsonl')
const badM=mr.flatMap((r:any)=>{const g:any=goals.get(r.goalId);const expected=hash({ruleVersion:r.ruleVersion,goalId:g.id,shortKey:g.shortKey??'',title:norm(g.title),titleEn:norm(g.titleEn),description:norm(g.description),descriptionEn:norm(g.descriptionEn),phase:norm(g.dimensionTags?.phase),area:norm(g.dimensionTags?.area),topicCode:norm(g.dimensionTags?.topicCode),nodeKind:norm(g.nodeKind)})
 return expected===r.fingerprint?[]:[{goalId:r.goalId,expected,actual:r.fingerprint}]
})
const deck=read('M/deck-natural-q2.complete-five-cards.only-two-reviewed-origin-tags.candidate.json')
const cr=records('M/two-card-retargets.original-independent-a.records.jsonl')
const cards=cr.map((r:any)=>{const c=deck.cards.find((x:any)=>x.id===r.cardId);const actual=hash({ruleVersion:r.ruleVersion,deckId:deck.deckId,cardId:c.id,front:norm(c.front),back:norm(c.back),category:norm(c.category),tags:c.tags.map(norm).filter(Boolean)});return {cardId:c.id,actualFingerprint:actual,originalReviewedFingerprint:r.fingerprint,pass:actual===r.fingerprint,originGoalIds:r.originGoalIds}})
const qa=read('V/seven-existing-typed-native-QA-fields.exact-original-A.not-applied.json').records
const assets=read('V/nine-existing-actual-PNG-bindings-and-original-paired-science.NO-NEW-V.json')
const checks=qa.map((r:any)=>{const a=assets.find((a:any)=>a.goalId===r.goalId);const normalized=normalizeGoalVisualizationAiReview(r,a.actualAsset.sha256)
 return {goalId:r.goalId,rawApprovedType:typeof r.aiApproved,rawApprovedVerbatim:r.aiApproved,rawReviewerVerbatim:r.aiReviewer,rawReviewedAtVerbatim:r.aiReviewedAt,actualPixelSHA:a.actualAsset.sha256,pass:r.aiApproved==='yes'&&isAiApprovedForCurrentAsset({...normalized,assetSha256:a.actualAsset.sha256})&&normalized.aiReviewer===r.aiReviewer&&normalized.aiReviewedAt===r.aiReviewedAt}
})
const report={memory419ExactFingerprintMirror:{source:'unmodified private fingerprint contract in app/scripts/memoryCardReview.ts; no full stock M419 claimed',count:mr.length,mismatches:badM,pass:!badM.length},card2ExactFingerprintMirror:{records:cards,pass:cards.every(x=>x.pass)},originalTypedRawV7:{stockFunctions:['normalizeGoalVisualizationAiReview','isAiApprovedForCurrentAsset'],records:checks,pass:checks.every((x:any)=>x.pass)},fullNormalM419Executed:false,actualPublicPNGPresenceAsserted:false,newScientificVotes:0}
fs.writeFileSync(path.join(own,'CHECK.M419-fingerprints-two-card-origins-and-original-V7-raw-types.actual.json'),JSON.stringify(report,null,2)+'\n')
console.log(JSON.stringify({M419Mismatches:badM.length,card2:cards.every(x=>x.pass),originalTypedV7:checks.every((x:any)=>x.pass),fullM419Claim:false}))
process.exitCode=badM.length||!cards.every(x=>x.pass)||!checks.every((x:any)=>x.pass)?1:0
