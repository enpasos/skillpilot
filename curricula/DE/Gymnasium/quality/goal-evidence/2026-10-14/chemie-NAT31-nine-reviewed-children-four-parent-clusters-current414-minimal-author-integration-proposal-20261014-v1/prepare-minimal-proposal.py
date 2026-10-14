#!/usr/bin/env python3
"""Finite inactive reuse proposal. No new science, host writes, or old hash relabels."""
import collections, copy, datetime, hashlib, json, pathlib

REPO = pathlib.Path('/home/enpasos/projects/skillpilot')
E = pathlib.Path('curricula/DE/Gymnasium/quality/goal-evidence')
E12, E14 = E/'2026-10-12', E/'2026-10-14'
OWN = pathlib.Path(__file__).resolve().parent
REL = OWN.relative_to(REPO)
BASE = E14/'chemie-rest6-two-whole-atoms-on-final-source6-current412-minimal-inactive-technical-20261014-v1'
I292 = E14/'chemie-source6-current412-five-paired-native-whole-gates-existing287-integration-technical-20261014-v1'
V6 = E12/'chemie-q2-current220-preserving-final-structure-source-technical-20261012-v6'
V3 = E12/'chemie-q2-naturstoffe-current407-targeted-remediation-root-preparation-20261012-v3/later-stage-source6'
A2 = E12/'chemie-q2-naturstoffe-current407-fresh-independent-a-20261012-v2'
B2 = E12/'chemie-q2-naturstoffe-current407-independent-b-20261012-v2'
A3 = E12/'chemie-q2-current407-remediation24-fresh-independent-a-20261012-v3'
B3 = E12/'chemie-q2-current407-remediation24-fresh-independent-b-20261012-v3'
PARENTS = ['62149f36-87c0-5a2d-8a78-e7d4203f58c2','8761cfd2-aa1a-56f1-9272-9cf66ef4b271','9deeac6f-d380-52c5-8fc9-e532ab1f4d3f','bebea164-dfd7-51d9-a54a-7029c78b7f5f']
CHILDREN = ['e9d34f34-2a43-5cc7-bcca-1d08e057531d','d8eeed29-d1b7-5a48-94b5-343629f8e867','684ffe86-3a9f-5514-866a-47d16372f2d4','dfaef897-dcd4-55d4-a1fe-3dd90b818853','1d2e7b80-653d-57b8-a284-8ede5a353b73','cf270aaf-235a-55a7-94a2-c4d9d7570a6b','ee359c2e-e339-5b56-bceb-cc7517b36bf2','2f3cdec5-f845-5b0f-841e-8b1d47de0281','7371c82e-6668-5ddc-ba78-347113fcddf8']
SELECTED = set(PARENTS+CHILDREN)
bindings = {}
def sha(b): return 'sha256:'+hashlib.sha256(b).hexdigest()
def bind(p):
    p=pathlib.Path(p); p=p.relative_to(REPO) if p.is_absolute() else p
    b=(REPO/p).read_bytes(); out={'path':str(p),'sha256':sha(b),'bytes':len(b)}; bindings[str(p)]=out; return out
def read(p): bind(p); return json.loads((REPO/p).read_text())
def lines(p): bind(p); return [json.loads(s) for s in (REPO/p).read_text().splitlines() if s.strip()]
def put(name,d):
    p=OWN/name;p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n');return str(p.relative_to(REPO))
def exact_lines(src, ids, key, dest):
    bind(src); selected=[]; provenance=[]
    for no,line in enumerate((REPO/src).read_bytes().splitlines(keepends=True),1):
        if line.strip() and json.loads(line).get(key) in ids:
            selected.append(line);provenance.append({'source':str(src),'line':no,'lineSha256':sha(line),'record':json.loads(line)})
    p=OWN/dest;p.parent.mkdir(parents=True,exist_ok=True);p.write_bytes(b''.join(selected));return provenance
def diffs(a,b): return [k for k in sorted(set(a)|set(b)) if a.get(k)!=b.get(k) or (k in a)!=(k in b)]

