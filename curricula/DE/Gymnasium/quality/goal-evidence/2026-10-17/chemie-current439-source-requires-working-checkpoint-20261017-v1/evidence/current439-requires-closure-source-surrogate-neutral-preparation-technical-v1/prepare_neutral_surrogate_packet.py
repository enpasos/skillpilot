from pathlib import Path
import json,hashlib,collections,datetime,shutil,re
B=Path('/mnt/e/skillpilot-chemie-L7-20261017');M=Path('/home/enpasos/projects/skillpilot');K=B/'current439-remediation14-guarded-root-integration-technical-v1/capsule';O=B/'current439-requires-closure-source-surrogate-neutral-preparation-technical-v1';D=B/'current439-main-portable-integration-plan-technical-v1/lower-layer-diagnosis-readonly-v1';CID='c436b994-8f44-5134-b9f8-0c9f5d6a5ba0';guards={};outputs=[]
P=B/'current439-f79-explicit-concentration-ratio-author-root-v1/capsule/curricula/DE/Gymnasium/quality/goal-evidence/2026-10-17/chemie-current439-f79-explicit-concentration-ratio-author-root-v1/P439.only-f79-explicit-concentration-ratio.author-candidate.aggregate.jsonl'
def digest(x):return hashlib.sha256(json.dumps(x,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode()).hexdigest()
def pin(p,source=True):
 p=Path(p)
 if source and str(p)in guards:return guards[str(p)]
 bb=p.read_bytes();r={'path':str(p),'sha256':hashlib.sha256(bb).hexdigest(),'bytes':len(bb)}
 if source:guards[str(p)]=r
 return r
def load(p):pin(p);return json.loads(Path(p).read_text())
def save(n,x):
 p=O/n;p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n');outputs.append(pin(p,False));return outputs[-1]
def copy(p,n):
 pp=pin(p);q=O/n;q.parent.mkdir(parents=True,exist_ok=True)
 if not q.exists():shutil.copyfile(p,q)
 qp=pin(q,False);assert qp['sha256']==pp['sha256'];return qp
Cpath=K/'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json';C=load(Cpath);gs={g['id']:g for g in C['goals']};assert pin(Cpath)['sha256']=='38c437d5fa0e24f8587b26cbdb2e3f168f3ffaf915aaaef885f918ac22c668e0'
raw=load(D/'RAW.actual-current-Chemistry-applicability-and-39-rendered-views.json');rb={x['goalId']:x for x in raw['report']['goals']};a=load(D/'DIAGNOSIS.actual-427-unsupported-82-source-gaps-148-warnings.exact-IDs.json');struct=load(O/'TECHNICAL.actual437-pairs-active-literal-requires-chains.no-acceptance.json')['pairs'];assert len(struct)==437
pin(P);assert pin(P)['sha256']=='c83f1a90c525f2f71d967af969b47a92f837dbf0e1ca1d2a590ad50e759423b1';plines=P.read_text().splitlines();prec=[json.loads(l)for l in plines if l.strip()];profiles={x['goalId']:x['profile']for x in prec};assert len(profiles)==439
pprov={x['goalId']:{'filePin':pin(P),'line1Based':i+1,'jsonPointerWithinLine':'/profile','profileFieldCanonicalSHA256':digest(x['profile'])}for i,x in enumerate(prec)}
registryPath=K/'curricula/DE/Gymnasium/provenance/source-landscape-registry.json';reg=load(registryPath);sreg={e['landscapeId']:e for e in reg['entries']};surpath=K/'curricula/DE/Gymnasium/provenance/canonical-goal-surrogate-evidence-registry.json';sregall=load(surpath);assert not[e for e in sregall.get('entries',[])if e.get('landscapeId')==CID and e.get('status')=='accepted'];pin(K/'app/scripts/sourceCoverageEvidence.ts');pin(K/'app/scripts/generateCurriculumQualityStatus.ts');pin(K/'app/scripts/applicabilityCompiler.ts')
# No science decisions or wrappers are copied from P. Original current C is retained as factual authored content.
save('science/C650.whole-current-authored-goal-content.json',C)
save('science/P439.whole-current-operative-profile-bodies.no-review-wrappers.json',{'role':'Exact current /profile field for439goals; includes supplied task/response/rubric strings where authored inside profile. No reason/reviewer/status/old verdicts.','sourceAggregatePin':pin(P),'profiles':[{'goalId':id,'profile':profiles[id]}for id in sorted(profiles)]})
save('technical/P439.profile-field-provenance-pointers.json',pprov)
viewdefs=[]
for v in raw['perView']:
 vv=load(K/v['path']);viewdefs.append({'logicalPath':v['path'],'wholeView':vv,'alreadyExtractedRenderedAtomicGoalIds':v['goalIds']})
save('science/CONTEXT39.whole-current-view-definitions-and-existing-rendered-membership.json',{'role':'39current actual authored views. BY two pilot views remain author artifacts; separate proposed broader fallback is given explicitly, not falsely claimed activated.','contexts':viewdefs})
# Required-by relation, exact current eligibility and all graph alternatives remain separate from scientific necessity.
ids=set();sourceEndpoints=set()
for p in struct:
 ids.add(p['goalId'])
 for end,path in p['reachableSourceBackedAtomicEndpoints'].items():ids.update(path);sourceEndpoints.add((end,p['jurisdiction']))
related=sorted(ids)
children={id:g.get('contains',[])for id,g in gs.items()};pathcache={}
def inherited_path(root,target):
 key=(root,target)
 if key in pathcache:return pathcache[key]
 q=collections.deque([(root,[root])]);seen=set()
 while q:
  n,path=q.popleft()
  if n in seen or n not in gs:continue
  seen.add(n)
  if len(path)>1 and gs[n].get('extendedData',{}).get('applicabilityMappingInheritance')=='boundary':continue
  if n==target:pathcache[key]=path;return path
  for ch in children[n]:q.append((ch.split(':')[-1],path+[ch.split(':')[-1]]))
 pathcache[key]=None;return None
maps={};sx={};anchors={};documents={};sourcecells={};source9={(x['sourceLandscapeId'],x['sourceGoalId'])for x in a['reverseUnmappedSourceGoals']if any(d['decision'].get('decision')!='mapped'for d in x['currentDecisions'])};assert len(source9)==9
# Local original material bytes are retained only when actually referenced by an endpoint anchor.
def doc_locator(doc,regentry):
 z={'declaredSourceDocument':doc,'declaredSourceRegistryEntry':{k:regentry[k]for k in ['landscapeId','title','jurisdiction','sourcePath','sourceUrl','archiveSourcePath']if k in regentry},'localOriginalPartners':[]}
 for path in dict.fromkeys([doc.get('path'),doc.get('sourcePath'),regentry.get('sourcePath'),regentry.get('archiveSourcePath')]):
  if not path:continue
  q=Path(path)if str(path).startswith('/')else K/path
  if not q.is_file():continue
  if q.suffix.lower()not in ['.pdf','.json','.png','.jpg','.jpeg']:continue
  pp=pin(q);key=pp['sha256'];name=f'primary/{key[:16]}-{q.name}'
  if key not in documents:documents[key]={'sourcePin':pp,'copy':copy(q,name),'identityBoundary':'Exact declared local original bytes. Hash verifies copying only, not curriculum validity or printed/PDF page correspondence.'}
  z['localOriginalPartners'].append(documents[key])
 z['localOriginalAvailable']=bool(z['localOriginalPartners']);return z

def getmap(path):
 if path not in maps:maps[path]=load(K/path)
 return maps[path]
def getsource(path):
 if path not in sx:sx[path]=load(K/path)
 return sx[path]
def sourceviews(path,ss):
 # Pipeline status, author flags, quality judgments and historical review metadata are excluded.
 sv={'sourceInputPin':pin(K/path),'extractionId':ss.get('extractionId'),'sourceLandscapeId':ss.get('sourceLandscapeId'),'jurisdiction':ss.get('jurisdiction'),'subject':ss.get('subject'),'stage':ss.get('stage'),'sourceDocument':ss.get('sourceDocument'),'sourceDocuments':ss.get('sourceDocuments',[])}
 return sv

def anchor_options(end,j):
 opts=[]
 for ev in rb[end]['evidence']:
  if ev.get('dimension')!='jurisdiction'or ev.get('value')!=j or ev['kind']!='mapping':continue
  path=ev['source'];mm=getmap(path);sid=mm.get('sourceLandscapeId');sp=mm.get('sourceExtractionPath')
  if not sp or not(K/sp).is_file():continue
  ss=getsource(sp);sgs={g['id']:(i,g)for i,g in enumerate(ss.get('sourceGoals',[]))};passages={p['id']:(i,p)for i,p in enumerate(ss.get('passages',[]))}
  for edge in mm.get('mappings',[]):
   cp=inherited_path(edge.get('canonicalGoalId'),end)
   if not cp:continue
   item=sgs.get(edge.get('legacyGoalId'))
   if not item:continue
   ix,sg=item;pid=sg.get('passageId');pitem=passages.get(pid);flags=[]
   if(sid,sg['id'])in source9:flags.append('known-pending-Source9-whole-source-row')
   if j=='DE-SN':flags.append('SN-current-source-inventory/scope-not-yet-resolved; no whole-source approval')
   if j=='DE-HB':flags.append('HB97-count/granularity-review-open; no whole97credit')
   if end=='d2ccd1d5-56f7-583f-9724-e97441367f91'and j=='DE-SN':flags.append('SN-indicator-own-performance-P-gap; successor-not-selected')
   sk=sid+'::'+sg['id'];sourcecells[sk]={'cellId':sk,'sourceFieldProvenance':{'filePin':pin(K/sp),'sourceGoalPointer':'/sourceGoals/'+str(ix),'sourceGoalFieldCanonicalSHA256':digest(sg),'wholePassagePointer':'/passages/'+str(pitem[0])if pitem else None},'wholeCurrentSourceGoal':sg,'wholeOriginalPassage':pitem[1]if pitem else None,'sourceDocumentMetadata':sourceviews(sp,ss),'knownOpenSourceFlags':flags}
   aid='anchor-'+hashlib.sha256((end+'|'+j+'|'+path+'|'+sg['id']+'|'+edge['canonicalGoalId']).encode()).hexdigest()[:20]
   anchor={'anchorId':aid,'jurisdiction':j,'endpointGoalId':end,'stockEvidence':ev,'mappingProvenance':{'filePin':pin(K/path),'wholeMappingEdge':edge,'mappedCanonicalTargetToEndpointContainsPath':cp,'allCurrentBoundaryChecksPassedMechanically':True},'sourceCellId':sk,'knownOpenSourceFlags':flags,'officialWholeSourceCreditEstablishedByThisPacket':False}
   if aid not in anchors:anchors[aid]=anchor
   opts.append((len(flags),len(cp),edge.get('matchType')!='exact',aid))
 # Direct provenance alone is retained exactly; unavailable concrete source row is not fabricated.
 return sorted(set(opts))
endpointopts={k:anchor_options(*k)for k in sorted(sourceEndpoints)}
# Pick shortest source-anchored path mechanically for a compact review docket. Alternatives remain available.
groups=collections.defaultdict(list);pendingrows={};noanchor=[];dockets=[]
for pair in struct:
 id=pair['goalId'];j=pair['jurisdiction'];poss=[]
 for end,path in pair['reachableSourceBackedAtomicEndpoints'].items():
  ops=endpointopts[(end,j)]
  if ops:
   best=ops[0];poss.append((best[0],len(path),best[1],best[2],end,path,best[3]))
 if not poss:
  noanchor.append({'goalId':id,'jurisdiction':j,'structuralClassification':pair['structuralClassification'],'reason':'No active eligible source-backed atomic chain'if not pair['reachableSourceBackedAtomicEndpoints']else 'Structural endpoint has direct stock evidence, but no exact current source-extraction row+permitted mapping path partner resolved; do not fabricate provenance source text.','activeClosureEvidence':pair['activeClosureEvidence'],'rejectedWitnesses':pair['rejectedWitnesses'],'stockSourceBackedEndpointsWithoutResolvedExactSourceRow':list(pair['reachableSourceBackedAtomicEndpoints'])});continue
 poss.sort(key=lambda z:z[:5]);_,_,_,_,end,path,aid=poss[0];aa=anchors[aid];flags=aa['knownOpenSourceFlags'];docket={'goalId':id,'jurisdiction':j,'technicalSelectedPathPrerequisiteToDependent':path,'endpointAnchorId':aid,'knownOpenSourceFlags':flags,'selectionRule':'Mechanically prefer no flagged source row, then shortest active literal requires chain, shortest permitted contains inheritance, exact mapping. This is only review-docket ordering, never physical necessity or source acceptance.','allReachableEndpointAlternatives':[{'endpointGoalId':e,'shortestActiveLiteralPath':pth,'availableConcreteAnchorIds':[z[3]for z in endpointopts[(e,j)]]}for e,pth in sorted(pair['reachableSourceBackedAtomicEndpoints'].items())],'candidateStatus':'pending_independent_scientific_review','dagNecessityAccepted':False};dockets.append(docket);groups[(id,path[1])].append(docket)
 for pre,dep in zip(path,path[1:]):
  key=(pre,j,dep);pendingrows.setdefault(key,{'landscapeId':CID,'goalId':pre,'jurisdiction':j,'evidenceType':'requires-closure','requiredByGoalId':dep,'status':'pending_independent_review','rationale':'PENDING: independent reviewers must supply a concrete content/task necessity rationale and verify this jurisdiction source anchor. The actual requires edge and active compiler witness are technical facts, not acceptance.','technicalSupportingDocketGoalIds':[],'technicalSourceAnchorIds':[],'knownOpenSourceFlags':[]})
  rr=pendingrows[key];rr['technicalSupportingDocketGoalIds']=sorted(set(rr['technicalSupportingDocketGoalIds']+[id]));rr['technicalSourceAnchorIds']=sorted(set(rr['technicalSourceAnchorIds']+[aid]));rr['knownOpenSourceFlags']=sorted(set(rr['knownOpenSourceFlags']+flags))
selectedcells={anchors[d['endpointAnchorId']]['sourceCellId']for d in dockets}
for sk in selectedcells:
 cell=sourcecells[sk];ss=cell['sourceDocumentMetadata'];sg=cell['wholeCurrentSourceGoal'];doc=next((d for d in ss.get('sourceDocuments',[])if d.get('key')==sg.get('sourceDocumentKey')),ss.get('sourceDocument')or{});cell['primaryOriginalLocator']=doc_locator(doc,sreg.get(ss['sourceLandscapeId'],{}))
# Full source passages/cells of all alternatives are available; only selected original PDFs copied to keep packet finite.
save('science/SOURCE-CELLS.whole-current-source-goals-passages-original-locators.no-verdicts.json',{'sourceCells':[sourcecells[k]for k in sorted(sourcecells)],'selectedCellIds':sorted(selectedcells),'allCellsAreRawCurrentSourceFactsNotSourceAcceptance':True})
save('science/SOURCE-ANCHORS.current-active-mapping-partners.no-review-decisions.json',{'anchors':[anchors[k]for k in sorted(anchors)],'allSelectedRowsPendingIndependentScience':True})
# Current actual whole task materials:22 original12 cases retained, f79 two corrected wholecases exactly replace old wrongratio entry.
m12=B/'current439-twelve-whole-case-materials-clean-root-v1/REVIEW.current12-whole-operative-case-materials.science-only.json';f79=B/'current439-f79-explicit-concentration-ratio-author-root-v1/capsule/curricula/DE/Gymnasium/quality/goal-evidence/2026-10-17/chemie-current439-f79-explicit-concentration-ratio-author-root-v1/AUTHOR.current-f79-whole-profile-and-two-cases.explicit-B-over-A.json';m=load(m12);ff=load(f79);oldf=next(x for x in m['goals']if x['goalId']==ff['goalId']);assert ff['currentWholeProfileBody']==profiles[ff['goalId']];m['goals']=[ff if x['goalId']==ff['goalId']else x for x in m['goals']];m['role']='Current12 whole24taskmaterials: exact whole f79 entry from corrected source replaces old ratio entry; other11 whole entries exact. Technical assembly, no review verdicts.';save('science/MATERIAL.current12-whole24cases-only-f79-current-corrected.no-verdicts.json',m)
save('technical/MATERIAL.f79-entry-exact-provenance.json',{'old12InputPin':pin(m12),'wholeCorrectedF79InputPin':pin(f79),'replacementPointer':'/goals/'+str(next(i for i,x in enumerate(m['goals'])if x['goalId']==ff['goalId'])),'fieldExactToAuthorFile':True,'wholeCurrentProfileMatchesCurrent439':True,'other11EntriesExact':all(x==y for x,y in zip(load(m12)['goals'],m['goals'])if x['goalId']!=ff['goalId']),'oldWrongRatioNotOperativeHere':True})
# Supplied current V3 material objects; no V2 rubric data are substituted as current.
v3=B/'chemie-28c-two-rubric-coverage-links-author-root-successor-v3/materials/28c.FIVE.complete-interpretation-projections.two-credit-links.author-v3.json';v34=B/'chemie-targeted-material-assessment-boundaries-author-successor-v2/materials/FOUR.complete-material-objects.boundaries-only.author-v2.json';vb=B/'chemie-28c-two-rubric-coverage-links-author-root-successor-v3/materials/CASE-MATERIAL-BINDINGS.exact-author-v3.json'
for p in [v3,v34,vb]:copy(p,'science/materials/'+p.name)
for p in [B/'current439-mixed18-neutral-whole-material-locators-technical-v1/MATERIAL.4a08-three-complete-calorimetry-materials-and-synthetic-logs.json',B/'current439-mixed18-neutral-whole-material-locators-technical-v1/MATERIAL.a76-two-current-qualitative-whole-cases-and-cards.json']:
 copy(p,'science/materials/'+p.name)
matpartnerlocators=[]
for p in [B/'current439-twelve-whole-case-materials-clean-root-v1/SELECTOR.current12-full-case-materials.clean.sealed.json',B/'current439-twelve-whole-case-materials-clean-root-v1/SELECTOR.current12-existing-six-research-source-files.additive.sealed.json']:
 obj=load(p);matpartnerlocators.append({'sourceSelectorPin':pin(p),'actualLocatorOnly':obj})
save('science/MATERIAL.additional-existing-neutral-material-and-research-source-locators.json',{'locators':matpartnerlocators,'instruction':'Read linked actual whole files only as needed; no execution results are fabricated. External materials not supplied here must be requested if needed for necessity decision.'})
relatedctx=[]
for id in related:
 g=gs[id];relatedctx.append({'goalId':id,'wholeCurrentGoal':g,'wholeCurrentProfile':profiles.get(id),'wholeDirectPrerequisites':[gs[x.split(':')[-1]]for x in g.get('requires',[])if x.split(':')[-1]in gs],'wholeDirectDependents':[z for z in C['goals']if id in [x.split(':')[-1]for x in z.get('requires',[])]],'currentCompiledApplicabilityAndEvidence':rb[id],'profileFieldProvenance':pprov.get(id)})
save('science/CONTEXT.whole-all-involved-prerequisites-direct-dependents-P-and-source-evidence.json',{'goals':relatedctx,'noScientificNecessityJudgmentInThisFile':True})
reviewgroups=[]
for (id,dep),ds in sorted(groups.items()):reviewgroups.append({'reviewGroupId':'goal-'+id+'-required-by-'+dep,'prerequisiteGoalId':id,'directDependentGoalId':dep,'sameCurrentPhysicalGoalPairAcrossJurisdictions':True,'scientificNecessityRationale':None,'reviewQuestion':'Does successful current dependent performance genuinely require the exact full prerequisite competence, at this scope/course, rather than merely offer helpful background or a convenient route? Inspect whole P/tasks and state source. Keep or reject each edge on content; do not accept by path existence.','jurisdictionDockets':ds})
save('science/REVIEW-GROUPS.common-prerequisite-dependent-scientific-necessity.pending.json',{'groups':reviewgroups,'sourceApproval':False,'noRationalesPrepopulated':True})
save('candidate/SURROGATE.rows.pending-independent-science.NOT-REGISTRY.json',{'schemaVersion':1,'role':'DRAFT stock-mechanism-shaped rows. Not installed in accepted registry. status neveraccepted; rationale deliberately pending. Additional technical fields are docket references, not validator bypass.','entries':[pendingrows[k]for k in sorted(pendingrows)],'sourceRegistryModified':False,'graphPathAloneSufficient':False})
save('science/OPEN.non-mappable-pairs-and-unresolved-source-operator-flags.json',{'nonMappablePairs':noanchor,'flaggedCandidatePairs':[{'goalId':x['goalId'],'jurisdiction':x['jurisdiction'],'flags':x['knownOpenSourceFlags']}for x in dockets if x['knownOpenSourceFlags']],'knownSource9RowKeys':[{'sourceLandscapeId':sid,'sourceGoalId':sg}for sid,sg in sorted(source9)],'SNCurrentOperatorGap':'Any d2ccd1d5 SN chain requiring actual own indicator performance remains flagged; author successor not selected. No source scope is transferred by inventory counts.','HB97':'All HB97 count/granularity acceptance is open. A raw exact clause can support its precise content only after review; whole97 approval is not asserted.'})
# Keep exact sourceguard list before/after. No foreign output or whole evolving capsule tree is guarded.
changed=[]
for p in list(guards.values()):
 if hashlib.sha256(Path(p['path']).read_bytes()).hexdigest()!=p['sha256']:changed.append(p['path'])
assert not changed,changed
save('technical/SOURCE-GUARDS.actual-inputs.before-after.json',{'guards':list(guards.values()),'allUnchanged':True,'changedPaths':changed,'MainWrites':False,'KWrites':False,'acceptedRegistryWrites':False,'newCompilerRuns':0,'fullChecks':0,'SourceABOutputsRead':False,'subagentsSpawned':0})
summary={'role':'Bounded neutral preparation for actual independent DAG-necessity/source review, not a source vote','atUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'unsupportedPairsInProposedBroaderBYFallbackUniverse':437,'unsupportedUniqueGoalIds':104,'currentAppliedKUnsupportedPairs':427,'BYBroaderFallbackProposedNotActivated':True,'structuralClasses':dict(collections.Counter(x['structuralClassification']for x in struct)),'activeClosurePairCount':sum(bool(x['activeClosureEvidence'])for x in struct),'structuralEndpointPathCount':sum(len(x['reachableSourceBackedAtomicEndpoints'])for x in struct),'sourceAnchoredDocketPairCount':len(dockets),'sourceAnchoredDocketUniquePrerequisiteGoalCount':len({x['goalId']for x in dockets}),'scientificReviewGroupCount':len(reviewgroups),'candidateSurrogateRowCountIncludingIntermediateObligations':len(pendingrows),'candidateFlaggedSourcePairCount':sum(bool(x['knownOpenSourceFlags'])for x in dockets),'candidateWithoutKnownSource9SNHBFlagCount':sum(not x['knownOpenSourceFlags']for x in dockets),'nonMappablePairCount':len(noanchor),'sourceAnchorCount':len(anchors),'wholeSourceCells':len(sourcecells),'selectedPrimaryPDFOrJSONBytePartners':len(documents),'wholeCurrentCGoals':650,'wholeCurrentPProfiles':439,'relatedWholeGoals':len(related),'actualAcceptedRows':0,'newCQRPassClaims':0,'registryWrites':0,'MainWrites':0,'KWrites':0,'newCompilerRuns':0,'fullChecks':0,'sourceGuardCount':len(guards),'remainingReviewNeeds':['Actual scientific necessity of every proposed prerequisite edge and every intermediate edge. Helpful background is not sufficient.','Exact source operator, stage/course/optionality and physical-performance scope at each jurisdiction anchor. Partial mapping is not whole official duty.','Known Source9/SN/HB flags stay open and may disqualify the selected anchor; alternative raw anchors are preserved.','No-active-witness55 and no-eligible-endpoint54 pairs require real source/placement work; existing mechanism must not be expanded to accept them.','Actual supplied material sufficiency must be checked; external references without whole tasks need neutral supplementation.'],'boundary':'Source/content coverage asks what the original source actually requires; didactic acquisition support asks which exact prerequisite competence is genuinely necessary for a source-backed dependent. A reviewed indirect surrogate can support the latter through the existing checker; it never manufactures direct official source wording, learner attainment or Human Approval.'}
save('HANDOFF.neutral-current437-requires-closure-source-surrogate-preparation.json',summary)
print(json.dumps(summary,ensure_ascii=False))
