# SPDX-License-Identifier: Apache-2.0
import json, hashlib, pathlib, datetime
P = pathlib.Path(__file__).parent
ROOT = pathlib.Path.cwd()
CAN = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'
read = lambda p: json.loads(pathlib.Path(p).read_text())
sha = lambda p: hashlib.sha256(pathlib.Path(p).read_bytes()).hexdigest()
hash_obj = lambda x: hashlib.sha256(json.dumps(x, ensure_ascii=False, sort_keys=True, separators=(',',':')).encode()).hexdigest()
before = {g['id']:g for g in read(P/'inputs/retained407/prospective-input-tree'/CAN)['goals']}
after = {g['id']:g for g in read(P/'inputs/proposed-active-tree'/CAN)['goals']}
bindings = read(P/'inputs/34-current-strict-d-binding-inputs.author-frozen.json')
oldpages = {p['goalId']:p for p in read(P/'inputs/retained407/actual-current-full378.after-current-typography.book-model.json')['pages']}
newpages = {p['goalId']:p for p in read(P/'inputs/full378.after-route-source.author-candidate.book-model.json')['pages']}
livepages = {p['goalId']:p for p in read(P/'inputs/live376.current-strict-binding-input.book-model.json')['pages']}
assert len(before)==477 and len(after)==479
assert len(oldpages)==len(newpages)==378 and set(oldpages)==set(newpages)
changed = [g for g in before if before[g]!=after[g]]
new = sorted(set(after)-set(before))
assert len(changed)==8 and len(new)==2
strict = bindings['currentStrictGoalIds'];assert len(strict)==104
assert all(before[g]==after[g] for g in strict)
assert set(new)=={'4cb74d76-99f1-5264-b1e3-448cda47b005','171b47e2-2c53-50f2-a145-a26b896fd73f'}
HE = {'3d6699ae-ebbd-5a55-8798-b809a9d74f0a','18819a59-2442-530f-a7c3-26755398ec66'}
def atom_desc(g,seen=None):
    seen=set() if seen is None else seen
    assert g not in seen
    seen=seen|{g}
    goal=before[g]
    return {g} if not goal.get('contains') else set().union(*(atom_desc(c,seen) for c in goal['contains']))
cluster='a0893975-1677-5dae-bbfb-675789be4f17'
old_atoms=atom_desc(cluster)
exams=['00139854-e5a7-5c12-ab50-2268c80bf776','c91350bc-7d2e-523c-bd50-0324bccfcf98','bf6c39f0-1e44-53b2-8ff6-025f2e36e125']
route_checks=[]
for g in exams:
    assert cluster in before[g]['requires'] and cluster not in after[g]['requires']
    assert not HE.intersection(after[g]['requires'])
    assert set(after[g]['requires'])==(set(before[g]['requires'])-{cluster})|(old_atoms-HE)
    be=before[g]['examData'];ae=after[g]['examData']
    assert [x for x in be['coveredGoalIds'] if x!=cluster]==ae['coveredGoalIds']
    assert {k:v for k,v in be.items() if k!='coveredGoalIds'}=={k:v for k,v in ae.items() if k!='coveredGoalIds'}
    route_checks.append({'goalId':g,'oldClusterExpandedAtomicCount':len(old_atoms),'remainingExpandedAtomicCount':len(old_atoms-HE),'taskSolutionScoringReviewStatusExact':True,'assessmentCoverageOnlyClusterRemoved':True})
graduation='14577339-c0ca-5f4b-b1d6-6897d3c4b7a9'
graduation=next(g for g in before if g.startswith('14577339'))
assert set(before[graduation]['requires'])-set(after[graduation]['requires'])==HE
assert not set(after[graduation]['requires'])-set(before[graduation]['requires'])
practice=next(g for g in before if g.startswith('4beeb141'))
assert set(after[practice]['contains'])-set(before[practice]['contains'])==set(new)
for prefix,covered in [('4cb74d76',{'0d59b62e-d3f9-5969-b961-0c5e26316c04'}),('171b47e2',HE)]:
    g=next(g for g in new if g.startswith(prefix))
    assert set(after[g]['requires'])==set(after[g]['examData']['coveredGoalIds'])==covered
    assert after[g]['extendedData']['applicabilityFromRequires'] is True
    assert after[g]['examData']['reviewStatus']=='needs_review'
    sc=after[g]['examData']['scoring'];assert sum(s['points'] for s in sc['steps'])==sc['maxPoints']==sc['passingPoints']==24