basepath=BASE/'candidate/canonical542.prospective414.on-final-source6-539.minimal-inactive.json'
oldpath=V6/'candidate/canonical533.current407.current220-preserving.inactive.json'
v3path=V3/'candidate/canonical532.current-active-plus-N2-P9-source6-ee4.inactive.json'
base,old,v3=read(basepath),read(oldpath),read(v3path)
bm={g['id']:g for g in base['goals']};om={g['id']:g for g in old['goals']};v3m={g['id']:g for g in v3['goals']}
assert len(bm)==542 and not set(CHILDREN)&set(bm)
assert all(om[i]==v3m[i] for i in SELECTED)
candidate=copy.deepcopy(base)
candidate['goals']=[copy.deepcopy(om[g['id']]) if g['id'] in PARENTS else g for g in candidate['goals']]+[copy.deepcopy(om[i]) for i in CHILDREN]
cm={g['id']:g for g in candidate['goals']}
assert len(cm)==551 and all(cm[i]==bm[i] for i in set(bm)-set(PARENTS))
assert cm['442c31c5-c561-5c7a-90bb-2335d779175c']==bm['442c31c5-c561-5c7a-90bb-2335d779175c'] and cm['442c31c5-c561-5c7a-90bb-2335d779175c']['weight']==1.2
measure=read(I292/'MEASURE.actual292-of412-source6-five-new-core-closures-preserved287.actual.json')
closed=measure['strictCompleteGoalIds'];assert len(closed)==292 and not set(PARENTS)&set(closed)
assert all(cm[i]==bm[i] for i in closed)
cpath=put('candidate/canonical551.prospective419.on-final542.exact-reviewed-NAT9.inactive.json',candidate)
parent_cas=[]
for i in PARENTS:
    assert diffs(bm[i],om[i])==['contains','requires','resourceLinks','type','weight']
    parent_cas.append({'goalId':i,'changedFields':diffs(bm[i],om[i]),'beforeWholeGoal':bm[i],'afterWholeGoal':om[i],
      'descriptionsVerbatim':True,'reviewedWholeV3AndV6Equal':True,'wholeSourceClosureGranted':False})
put('CAS.exact-four-parent-structure-plus-nine-reviewed-whole-children.NOT-APPLIED.json',{
 'schemaVersion':1,'role':'informed author integration proposal; existing science reused, no new vote',
 'base':bind(basepath),'reviewedV3':bind(v3path),'reviewedV6':bind(oldpath),'candidatePath':cpath,
 'replaceExactlyFourWholeObjects':parent_cas,'appendExactlyNineWholeObjects':[om[i] for i in CHILDREN],
 'preservedWholeObjectCount':538,'allPrevious292WholeObjectsExact':closed,'rootWeightUnchanged':1.2,
 'otherRequiresUnchanged':True,'sourceMappingsUnchanged':True,'notApplied':True})
put('CHECK.full-whole-object-preservation-542-to551.actual.json',{
 'baseObjects':542,'candidateObjects':551,'preservedWholeObjects':538,'newChildren':9,'changedParentObjects':4,
 'parentWholeDEENOperatorsVerbatim':True,'all292ExistingStrictWholeBodiesExact':True,'rootWholeObjectExact':True,'rootWeight':1.2,
 'all538PreservedObjectSha256':{i:sha(json.dumps(bm[i],sort_keys=True,ensure_ascii=False,separators=(',',':')).encode()) for i in bm if i not in PARENTS},
 'denominatorArithmeticOnly':{'base':414,'removeNonAtomicParents':4,'appendReviewedChildren':9,'candidate':419},
 'strictGainMeasured':False,'centralRunExecuted':False,'newScientificVotes':0})

# Exact semantic-kind decisions for thirteen byte-identical reviewed objects; other 538 current rows verbatim.
skbase=read(BASE/'candidate/semantic542.prospective414.paired-existing-science.closed-enum.json')
skold=read(V6/'candidate/semantic533.current407.current220-preserving.inactive.json')
km={x['goalId']:x for x in skold['decisions']}; kind=copy.deepcopy(skbase)
kind['decisions']=[copy.deepcopy(km[x['goalId']]) if x['goalId'] in PARENTS else x for x in kind['decisions']]+[copy.deepcopy(km[i]) for i in CHILDREN]
kind['sourceLandscapePath']=cpath
kind['ledgerId']='chemie-NAT9-current419-existing-paired-kind-science-mechanical-source-binding-20261014-v1'
counted=collections.Counter(x['semanticKind'] for x in kind['decisions'])
kind['counts']={k:counted[k] for k in ['programStructure','curricularArea','curricularAtomic','orientation','practiceAssessment','memory','runtimeSupport']}
kind['counts']['total']=len(kind['decisions'])
put('candidate/semantic551.prospective419.existing-paired-kind-science.json',kind)

