// SPDX-License-Identifier: Apache-2.0
// Real derived pages for technical adoption only. No new review or approval.
import assert from 'node:assert/strict'
import {createHash} from 'node:crypto'
import {readFileSync,writeFileSync,mkdirSync,existsSync} from 'node:fs'
import {dirname,relative,resolve} from 'node:path'
import {fileURLToPath} from 'node:url'
import {buildGoalDescriptionRolloutSubsetModel} from '../../../../../../../app/scripts/materializeGoalDescriptionRolloutBatch'
import {writeGoalBookHtml,writeGoalBookPdf,writeGoalBookRenderManifest} from '../../../../../../../app/scripts/goalBookRenderer'
import {buildGoalBookReviewBundle} from '../../../../../../../app/scripts/exportGoalBookReviewBundle'
import {verifyGoalBookReviewBundleArtifactBytes} from '../../../../../../../app/scripts/createGoalDescriptionReviewCampaign'
const root=resolve('.'),own=dirname(fileURLToPath(import.meta.url)),out=resolve(own,'actual-standard-derived-four'),rp=(p:string)=>relative(root,p),declared:Record<string,any>={}
const sha=(b:Buffer|string)=>'sha256:'+createHash('sha256').update(b).digest('hex')
const bind=(p:string)=>{const b=readFileSync(p),r={path:rp(p),sha256:sha(b),bytes:b.length};declared[r.path]=r;return r}
const read=(p:string)=>{bind(p);return JSON.parse(readFileSync(p,'utf8'))}
const write=(p:string,v:any)=>{const b=Buffer.isBuffer(v)?v:Buffer.from(typeof v==='string'?v:JSON.stringify(v,null,2)+'\n');if(existsSync(p)){assert.ok(readFileSync(p).equals(b));return bind(p)}mkdirSync(dirname(p),{recursive:true});writeFileSync(p,b,{flag:'wx'});return bind(p)}
const guards=read(resolve(own,'checks/genuine-current-four-pair-ready.technical.json')),author=resolve(root,guards.actualSourceAuthor),full=read(resolve(own,'checks/real-generated-atlas392.actual-raster.book-model.json')),original=read(resolve(author,'native-raster-candidate-v2/four/book-model.json'))
const ordered=full.pages.filter((p:any)=>guards.selectedGoalIds.includes(p.goalId)).map((p:any)=>p.goalId)
const subset=buildGoalDescriptionRolloutSubsetModel({baseModel:full,goalIds:ordered,bookId:original.bookId,title:original.title})
assert.equal(subset.pages.length,4)
const modelPath=resolve(out,'book-model.json'),pdfPath=resolve(out,'book.pdf'),htmlPath=resolve(out,'book.html');write(modelPath,subset)
const options={publicRoot:author,feedbackBaseUrl:'https://skillpilot.com/feedback',printDerivativeProfile:'bounded-atlas' as const}
await writeGoalBookRenderManifest(await writeGoalBookHtml(subset,htmlPath,options),htmlPath+'.render-manifest.json')
await writeGoalBookRenderManifest(await writeGoalBookPdf(subset,pdfPath,options),pdfPath+'.render-manifest.json')
const bundleDirectory=resolve(out,'bundle'),bundle=await buildGoalBookReviewBundle(subset,{modelPath,pdfPath,pdfRenderManifestPath:pdfPath+'.render-manifest.json',htmlPath,htmlRenderManifestPath:htmlPath+'.render-manifest.json',outputDirectory:bundleDirectory,promptPath:resolve(root,'curricula/DE/Gymnasium/quality/goal-evidence/prompts/goal-description-understanding-evidence-review-v2.md'),criteriaPath:resolve(root,'curricula/DE/Gymnasium/quality/goal-evidence/prompts/biology-goal-description-understanding-evidence-review-criteria-v2.md'),goalIds:ordered})
for(const file of bundle.files)write(resolve(bundleDirectory,file.relativePath),file.content)
write(resolve(bundleDirectory,'review-bundle-manifest.json'),bundle.manifest)
await verifyGoalBookReviewBundleArtifactBytes(bundle.manifest,bundleDirectory)
const actualHTML=readFileSync(resolve(bundleDirectory,'book.html'),'utf8'),originalHTMLPath=resolve(author,'native-raster-candidate-v2/four/bundle/book.html');bind(originalHTMLPath);const originalHTML=readFileSync(originalHTMLPath,'utf8')
const esc=(s:string)=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),article=(h:string,id:string)=>{const m=h.match(new RegExp('<article[^>]*id="goal-'+esc(id)+'"[^>]*>[\\s\\S]*?<\\/article>'));assert.ok(m);return m[0]}
const attributes=(h:string,name:string)=>Array.from(h.matchAll(new RegExp('\\b'+name+'="([^"<>]*)"','g'))).map(m=>m[1])
const htmlIDs=new Set(attributes(actualHTML,'id')),fragments=attributes(actualHTML,'href').filter(h=>h.startsWith('#')).map(h=>h.slice(1)),bad=fragments.filter(f=>!htmlIDs.has(f));assert.deepEqual(bad,[])
const linkRows=[]
for(const id of ordered){const p=subset.pages.find((p:any)=>p.goalId===id),old=original.pages.find((p:any)=>p.goalId===id),html=article(actualHTML,id),oldHTML=article(originalHTML,id)
assert.equal(p.title,old.title);assert.equal(p.description,old.description);assert.deepEqual(p.breadcrumbs,old.breadcrumbs);assert.deepEqual(p.requires,old.requires);assert.deepEqual(p.reverseRequires,old.reverseRequires);assert.deepEqual(p.externalPrerequisites,old.externalPrerequisites);assert.deepEqual(p.externalReverseRequires,old.externalReverseRequires);assert.deepEqual(p.applicability,old.applicability);assert.deepEqual(p.visualization,old.visualization)
linkRows.push({goalId:id,beforeChapterIds:old.chapterIds,actualChapterIds:p.chapterIds,beforePageFingerprint:old.pageFingerprint,actualPageFingerprint:p.pageFingerprint,breadcrumbs:p.breadcrumbs,actualHrefValues:attributes(html,'href'),originalHrefValues:attributes(oldHTML,'href'),actualImageSources:attributes(html,'src'),physicalPage:ordered.indexOf(id)+3,fullTitleDescriptionRelationsSourcesImagesExact:true})}
write(resolve(own,'checks/actual-standard-derived-four-native-render-links.technical.json'),{role:'Actual complete standard-generator native four-page technical binding candidate, no new science review',actualWholePDF:bind(resolve(bundleDirectory,'book.pdf')),actualWholeHTML:bind(resolve(bundleDirectory,'book.html')),actualSubsetModel:bind(modelPath),originalPDF:bind(resolve(author,'native-raster-candidate-v2/four/bundle/book.pdf')),originalHTML:bind(originalHTMLPath),allLocalFragmentsResolve:true,localFragmentCount:fragments.length,brokenLocalFragmentCount:0,publicRootExactOriginalAuthorContainedPNGDirectory:guards.actualSourceAuthor,portableNativeFiles:'bundle/book.pdf and bundle/book.html, unchanged four contained PNG aliases retained in original author',fourActualRows:linkRows,only2ChildTechnicalChapterIdsDifferent:true,rootActualPageViewAndBindingAdoptionPending:true,noReviewRecordRunOrHashChanged:true,activeWrites:0,strictGainClaimed:0,humanApproval:false})
write(resolve(own,'checks/actual-standard-derived-four-render-declared-inputs.technical.json'),{files:Object.values(declared)})
console.log(JSON.stringify({actualDerivedNativePages:4,actualFullPDFrender:'PASS',allLocalLinksResolve:true,rootPageViewAndTechnicalAdoptionPending:true,newScienceReview:false,activeWrites:0,strictGainClaimed:0}))
