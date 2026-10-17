import pathlib,json,hashlib,collections,datetime
M=pathlib.Path('/home/enpasos/projects/skillpilot');B=pathlib.Path('/mnt/e/skillpilot-chemie-L7-20261017');K=B/'current439-remediation14-guarded-root-integration-technical-v1/capsule';O=B/'current439-main-portable-integration-plan-technical-v1';D=O/'lower-layer-diagnosis-readonly-v1';S=O/'remaining-lower-layer-cause-and-remediation-plan-v1';guards={}
def pin(p):
 p=pathlib.Path(p);b=p.read_bytes();v={'path':str(p),'sha256':hashlib.sha256(b).hexdigest(),'bytes':len(b)};guards[str(p)]=v;return v
def read(p):pin(p);return json.loads(pathlib.Path(p).read_text())
def save(n,x):p=S/n;p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n');return pin(p)
rel='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json';cg=read(K/rel);mg=read(M/rel);cur={g['id']:g for g in cg['goals']};old={g['id']:g for g in mg['goals']};a=read(D/'DIAGNOSIS.actual-427-unsupported-82-source-gaps-148-warnings.exact-IDs.json');raw=read(D/'RAW.actual-current-Chemistry-applicability-and-39-rendered-views.json');cr={g['goalId']:g for g in raw['report']['goals']};mr=read(M/'tmp/applicability/c436b994-8f44-5134-b9f8-0c9f5d6a5ba0.json');mr={g['goalId']:g for g in mr['goals']};mv=read(S/'RAW.existing-Main-37-rendered-views-no-compiler.json')['perView'];nat=set();by=collections.defaultdict(set)
for v in mv:
 p=v['path'];pin(M/p);n=pathlib.Path(p).name
 if n.startswith('de-de'):nat.update(v['goalIds'])
 else:by['DE-'+n.split('-')[1].upper()].update(v['goalIds'])
for v in raw['perView']:pin(K/v['path'])
def paths(gs,root,target,block=False,seen=()):
 if root not in gs or root in seen:return []
 if block and seen and gs[root].get('extendedData',{}).get('applicabilityMappingInheritance')=='boundary':return []
 if root==target:return [[root]]
 out=[]
 for ch in gs[root].get('contains',[]):
  for p in paths(gs,ch,target,block,seen+(root,)):out.append([root]+p)
 return out
lost=[];rows=[];counter=collections.Counter()
for x in a['unsupportedOccurrences']:
 id=x['goalId'];j=x['jurisdiction'];scope='not-in-Main-national-scope' if id not in nat else 'not-in-Main-state-scope' if j in by and id not in by[j] else 'already-in-Main-scope'
 olde=[e for e in mr.get(id,{}).get('evidence',[]) if e['dimension']=='jurisdiction' and e['value']==j];direct=[e for e in olde if e['kind'] in ['mapping','provenance']];counter[scope]+=1
 r={k:x[k] for k in ['goalId','jurisdiction','title','currentVsMainFieldsChanged']};r.update({'MainScopeComparison':scope,'olderUnpinnedGenerationMainCompilerEvidence':olde,'currentEvidence':x['compiledEvidenceForJurisdiction'],'olderSnapshotHadDirectMappingOrProvenance':bool(direct)})
 if direct:
  witnesses=[]
  for e in direct:
   if e['kind']!='mapping':continue
   p=e['source'];ma=read(M/p);ka=read(K/p)
   for edge in ma.get('mappings',[]):
    target=edge.get('canonicalGoalId');ps=paths(old,target,id)
    if not ps:continue
    cp=paths(cur,target,id,False);active=paths(cur,target,id,True)
    witnesses.append({'mappingPath':p,'MainAndKMappingWholeJSONEqual':ma==ka,'oldWholeEdge':edge,'oldContainsPaths':ps,'currentContainsPaths':cp,'currentInheritanceEligiblePaths':active,'currentBlockingGoalIds':list({z for pth in cp for z in pth[1:] if cur[z].get('extendedData',{}).get('applicabilityMappingInheritance')=='boundary'})})
  r['lostDirectWitnesses']=witnesses;lost.append(r)
 rows.append(r)
