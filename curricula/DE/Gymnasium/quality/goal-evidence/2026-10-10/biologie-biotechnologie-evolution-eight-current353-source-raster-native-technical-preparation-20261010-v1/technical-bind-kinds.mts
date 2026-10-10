// SPDX-License-Identifier: Apache-2.0
import {readFileSync,writeFileSync} from 'node:fs';import {resolve} from 'node:path';import {pathToFileURL} from 'node:url';import assert from 'node:assert/strict';
const R='/home/enpasos/projects/skillpilot',C=R+'/tmp/m7-bio8-biotech-native-technical/isolated-normal-capsule',P='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/biologie-biotechnologie-evolution-eight-current353-source-raster-native-technical-preparation-20261010-v1';
const {fingerprintSemanticKindSourceGoal}=await import(pathToFileURL(C+'/app/scripts/goalBookModel.ts').href);
const read=(p:string)=>JSON.parse(readFileSync(resolve(R,P,p),'utf8')),put=(p:string,x:any)=>{const s=JSON.stringify(x,null,2)+'\n';writeFileSync(resolve(R,P,p),s);writeFileSync(resolve(C,P,p),s)};
const after=read('candidate/whole479-only-eight-author-deltas.inactive.json'),old=read('inputs/current394-kinds.before.exact.json'),k=read('candidate/kinds394.inactive.pending-technical.json');const deltas=[];
for(const row of k.decisions){const g=after.goals.find((x:any)=>x.id===row.goalId),fp=fingerprintSemanticKindSourceGoal(g);if(row.sourceFingerprint!==fp){deltas.push({goalId:row.goalId,beforeFingerprint:row.sourceFingerprint,currentFingerprint:fp,unchangedSemanticKind:row.semanticKind,classificationOnlyNotSemanticAtomicityApproval:true,actualAMReviewRequired:true});row.sourceFingerprint=fp;}}
assert.equal(deltas.length,3);put('candidate/kinds394.inactive.pending-technical.json',k);
old.sourceLandscapePath=P+'/inputs/intended353-whole479.before.exact.json';put('candidate/kinds394.before.path-only.json',old);
const bc=read('native/whole394-before.normal.config.json');bc.semanticKindLedgerPath=P+'/candidate/kinds394.before.path-only.json';put('native/whole394-before.normal.config.json',bc);
const sc=read('sources/intended353-before-atlas.normal.config.json');sc.semanticKindLedgerPath=P+'/candidate/kinds394.before.path-only.json';put('sources/intended353-before-atlas.normal.config.json',sc);
put('checks/actual-normal-three-source-classification-fingerprint-deltas.json',{schemaVersion:1,role:'Inactive technical source-fingerprint bindings for native model preparation only',deltas,newIndependentSemanticAtomicityDecision:false,newMemoryDecision:false,activeWrites:[]});console.log(JSON.stringify({changedClassificationSourceFingerprints:3,AMScienceApproval:0}));
