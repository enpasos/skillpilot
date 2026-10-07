// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict'
import {createHash} from 'node:crypto'
import {readFileSync,writeFileSync} from 'node:fs'
import {resolve,dirname} from 'node:path'
import {fileURLToPath} from 'node:url'
import {buildGoalBookModel} from '/home/enpasos/projects/skillpilot/app/scripts/goalBookModel.ts'
const root='/home/enpasos/projects/skillpilot',own=dirname(fileURLToPath(import.meta.url)),base=resolve(own,'..'),author=resolve(base,'biologie-q1-four-current390-native-source-operator-candidate-author-20261007-v1'),a2=resolve(base,'biologie-q1-four-current390-native-source-operator-candidate-author-20261007-v2'),read=(p:string)=>JSON.parse(readFileSync(p,'utf8')),hash=(p:string)=>'sha256:'+createHash('sha256').update(readFileSync(p)).digest('hex')
const landscape=read(resolve(own,'candidate/canonical.four.json')),config=read(resolve(author,'native/full390.four-candidate.book.config.json')),ledger=read(resolve(own,'candidate/semantic-kinds.four.json')),qa=read(resolve(own,'integration-candidates/biologie.four-paired.qa.json')),ids=read(resolve(own,'native-d-four/resolution-index.json')).batchGoalIds,assetDigests:any={}
for(const g of landscape.goals)for(const link of g.resourceLinks??[])if(link.type==='goal-visualization')assetDigests[link.url]=hash(ids.includes(g.id)?resolve(a2,'selected-existing-images',g.id+'.png'):resolve(root,'app/public',link.url.slice(1)))
const model=buildGoalBookModel({landscape,compositionView:read(resolve(root,'tmp/biologie-q1-four-current390-native-author-20261007-v1-attempt02/inputs/current390.composition-view.exact.json')),semanticKindLedger:ledger,goalVisualizationQa:qa,goalVisualizationAssetDigests:assetDigests,evidenceReviewSources:[],config}),old=read(resolve(author,'native/full390.four-candidate.book-model.json'))
assert.equal(model.pages.length,390);for(const p of model.pages){const previous=old.pages.find((x:any)=>x.goalId===p.goalId);assert.deepEqual(p,previous,'Reviewed native page drift for '+p.goalId)}
writeFileSync(resolve(own,'visualization/final-paired-QA-and-all390-native-pages.actual.json'),JSON.stringify({role:'Unchanged native model builder validates paired final QA with actual current exact image bytes',all390WholeNativePagesExactAuthorCandidate:true,allFourCurrentDPageFingerprintsExact:true,all95PriorStrictPagesExact:true,machineAIApprovalIsNotPublicationHumanApproval:true,humanApproval:false,humanTrial:false,activeWrites:false,newScientificJudgments:false,strictGain:0},null,2)+'\n',{flag:'wx'});console.log('Final QA and all390 exact native page bindings PASS')