unsupported=save('CAUSE.427-unsupported-vs-Main-37-view-scope-and-26-old-direct-witnesses.json',{'scope':'Technical cause analysis only; no source approval','baselineCaution':'Main committed PASS is dated2026-10-12. Existing tmp compiler snapshot has no generation/source pin and4 warnings, unlike committed status0; it is corroborating history only. Current Main renderer-only membership was read directly and national source scope reproduces342.','counts':dict(counter),'oldCompilerDirectOccurrences':len(lost),'oldDirectWitnessAllCurrentInheritedPathsBlocked':sum(bool(x['lostDirectWitnesses']) and all(not w['currentInheritanceEligiblePaths'] for w in x['lostDirectWitnesses']) for x in lost),'rows':rows,'next':'Keep broader current targets. Current compiler already loads all mapping JSONs, direct registry provenance and overrides. Native D/P/A/M/V success and own-acquisition annotations are not source-coverage approvals. Requires-only occurrences need exact eligible dependency/source proof plus explicit reviewed surrogate entries or a genuine direct source mapping; override-only acquisition scopes cannot be represented as official whole-source credit.'})
warn=[];delta=collections.Counter()
for w in a['warnings']:
 g=w['wholeCurrentGoal'];id=g['id'];ca=w['currentCompiledApplicability'];ra=w['currentRawApplicability'];add=sorted(set(ca.get('jurisdiction',[]))-set(ra.get('jurisdiction',[])));remove=sorted(set(ra.get('jurisdiction',[]))-set(ca.get('jurisdiction',[])));ext=g.get('extendedData',{});r={'goalId':id,'title':g['title'],'code':w['finding']['code'],'goalType':w['currentGoalType'],'currentWholeGoal':g,'currentRaw':ra,'currentCompiled':ca,'compiledAdds':add,'compiledRemoves':remove,'currentEvidence':cr[id]['evidence'],'wholeGoalExactMain':g==old.get(id),'fieldChangesVersusMain':w['currentVsMainFieldsChanged']}
 if r['code']=='APV-203':
  delta['total']+=1;delta['cluster' if g.get('contains') else 'atomic']+=1;delta['addsOnly' if add and not remove else 'removesOnly' if remove and not add else 'addsAndRemoves']+=1;delta['exactWholeMain' if g==old.get(id) else 'newID' if id not in old else 'changedWholeMain']+=1
  r['technicalAssessment']='Raw applicability is a stored author field, while current compiled value is derived from current direct sources/overrides/requires/children. Mismatch is proven; no semantic permission to replace raw values inferred. Proposed CAS candidate only, requiring impact binding.'
  r['proposedFieldOnlyCAS_NOT_APPLIED']={'field':'applicability','before':ra,'after':ca}
 else:
  r['ownScopeExtensionCount']=len(ext.get('skillPilotAcquisitionExtensions',[]));r['currentExtendedDataKeys']=list(ext);r['acceptance']='Not accepted by this diagnosis; explicit bounded historical proof needs exact current override tuple/source/body/context comparison. Even accepted AI scope is not official duty or Human Approval.'
 warn.append(r)
