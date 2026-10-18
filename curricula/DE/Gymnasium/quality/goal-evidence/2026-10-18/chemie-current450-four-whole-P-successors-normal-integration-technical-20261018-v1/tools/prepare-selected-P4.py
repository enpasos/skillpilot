# SPDX-License-Identifier: Apache-2.0
"""Combine exactly the sealed MV P1 and NI/SL P3 selected-owner transitions."""
import json,pathlib,hashlib,copy,datetime
R=pathlib.Path.cwd();O=pathlib.Path(__file__).resolve().parent.parent;N=pathlib.Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-18');M=N/'chemie-current450-MV-one-whole-P-native-inactive-technical-20261018-v1';P=N/'chemie-current450-NI-SL-three-whole-P-native-inactive-technical-20261018-v1';C=pathlib.Path('curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json')
def J(p):return json.loads(pathlib.Path(p).read_text())
def H(b):return hashlib.sha256(b).hexdigest()
def D(x):return H(json.dumps(x,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode())
def pin(p):p=pathlib.Path(p);b=p.read_bytes();return {'path':str(p.relative_to(R) if p.is_absolute() else p),'sha256':H(b),'bytes':len(b)}
def put(n,x):p=O/n;p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n');return pin(p)
def check(f):assert pin(f['path'])==f
assert not (O/'PLAN.selected-four-current-whole-P-owners.normal-activation.json').exists()
for sf in [M/'SEAL.inactive-native-MV-P1-technical-preparation.json',P/'SEAL.actual-inactive-P3-native-preparation.json']:
 for f in J(sf)['files']:check(f)
mp=J(M/'PLAN.inactive-native-P1-and-exact-8ceb-residue.json');pp=J(P/'PLAN.actual-inactive-P3-original-namespaces-and-residuals.json');central=J(C);si=next(i for i,x in enumerate(central['subjects']) if x['subject']=='chemie');chem=central['subjects'][si];before=chem['positiveEvidenceConfigPaths'];assert before==J(pp['selectedCentralPatch']['path'])['actualOldPConfigArray'];assert len(before)==134
mvres=mp['residuals'][0];moves=[{'goalId':mp['targetGoalIds'][0],'oldConfig':mvres['oldConfig'],'oldReview':mvres['oldReview'],'residualConfig':mvres['newConfig'],'residualReview':mvres['newReview'],'newConfig':mp['exactNewStockConfig'],'newReview':pin(J(mp['exactNewStockConfig']['path'])['reviewPath']),'newCandidateSet':mp['exactStockCandidateSet'],'retainedResidualRowCount':1}]
for t in pp['targets']:moves.append({'goalId':t['goalId'],'oldConfig':t['oldOwnerConfig'],'oldReview':t['oldReview'],'residualConfig':t['residualConfig'],'residualReview':t['residualReview'],'newConfig':t['newNativeConfig'],'newReview':pin(t['newNativeReviewPath']),'newCandidateSet':t['newCandidateSet'],'retainedResidualRowCount':t['residualWholeRowsExact']})
assert len({m['oldConfig']['path'] for m in moves})==4;post=before[:];ops=[];targets={m['goalId'] for m in moves}
for m in moves:
 for k in ['oldConfig','oldReview','residualConfig','residualReview','newConfig','newReview','newCandidateSet']:check(m[k])
 idx=before.index(m['oldConfig']['path']);m['arrayIndex']=idx;post[idx]=m['residualConfig']['path'];ops.extend([{'op':'test','path':f'/subjects/{si}/positiveEvidenceConfigPaths/{idx}','value':m['oldConfig']['path']},{'op':'replace','path':f'/subjects/{si}/positiveEvidenceConfigPaths/{idx}','value':m['residualConfig']['path']}])
for m in moves:post.append(m['newConfig']['path']);ops.append({'op':'add','path':f'/subjects/{si}/positiveEvidenceConfigPaths/-','value':m['newConfig']['path']})
def selection(paths):
 rows={};proof=[]
 for p in paths:
  cfg=J(p);raw=pathlib.Path(cfg['reviewPath']).read_bytes();rs=[json.loads(z) for z in raw.splitlines() if z.strip()];assert [r['goalId'] for r in rs]==cfg['scope']['goalIds'];proof.append({'config':pin(p),'review':pin(cfg['reviewPath'])})
  for r in rs:assert r['goalId'] not in rows;rows[r['goalId']]=r
 return rows,proof
old,oldpins=selection(before);new,newpins=selection(post);assert len(post)==138;assert len(old)==450 and set(old)==set(new);assert all(old[g]==new[g] for g in old if g not in targets)
for m in moves:
 cfg=J(m['oldConfig']['path']);res=J(m['residualConfig']['path']);assert {k:v for k,v in cfg.items() if k not in ['reviewPath','scope']}=={k:v for k,v in res.items() if k not in ['reviewPath','scope']};assert res['scope']['goalIds']==[g for g in cfg['scope']['goalIds'] if g!=m['goalId']]
 ids=J(m['newConfig']['path'])['scope']['goalIds'];assert ids==[m['goalId']]
science={
 'MVownIndependentFIRST':pin(N/'chemie-current450-MV-acid-practical-informed-independent-b-20261018-v1/FIRST.actual-whole-MV-acid-practical-successor.informed-independent-b.json'),
 'MVsecondIndependentFIRST':pin(N/'chemie-current450-MV-last-reverse-acid-practical-informed-independent-b-20261018-v1/FIRST.independent-informed-MV-whole-material-P-and-source.json'),
 'MVsecondFinalPortableSeal':pin(N/'chemie-current450-MV-last-reverse-acid-practical-informed-independent-b-20261018-v1/SEAL.final-portable-FIRST-and-inactive-MV-placement.json'),
 'threeContextOwnIndependentFIRST':pp['ownActualScienceFIRST'],
 'threeContextOwnSeal':pin(N/'chemie-current450-NI-SL-three-conditional-contexts-informed-independent-b-20261018-v1/SEAL.own-informed-three-conditional-context-review.json'),
 'rootActualSixViewReceipt':pin(N/'chemie-current450-six-reviewed-HE-MV-view-placements-technical-20261018-v1/RECEIPT.actual-six-view-normal-integration.json'),
 'rootActualSixViewSeal':pin(N/'chemie-current450-six-reviewed-HE-MV-view-placements-technical-20261018-v1/SEAL.actual-six-view-normal-integration.json')}
assert science['MVsecondIndependentFIRST']['sha256']=='8a172da1f6ac42a0fd19aee3512d54ef765edbbffd4859e26e6b8722b088b86e';assert science['rootActualSixViewReceipt']['sha256']=='c63cdccf0e068b72ae59206db4f12dec5926286dbc41292254d848aa87dceb13'
second=J(science['MVsecondIndependentFIRST']['path']);check(second['acceptedExactWholeCandidateProfile']);check(second['acceptedExactWholeBilingualMaterial']);assert J(second['acceptedExactWholeCandidateProfile']['path'])==new[moves[0]['goalId']]['profile'];vr=J(science['rootActualSixViewReceipt']['path']);assert vr['lostEffectiveTargets']==0 and vr['newEffectiveTargetAppearances']==4 and vr['prerequisiteOnlyAndVisibleMemoryRolesPreserved']
for row in vr['rows']:check(row['normalAfter'])
contexts=[];AD=N/'chemie-current450-NI-SL-three-conditional-profile-source-author-successor-20261018-v2';author=J(AD/'AUTHOR.three-whole-current-profile-source-successors.inactive.json');mat=pin(AD/'MATERIAL.three-complete-bilingual-source-context-cases.json')
for i,r in enumerate(author['records']):assert r['wholeCandidateProfile']==new[r['goalId']]['profile'];contexts.append({'goalId':r['goalId'],'wholeProfileSHA256':D(new[r['goalId']]['profile']),'actualWholeSourceCell':r['source']['extraction'],'sourcePointer':r['source']['pointer'],'wholeSourceSHA256':D(r['source']['wholeCell']),'primaryPDF':r['source']['primaryPDF'],'physicalPageOneBased':r['source']['physicalPageOneBased'],'completeMaterial':mat,'materialPointer':'/cases/'+str(i),'sourceAndWholePScienceFIRST':science['threeContextOwnIndependentFIRST']})
contexts.append({'goalId':moves[0]['goalId'],'wholeProfileSHA256':D(new[moves[0]['goalId']]['profile']),'wholeAcceptedMaterial':second['acceptedExactWholeBilingualMaterial'],'wholeAcceptedProfileFile':second['acceptedExactWholeCandidateProfile'],'actualTwoIndependentScienceFIRSTs':[science['MVownIndependentFIRST'],science['MVsecondIndependentFIRST']],'historicalSecondViewHold':'HOLD_VIEW_ABSENCE remains literal in the immutable second FIRST; actual Root six-view receipt separately documents resolved target availability. No vote or historical file is rewritten.'})
protected=[pin(chem['landscapePath']),pin(chem['semanticKindLedgerPath']),pin(chem['visualizationQaPath'])]
for subj in central['subjects']:
 if subj['subject']!='chemie':
  for k in ['landscapePath','semanticKindLedgerPath','visualizationQaPath']:
   if subj.get(k):protected.append(pin(subj[k]))
put('BASIS.actual-four-whole-profiles-materials-and-science.json',{'role':'Technical linkage of actual separately existing science, not new votes','science':science,'contexts':contexts,'MVSourceBindings':'Whole MV source/material and practical DE/SE boundaries remain in the pinned author and independent FIRSTs; no source/mapping mutation by this installer.','noInventedPair':'MV has two actual foreign-to-author informed reviews, named here by exact agent artifacts. Three NI/SL contexts consume the actual own informed B FIRST only; Root author/GO is not an invented second scientific review.','newScientificVotes':0})
plan=put('PLAN.selected-four-current-whole-P-owners.normal-activation.json',{'role':'Guarded selected P-only transition; execution requires explicit Root GO','rootGOReceived':'Root authorizes exclusive actual P4 central activation in current session after six-view normal integration.','centralBefore':pin(C),'subjectIndex':si,'beforePArray':before,'beforePArraySHA256':D(before),'afterPArray':post,'configCounts':[len(before),len(post)],'moves':moves,'selectedArrayOperations':ops,'allOldSelectedOwnerAndAfterInputPins':oldpins+newpins,'protectedNonPFiles':protected,'targetIds':list(m['goalId'] for m in moves),'ordinaryCount':450,'other446WholeRecordsExact':True,'DCountsUnchanged':[len(chem['resolutionIndexPaths']),len(chem['resolutionSupersessions']),len(chem['resolutionWithdrawals'])],'scienceBasis':pin(O/'BASIS.actual-four-whole-profiles-materials-and-science.json'),'normalAllowedWritePaths':[str(C)],'forbiddenOtherWrites':['Canonical','Source/mappings','Views','AP/build','QA','A/M/D central fields','Other4 subject objects'],'originalSealedNativePackagesPreservedExactly':True})
print(json.dumps({'READY':plan,'configsBeforeAfter':[134,138],'ordinaryCount':450,'unchangedWholeNativeRows':446},indent=2))
