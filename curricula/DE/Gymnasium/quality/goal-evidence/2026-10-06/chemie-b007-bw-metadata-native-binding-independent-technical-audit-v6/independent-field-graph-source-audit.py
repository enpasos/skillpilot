# Apache-2.0. Independent recursive comparisons; no writes outside own dossier.
from pathlib import Path
import json, hashlib, copy, datetime
repo=Path.cwd()
base=repo/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06'
author=base/'chemie-b007-bw-reviewed-metadata-native-binding-preparation-author-v6'
own=base/'chemie-b007-bw-metadata-native-binding-independent-technical-audit-v6'
def read(p):return json.loads(p.read_text())
def hashp(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def bind(p):return {'path':str(p.relative_to(repo)) if p.is_relative_to(repo) else str(p),'sha256':'sha256:'+hashp(p),'bytes':p.stat().st_size}
def save(n,d):(own/n).write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n')
def diff(a,b,p=''):
    if type(a)!=type(b):return [{'pointer':p,'before':a,'after':b}]
    if isinstance(a,dict):
        out=[]
        for k in sorted(a.keys()|b.keys()):
            q=p+'/'+k.replace('~','~0').replace('/','~1')
            if k not in a or k not in b:out.append({'pointer':q,'before':a.get(k),'after':b.get(k),'keyMembershipChanged':True})
            else:out+=diff(a[k],b[k],q)
        return out
    if isinstance(a,list):
        if len(a)!=len(b):return [{'pointer':p,'beforeCount':len(a),'afterCount':len(b),'arrayLengthChanged':True}]
        return sum((diff(x,y,p+'/'+str(i)) for i,(x,y) in enumerate(zip(a,b))),[])
    return [] if a==b else [{'pointer':p,'before':a,'after':b}]
plan=read(author/'exact-selected-five-file-metadata-application-and-native-derivative-candidates.json')
rows=[]
for r in plan['actual21ScalarOperationsAcrossFiveCurrentFiles']:
    b=repo/r['actualFrozenBefore']['path'];a=repo/r['actualFrozenAfter']['path'];active=repo/r['intendedFutureActivePath']
    assert bind(b)==r['actualFrozenBefore'] and bind(a)==r['actualFrozenAfter'] and bind(active)==r['exactCurrentActiveBinding']
    assert active.read_bytes()==b.read_bytes()
    actual=diff(read(b),read(a))
    assert actual==sorted(r['exactFieldDeltas'],key=lambda r:r['pointer']) or sorted(actual,key=lambda r:r['pointer'])==sorted(r['exactFieldDeltas'],key=lambda r:r['pointer'])
    for x in actual:assert isinstance(x['before'],str) and isinstance(x['after'],str)
    rows.append({'activePath':r['intendedFutureActivePath'],'before':bind(b),'after':bind(a),'actualDeltaCount':len(actual),'actualScalarDeltas':actual,'activeCurrentExactlyBaseline':True})
assert len(rows)==5 and sum(x['actualDeltaCount'] for x in rows)==21
lane_roots=[author/x/'checkout' for x in ['baseline-current','future-metadata-only']]
paths=[{str(p.relative_to(root)) for p in root.rglob('*') if p.is_file() and not p.is_symlink()} for root in lane_roots]
assert paths[0]==paths[1]
pairs=[]
for path in sorted(paths[0]):
    b=lane_roots[0]/path;a=lane_roots[1]/path
    pairs.append({'relativeCheckoutPath':path,'beforeSHA256':hashp(b),'afterSHA256':hashp(a),'byteExact':b.read_bytes()==a.read_bytes()})
changed={x['relativeCheckoutPath'] for x in pairs if not x['byteExact']}
intended={x['activePath'] for x in rows}
assert changed==intended|{'app/scripts/config/goal-books/source-views/de-gym-chemistry-national-atlas/source-projection.receipt.json'}
canon='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'
before=read(lane_roots[0]/canon);after=read(lane_roots[1]/canon)
assert len(before['goals'])==len(after['goals'])==479
assert [g['id'] for g in before['goals']]==[g['id'] for g in after['goals']]
graph=[]
for g,h in zip(before['goals'],after['goals']):
    d=diff(g,h)
    assert all(x['pointer']=='/extendedData/provenance/sourceRef' for x in d)
    graph.append({'goalId':g['id'],'titleDE':g['title'],'titleEN':g.get('titleEn'),'wholeDEENExact':all(g.get(k)==h.get(k) for k in ['title','titleEn','description','descriptionEn']),'wholeGoalExceptExactReviewedProvenanceSourceRefExact':True,'requiresContainsExact':g.get('requires')==h.get('requires') and g.get('contains')==h.get('contains'),'resourceLinksExact':g.get('resourceLinks')==h.get('resourceLinks'),'actualDeltas':d})
assert sum(bool(x['actualDeltas']) for x in graph)==5
report=read(base/'chemie-current-fifteen-reviewed-active-integration-v1/current-central-five-gate.actual.report.json')
protected={s['subject']:s['strictCompleteGoalIds'] for s in report['subjects']}
assert {k:len(v) for k,v in protected.items()}=={'mathematik':807,'physik':478,'chemie':127,'biologie':74}
protected_changed=[r['goalId'] for r in graph if r['actualDeltas'] and r['goalId'] in protected['chemie']]
assert len(protected_changed)==4
ab=[]
for name,file,expected in [('chemie-b007-bw-source-locator-version-independent-a-v5','bw-source-locator-version-independent-a-v5.final.freeze.json','c969392b908639d9aaf83f75a2f71a688b36261e57f998886233da8735408afa'),('chemie-b007-bw-source-locator-version-independent-b-v5','independent-b-bw-source-locator-version.final.freeze.json','6ba654676e37e0ee7d69b598bc11387960fef8f1b5c891ae0dcdb16a57f7a23e')]:
    folder=base/name;p=folder/file;f=read(p);assert hashp(p)==expected
    checks=[]
    for x in f['files']:
        q=repo/x['path'] if x['path'].startswith('curricula/') else folder/x['path']
        b=bind(q);assert b['sha256'].removeprefix('sha256:')==x['sha256'].removeprefix('sha256:') and b['bytes']==x['bytes'];checks.append(b)
    ab.append({'freeze':bind(p),'allOwnFrozenFilesExact':checks})
decisionA=read(base/'chemie-b007-bw-source-locator-version-independent-a-v5/actual-own-primary-raster-sight-and-bounded-science-verdict.independent-a.json')
decisionB=read(base/'chemie-b007-bw-source-locator-version-independent-b-v5/independent-b-source-locator-version-verdict.json')
assert all(x['decision']=='KEEP' for x in decisionB['sourceDocumentURLDecisions'])
assert len(decisionB['separateEightParagraphAlternative']['paragraphFieldDecisions'])==8
assert all(x['decision']=='KEEP' for x in decisionB['separateEightParagraphAlternative']['paragraphFieldDecisions'])
active_lane=next(x for x in decisionB['canonicalFieldDecisionsBySeparateBaseline'] if x['lane']=='chemie-current-active-base-alternative')
assert active_lane['decision']=='KEEP' and len(active_lane['fieldDecisions'])==5
assert sorted(x['goalId'] for x in active_lane['fieldDecisions'])==sorted(x['goalId'] for x in graph if x['actualDeltas'])
pdfs=[repo/'curricula/DE/Gymnasium/input/BW/BP2016BW_ALLG_GYM_CH_V2.pdf',base/'chemie-b007-bw-three-source-locator-targeted-author-v5/sources/BW-official-live-v2.actual.pdf',base/'chemie-b007-bw-source-locator-version-independent-b-v5/sources/actual-official-V2.pdf']
assert all(hashp(p)=='3ae66c6c2db6371aa24153484f78832f1dfc2097deac8b8dfbffeb32bed28c62' for p in pdfs)
snapshots=[read(root/'app/scripts/config/goal-books/de-gym-chemistry-national-atlas.inputs.json')['sourceDocumentSnapshots'][4] for root in lane_roots]
assert diff(snapshots[0],snapshots[1])==[{'pointer':'/url','before':snapshots[0]['url'],'after':snapshots[1]['url']}]
raw_source=read(author/'baseline-current/native-artifacts/national359.original-sources.json')
next_source=read(author/'future-metadata-only/native-artifacts/national359.original-sources.json')
source_deltas=diff(raw_source,next_source)
assert len(source_deltas)==17
assert sum(x['pointer']=='/bookDigest' for x in source_deltas)==1
assert sum(x['pointer'].startswith('/documents/') and x['pointer'].endswith('/url') for x in source_deltas)==1
assert sum(x['pointer'].startswith('/evidence/') and x['pointer'].endswith('/sourceRef') for x in source_deltas)==15
top_model_deltas=[]
for n in ['current378.full.book-model.json','national359.book-model.json']:
    d=diff(read(author/'baseline-current/native-artifacts'/n),read(author/'future-metadata-only/native-artifacts'/n))
    assert all(not x['pointer'].startswith('/pages/') and not x['pointer'].startswith('/navigation/') and not x['pointer'].startswith('/chapters/') for x in d)
    top_model_deltas.append({'model':n,'actualDeltas':d,'allWholePagesNavigationChaptersExact':True})
native=read(own/'independent-native-production-contract-and-fingerprint.receipt.json')
src=read(own/'independent-186-changed-source-attributions.actual.json')
attribution_deltas=[]
for r in src['rows']:
    d=diff(r['before'],r['after'])
    assert all(x['pointer'].endswith('/completeDocument/url') or x['pointer'].endswith('/sourceRef') for x in d)
    attribution_deltas.append({'goalId':r['goalId'],'protectedCurrent127':r['protectedCurrent127'],'actualMetadataDeltas':d,'allIDsKindsScopesOperatorsMappingTargetsAndCoverageExact':True})
assert len(attribution_deltas)==186 and sum(x['protectedCurrent127'] for x in attribution_deltas)==68
holds=decisionB['preservedHolds'];assert [holds['nationalSourceObligations'],holds['originalMatchedRows'],holds['affectedExistingSourceViews']]==[403,413,40]
old_path=base/'chemie-b007-one-inherited-prerequisite-targeted-author-v4/qa-artifacts/DE_DEU_S_GYM_CANONICAL_CHEMIE.one-inherited-prerequisite.author-candidate.json'
old={g['id']:g for g in read(old_path)['goals']};current={g['id']:g for g in before['goals']}
old_diff=[i for i in protected['chemie'] if old.get(i)!=current[i]]
assert len(old_diff)==9
save('independent-21-fields-five-files-and479-whole-goals.actual.json',{'schemaVersion':1,'createdAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'actualFields':rows,'scalarOperations':21,'activeFiles':5,'completeCheckoutFilePairs':pairs,'changedCheckoutFiles':sorted(changed),'whole479GoalRows':graph,'current479UsedAsOnlyBase':True,'historicalV4NotAdopted':True,'historicalV4ProtectedWholeObjectDifferences':old_diff,'fourProtectedOnlyProvenanceDeltas':protected_changed,'netStrictGrowth':0,'activeWrites':0})
save('independent-source-AB-keeps-and-same-V2-binding.actual.json',{'schemaVersion':1,'role':'technical exact adoption of already completed bounded metadata decisions; no new science','independentSourceFreezesAndAllOwnFiles':ab,'AActualDecisionsRead':decisionA['decisions'],'BActualURLDecisionsRead':decisionB['sourceDocumentURLDecisions'],'BActualEightParagraphFieldsRead':decisionB['separateEightParagraphAlternative']['paragraphFieldDecisions'],'BActualFiveCurrentBaselineFieldsRead':active_lane,'sameRetainedV2PDFBindings':list(map(bind,pdfs)),'BExistingOfficialHTTPSRetrievalReceipt':bind(base/'chemie-b007-bw-source-locator-version-independent-b-v5/actual-official-https-pdf-retrieval.independent-b.json'),'snapshotBefore':snapshots[0],'snapshotAfter':snapshots[1],'retainedHolds':holds,'noNewPDFRasterScienceReview':True,'sourceHoldsCleared':0,'activeWrites':0})
save('independent-native-source-deltas-and68-protected-routing.actual.json',{'schemaVersion':1,'rawSourceIndexScalarDeltas':source_deltas,'rawSourceIndexScalarDeltaCount':17,'actualWholeBookTopLevelDeltas':top_model_deltas,'attributionRows':attribution_deltas,'actualAttributionChangedGoals':186,'actualAttributionChangedProtected127':68,'unchangedSourceClaimsPreciselyLimited':True,'fullSourcesScopesAndWitnessesUnchangedExceptExplicitURLLocator':True,'currentStrictSets':protected,'originalHolds40341340Retained':True,'currentNativeUnresolved496AndOmitted19Retained':native['counts']['unresolvedSourceScopeDecisions']==496 and native['counts']['omittedGoals']==19,'sourceHoldsCleared':0,'strictCompletionsAdded':0,'humanApproval':False,'activeWrites':0})
print(json.dumps({'scalarOperations':21,'activeFiles':5,'canonicalWholeGoals':479,'completeCheckoutPairs':len(pairs),'changedCheckoutPaths':len(changed),'sourceIndexScalarDeltas':17,'realAttributionChanges':186,'protectedAttributionChanges':68,'sourceHolds40341340Retained':True,'sameV2PDFBytes':True,'decisionCandidate':'APPLY_SAFE_METADATA_ONLY'},ensure_ascii=False))
