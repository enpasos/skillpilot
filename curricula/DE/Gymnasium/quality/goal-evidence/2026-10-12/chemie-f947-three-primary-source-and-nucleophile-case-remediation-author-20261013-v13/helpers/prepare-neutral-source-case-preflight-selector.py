# Apache-2.0. Freeze source/case data for an independent source-first preflight; excludes author verdict prose.
from pathlib import Path
import datetime,hashlib,json
R=Path('/home/enpasos/projects/skillpilot');E=R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-12';N=E/'chemie-f947-three-primary-source-and-nucleophile-case-remediation-author-20261013-v13';D=N/'source/converged-polymer20-source-author'
rd=lambda p:json.loads(p.read_text());rel=lambda p:str(p.relative_to(R));sha=lambda p:'sha256:'+hashlib.sha256(p.read_bytes()).hexdigest();bind=lambda p:{'path':rel(p),'sha256':sha(p),'bytes':p.stat().st_size}
def own(p,d):
 assert p.is_relative_to(D);p.parent.mkdir(parents=True,exist_ok=True);assert not p.exists();p.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n')
cfg=rd(R/'app/scripts/config/goal-books/de-gym-chemistry-national-atlas.inputs.json');old=rd(R/cfg['outputDirectory']/'source-projection.receipt.json');bindings=old['inputBindings'];groups=old['witnessGroups'];oldscopes=[]
for s in old['scopes']:
 ws=[]
 for i in s['witnessGroupRefs']:
  g=groups[i]
  for id in g['goalIds']:
   ws.append({'goalId':id,'sourceGoalId':g['sourceGoalId'],'mappedTargetGoalId':g['mappedTargetGoalId'],'coverage':g['coverage'],'profileBasis':g['profileBasis'],'mappingPath':bindings[g['mappingInput']]['path'],'sourceExtractionPath':bindings[g['extractionInput']]['path']})
 oldscopes.append({'key':s['key'],'witnesses':ws})
actual=rd(D/'checks/final-stock-source-atlas-381-actual-snapshot-author.not-science.json');plan=rd(D/'CONVERGED.polymer20.source-author.proposal.pending-science.json');matrix=rd(D/'checks/current402-protected231-polymer20-source-and-P-A-M-input-matrix.author.actual.json');wanted=set(plan['boundaryGoalIds'])|{'7a05a1ce-45d3-571e-be51-afcd8dfd33ca','a4bac92b-d685-5cb6-94c8-c9b8b878d125','1df17884-96ae-57d7-9da9-dbebd082596f'}
future_mapping_actual={p['proposedFutureLivePath']:p['candidateBinding']['path'] for p in plan['mappingSuccessors']}
def actual_path(path):return R/future_mapping_actual.get(path,path)
cache={};records={};witnesses=[];documents={}
def get(path):
 if path not in cache:cache[path]=rd(actual_path(path))
 return cache[path]
def capture(version,mp,ep,sid):
 key='|'.join([version,mp,ep,sid])
 if key in records:return key
 m=get(mp);ex=get(ep);sg=next(g for g in ex['sourceGoals'] if g['id']==sid);p=next((p for p in ex.get('passages',[]) if p['id']==sg['passageId']),{})
 docs=ex.get('sourceDocuments',[ex.get('sourceDocument',{})]);keys=list(dict.fromkeys([v for v in [sg.get('sourceDocumentKey'),p.get('sourceDocumentKey')]+[t.split(':',1)[1] for t in sg.get('tags',[]) if t.startswith('sourceDocument:')] if v]));doc=next((d for d in docs if keys and d.get('key')==keys[0]),docs[0] if len(docs)==1 else None)
 decision=next((d for d in m.get('decisions',[]) if d.get('sourceGoalId')==sid),None);semantic={k:v for k,v in (decision or {}).items() if k not in ['rationale','reviewer','reviewedAt']}
 records[key]={'version':version,'mappingBinding':bind(actual_path(mp)),'projectedFutureMappingPath':mp if mp in future_mapping_actual else None,'extractionBinding':bind(R/ep),'sourceGoal':sg,'passage':p,'document':doc,'semanticMappingDecisionExcludingReviewerProse':semantic,'rawVsNormalizedDescriptorFieldsExplicit':{'primaryLiteralField':'rawSourceText if available, otherwise sourceText','normalizedGoalTitleDescriptionAreDerivedDescriptorsNotASecondPrimaryQuote':True}}
 if doc and doc.get('path'):
  path=doc['path'];snapshot=next((s for s in cfg.get('sourceDocumentSnapshots',[]) if s['path']==path),None);physical=R/path;documents[path]={'path':path,'officialSourceDocumentMetadata':doc,'pinnedSnapshot':snapshot,'actualCachedFileBinding':bind(physical) if physical.exists() else None,'actualCachedDocumentAvailable':physical.exists()}
 return key