# Preserve dependent requires. Record the real changed context rather than copying old v6 collateral rewrites.
reverse=[]
for i,g in bm.items():
    hit=[x for x in g.get('requires',[]) if x.split(':')[-1] in PARENTS]
    if hit:
        reverse.append({'goalId':i,'title':g['title'],'beforeWholeGoal':g,'afterWholeGoal':cm[i],
          'wholeObjectPreserved':g==cm[i],'parentPrerequisiteRefs':hit,
          'historicalV6DependentDifferentFields':diffs(g,om[i]) if i in om else ['absent-in-old-v6'],
          'policy':'Keep the complete current dependent. Aggregate parent mastery still requires its reviewed children; do not import historic dependent narrowing or clear separate M311/GOD/source holds.'})
contexts=[]
for i in CHILDREN:
    req=om[i].get('requires',[]); contexts.append({'goalId':i,'wholeReviewedGoal':om[i],
      'wholeDirectPrerequisitesCurrent':[cm[x.split(':')[-1]] for x in req],
      'wholeDirectPrerequisitesHistorical':[v3m[x.split(':')[-1]] for x in req],
      'changedPrerequisiteWholeFields':[{'goalId':x,'fields':diffs(v3m[x.split(':')[-1]],cm[x.split(':')[-1]])} for x in req if v3m[x.split(':')[-1]]!=cm[x.split(':')[-1]]],
      'currentParentsContainingChild':[g['id'] for g in candidate['goals'] if i in g.get('contains',[])],
      'nativeReviewBoundary':'Historic whole-goal science is retained. Old native page/run fingerprints are not current551 page fingerprints; ordinary exact-context D preparation remains a separate integration step.'})
put('CONTEXT.current-whole-prerequisites-successors-and-untouched-dependent-requires.actual.json',{'nineChildren':contexts,'dependentWholeGoals':reverse,'unrelatedGraphFixesApplied':False})

# Whole original paired judgments: retain genuine A/B source documents verbatim as references, scoped extracts as data.
science={
 'a2':read(A2/'FINAL.targeted29.genuine-scientific-judgments.json')['judgments'],
 'b2':read(B2/'ORIGINAL.per-goal-strict-ready-and-exact-holds.json')['goals'],
 'a3':read(A3/'D23-P23-A23-M23-V23-source.per-goal-scientific-verdicts.json'),
 'b3':read(B3/'scientific-D-P-A-M-V.per-goal.json')['records']}
for tag,rs in science.items(): put('history/'+tag+'.scoped-original-whole-judgments.NO-NEW-VOTE.json',[x for x in rs if x['goalId'] in CHILDREN])
put('history/four-parent-cluster-original-paired-science.NO-NEW-VOTE.json',{
 'a':read(A2/'FINAL.split9-parent4.genuine-scientific-review.json'),
 'b':read(B2/'ORIGINAL.split9-child-vs-parent-and-source-union-proof.json')})
for path in [A2/'FINAL.independent-a.review.freeze.json',B2/'ORIGINAL.freeze.json',A3/'FINAL.independent-a.original-output.freeze.json',B3/'FINAL.independent-b.freeze.json',V6/'FINAL.technical-consolidation.freeze.json',BASE/'SEAL.finite-minimal542-prospective414-P2-kind-AM-existing-science-technical.actual.json']:
    read(path)

