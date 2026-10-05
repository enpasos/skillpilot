import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fingerprintGoalForEvidence } from '/home/enpasos/projects/skillpilot/app/scripts/goalEvidenceProfileModel'
import { stableGoalBookJson } from '/home/enpasos/projects/skillpilot/app/scripts/goalBookModel'

const root = '/home/enpasos/projects/skillpilot'
const base = resolve(root, 'curricula/DE/Gymnasium/quality/goal-description-review/chemie/rollout-v1/2026-09-30/batch-008-global-inquiry-communication-current-9-v1')
const receipt = resolve(root, 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/chemie-b008-inquiry-targeted-continuation-candidate-v1')
const read = (p: string) => JSON.parse(readFileSync(p, 'utf8'))
const bytesDigest = (p: string) => `sha256:${createHash('sha256').update(readFileSync(p)).digest('hex')}`
const stableDigest = (v: unknown) => `sha256:${createHash('sha256').update(stableGoalBookJson(v)).digest('hex')}`
const round = resolve(base, 'round-b')
const campaign = read(resolve(round, 'description-review-campaign.json'))
const bundle = read(resolve(round, 'review-bundle-manifest.json'))
const model = read(resolve(base, 'bundle/book-model.json'))
const render = read(resolve(base, 'bundle/book.pdf.render-manifest.json'))
const canonicalPath = resolve(root, 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json')
const canonical = read(canonicalPath)
const input = read(resolve(round, 'description-review-input.json'))
const { digest: modelDigest, ...modelWithoutDigest } = model
const { bundleFingerprint, ...bundleWithoutFingerprint } = bundle
const goalChecks = input.goals.map((g: any) => {
  const actual = canonical.goals.find((x: any) => x.id === g.goalId)
  const page = model.pages.find((x: any) => x.goalId === g.goalId)
  const graphGoal = model.navigation.goalGraph.goals.find((x: any) => x.id === g.goalId)
  const { pageFingerprint, ...pageWithoutFingerprint } = page
  const resourceChecks = actual.resourceLinks.filter((x: any) => x.type === 'goal-visualization').map((x: any) => ({
    url: x.url,
    sourceDigest: bytesDigest(resolve(root, 'curricula/DE/Gymnasium/visualizations/chemie', g.goalId, x.url.split('/').at(-1))),
    frontendDigest: bytesDigest(resolve(root, 'app/public', x.url.slice(1))),
    boundOriginalDigest: page.visualization.originalDigest,
  }))
  const fields = { title: g.currentTitleDe, titleEn: g.currentTitleEn, description: g.currentDescriptionDe, descriptionEn: g.currentDescriptionEn }
  const fieldChecks = Object.entries(fields).map(([field, value]) => ({field, exact: actual[field] === value}))
  return {
    goalId: g.goalId,
    logicalGoalPage: page.pageNumber,
    physicalPdfPage: page.pageNumber + render.frontMatterPageCount,
    boundGoalFingerprint: g.goalFingerprint,
    actualCanonicalGoalFingerprint: fingerprintGoalForEvidence(actual, model.source.goalFingerprintRuleVersion, graphGoal.semanticKind),
    boundPageFingerprint: g.pageFingerprint,
    actualPageFingerprint: stableDigest({modelSchemaVersion: model.schemaVersion, edition: model.book.edition, page: pageWithoutFingerprint}),
    fieldChecks,
    requiresExact: stableGoalBookJson(actual.requires) === stableGoalBookJson(g.canonicalContext.requires),
    containsExact: stableGoalBookJson(actual.contains) === stableGoalBookJson(g.canonicalContext.contains),
    dimensionTagsExact: stableGoalBookJson(actual.dimensionTags) === stableGoalBookJson(g.canonicalContext.dimensionTags),
    applicabilityExact: stableGoalBookJson(actual.applicability) === stableGoalBookJson(g.canonicalContext.applicability),
    resourceChecks,
  }
})
const artifactRolesToCheck = new Set(['book_model', 'book_pdf', 'book_pdf_render_manifest', 'review_prompt', 'review_criteria', 'run_manifest_schema'])
const artifacts = bundle.artifacts.filter((a: any) => artifactRolesToCheck.has(a.role)).map((a: any) => {
  const actualPath = ['review_prompt', 'review_criteria'].includes(a.role) ? resolve(round, a.path) : resolve(base, 'bundle', a.path)
  return {role: a.role, expected: a.digest, actual: bytesDigest(actualPath), path: actualPath.slice(root.length + 1)}
})
const output = {
  schemaVersion: 1,
  checkedAt: new Date().toISOString(),
  modelDigest,
  computedModelDigest: stableDigest(modelWithoutDigest),
  bundleFingerprint,
  computedBundleFingerprint: stableDigest(bundleWithoutFingerprint),
  canonicalFileByteDigest: bytesDigest(canonicalPath),
  canonicalStableDigest: stableDigest(canonical),
  boundCanonicalStableDigest: model.source.landscapeDigest,
  physicalPdfPageCount: render.physicalPageCount,
  logicalGoalPageCount: render.goalPageCount,
  artifacts,
  goalChecks,
}
const failures: string[] = []
if (output.modelDigest !== output.computedModelDigest) failures.push('model digest mismatch')
if (output.bundleFingerprint !== output.computedBundleFingerprint) failures.push('bundle fingerprint mismatch')
for (const a of artifacts) if (a.expected !== a.actual) failures.push(`artifact ${a.role}`)
for (const g of goalChecks) {
  if (g.boundGoalFingerprint !== g.actualCanonicalGoalFingerprint) failures.push(`goal ${g.goalId}`)
  if (g.boundPageFingerprint !== g.actualPageFingerprint) failures.push(`page ${g.goalId}`)
  if (g.fieldChecks.some((f: any) => !f.exact)) failures.push(`text ${g.goalId}`)
  for (const k of ['requiresExact', 'containsExact', 'dimensionTagsExact', 'applicabilityExact'] as const) if (!g[k]) failures.push(`${k} ${g.goalId}`)
  for (const r of g.resourceChecks) if (r.sourceDigest !== r.frontendDigest || r.sourceDigest !== r.boundOriginalDigest) failures.push(`image binding ${g.goalId}`)
}
writeFileSync(resolve(receipt, 'binding-check.json'), JSON.stringify({...output, failures}, null, 2) + '\n')
console.log(JSON.stringify({checkedGoals: goalChecks.length, modelDigest, bundleFingerprint, artifactCount: artifacts.length, allNineGoalAndPageBindingsValid: failures.length === 0, fullCanonicalStableDigestMatchesBook: output.canonicalStableDigest === output.boundCanonicalStableDigest, failures}, null, 2))
const normalize = (v: any) => String(v ?? '').normalize('NFKC').replace(/\s+/g, ' ').trim()
const qa = read(resolve(root, 'curricula/DE/Gymnasium/quality/goal-visualization-qa/chemie.qa.json'))
const ledgerPaths = {
  atomicity: 'curricula/DE/Gymnasium/quality/semantic-atomicity/canonical-chemistry-inquiry-communication.review.jsonl',
  memory: 'curricula/DE/Gymnasium/quality/memory-card-review/chemie-stoffmenge-nine-current-20261005-v1/canonical-chemistry-full.review.jsonl'
}
const ledgers = Object.fromEntries(Object.entries(ledgerPaths).map(([k,p]) => [k, readFileSync(resolve(root,p),'utf8').trim().split('\n').map(x=>JSON.parse(x))]))
const semanticFp = (g:any, ruleVersion:string) => stableDigest({ruleVersion,goalId:g.id,shortKey:g.shortKey??'',title:normalize(g.title),titleEn:normalize(g.titleEn),description:normalize(g.description),descriptionEn:normalize(g.descriptionEn),phase:normalize(g.dimensionTags?.phase),area:normalize(g.dimensionTags?.area),topicCode:normalize(g.dimensionTags?.topicCode),nodeKind:normalize(g.nodeKind)})
const mappingPath = 'curricula/DE/Gymnasium/mapping/DE-BY/gymnasium/bavaria_chemistry_source_extraction_to_canonical_chemistry.review.json'
const mapping = read(resolve(root,mappingPath))
const extraction = read(resolve(root,mapping.sourceExtractionPath))
const dRecords = Object.fromEntries(['a','b'].map(k=>{
  const batchId=campaign.batches[0].batchId
  const p=resolve(base, `round-${k}/results/chemie-rollout-v1-batch-008-global-inquiry-communication-current-9-v1-20260930-first-pass-${k}.batch-001.records.jsonl`)
  return[k,readFileSync(p,'utf8').trim().split('\n').map(x=>JSON.parse(x))]
}))
const details=input.goals.map((i:any)=>{
 const g=canonical.goals.find((x:any)=>x.id===i.goalId),page=model.pages.find((x:any)=>x.goalId===i.goalId)
 const a=ledgers.atomicity.find((x:any)=>x.goalId===g.id),m=ledgers.memory.find((x:any)=>x.goalId===g.id),v=qa.records.find((x:any)=>x.goalId===g.id)
 const sourceBindings=mapping.mappings.filter((x:any)=>x.canonicalGoalId===g.id).map((x:any)=>{
  const s=extraction.sourceGoals.find((s:any)=>s.id===x.legacyGoalId)
  return {mapping:x,source:{id:s.id,passageId:s.passageId,topicCode:s.topicCode,sourceSpan:s.sourceSpan,sourceRef:s.sourceRef,courseLevel:s.courseLevel,title:s.title,sourceText:s.sourceText,sourceOccurrences:s.sourceOccurrences}}
 })
 return {goalId:g.id,before:{titleDe:g.title,titleEn:g.titleEn,descriptionDe:g.description,descriptionEn:g.descriptionEn},canonicalContext:{dimensionTags:g.dimensionTags,requires:g.requires.map((id:string)=>({goalId:id,title:canonical.goals.find((x:any)=>x.id===id)?.title})),applicability:g.applicability,extendedData:g.extendedData},book:{goalFingerprint:page.goalFingerprint,pageFingerprint:page.pageFingerprint,logicalPage:page.pageNumber,breadcrumbs:page.breadcrumbs,chapterStageMismatch:g.dimensionTags.topicCode.includes('.UPPER.')||g.id==='1f354a60-be44-512b-8f8b-f67c8c456035'},atomicity:{record:a,currentFingerprint:semanticFp(g,a.ruleVersion),current:a.fingerprint===semanticFp(g,a.ruleVersion)},memory:{record:m,currentFingerprint:semanticFp(g,m.ruleVersion),current:m.fingerprint===semanticFp(g,m.ruleVersion)},visualization:{qaRecord:v,currentSourceDigest:bytesDigest(resolve(root,v.canonicalAssetPath)),currentFrontendDigest:bytesDigest(resolve(root,v.publicAssetPath)),qaBindingCurrent:v.assetSha256===bytesDigest(resolve(root,v.canonicalAssetPath))&&v.assetSha256===bytesDigest(resolve(root,v.publicAssetPath))},existingD:{a:dRecords.a.find((x:any)=>x.goalId===g.id),b:dRecords.b.find((x:any)=>x.goalId===g.id)},sourceBindings}
})
const inventory={schemaVersion:1,checkedAt:new Date().toISOString(),currentCanonicalByteDigest:bytesDigest(canonicalPath),mappingPath,mappingByteDigest:bytesDigest(resolve(root,mappingPath)),sourceExtractionPath:mapping.sourceExtractionPath,sourceExtractionByteDigest:bytesDigest(resolve(root,mapping.sourceExtractionPath)),ledgerInputs:Object.fromEntries(Object.entries(ledgerPaths).map(([k,p])=>[k,{path:p,byteDigest:bytesDigest(resolve(root,p))}])),goals:details}
writeFileSync(resolve(receipt,'current-nine-inventory.json'),JSON.stringify(inventory,null,2)+'\n')
console.log(JSON.stringify(details.map((x:any)=>({id:x.goalId,Acurrent:x.atomicity.current,Mcurrent:x.memory.current,Vcurrent:x.visualization.qaBindingCurrent,sourceBindings:x.sourceBindings.length,DA:x.existingD.a.decision,DB:x.existingD.b.decision,chapterMismatch:x.book.chapterStageMismatch})),null,2))
process.exitCode = failures.length ? 1 : 0