page_rows=[]
for r in bindings['perGoalLiveReviewedAndRoutePageInputs']:
    g=r['goalId'];old=r['beforeReviewed378Page'];newp=r['afterRoute378Page']
    assert old==oldpages[g] and newp==newpages[g] and r['live376Page']==livepages[g]
    fields=sorted(k for k in set(old)|set(newp) if old.get(k)!=newp.get(k))
    assert fields==['externalReverseRequires','pageFingerprint']
    assert old['goalFingerprint']==newp['goalFingerprint']
    oldback={x['goalId']:x for x in old['externalReverseRequires']}
    newback={x['goalId']:x for x in newp['externalReverseRequires']}
    added=sorted(set(newback)-set(oldback));assert not set(oldback)-set(newback)
    assert added==sorted(x['goalId'] for d in r['visibleDependentBacklinkDeltas'] for x in d['added'])
    assert set(added)<=set(exams)
    for target in added:
        assert g in after[target]['requires'] and newback[target]['title']==after[target]['title']
        assert newback[target]['canonicalUrl'].endswith('#goal-'+target)
    page_rows.append({'goalId':g,'title':newp['title'],'rawVerdict':'KEEP','bindingStatus':'RAW_ONLY_NOT_NATIVE_D_APPROVAL','changedFields':fields,'live376ToReviewed378PriorChangedFields':r['live376ToReviewed378ChangedFields'],'addedDependentGoalIds':added,'beforePageFingerprint':old['pageFingerprint'],'afterPageFingerprint':newp['pageFingerprint'],'beforeWholePageOwnNormalizedSHA256':hash_obj(old),'afterWholePageOwnNormalizedSHA256':hash_obj(newp),'unchangedCanonicalWholeGoalOwnNormalizedSHA256':hash_obj(after[g]),'unchangedGoalFingerprint':newp['goalFingerprint'],'ownPositiveEvidenceAuthorProvidedSemanticOwnSHA256':hash_obj(r['unchangedOwnPositiveSemantic']),'ownPositiveEvidenceAuthorProvidedReviewInputOwnSHA256':hash_obj(r['unchangedOwnPositiveReviewInput']),'textTitleDescriptionBreadcrumbsPrerequisitesVisualizationExact':True,'reason':'Zusätzliche Rückverweise sind tatsächliche direkte Voraussetzungen der drei unveränderten Q1-Aufgaben nach Expansion der vorherigen Cluster-Voraussetzung. Sie behaupten weder Aufgabenabdeckung aller Voraussetzungen noch eine neue fachliche Leistung des Seitenziels. Prior-Live376-Deltas bleiben separat; kein PDF oder natives D-Gate geprüft.'})
assert len(page_rows)==34
assert sum(oldpages[g]!=newpages[g] for g in strict)==34
assert all(oldpages[g]==newpages[g] for g in set(strict)-{r['goalId'] for r in page_rows})
# Independent arithmetic, using the stated measurement models and no inferred acceptance tolerance.
asc=[(v-1.00)/1000*.000500/.01000*20*176.12 for v in [16.00,16.10,15.90]]
par=[(a-100)/1200*100 for a in [24100,24220,23980]]
assert abs(sum(asc)/3-2.6418)<1e-12 and sum(par)/3==2000
assert all(0<((a-100)/1200)<25 for a in [24100,24220,23980])
assert .15<=min(.25,.30) and .15<=.20 and .03>.02 and .03<=.05
freeze_checks=[]
for file in [P/'inputs/author-candidate.final.freeze.json',P/'inputs/retained407/reviewed-integration.final.freeze.json']:
    f=read(file)
    for row in f['files']:
        actual=sha(ROOT/row['path']);expected=row['sha256'].removeprefix('sha256:')
        assert actual==expected, row['path']
    freeze_checks.append({'inputFreeze':str(file),'sha256':sha(file),'fileCount':len(f['files']),'allFilesStillExact':True})
assert all(f.stat().st_nlink==1 for f in (P/'native-physical-isolate').rglob('*') if f.is_file())
result={'checkedAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'reviewer':'independent-b','status':'PASS targeted structural/arithmetic checks; quantitative control criterion REVISE is substantive','canonicalBeforeSHA256':sha(P/'inputs/retained407/prospective-input-tree'/CAN),'canonicalAfterSHA256':sha(P/'inputs/proposed-active-tree'/CAN),'unchangedOldGoals':len(before)-len(changed),'changedOldGoalIds':changed,'newAssessmentGoalIds':new,'all104StrictWholeGoalsExact':True,'strictPageTriplesRawChecked':34,'strictUnchangedRemainingPages':70,'all378PageIdsExact':True,'routeChecks':route_checks,'ascorbicPerReplicate_gL':asc,'ascorbicMean_gL':sum(asc)/3,'methylparabenPerReplicate_mgL':par,'methylparabenMean_mgL':sum(par)/3,'bothRubricsTotalAndPassPoints':24,'parabenColdestLimitAndLinearIntervalExplicit':True,'freezeChecks':freeze_checks,'nativeIsolationPhysicalCopiesOnly':True,'nativeDFreigabe':False,'nativePDFPageImageReview':False,'unchangedEightSciencePImageReviewsRestarted':False,'fullCQRRun':False,'activeWrites':False,'humanApproval':False,'humanTrial':False}
(P/'results/targeted-checks.actual.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
(P/'results/34-page-triples.raw-verdicts.json').write_text(json.dumps({'status':'raw independent context conclusions only','nativeDFreigabe':False,'rows':page_rows,'humanApproval':False,'humanTrial':False},ensure_ascii=False,indent=2)+'\n')
print(json.dumps({k:result[k] for k in ['status','unchangedOldGoals','changedOldGoalIds','newAssessmentGoalIds','ascorbicMean_gL','methylparabenMean_mgL','all104StrictWholeGoalsExact','strictPageTriplesRawChecked','freezeChecks']},ensure_ascii=False))