profile_orig=V6/'positive/P35.other-whole-record-lines.exact.jsonl'
plines=exact_lines(profile_orig,set(CHILDREN),'goalId','P/nine-existing-whole-profile-records.exact.jsonl')
assert len(plines)==9
cases=read(V3/'cases/P37.unique-whole-case-and-current-brief-bindings.json')['cases']
selectedcases=[x for x in cases if x['goalId'] in CHILDREN]
assert len(selectedcases)==19
assert all(set(x['caseId'] for x in selectedcases if x['goalId']==i)==set(x['id'] for x in next(p['record'] for p in plines if p['record']['goalId']==i)['profile']['applicationCaseBriefs']) for i in CHILDREN)
put('P/nineteen-complete-original-DEEN-cases-material-answers-rubrics.exact.json',{'role':'Exact existing accepted whole cases, including the third Benedict execution/transfer case. No new science or learner execution.','cases':selectedcases})
put('P/exact-profile-line-provenance.NO-NEW-REVIEW.json',plines)
# The original A3 run metadata disagreement is preserved, never silently rewritten.
run=read(A3/'P23.schema-valid-candidates.actual-run-manifest.json')
put('P/original-A3-run-metadata-boundary.NO-REWRITE.json',{'originalRun':bind(A3/'P23.schema-valid-candidates.actual-run-manifest.json'),
 'wholeOriginalRunManifest':run,'currentProfilesHaveReviewRunIds':[{'goalId':x['record']['goalId'],'reviewRunIds':x['record'].get('reviewRunIds',[]),'criteriaFingerprint':x['record']['reviewCriteriaFingerprint']} for x in plines],
 'boundary':'The genuine A3 original run has a historical criteria-fingerprint discrepancy relative to its record stream. Preserve it as history. Do not claim that amended metadata or a technical scoped profile check creates a new run or peer vote.'})

# Exact A/M decisions: latest actual A3 records for seven, original actual A2 for the two retained children.
actual7=set(CHILDREN)-{'684ffe86-3a9f-5514-866a-47d16372f2d4','cf270aaf-235a-55a7-94a2-c4d9d7570a6b'}
linehistory=[]
for kinddir,latest,original in [('A',A3/'A23.current-original-reviewed.records.jsonl',A2/'atomicity/A29.fresh.review.jsonl'),('M',A3/'M23.current-original-reviewed.records.jsonl',A2/'memory/current407.fresh.necessity.jsonl')]:
    linehistory+=exact_lines(latest,actual7,'goalId',kinddir+'/seven-latest-original-a.records.jsonl')
    linehistory+=exact_lines(original,set(CHILDREN)-actual7,'goalId',kinddir+'/two-retained-original-a.records.jsonl')
    rows=[x for x in lines(latest) if x['goalId'] in actual7]+[x for x in lines(original) if x['goalId'] in set(CHILDREN)-actual7]
    put(kinddir+'/nine-existing-a-records.selection.json',rows)
put('history/AM-nine-original-line-provenance.json',linehistory)

# Two unchanged-text retargets have their own genuine pair, independent of nine-child A/M decisions.
deckpath=pathlib.Path('curricula/DE/Gymnasium/memory-decks/de_gymnasium_chemistry_flashcards_natural_q2.de.json')
deck=read(deckpath); decknew=copy.deepcopy(deck)
for c in decknew['cards']:
    if c['id'] in ['chem_nat_q2_001','chem_nat_q2_002']:
        c['tags']=['goal:'+CHILDREN[0] if t=='goal:'+PARENTS[0] else t for t in c['tags']]
assert all(a==b for a,b in zip(deck['cards'][2:],decknew['cards'][2:]))
assert all(diffs(a,b)==['tags'] for a,b in zip(deck['cards'][:2],decknew['cards'][:2]))
deckcandidate=put('M/deck-natural-q2.complete-five-cards.only-two-reviewed-origin-tags.candidate.json',decknew)
cardids={'chem_nat_q2_001','chem_nat_q2_002'}
cardlines_a=exact_lines(A2/'memory/current75.fresh.cards.jsonl',cardids,'cardId','M/two-card-retargets.original-independent-a.records.jsonl')
cardlines_b=exact_lines(B2/'memory/C2.actual-text-retarget-independent-b.review.jsonl',cardids,'cardId','M/two-card-retargets.original-independent-b.records.jsonl')
assert len(cardlines_a)==len(cardlines_b)==2
put('CAS.two-card-origin-tags-with-separate-paired-retarget-science.NOT-APPLIED.json',{
 'originalDeck':bind(deckpath),'candidateDeck':deckcandidate,'wholeOriginalDeck':deck,'wholeCandidateDeck':decknew,
 'changedCards':['chem_nat_q2_001','chem_nat_q2_002'],'onlyChangedField':'tags.goal origin from 62149 to e9d34',
 'allCardTextVerbatim':True,'otherThreeCardsWholeExact':True,'pairedA':cardlines_a,'pairedB':cardlines_b,
 'GODCard005AndM311HoldsPreserved':True,'normalHostMemoryVisibilityAndAcquisitionCheckStillRequired':True,'notApplied':True})