for version,scopes in [('current',oldscopes),('proposed',actual['selectedGoalScopes'])]:
 for s in scopes:
  for w in s['witnesses']:
   if w['goalId'] not in wanted:continue
   k=capture(version,w['mappingPath'],w['sourceExtractionPath'],w['sourceGoalId']);witnesses.append({'version':version,'scope':s['key'],**w,'sourceRecordKey':k})
changed=[]
for p in plan['mappingSuccessors']:
 mp=p['originalLiveBinding']['path'];cp=p['candidateBinding']['path'];a=get(mp);b=get(cp);ad={r['sourceGoalId']:r for r in a.get('decisions',[])};bd={r['sourceGoalId']:r for r in b.get('decisions',[])}
 for sid in sorted(ad.keys()|bd.keys()):
  aa={k:v for k,v in ad.get(sid,{}).items() if k not in ['rationale','reviewer','reviewedAt']};bb={k:v for k,v in bd.get(sid,{}).items() if k not in ['rationale','reviewer','reviewedAt']}
  if aa==bb and a.get('sourceExtractionPath')==b.get('sourceExtractionPath'):continue
  if not any(t in wanted for t in aa.get('canonicalGoalIds',[])+bb.get('canonicalGoalIds',[])):continue
  ka=capture('current',mp,a['sourceExtractionPath'],sid) if sid in ad else None;kb=capture('proposed',cp,b['sourceExtractionPath'],sid) if sid in bd else None
  changed.append({'currentMappingBinding':p['originalLiveBinding'],'proposedMappingBinding':p['candidateBinding'],'sourceGoalId':sid,'currentSemanticDecision':aa,'proposedSemanticDecision':bb,'currentSourceRecordKey':ka,'proposedSourceRecordKey':kb})
dataset={'schemaVersion':1,'kind':'Neutral actual-source data, all direct/inherited witnesses and source/operator/course cells; no verdict','goalIds':sorted(wanted),'actualCurrentAndProposedWitnesses':witnesses,'sourceRecords':records,'changedSemanticDecisions':changed,'primaryDocuments':list(documents.values()),'proposedSourceCounts':actual['counts'],'omittedGoalIds':[r['goalId'] for r in actual['omittedGoals']],'authorVerdictsAndPeerResultsExcluded':True,'nativeMaterializationNotPerformed':True};data=D/'neutral/selected-polymer20-and-shared-protected-source-literals-passages-partners-courses.actual.json';own(data,dataset)
neutralmatrix={'schemaVersion':1,'currentCurricularAtomicDenominator':402,'candidateCurricularAtomicDenominator':402,'protected231ChangedPageGoalIds':[r['goalId'] for r in matrix['protected231'] if not r['whole402PageExact']],'protected231ChangedRawSEMSourceFingerprintGoalIds':[r['goalId'] for r in matrix['protected231'] if not r['rawSemanticSourceFingerprintExact']],'protected231ChangedCanonicalDescriptionContextGoalIds':[r['goalId'] for r in matrix['protected231'] if not r['canonicalDescriptionContextExact']],'goalData':[{k:r[k] for k in ['goalId','title','currentJurisdictions','candidateJurisdictions','literalBodiesDEENAndEdgesExact','originalFull402PageExact','changedPageFields','currentVsCandidateCanonicalDescriptionContextExact','originalP17SemanticFingerprintExact','originalP17ActualResourceInputFingerprintExact','oldSourceScopes','candidateSourceScopes']} for r in matrix['polymer20']],'sourceCount':381,'omittedCount':21,'noScientificVerdictOrNewVotes':True};mx=D/'neutral/current-goal-page-context-and-program-scope-delta.actual.json';own(mx,neutralmatrix)
scientific=[R/rd(D/'configs/P1.author.inactive.config.json')['landscapePath'],R/rd(D/'configs/P1.author.inactive.config.json')['semanticKindLedgerPath'],D/'positive/P1.primary-and-NE.author.normal.jsonl',N/'positive/whole-two-cases.nucleophile-electrophile.author-successor.json',data,mx]
for doc in documents.values():
 if doc['actualCachedDocumentAvailable']:scientific.append(R/doc['path'])