warnings=save('CAUSE.148-APV-warning-whole-contexts-and-proposed-only-raw-CAS.json',{'APV203Counts':dict(delta),'APV201Count':sum(x['code']=='APV-201' for x in warn),'APV201WithExplicitAcquisitionScope':sum(x['code']=='APV-201' and x['ownScopeExtensionCount']>0 for x in warn),'rows':warn,'impact':'Any applicability write changes canonical whole-goal bytes and may change review-input fingerprints; no automatic D/P/A/M/V rebinding. Rebind actual affected goal IDs and teacher/page contexts after authorized exact scope resolution. No blanket acceptedWarnings.'})
rev=[]
for x in a['reverseUnmappedSourceGoals']:
 if x['jurisdiction']=='DE-BY' or not x['currentDecisions'] or any(z['decision'].get('decision')!='mapped' for z in x['currentDecisions']):continue
 ts=sorted({z['mapping']['canonicalGoalId'] for z in x['currentMappings']});r=dict(x);r['targetWholeCurrentContexts']=[{'wholeGoal':cur[t],'compiled':cr.get(t),'parents':[g for g in cg['goals'] if t in g.get('contains',[])],'wholeChildren':[cur[c] for c in cur[t].get('contains',[])]}for t in ts]
 if ts==['dc0470f1-0676-5949-a5cc-02783d478406']:r['proposalOnly']='Add exact existing polyprotic atomic target to BB/BE LK acid-base scope; preserve existing LK-only tag and source course qualifier unspecified. This cannot prove complete current official multistage-protolysis source scope; source-to-goal comparison remains needed.'
 elif ts==['3be2d0b7-c22f-57d4-886a-10fc04a629f5']:r['proposalOnly']='Candidate existing exact radical-substitution atomic reference in applicable BW SekI target branch; do not use canonical phase E to omit an official SekI duty. Existing canonical text is bromination-specific while source says halogens, so confirm exact whole-source scope before calling it closed.'
 elif 'cf2631d9-da24-50e8-9e50-db625e6efaad' in ts:r['proposalOnly']='Do not insert the current BcP selected-practical-course cluster into HH/MV/ST ordinary chemistry to silence coverage. Original legacy target was consolidated into a separate optional BcP method-family cluster; current five child duties are not generic device/safety/communication/MgO tasks. Requires explicit current remapping/source-scope review to suitable existing ordinary atomic competencies; retain all official tasks and actual-performance requirement.'
 else:r['proposalOnly']='Old mapped aggregate is now a model/data family with independently assessed atomic children and boundary metadata. Prepare exact atomic replacements with whole source operation and stage/course retained; do not add entire cross-stage cluster merely to obtain nonempty intersection. HB digital-model row includes old data-family edge and must be checked against current model atoms.'
 for z in x['currentMappings']:pin(K/z['mappingPath'])
 for z in x['currentDecisions']:pin(K/z['mappingPath'])
 pin(K/x['sourceExtractionPath']);rev.append(r)
reverse=save('CAUSE.remaining11-reverse-source-rows-whole-target-contexts-and-scope-proposals-only.json',{'count':len(rev),'uniqueDirectTargetIDs':sorted({z['mapping']['canonicalGoalId'] for x in rev for z in x['currentMappings']}),'rows':rev,'scienceApproval':False,'preserveAllAuthoredApplicableTopics':True,'currentMappingsExistButWrongOrMissingPlacementIsNotFullSourceProof':True})
proofPaths=[
'NI-organics-materials-independent-a-v1/FIRST.independent-a.NI-package05.json','NI-organics-materials-independent-b-v1/FIRST.review.json','surfactants-softeners-independent-b-v1/FIRST.independent-b.package03.json','surfactants-softeners-informed-root-review-v1/REVIEW.informed-root.package03.json','eleven-colour-goals-independent-a-followup-v2/FOLLOWUP.independent-a.one188-DE-field.v2.json','eleven-colour-goals-independent-b-v2/FIRST.review.json','HB7f-retained-application-independent-a-v1/FIRST.independent-a.HB7f.json','HB7f-retained-application-independent-b-v1/FIRST.informed-foreign-b.HB7f.json']
# Inspect only already-known earlier scope proofs; no Source9 A/B output is opened.
for dn in ['arrhenius-and-HE-practice-independent-b-v1','arrhenius-and-HE-practice-informed-root-review-v1','nano-aromatics-and-methods-independent-a-v1','nano-aromatics-and-methods-informed-root-review-v1']:
 for p in (B/dn).iterdir():
  if p.is_file() and p.suffix=='.json' and any(s in p.name for s in ['FIRST','REVIEW.']):proofPaths.append(str(p.relative_to(B)))
