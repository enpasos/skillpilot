// SPDX-License-Identifier: Apache-2.0
// Materialize ordinary current context for independent reviewers. No verdicts.
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync, mkdirSync, existsSync, copyFileSync } from 'node:fs'
import { dirname, resolve, relative } from 'node:path'
import { pathToFileURL } from 'node:url'

const root = process.env.BASIS2_WORKSPACE_ROOT!
const own = process.env.BASIS2_AUTHOR_OUTPUT!
const mod = (name: string) => import(pathToFileURL(resolve('app/scripts', name)).href)
const read = (path: string) => JSON.parse(readFileSync(path, 'utf8'))
const write = (path: string, value: any) => {
  assert.ok(!existsSync(path), `Preserve existing artifact: ${path}`)
  mkdirSync(dirname(path), {recursive: true})
  writeFileSync(path, Buffer.isBuffer(value) ? value : typeof value === 'string' ? value : JSON.stringify(value, null, 2) + '\n')
}
const bind = (path: string) => {
  const bytes = readFileSync(path)
  return {path: relative(root, path), sha256: createHash('sha256').update(bytes).digest('hex'), bytes: bytes.length}
}
const { loadGoalBookBuildInputs, parseAndValidateGoalBookModel, stableGoalBookJson } = await mod('goalBookModel.ts')
const { buildGoalDescriptionRolloutSubsetModel } = await mod('materializeGoalDescriptionRolloutBatch.ts')
const { writeGoalBookHtml, writeGoalBookPdf, writeGoalBookRenderManifest } = await mod('goalBookRenderer.ts')
const { buildGoalBookReviewBundle } = await mod('exportGoalBookReviewBundle.ts')
const { createGoalDescriptionReviewCampaignArtifacts, verifyGoalBookReviewBundleArtifactBytes } = await mod('createGoalDescriptionReviewCampaign.ts')
const { validateGoalDescriptionReviewCampaign } = await mod('validateGoalDescriptionReviewCampaign.ts')
const { model } = await loadGoalBookBuildInputs(resolve('app/scripts/config/goal-books/de-gym-biology-national-atlas.json'))
assert.equal(model.pages.length, 394)
assert.equal(stableGoalBookJson(parseAndValidateGoalBookModel(model)), stableGoalBookJson(model))
const fullPath = resolve(own, 'native/full394.ordinary-source-supplement.actual-model.json')
write(fullPath, model)
const baseline = read(resolve(own, 'before/current392.ordinary-loader.whole-model.json'))
const priorReviewedPath = resolve(root, 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08/biologie-stoffwechsel-two-basic-companions-complete-author-20261008-v2/native/full394.actual-primary-refined.final-model.json')
const prior = read(priorReviewedPath)
const differences = (before: any, after: any) => Object.keys({...before, ...after})
  .filter(key => stableGoalBookJson(before[key]) !== stableGoalBookJson(after[key]))
const oldPageComparisons = baseline.pages.map((page: any) => {
  const current = model.pages.find((p: any) => p.goalId === page.goalId)
  assert.ok(current)
  const keys = differences(page, current)
  return {goalId: page.goalId, exact: keys.length === 0, changedKeys: keys,
    ...(keys.length ? {wholeBefore: page, wholeAfter: current} : {})}
})
const priorComparisons = prior.pages.map((page: any) => {
  const current = model.pages.find((p: any) => p.goalId === page.goalId)
  assert.ok(current)
  return {goalId: page.goalId, changedKeys: differences(page, current)}
})
write(resolve(own, 'checks/actual-all392-whole-pages.baseline-and-original394.diff.json'), {
  role: 'Actual whole-page comparison, no claim that changed contexts are independently accepted',
  baseline392Model: bind(resolve(own, 'before/current392.ordinary-loader.whole-model.json')),
  current394Model: bind(fullPath), priorActuallyReviewed394Model: bind(priorReviewedPath),
  currentWholePageCount:394, oldWholePageCount:392,
  exactOldWholePageCount:oldPageComparisons.filter((p: any) => p.exact).length,
  changedOldWholePages:oldPageComparisons.filter((p: any) => !p.exact),
  all392WholePageComparisons:oldPageComparisons.map(({wholeBefore,wholeAfter,...record}:any)=>record),
  changedPagesComparedToPriorReviewed394:priorComparisons.filter((p: any) => p.changedKeys.length),
  oldGoalFingerprintsAllExact:baseline.pages.every((p:any)=>p.goalFingerprint===model.pages.find((q:any)=>q.goalId===p.goalId)?.goalFingerprint),
  noNewScientificReviewByAuthor:true, activeWrites:0, humanApproval:false,
})
const preparation = read(resolve(own, 'candidate-preparation.actual.json'))
const ids = preparation.newGoalIds
const selected = model.pages.filter((page: any) => ids.includes(page.goalId)).map((page: any) => page.goalId)
assert.equal(selected.length, 2)
const subset = buildGoalDescriptionRolloutSubsetModel({baseModel:model,goalIds:selected,
  bookId:'biologie-basis2-source-supplement-context-20261008-v1',
  title:'Biologie: ergänzende Grundlagen der Stoff- und Energieumwandlung'})
const native = resolve(own, 'native-two-context')
const modelPath = resolve(native, 'book-model.json'), htmlPath=resolve(native,'book.html'), pdfPath=resolve(native,'book.pdf')
write(modelPath, subset)
const canon=read(resolve('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json'))
for (const gid of ids) {
  const goal=canon.goals.find((g:any)=>g.id===gid)
  const url=goal.resourceLinks.find((r:any)=>r.type==='goal-visualization'&&r.role==='primary').url
  const asset=resolve(own,'.'+url)
  mkdirSync(dirname(asset),{recursive:true})
  copyFileSync(resolve('app/public','.'+url),asset)
}
const options = {publicRoot:own,feedbackBaseUrl:'https://skillpilot.com/feedback',printDerivativeProfile:'standard' as const}
await writeGoalBookRenderManifest(await writeGoalBookHtml(subset, htmlPath, options), htmlPath+'.render-manifest.json')
const pdf=await writeGoalBookPdf(subset,pdfPath,options)
await writeGoalBookRenderManifest(pdf,pdfPath+'.render-manifest.json')
assert.equal(pdf.goalPageCount,2)
assert.equal(pdf.physicalPageCount,4)
const bundleDirectory=resolve(native,'bundle')
const bundle=await buildGoalBookReviewBundle(subset,{modelPath,pdfPath,pdfRenderManifestPath:pdfPath+'.render-manifest.json',
  htmlPath,htmlRenderManifestPath:htmlPath+'.render-manifest.json',outputDirectory:bundleDirectory,
  promptPath:resolve('curricula/DE/Gymnasium/quality/goal-evidence/prompts/goal-description-understanding-evidence-review-v2.md'),
  criteriaPath:resolve('curricula/DE/Gymnasium/quality/goal-evidence/prompts/biology-goal-description-understanding-evidence-review-criteria-v2.md'),goalIds:selected})
for(const file of bundle.files)write(resolve(bundleDirectory,file.relativePath),file.content)
write(resolve(bundleDirectory,'review-bundle-manifest.json'),bundle.manifest)
await verifyGoalBookReviewBundleArtifactBytes(bundle.manifest,bundleDirectory)
const artifact=(role:string)=>bundle.manifest.artifacts.find((a:any)=>a.role===role)
const campaigns=[]
for(const side of ['a','b']) {
  const outputDirectory=resolve(native,'round-'+side),round='bio-basis2-source-supplement-context-20261008-v1-independent-'+side
  const result=await createGoalDescriptionReviewCampaignArtifacts({
    bundleBytes:readFileSync(resolve(bundleDirectory,'review-bundle-manifest.json')),
    bookModelBytes:readFileSync(resolve(bundleDirectory,artifact('book_model').path)),
    reviewInputBytes:readFileSync(resolve(bundleDirectory,artifact('review_input_json').path)),
    bundleDirectory,outputDirectory,
    campaignOptions:{campaignId:round+'-campaign',roundId:round,reviewerRole:'internal_ai_reviewer',reviewPass:'first_pass',
      independenceGroupId:round,blindToOtherReviews:true,batchSize:20},
  })
  const check=await validateGoalDescriptionReviewCampaign({bundle:read(resolve(outputDirectory,'review-bundle-manifest.json')),input:result.input,campaign:result.campaign})
  assert.deepEqual(check.errors,[])
  campaigns.push({side,campaign:bind(resolve(outputDirectory,'description-review-campaign.json')),input:bind(resolve(outputDirectory,'description-review-input.json')),actualIndependentResults:0})
}
write(resolve(own,'native-two-context/ordinary-native-context.preparation.actual.json'),{
  role:'New native context inputs only; no independent verdict',full394Model:bind(fullPath),
  subsetModel:bind(modelPath),pdf:bind(pdfPath),html:bind(htmlPath),bundle:bind(resolve(bundleDirectory,'review-bundle-manifest.json')),
  physicalPageCount:pdf.physicalPageCount,pageMap:selected.map((goalId:string,index:number)=>({goalId,physicalPage:pdf.frontMatterPageCount+index+1})),
  campaigns,priorScientificReviewsAndOriginalSealsPreserved:true,independentDContextReview:'pending',
  independentPContextReview:'pending',activeWrites:0,newScientificReviewByAuthor:false,humanApproval:false,
})
console.log(JSON.stringify({ordinaryWholePages:394,exactOldWholePages:oldPageComparisons.filter((p:any)=>p.exact).length,
  changedOldWholePages:oldPageComparisons.filter((p:any)=>!p.exact).map(({wholeBefore,wholeAfter,...record}:any)=>record),
  twoNativePhysicalPages:pdf.physicalPageCount,campaignErrors:0,independentContextResults:0,activeWrites:0}))