scientific += [R/p['candidateBinding']['path'] for p in plan['sourceExtractionSuccessors']]
scientific += [E/'chemie-polymers17-original-native-current231-inactive-adoption-root-20261013-v9/positive/P17.original-author-native-bound.raw-exact.jsonl']
selector={'schemaVersion':1,'kind':'Neutral source-first independent preflight inputs, before any new native PDF or final paired D rounds','createdAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'authorRoleOnlyNoIndependentSourceVote':True,'currentCanonicalBinding':bind(R/'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'),'currentRawSemanticLedgerBinding':bind(R/'curricula/DE/Gymnasium/quality/goal-book-publication/chemie.semantic-kinds.json'),'candidateCanonicalBinding':bind(scientific[0]),'candidateCurricularAtomicDenominator':402,'sourceProjectionPublishedCount':381,'sourceProjectionOmittedCount':21,'sourceCounterNotM7MinimumThreshold':True,'scientificInputBindings':[bind(p) for p in dict.fromkeys(scientific)],'actualMappingProposalByteBindings':[p['candidateBinding'] for p in plan['mappingSuccessors']],'technicalOnlyReadProofBindings':[bind(D/'checks/current402-protected231-polymer20-source-and-P-A-M-input-matrix.author.actual.json'),bind(D/'checks/prospective-historical-byte-exact-transport-before-32-alias-retirement.author.actual.json')],'excludedReviewerInputPatterns':['N13/source/HB34*author-audit*','N13/checks/four-original-goals-source-retention-limits*','all A12/B12 prior reviewer verdicts/findings','all author or root scientific verdict prose','all original17 reviewer verdict prose unless separately required for already-retained decisions'],'reviewScope':['Check the actual changed primary/operator/course cells and all direct or ancestor routes into the coupled polymer goals; describe any specific remaining wrong clause or course.','Check final F947 DE/EN N/E demands, answer and scored rubric against the actual relevant source demands and existing complete chemistry balances.','Use valid unchanged P17 chemistry bodies without restarting historical reviews; explain any concrete binding/context affected by current source corrections.','Keep 413 and 9d original holds explicit; do not infer their closure from projection counts.','Do not label source-wide practical execution, full sibling unions or human approval as completed.'],'independentSourceVerdictStatus':'pending','nativeMaterializationStatus':'not_started','freshPairedDReviewStatus':'pending_after_source_preflight','humanApproval':False,'activeOrGitWrites':False};out=D/'REVIEW_INPUTS.neutral-source-and-F947-case-preflight.pending-independent.json';own(out,selector)
print(json.dumps({'neutralSelector':rel(out),'neutralSelectorSHA':sha(out),'sourceRecordCount':len(records),'directAndInheritedWitnessRows':len(witnesses),'changedSemanticDecisions':len(changed),'actualCachedPrimaryDocuments':len([d for d in documents.values() if d['actualCachedDocumentAvailable']]),'protected231ChangedPages':len(neutralmatrix['protected231ChangedPageGoalIds']),'freshNativeRendered':False,'scientificVotes':0}))