currentmconfig=read(I292/'config/M412.existing407-plus-genuine-five.normal-alias.config.json')
currentcards=lines(pathlib.Path(currentmconfig['cardReviewPath']))
replacement={x['record']['cardId']:x['record'] for x in cardlines_a}
all75=[replacement.get(x['cardId'],x) if x.get('deckId')==deck['deckId'] else x for x in currentcards]
assert len(currentcards)==len(all75)==75
assert sum(a!=b for a,b in zip(currentcards,all75))==2
put('M/current75.with-two-original-a-retarget-records.other73-whole-exact.candidate.json',all75)
put('CHECK.M-two-retargets-versus-current75-preservation.actual.json',{
 'original75':bind(pathlib.Path(currentmconfig['cardReviewPath'])),'sameCardCount':75,'other73WholeRecordsExact':True,
 'onlyOriginalRetargetPairSelected':True,'noAdditionalCardOrMemoryDecision':True,
 'existingMemoryGoal311WholeExact':cm['31148286-b8db-57a7-8da2-2e0479240a2c']==bm['31148286-b8db-57a7-8da2-2e0479240a2c'],
 'fullNormalM419NotRun':'Stock reads actual app/public deck paths and all original visibility scopes; no fake public root or host mutation is authorized. Stage exact two-tag deck CAS later, retaining all M311 acquisition/GOD holds.'})

# Exact actual image bindings; no image regeneration or new V judgment.
assets=read(V6/'assets/changed-N2-and-protected-Q3.actual-source-bindings.json')['assets']; selectedassets=[]
a2m={x['goalId']:x for x in science['a2']};b2m={x['goalId']:x for x in science['b2']};a3m={x['goalId']:x for x in science['a3']};b3m={x['goalId']:x for x in science['b3']}
for i in CHILDREN:
    matches=[x for x in assets if x['goalId']==i];assert len(matches)==1
    row=matches[0];actual=bind(pathlib.Path(row['actualAsset']['path']));assert actual==row['actualAsset']
    selectedassets.append({'goalId':i,'actualAsset':actual,'resourceBody':row['resourceBody'],
       'originalV6Binding':row,'genuineA':a3m.get(i,a2m.get(i)),'genuineB':b3m.get(i,b2m.get(i)),
       'newVVote':False,'currentPublicOrPublicationClaim':False})
put('V/nine-existing-actual-PNG-bindings-and-original-paired-science.NO-NEW-V.json',selectedassets)
for p in [E12/'chemie-q2-ammonium-ee359-phone-legibility-author-root-20261012-v4/actual-imagegen-tool-prompt.txt',E12/'chemie-q2-ammonium-ee359-phone-legibility-author-root-20261012-v4/FIRST.actual-generated-phone-legibility-correction-provenance.json']:
    bind(p)
put('V/ee359-final-blue-exposed-tip-not-forceps-end.exact-existing-binding.json',{
 'image':next(x['actualAsset'] for x in selectedassets if x['goalId'].startswith('ee359')),
 'prompt':bind(E12/'chemie-q2-ammonium-ee359-phone-legibility-author-root-20261012-v4/actual-imagegen-tool-prompt.txt'),
 'geometryVerifiedInActualNativeImageDuringThisAuthorInvestigation':'Blue free tip above the ammonia-exposed opening; pink forceps-held end and pink control. No dipping; moist paper. Positive ammonium does not prove protein origin.',
 'originalGenuineA':a3m[CHILDREN[6]]['V'],'originalGenuineB':b3m[CHILDREN[6]],
 'newIndependentImageReview':False})

# Minimal current view edit only: an existing opaque parent becomes its same reviewed subtree, with roles preserved.
viewchanges=[]
def editview(node,ptr,changes):
    if isinstance(node,dict):
        if node.get('kind')=='goalEntry' and node.get('goalId') in PARENTS:
            before=copy.deepcopy(node);node['kind']='canonicalSubtree';changes.append({'jsonPointer':ptr,'before':before,'after':copy.deepcopy(node),'projectionRolePreserved':node.get('projectionRole','target')==before.get('projectionRole','target')})
        for k,v in list(node.items()): editview(v,ptr+'/'+k,changes)
    elif isinstance(node,list):
        for n,v in enumerate(node):editview(v,ptr+'/'+str(n),changes)
