# SPDX-License-Identifier: Apache-2.0
"""Finite technical transport of two foreign-root accepted partial relations."""
import copy, datetime, hashlib, importlib.util, json, pathlib, sys
R=pathlib.Path.cwd(); O=pathlib.Path(__file__).resolve().parent.parent.relative_to(R)
N=pathlib.Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-18')
A=N/'chemie-current450-SH-biodiesel-SL-micelle-two-content-source-remediation-author-successor-20261018-v1'
S=N/'chemie-current450-SH-SL-two-source-informed-independent-root-20261018-v1'
read=lambda p:json.loads(pathlib.Path(p).read_text())
dig=lambda x:hashlib.sha256(json.dumps(x,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode()).hexdigest()
def pin(p):
 p=pathlib.Path(p); b=p.read_bytes(); return dict(path=p.as_posix(),sha256=hashlib.sha256(b).hexdigest(),bytes=len(b))
def verify(p): assert pin(p['path'])==p,p['path']
def write(p,x): pathlib.Path(p).write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n')
def pins(rows): return [dict(id=x['id'],sha256=dig(x)) for x in rows]
def native():
 cp='curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json'
 paths=next(s for s in read(cp)['subjects'] if s['subject']=='chemie')['positiveEvidenceConfigPaths']; assert len(paths)==138
 wanted={x['goalId']:x for x in read(A/'INPUT.two-whole-actual-current-C-P.exact.json')}; owners={}; selected=[]
 for path in paths:
  c=read(path); scope=c['scope']['goalIds']; selected.extend(scope)
  for line,r in enumerate(pathlib.Path(c['reviewPath']).read_text().splitlines(),1):
   if not r.strip(): continue
   row=json.loads(r); gid=row['goalId']
   if gid in scope and gid in wanted:
    assert gid not in owners
    assert row==wanted[gid]['wholeNativeRecord']
    owners[gid]=dict(goalId=gid,config=pin(path),nativeRecordFile=pin(c['reviewPath']),nativeLineOneBased=line,wholeNativeRecordSHA256=dig(row),wholeProfileSHA256=dig(row['profile']))
 assert len(selected)==len(set(selected))==450 and set(owners)==set(wanted)
 canon='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'; goals={g['id']:g for g in read(canon)['goals']}
 for gid,w in wanted.items(): assert goals[gid]==w['wholeCurrentGoal']; owners[gid]['wholeCurrentGoalSHA256']=dig(goals[gid])
 return dict(activeConfigCount=len(paths),selectedUniqueGoalCount=len(selected),wholeSelectedTwoRecordsExact=True,owners=list(owners.values())),[cp,canon]+[v[k]['path'] for v in owners.values() for k in ['config','nativeRecordFile']]
def evidence():
 author=A/'SEAL.inactive-two-content-source-author-successor.json'; science=S/'SEAL.informed-independent-root-two-partial-source-successors.json'; first=S/'FIRST.informed-independent-root-two-whole-profiles-and-original-source-scope.json'
 assert pin(author)['sha256']=='41446c3b01a2df677b643d3a67534dfe224e00d2c247fd7d332ee628ae2ffe22'
 assert pin(science)['sha256']=='86149bbaa22c5021f4ad2e7328d175e4c30fa7ec9d76e590197a51944681d465'
 assert pin(first)['sha256']=='0da4bc8e67fd3d44dc5a472f86e041ef80a1d2c2ed26e2057ca16ffbd31e28a6'
 for seal in [author,science]:
  for row in read(seal)['files']:verify(row)
 rows=read(first)['decisions']; assert len(rows)==2 and all(r['disposition']=='APPROVE_BOUNDED_PARTIAL' and not r['wholeOfficialSourceCredit'] and not r['requiredCanonicalOrProfileMutation'] for r in rows)
 return dict(authorSeal=pin(author),independentScienceSeal=pin(science),independentScienceFIRST=pin(first))
def prepare():
 assert not (O/'PLAN.actual-six-files-selected-object-CAS.json').exists()
 ev=evidence(); profiles,protected=native(); cas=read(A/'candidate/CAS.five-current-alias-single-cell-appends.INACTIVE.json')['aliases']; ext=read(A/'candidate/EXTRACTION.one-whole-SL-LK-competence-diagram-unit.INACTIVE.json'); ep=ext['proposedNormalExtractionPath']; old=read(ep)
 by={g['id']:g for g in old['sourceGoals']}; bp={p['id']:p for p in old['passages']}
 assert len(by)==len(old['sourceGoals']) and len(bp)==len(old['passages'])
 for row in ext['beforeEveryWholeSourceObjectSHA256']:assert dig(by[row['id']])==row['sha256']
 for row in ext['beforeEveryWholePassageSHA256']:assert dig(bp[row['id']])==row['sha256']
 assert ext['wholeSourceGoalToAppend']['id'] not in by and ext['wholePassageToAppend']['id'] not in bp
 assert ext['wholeSourceGoalToAppend']['sourceText'] not in [g.get('sourceText') for g in old['sourceGoals']]
 assert next(d for d in old['sourceDocuments'] if d['key']==ext['sourceDocument']['key'])==ext['sourceDocument']
 operations=[]
 for row in cas:
  p=row['actualBeforeAlias']['path']; d=read(p); m=row['appendOnlyMapping']; assert d['sourceLandscapeId']==row['sourceLandscapeId']; assert d.get('sourceExtractionPath')==row['actualBeforeDeclaredSourceExtraction']
  assert not any(x['legacyGoalId']==m['legacyGoalId'] and x['canonicalGoalId']==m['canonicalGoalId'] for x in d['mappings'])
  ds=[x for x in d.get('decisions',[]) if x['sourceGoalId']==row['selectedSourceGoalId']]; assert len(ds)<=1
  current=ds[0] if ds else None; historical=row['currentWholeDecisionCAS']
  if current!=historical:
   assert historical is not None and current is not None
   for k,v in historical.items():assert current[k][:len(v)]==v if k in ['canonicalGoalIds','additionalAcceptedPartialContributions'] else current[k]==v
   assert set(current)-set(historical)<={'additionalAcceptedPartialContributions'}
   for contribution in current.get('additionalAcceptedPartialContributions',[]):
    ref=contribution.get('acceptedScientificRef') or contribution.get('independentAcceptedRef');assert ref is not None
    verify({k:v for k,v in ref.items() if k in ['path','sha256','bytes']})
  operations.append(dict(normalFile=pin(p),appendExactRow=m,currentSelectedWholeDecision=current,currentSelectedWholeDecisionSHA256=dig(current) if current else None,authorBeforeWholeDecisionStillExact=current==historical,laterAcceptedCarrierTailRetained=current is not None and current!=historical,oldMappingCount=len(d['mappings']),oldWholeMappingArraySHA256=dig(d['mappings']),oldDecisionCount=len(d.get('decisions',[])),oldWholeDecisionArraySHA256=dig(d.get('decisions',[])),oldOtherRootFields={k:v for k,v in d.items() if k not in ['mappings','decisions']},sourceExtractionPath=row['sourceExtractionPathForProposedCell']))
 assert len(operations)==5 and sum('/DE-SH/' in x['normalFile']['path'] for x in operations)==3
 sh=read(A/'INPUT.actual-whole-source-objects-and-appropriate-primary-contexts.json')['SH']; shdata=read(sh['extraction']['path']); assert shdata['sourceGoals'][127]==sh['wholeSourceGoal']; assert next(p for p in shdata['passages'] if p['id']==sh['wholeSourceGoal']['passageId'])==sh['wholeCurrentPassage']; protected.append(sh['extraction']['path'])
 matrix=read(A/'MATRIX.two-content-HOLD-author-successor.json'); protected.extend(matrix[k]['path'] for k in ['firstIndependentC40RecordPreserved','originalC40IndependentSealPreserved'])
 protected.extend(f'curricula/DE/Gymnasium/composition-views/chemie/de-{state}-{course}.view.json' for state in ['sh','sl'] for course in ['gk','lk'])
 p=dict(artifactRole='PREMUTATION_FINITE_TECHNICAL_CAS',**ev,actualCurrent138Selection=profiles,protectedFiles=[pin(p) for p in sorted(set(protected))],writeList=[ep]+[x['normalFile']['path'] for x in operations],extractionBefore=pin(ep),extractionCurrentOldSourcePins=pins(old['sourceGoals']),extractionCurrentOldPassagePins=pins(old['passages']),extractionOtherRootFields={k:v for k,v in old.items() if k not in ['sourceGoals','passages']},authorWholeSourceObjectPinsAllRetained=True,authorOldCount=len(ext['beforeEveryWholeSourceObjectSHA256']),laterCurrentSourceTailCount=len(old['sourceGoals'])-len(ext['beforeEveryWholeSourceObjectSHA256']),operations=operations,newWholeSourceUnit=ext['wholeSourceGoalToAppend'],newWholePassage=ext['wholePassageToAppend'],wholeSourceCredit=0,newScientificVotes=0)
 write(O/'PLAN.actual-six-files-selected-object-CAS.json',p); print(json.dumps(dict(plan=pin(O/'PLAN.actual-six-files-selected-object-CAS.json'),writeList=p['writeList'],profiles=profiles),indent=2))
def apply():
 P=read(O/'PLAN.actual-six-files-selected-object-CAS.json'); assert not (O/'RECEIPT.actual-two-partial-bindings-five-aliases-one-unit.json').exists(); assert evidence()=={k:P[k] for k in ['authorSeal','independentScienceSeal','independentScienceFIRST']}; profiles,_=native();assert profiles==P['actualCurrent138Selection']
 for p in P['protectedFiles']+[P['extractionBefore']]+[x['normalFile'] for x in P['operations']]:verify(p)
 science=read(P['independentScienceFIRST']['path'])['decisions']; authored=read(A/'candidate/TWO.bounded-source-partial-relations.INACTIVE.json')['records']; now=datetime.datetime.now(datetime.timezone.utc).isoformat(); profilesBy={x['goalId']:x for x in profiles['owners']}; pending={}; before={}; changes=[]
 for op in P['operations']:
  path=op['normalFile']['path']; d=read(path); before[path]=pathlib.Path(path).read_bytes(); m=op['appendExactRow']; gid=m['canonicalGoalId']; ix=next(i for i,x in enumerate(science) if x['goalId']==gid); s=science[ix]; a=next(x for x in authored if x['goalId']==gid); assert s['sourceGoalId']==m['legacyGoalId']; ref=dict(**P['independentScienceFIRST'],jsonPointer=f'/decisions/{ix}')
  contribution=dict(canonicalGoalId=gid,matchType='partial',independentAcceptedRef=ref,currentWholeGoalSHA256=profilesBy[gid]['wholeCurrentGoalSHA256'],currentWholeProfileSHA256=profilesBy[gid]['wholeProfileSHA256'],acceptedPartDe=s['findingAndReasonDe'],acceptedPartEn=a['proposedContributionEn'],explicitLimits=s['explicitLimits'],wholeOfficialSourceCredit=False,oldC40HOLDUnchanged=True,technicalIntegrationAtUTC=now,newScientificVoteByIntegrator=False)
  d['mappings'].append(copy.deepcopy(m))
  if 'decisions' in d:
   if op['currentSelectedWholeDecision'] is not None:
    dec=next(x for x in d['decisions'] if x['sourceGoalId']==m['legacyGoalId']); assert dec==op['currentSelectedWholeDecision']; dec['canonicalGoalIds'].append(gid); dec.setdefault('additionalAcceptedPartialContributions',[]).append(contribution)
   else:
    g=P['newWholeSourceUnit']; d['decisions'].append(dict(sourceGoalId=g['id'],topicCode=g['topicCode'],sourceSpan=g['sourceSpan'],sourceCourseLevel='LK',decision='mapped',canonicalGoalIds=[gid],matchType='partial',rationale='Only the specifically accepted chemical model-use contribution is mapped. Experimental/other-method duties and whole official source completion remain open.',reviewedAt=now[:10],reviewer='Foreign informed root source review; technical transport by B adds no scientific vote',scientificEvidence=[ref],additionalAcceptedPartialContributions=[contribution],wholeOfficialSourceCredit=False))
    previous=copy.deepcopy(d['status']); d['twoSourcePartialIntegration']=dict(previousStatusHistorical=previous,independentAcceptedRef=ref,newPartialMappings=1,newWholeSourceCoverage=0,wholeSourceCoverageEstablished=False); d['status']=dict(previous,totalSourceGoals=len(read(P['extractionBefore']['path'])['sourceGoals'])+1,newAcceptedPartialSourceGoals=1,newWholeSourceGoalsCovered=0,remainingWholeSourceReviewRequiredForNewUnit=True,notes='Historical pre-existing coverage counts remain unchanged. One separately reviewed bounded model-use relation is added; the complete new LK unit is not wholly covered. No historical C40 HOLD is rewritten.')
  assert len({(m['legacyGoalId'],m['canonicalGoalId']) for m in d['mappings']})==len(d['mappings']); pending[path]=d
 ep=P['extractionBefore']['path']; d=read(ep);before[ep]=pathlib.Path(ep).read_bytes(); oldcount=len(d['sourceGoals']); oldpassages=len(d['passages']); g=copy.deepcopy(P['newWholeSourceUnit']);g['metadata']['historicalAuthorStatus']=g['metadata']['authorStatus'];g['metadata']['authorStatus']='foreign-root-accepted-bounded-partial-technically-integrated';g['metadata']['independentAcceptedRef']=dict(**P['independentScienceFIRST'],jsonPointer='/decisions/1');g['metadata']['wholeOfficialSourceCredit']=False;d['sourceGoals'].append(g);d['passages'].append(copy.deepcopy(P['newWholePassage']))
 hist=copy.deepcopy(d['pipelineStatus']); d['method']['twoSourceReviewedPartialAddition']=dict(previousPipelineStatusHistorical=hist,oldSourceGoalCount=oldcount,currentSourceGoalCount=oldcount+1,oldPassageCount=oldpassages,currentPassageCount=oldpassages+1,completeSelectedGeneralDiagramUnitsAppended=1,method='Additive complete selected official LK competence-diagram unit; not a left-column content bullet. Only its specifically reviewed model-use contribution is mapped.',independentAcceptedRef=P['independentScienceFIRST'],wholeOfficialSourceCredit=0)
 for step in d['pipelineStatus']['steps']:
  if step['id']=='MAPPING-1':
   for c in step['checks']:
    if c['id']=='expected-topic-coverage':c['details']=f'{oldpassages} pre-existing passage groups plus1 complete selected LK competency-diagram unit; {oldpassages+1} current passages.'
  if step['id']=='MAPPING-2':
   for c in step['checks']:
    if c['id']=='source-goals-created':c['details']=f'{oldcount} pre-existing source units plus1 complete selected LK competency-diagram unit; {oldcount+1} current source units.'
    if c['id']=='source-goal-count-peer-baseline':c['details']='Historical content-only peer baseline retained in method.twoSourceReviewedPartialAddition.previousPipelineStatusHistorical; no new cross-inventory plausibility or full-standards completeness judgment.'
  if step['id']=='MAPPING-3':
   step['status']='incomplete'
   for c in step['checks']:
    if c['id']=='mapping-2-complete':c['details']=f'{oldcount+1} complete extracted source units; new LK unit has one bounded partial source-fit review, not whole coverage.'
    if c['id']=='m3-all-source-goals-reviewed':c['passed']=False;c['details']=f'Historical {oldcount}-unit reviews retained as history; new unit reviewed for bounded model use only. No new whole-source review closure.'
    if c['id']=='m3-all-source-goals-covered-by-canonical':c['passed']=False;c['details']='The new LK unit retains experimental and other-investigation duties beyond the accepted model-use contribution. Whole-source coverage remains open.'
 pending[ep]=d; encoded={p:(json.dumps(x,ensure_ascii=False,indent=2)+'\n').encode() for p,x in pending.items()};assert len(encoded)==6
 for p,b in encoded.items():assert json.loads(b)==pending[p]
 for x in [P['extractionBefore']]+[x['normalFile'] for x in P['operations']]:verify(x)
 written=[]
 try:
  for p,b in encoded.items():pathlib.Path(p).write_bytes(b);written.append(p)
 except BaseException:
  for p in reversed(written):pathlib.Path(p).write_bytes(before[p])
  raise
 for op in P['operations']:
  d=read(op['normalFile']['path']); n=op['oldMappingCount']; assert dig(d['mappings'][:n])==op['oldWholeMappingArraySHA256'] and d['mappings'][n:]==[op['appendExactRow']]; decisions=copy.deepcopy(d.get('decisions',[])); old=op['currentSelectedWholeDecision']
  if old is not None:
   ix=next(i for i,x in enumerate(decisions) if x['sourceGoalId']==old['sourceGoalId']); cur=decisions[ix]
   for k,v in old.items():assert (cur[k][:len(v)]==v) if k in ['canonicalGoalIds','additionalAcceptedPartialContributions'] else cur[k]==v
   assert set(cur)-set(old)<={'additionalAcceptedPartialContributions'};decisions[ix]=old
  elif 'decisions' in d:assert decisions.pop()['sourceGoalId']==P['newWholeSourceUnit']['id']
  assert dig(decisions)==op['oldWholeDecisionArraySHA256']
  for k,v in op['oldOtherRootFields'].items():
   if k!='status' or '/DE-SH/' in op['normalFile']['path']:assert d[k]==v
  assert (set(d)-set(op['oldOtherRootFields'])-{'mappings','decisions'})<=({'twoSourcePartialIntegration'} if '/DE-SL/' in op['normalFile']['path'] and 'decisions' in d else set())
  changes.append(dict(before=op['normalFile'],after=pin(op['normalFile']['path']),addedExactMapping=op['appendExactRow'],allOldMappingRowsAndAllOldDecisionFieldsExact=True,oldMappingCount=n,newMappingCount=len(d['mappings'])))
 d=read(ep); assert pins(d['sourceGoals'][:-1])==P['extractionCurrentOldSourcePins'];assert pins(d['passages'][:-1])==P['extractionCurrentOldPassagePins'];assert d['passages'][-1]==P['newWholePassage'];actual=copy.deepcopy(d['sourceGoals'][-1]);actual['metadata']=P['newWholeSourceUnit']['metadata'];assert actual==P['newWholeSourceUnit'];assert d['pipelineStatus']['steps'][-1]['status']=='incomplete'
 for k,v in P['extractionOtherRootFields'].items():
  if k not in ['method','pipelineStatus']:assert d[k]==v
 for k,v in P['extractionOtherRootFields']['method'].items():assert d['method'][k]==v
 for x in P['protectedFiles']:verify(x)
 assert native()[0]==P['actualCurrent138Selection']
 checks=dict(status='PASS',writtenNormalFiles=6,partialTuples=5,distinctAcceptedCountryRelations=2,newCompleteSourceUnits=1,newPassages=1,oldSLWholeSourceObjectsExact=len(d['sourceGoals'])-1,oldSLWholePassagesExact=len(d['passages'])-1,laterCurrentTailsPreserved=P['laterCurrentSourceTailCount'],allOldDecisionsAndMappingsPreserved=True,wholeP2ExactAgainstCurrent138Selection=True,originalC40HOLDAndScienceBytesExact=True,SLNewUnitLKOnly=True,currentSLM3WholeSourceStatus='incomplete',newWholeSourceCredit=0,newScientificOrNativeVotes=0,canonicalProfileDAGViewRegistryMutations=0)
 receipt=dict(artifactRole='ACTUAL_TECHNICAL_FOREIGN_ROOT_ACCEPTED_TWO_SOURCE_TRANSPORT',atUTC=now,integrator='/root/chemie450_caption1_native_fresh_b',provenance=dict(tool='OpenAI Codex',modelRevision=None,scientificRole='Technical transport only; no independent new source science'),plan=pin(O/'PLAN.actual-six-files-selected-object-CAS.json'),independentAcceptedRef=P['independentScienceFIRST'],independentScienceSeal=P['independentScienceSeal'],authorSeal=P['authorSeal'],actualCurrent138Selection=P['actualCurrent138Selection'],checks=checks,aliasChanges=changes,extractionChange=dict(before=P['extractionBefore'],after=pin(ep),oldSources=oldcount,newSources=oldcount+1,oldPassages=oldpassages,newPassages=oldpassages+1,wholeNewSourceObjectSHA256=dig(d['sourceGoals'][-1]),wholeNewPassageSHA256=dig(d['passages'][-1])),protectedFiles=P['protectedFiles'],remainingWholeSourceBoundaries=science[1]['explicitLimits'],APCompilerGlobalBuildStageCommitRuns=0,humanApprovalAndLearnerExecutionClaims=False)
 write(O/'RECEIPT.actual-two-partial-bindings-five-aliases-one-unit.json',receipt);print(json.dumps(dict(status='PASS',receipt=pin(O/'RECEIPT.actual-two-partial-bindings-five-aliases-one-unit.json'),checks=checks),indent=2))
if __name__=='__main__':
 {'prepare':prepare,'apply':apply}[sys.argv[1]]()