proofs=[]
for rp in proofPaths:
 p=B/rp
 if not p.exists():continue
 body=p.read_text();pn=pin(p);obj=json.loads(body);proofs.append({'pin':pn,'topLevelKeys':list(obj) if isinstance(obj,dict) else [],'warningGoalIdsMentioned':[x['goalId'] for x in warn if x['code']=='APV-201' and x['goalId'] in body],'scopeBoundary':'Existing historical independent/informed scope proof, not newly reviewed or automatically transferable to current exact override tuple; complete verdict parsing/current body comparison not completed in this finite handoff. Preserve actual informed versus independent authority.'})
proof=save('LOCATORS.existing-bounded-acquisition-scope-science-for-50-APV201-not-new-acceptance.json',{'proofs':proofs,'coveredByMentionGoalCount':len({id for p in proofs for id in p['warningGoalIdsMentioned']}),'notMentionedWarningGoalIds':sorted({x['goalId']for x in warn if x['code']=='APV-201'}-{id for p in proofs for id in p['warningGoalIdsMentioned']}),'locatorMentionIsNotScientificAcceptance':True,'requiresNext':'Exact per-override current jurisdiction/source scope/body compare against actual preserved verdict and primary passage. No warning acceptance or source-coverage credit is authorized here.'})
# Guard actual read source files; own outputs are excluded from immutable source guards.
source=[p for p in guards.values() if not p['path'].startswith(str(S)+'/')];changed=[]
for p in source:
 q=pathlib.Path(p['path']);b=q.read_bytes()
 if hashlib.sha256(b).hexdigest()!=p['sha256']:changed.append(p['path'])
gp=save('GUARDS.actual-read-sources-before-after.json',{'sourceFiles':source,'changedPaths':changed,'allUnchanged':not changed,'MainWrites':False,'KWrites':False,'compilerRepeats':0,'fullChecks':0,'SourceABOutputsRead':False})
summary={'atUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'role':'Finite partial technical cause/remediation handoff; no science votes/source approvals','unsupported427CauseCounts':dict(counter),'BYInactiveBroaderFallbackCounterfactualUnsupported':437,'uniqueUnsupported104':a['unsupportedUniqueGoalCount'],'APV203':dict(delta),'APV201':50,'APV201ExplicitOwnAcquisitionScope':sum(x['code']=='APV-201' and x['ownScopeExtensionCount']>0 for x in warn),'remainingReverseRows':len(rev),'artifacts':[unsupported,warnings,reverse,proof,gp],'unresolved':['401 of427 lack older direct source credit and mostly newly visible scope. Need finite current source/required-by proof review, not return to narrower Main scope.','26 older direct occurrences need final exact boundary-path interpretation; raw witnesses are preserved.','11 reverse rows: scope references versus stale broad aggregate mappings require author/source review; no ready-approved automatic view patch.','98 raw applicability CAS proposals are not authorized; full downstream fingerprint effect not computed.','50 override acceptance requires exact historical verdict-to-current tuple resolution; historical proof locators supplied, not a blanket waiver.'],'actionsNotPerformed':['No Main/K writes','No source approval or accepted-warning writes','No current SourceA/B reads','No compiler/global rerun','No new subagent']};sp=save('HANDOFF.finite-remaining-lower-layer-cause-and-open-remediation.json',summary);print(json.dumps({'handoff':sp,'counts':dict(counter),'APV203':dict(delta),'sourceGuards':len(source),'changed':changed,'proofMentionGoals':len({id for p in proofs for id in p['warningGoalIdsMentioned']}),'old26Blocked':sum(bool(x['lostDirectWitnesses']) and all(not w['currentInheritanceEligiblePaths'] for w in x['lostDirectWitnesses']) for x in lost)}))