for p in sorted((REPO/'curricula/DE/Gymnasium/composition-views/chemie').glob('*.json')):
    d=json.loads(p.read_text());after=copy.deepcopy(d);changes=[];editview(after,'',changes)
    if changes:
        metadata={k:v for k,v in {'$schema':'https://skillpilot.com/schemas/curriculum-package/v1/composition-view.schema.json','viewFormatVersion':'1.0','language':'de'}.items() if k not in after}
        after.update(metadata)
        bound=bind(p);dest=put('views/'+p.name,after);viewchanges.append({'original':bound,'candidatePath':dest,'scope':d.get('scope'),'changes':changes,
          'mechanicalRequiredFormatMetadataAdded':metadata,'allOtherFieldsAndEntriesExact':True,'semanticBoundary':'Preserve the currently authored target/prerequisiteOnly role and course. Structural expansion is not a new whole-source, course-selection, or actual-acquisition approval.'})
put('CAS.current-Chemistry-views-only-four-parent-reference-kinds.NOT-APPLIED.json',{'changes':viewchanges,'notApplied':True,'noOldV6ViewsCopied':True})

# Whole historic source cells, every original partner, and exact current-carrier deltas. No mapping mutation.
raw=read(V3/'sources/all-current-raw-source-bindings.no-display-dedup.json')['rawBindings']
atlaspath=pathlib.Path('app/scripts/config/goal-books/de-gym-chemistry-national-atlas.inputs.json')
atlas=read(atlaspath)
atlascarriers=[]
for p in atlas['mappingPaths']:
    path=pathlib.Path(p)
    if (REPO/path).is_file():
        carrier=read(path)
        if carrier.get('sourceExtractionPath'):
            ex=read(pathlib.Path(carrier['sourceExtractionPath']))
            atlascarriers.append((p,carrier,ex))
rows=[x for x in raw if x['directCanonicalOwner'] in PARENTS]
documents={};cells={};source_rows=[];partners={};carrier_cache={};extract_cache={}
for row in rows:
    sid=row['wholeLiteralSourceGoal']['id'];mp=row['mappingPath'];key=row['sourceExtractionPath']+'#'+sid
    documents[row['sourceDocument']['path']]=row['sourceDocument']
    cells[key]={'sourceExtractionPath':row['sourceExtractionPath'],'wholeOriginalSourceCell':row['wholeLiteralSourceGoal'],'sourceStage':row['sourceStage'],'sourceJurisdiction':row['sourceJurisdiction']}
    if mp not in carrier_cache:
        matches=[(p,c,e) for p,c,e in atlascarriers if e.get('jurisdiction')==row['sourceJurisdiction'] and e.get('stage')==row['sourceStage']]
        assert len(matches)==1, (mp,[(p,e.get('jurisdiction'),e.get('stage')) for p,c,e in matches])
        carrier_cache[mp]=matches[0]
    currentmp,cd,ex=carrier_cache[mp]
    old_dec=[x['decision'] for x in row['wholeOriginalDecisionRows']]
    old_partner_ids=sorted(set([row['directCanonicalOwner']]+[i for x in old_dec for i in x.get('canonicalGoalIds',[])]))
    for i in old_partner_ids:
        if i in v3m: partners[i]={'wholeHistoricalPartner':v3m[i],'wholeCurrentPartner':cm.get(i),'currentChangedFields':diffs(v3m[i],cm[i]) if i in cm else ['absent-current']}
    currows=[x for x in cd.get('mappings',[]) if x.get('legacyGoalId',x.get('sourceGoalId'))==sid] if cd else []
    curdec=[x for x in cd.get('decisions',[]) if x.get('sourceGoalId')==sid] if cd else []
    ep=cd['sourceExtractionPath']
    exgoals=ex.get('sourceGoals',ex.get('goals',[]))
    currentcell=next((x for x in exgoals if x.get('id')==sid),None)
    cells[key]['wholeCurrentSourceCell']=currentcell
    cells[key]['currentSourceExtractionPath']=ep
    cells[key]['sourceCellWholeEqualToHistorical']=currentcell==row['wholeLiteralSourceGoal']
    source_rows.append({'originalRawBindingKey':row['rawBindingKey'],'historicalMappingPath':mp,'currentAtlasMappingPath':currentmp,'sourceCellKey':key,
      'wholeOriginalMappingRow':row['wholeOriginalMappingRow'],'wholeOriginalDecisionRows':row['wholeOriginalDecisionRows'],
      'wholeCurrentSourceCellMappings':currows,'wholeCurrentSourceCellDecisions':curdec,'wholeOriginalPartnerIds':old_partner_ids,
      'directCanonicalOwner':row['directCanonicalOwner'],'reviewedChildUnion':om[row['directCanonicalOwner']]['contains'],
      'historicContributionOnly':True,'mappingDecisionNotAutomaticallyUpgraded':True,'wholeSourceUnionApproval':False})
put('SOURCE.whole-original-cells-all-original-partners-current-carrier-deltas.NO-GRANT.json',{
 'original251DirectParentBindings':len(rows),'sourceCells':list(cells.values()),'sourceDocuments':list(documents.values()),
 'mappingRows':source_rows,'wholeMappedPartnerObjects':partners,
 'sourcePolicy':'Keep every original whole cell/operator, partner, and GK/LK/optional condition. Parent cluster descriptions preserve the existing whole duty; child partial contributions do not create a full original source-cell approval. No historical source carrier or scope view is copied wholesale.',
 'currentAtlasConfig':bind(atlaspath),'currentCarrierBoundary':'Read-only comparison against the exact repository atlas input configuration. Newer private-host/source proposals are separate bindings and are not overwritten or claimed approved by this comparison.',
 'newSourceGrant':False,'mappedCarrierWrites':0,'classroomSelectionAsserted':False})

# Matrix distinguishes reusable science from actual integration work and the precise old/new boundaries.
matrix=[]
for i in CHILDREN:
    pr=next(x['record'] for x in plines if x['record']['goalId']==i)
    latest='v3' if i in actual7 else 'v2-retained'
    ca=next(x for x in contexts if x['goalId']==i)
    matrix.append({'goalId':i,'title':om[i]['title'],'reviewedWholeGoalExactV3V6':True,'wholeProfileFingerprint':pr['profileFingerprint'],
     'wholeCaseIds':[x['caseId'] for x in selectedcases if x['goalId']==i],
     'genuineScienceHistory':{'a':a3m.get(i,a2m[i]),'b':b3m.get(i,b2m[i]),'latestAcceptedWholeInputs':latest},
     'scientificScope':'Reuse exact whole goal and accepted P/A/M/V designs. No new vote; no actual learner performance, whole source/course, M311, or Human claim.',
     'remainingIntegration':[
      'Normal exact current candidate semantic-kind/P/A/M/assets/schema checks; preserve original record payloads and independent run metadata.',
      'Complete ordinary D pair/container provenance using genuine original full runs, or a bounded fresh current-context native pass if historical exact current-page binding cannot be proved. No legacy shortcut or page-hash relabel.',
      'Stage exact canonical/public asset and typed QA approval binding in an authorized inactive host, then current normal stock gates.',
      'Source/course partner-union and prerequisite acquisition conditions remain independent; do not infer whole-source clearance from ancestor mapping.'],
     'wholeDirectPrerequisiteDeltas':ca['changedPrerequisiteWholeFields'],
     'memory':'memory_required; existing two retargeted recall cards and actual M311 acquisition conditions remain' if i==CHILDREN[0] else 'existing genuine no_memory_needed decision; not an M311/GOD clearance'})
put('MATRIX.nine-children-reuse-versus-actual-integration-HOLDs.NO-CLOSURE.json',matrix)
put('INPUTS.exact-whole-material-selection.external-bindings.json',{'createdAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'role':'informed author integration proposal; not independent science','bindings':list(bindings.values()),'selectedChildIds':CHILDREN,'selectedParentIds':PARENTS})
print(json.dumps({'root':str(REL),'candidateObjects':len(cm),'preservedObjects':538,'caseCount':len(selectedcases),'profileCount':len(plines),'viewCount':len(viewchanges),'viewEdits':sum(len(x['changes']) for x in viewchanges),'sourceDirectBindings':len(rows),'sourceCells':len(cells),'externalBindings':len(bindings),'newVotes':0}))
