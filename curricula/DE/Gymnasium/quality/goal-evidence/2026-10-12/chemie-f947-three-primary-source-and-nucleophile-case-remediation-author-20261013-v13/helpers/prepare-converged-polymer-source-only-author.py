# Apache-2.0. Bounded author successors only; no live data, Git, review votes or render writes.
from pathlib import Path
import copy, datetime, hashlib, json
R=Path('/home/enpasos/projects/skillpilot');E=R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-12'
N=E/'chemie-f947-three-primary-source-and-nucleophile-case-remediation-author-20261013-v13';D=N/'source/converged-polymer20-source-author'
X=R/'tmp/chemie-f947-primary-case-author-private-20261013-v13'
OLD=E/'chemie-f947-final-source-PNG-explicit-tasks-neutral-native-author-root-20261013-v11'
O=E/'chemie-polymers18-current231-inactive-normal-preparation-technical-20261013-v1'
G='f947cd04-952a-5a9d-9445-3ffc70e02c3c';SILVER='afa7dae7-9378-5687-aa8d-69a04afaa0d8'
rd=lambda p:json.loads(p.read_text());rel=lambda p:str(p.relative_to(R));sha=lambda p:'sha256:'+hashlib.sha256(p.read_bytes()).hexdigest();bind=lambda p:{'path':rel(p),'sha256':sha(p),'bytes':p.stat().st_size}
def own(p,d):
 assert p.is_relative_to(D);p.parent.mkdir(parents=True,exist_ok=True);assert not p.exists();p.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n')
def private(p,b):
 assert p.is_relative_to(X);cur=X
 for part in p.parent.relative_to(X).parts:
  cur=cur/part
  if cur.is_symlink():
   src=cur.resolve(strict=True);assert src.is_dir();cur.unlink();cur.mkdir()
   for child in src.iterdir():(cur/child.name).symlink_to(child,target_is_directory=child.is_dir())
  elif not cur.exists():cur.mkdir()
  assert cur.is_dir() and not cur.is_symlink(),cur
 if p.is_symlink() or p.exists():p.unlink()
 p.write_bytes(b);assert not p.is_symlink() and p.resolve().is_relative_to(X)
plan=rd(N/'source/PRIMARY_SOURCE_AUTHOR.proposed-current-transports-and-component-routing.json');baseplans={p['originalLiveBinding']['path']:p for p in plan['mappingSuccessors']}
HB77='hb-chemistry-sekii-gyo2022-3-3-4-1-kunststoffe-077-a9fa2b95';HB78='hb-chemistry-sekii-gyo2022-3-3-4-1-kunststoffe-078-1902b687';HB79='hb-chemistry-sekii-gyo2022-3-3-4-1-kunststoffe-079-7418c562';HE='he-chem-sekii-q2-2-b06-a01-f1814d99'
TH067='th-chem-sekii-th-ch-sekii-4-1-3-loslichkeitsgleichgewichte-067-01-ab4ff945'
four=rd(N/'checks/four-original-goals-current-active-source-direct-inherited-witnesses.author.actual.json');silverrows=next(g for g in four['goals'] if g['goalId']==SILVER)
silver_bad={w['witness']['sourceGoalId'] for w in silverrows['selectedSourceWitnesses'] if w['witness']['sourceGoalId'].startswith(('sn-','st-','rp-'))}|{TH067}
rules={HB77:['8721d943-8368-5304-bd3c-7d7944099662'],HB78:['2cf86c25-5280-5e7d-8ebb-9f2e6733fbe2','1df17884-96ae-57d7-9da9-dbebd082596f'],HB79:[],HE:[SILVER]}
# Originals are immutable. Add only concrete source rows observed in the coupled polymer audit.
files={p:R/p for p in baseplans}
for p in (R/'curricula/DE/Gymnasium/mapping').rglob('*.json'):
 if 'quality' in p.parts:continue
 m=rd(p)
 if any(r.get('legacyGoalId') in silver_bad and r.get('canonicalGoalId')==SILVER for r in m.get('mappings',[])) or any(r.get('legacyGoalId') in rules for r in m.get('mappings',[])):files[rel(p)]=p
sources={};source_proposals=[]
for proposal in plan['sourceExtractionSuccessors']:
 src=R/proposal['candidateBinding']['path'];new=copy.deepcopy(rd(src));changed=[]
 for g in new['sourceGoals']:
  if g['id']==plan['newHB34PrimarySourceId']:g['bulletIndex']=2
  if g['id'] not in [HB77,HB78,HB79]:continue
  record=next(x for x in rd(N/'source/HB34.all-four-selected-polymer-source-rows.actual-primary-author-audit.json')['records'] if x['sourceGoalId']==g['id']);literal=record['actualPrimaryText'];oldpassage=next(p for p in new['passages'] if p['id']==g['passageId'])
  oldpassage['sourceGoalIds']=[i for i in oldpassage.get('sourceGoalIds',[]) if i!=g['id']]
  pid=g['passageId']+'-converged-primary-'+g['id'].split('-')[-2];choice=g['id']==HB79;span='Bremen Thema 4.1 Kunststoffe; physische und gedruckte S.34; '+('optionale Vertiefung Silicone' if choice else 'tatsächlicher fachinhaltlicher Recycling-Bullet' if g['id']==HB77 else 'tatsächlicher gesellschaftlicher Nachhaltigkeits-Operator')
  normalized={HB77:('Recyclingmethoden für Kunststoffe beschreiben','Die lernende Person kann verschiedene Recyclingmethoden für Kunststoffe beschreiben.'),HB78:('Gesellschaftliche Bedeutung von Kunststoffen nachhaltig bewerten','Die lernende Person kann die gesellschaftliche und wirtschaftliche Bedeutung von Kunststoffen und Biokunststoffen aus Sicht der Nachhaltigkeit bewerten.'),HB79:('Silicone als optionale Vertiefung beschreiben','Die lernende Person kann im gewählten Vertiefungsbereich Herstellung, Struktur, Eigenschaften und Anwendungen von Siliconen beschreiben.')}[g['id']]
  g.update(passageId=pid,sourceText=literal,rawSourceText=literal,parentBulletText=literal,rawParentBulletText=literal,sourceSpan=span,rawSourceSpan=span,sourceRef=span,title=normalized[0],description=normalized[1])
  if choice:g['tags']=list(g.get('tags',[]))+['selection:optional-deepening']
  passage={'id':pid,'topicCode':g['topicCode'],'title':span,'text':literal,'rawText':literal,'page':34,'sourcePath':'curricula/DE/Gymnasium/input/HB/GyO_Chemie_2022.pdf','sourceGoalIds':[g['id']],'courseLevel':'GK_LK'}
  if oldpassage.get('sourceDocumentKey'):passage['sourceDocumentKey']=oldpassage['sourceDocumentKey']
  new['passages'].append(passage);changed.append(g['id'])
 dst=D/'extraction-successors'/src.name;own(dst,new);sources[proposal['originalBinding']['path']]=rel(dst);source_proposals.append({'originalLiveBinding':proposal['originalBinding'],'earlierUnapprovedAuthorBinding':bind(src),'candidateBinding':bind(dst),'newAdditionalChangedSourceGoalIds':changed,'allOtherSourceGoalRowsExactToEarlierAuthor':True,'actualPrimaryDocumentsUnchanged':True,'newScientificVotes':0})
targeted=[];mapping_plans=[]
for path,src in sorted(files.items()):
 original=rd(src);prior=baseplans.get(path);base=rd(R/prior['candidateBinding']['path']) if prior else copy.deepcopy(original);new=copy.deepcopy(base);sourcepath=original.get('sourceExtractionPath')
 if sourcepath in sources:new['sourceExtractionPath']=sources[sourcepath]
 elif prior and original.get('sourceExtractionPath') in sources:new['sourceExtractionPath']=sources[original['sourceExtractionPath']]
 # A flat alias intentionally keeps its own original fields, except explicit authoritative source transport introduced earlier.
 if prior:
  for originalsource,newsource in sources.items():
   oldcandidate=next(p['candidateBinding']['path'] for p in plan['sourceExtractionSuccessors'] if p['originalBinding']['path']==originalsource)
   if new.get('sourceExtractionPath')==oldcandidate:new['sourceExtractionPath']=newsource
 for d in new.get('decisions',[]):
  sid=d.get('sourceGoalId');before=copy.deepcopy(d)
  if sid in rules:
   d['canonicalGoalIds']=rules[sid]
   if not d['canonicalGoalIds']:d['decision']='needs_review'
   d['rationale']='AUTHOR ONLY, exact primary/operator correction; no independent vote. '+('Only recycling is actually demanded by the HB34 bullet; processing and thermal behaviour are held.' if sid==HB77 else 'Societal/economic sustainability assessment supports bounded societal/criteria components; no degradation mechanism, raw-material supply operator or formal LCA method is claimed.' if sid==HB78 else 'Optional Silicone deepening is not representable as an unconditional source course. Conductive plastic operators are absent from the actual primary. Literal retained, source union held.' if sid==HB79 else 'The actual HE Q2.2-b06 literal explicitly describes silver nanoparticles in antimicrobial polyolefin food packaging. It supports the bounded silver-nanomaterial goal; radical polymerisation and recycling are not this literal operator.')
  elif sid in silver_bad and SILVER in d.get('canonicalGoalIds',[]):
   d['canonicalGoalIds']=[i for i in d['canonicalGoalIds'] if i!=SILVER]
   if not d['canonicalGoalIds']:d['decision']='needs_review'
   d['rationale']=d.get('rationale','')+' AUTHOR ONLY: remove the silver-nanoparticle-packaging component; this literal describes silver ions, complexes, fixation or precipitation, not this current nano goal. Every other partner is retained exactly.'
  else:continue
  d['reviewer']='Codex bounded polymer-source author; independent operator/course amendment judgment pending';d['reviewedAt']=datetime.datetime.now(datetime.timezone.utc).isoformat();targeted.append({'originalMappingPath':path,'sourceGoalId':sid,'before':before,'after':copy.deepcopy(d)})
 flat=[]
 for r in new.get('mappings',[]):
  sid=r.get('legacyGoalId');tid=r.get('canonicalGoalId')
  if sid in rules:continue
  if sid in silver_bad and tid==SILVER:continue
  flat.append(r)
 for sid,targets in rules.items():
  if any(r.get('legacyGoalId')==sid for r in base.get('mappings',[])):
   template=next(r for r in base['mappings'] if r['legacyGoalId']==sid)
   for tid in targets:
    r=copy.deepcopy(template);r['canonicalGoalId']=tid;r['matchType']='partial';flat.append(r)
 new['mappings']=flat
 relative_source=Path(path).relative_to('curricula/DE/Gymnasium/mapping');future='curricula/DE/Gymnasium/mapping/'+str(relative_source.parent/(Path(path).stem+'.converged-polymer-author-20261013-v13.json'));archive='curricula/DE/Gymnasium/mapping/author-polymer20-primary-history/quality/20261013-v13/'+str(relative_source)
 dst=D/'mapping-successors'/relative_source.parent/Path(future).name;own(dst,new)
 # All removed old aliases remain byte-exact in private archive; active repository paths are untouched.
 oldprivate=X/path
 if oldprivate.exists():assert sha(oldprivate)==sha(src);oldprivate.unlink()
 if prior:
  oldproposal=X/prior['proposedFutureLivePath'];assert oldproposal.is_file() and not oldproposal.is_symlink();oldproposal.unlink()
 private(X/archive,src.read_bytes());private(X/future,dst.read_bytes())
 mapping_plans.append({'originalLiveBinding':bind(src),'earlierUnapprovedAuthorBinding':prior['candidateBinding'] if prior else None,'candidateBinding':bind(dst),'proposedFutureLivePath':future,'proposedFutureArchivePath':archive,'allOtherPartnerComponentsPreserved':True,'sourceChangesApproved':False})
selector=rd(O/'REVIEW_INPUTS.final18.current231.neutral.json');ids=selector['futureNativeReviewGoalIds']+selector['heldGoalIds'];assert len(ids)==20
can=rd(OLD/'candidate/canonical523.current402.seven-images-source-boundary.author.json');before=copy.deepcopy(can)
for g in can['goals']:
 if g['id'] in ids:g.setdefault('extendedData',{})['applicabilityMappingInheritance']='boundary'
canpath=D/'candidate/canonical523.current402.seven-images-polymer20-boundaries.pre-compiled.author.json';own(canpath,can)
cfg=rd(N/'source/current-source-atlas-primary-author.config.json');replace={p['proposedFutureLivePath']:next(q['proposedFutureLivePath'] for q in mapping_plans if q['originalLiveBinding']['path']==p['originalLiveBinding']['path']) for p in plan['mappingSuccessors']};replace.update({p['originalLiveBinding']['path']:p['proposedFutureLivePath'] for p in mapping_plans});cfg['mappingPaths']=[replace.get(p,p) for p in cfg['mappingPaths']];cfg['landscapePath']=rel(canpath);cfg['semanticKindLedgerPath']=rel(D/'candidate/semantic523.raw-source-classifications.pre-compiled.author.json')
own(D/'source-atlas.converged-author.config.json',cfg)
own(D/'CONVERGED.polymer20.source-author.proposal.pending-science.json',{'schemaVersion':1,'role':'source author technical proposal only','sourceExtractionSuccessors':source_proposals,'mappingSuccessors':mapping_plans,'additionalConcreteOperatorChanges':targeted,'boundaryGoalIds':ids,'boundaryUsesExistingAtomicGoalContract':True,'boundaryDoesNotClaimDirectSupportFromNaturstoffAncestors':True,'knownHELiteralMissingCorrectNanoPartnerRepairedAsCandidate':HE,'silverIonOrComplexNonNanoComponentsRemoved':sorted(silver_bad),'HBOptionalSiliconeAndRPOptionalMechanismUnqualifiedProjectionHeld':True,'HBPracticalAndAllOtherWholeSourceUnionsNotApproved':True,'allOtherFieldsExceptBoundaryMetadataAndPriorSevenImageBindingsPreserved':True,'current402AndProtected231ProjectionMeasurementPending':True,'actualExistingCases17AndImagesUnchanged':True,'f947NECaseAuthorBinding':bind(N/'positive/whole-two-cases.nucleophile-electrophile.author-successor.json'),'newScientificVotes':0,'activeOrGitWrites':False})
for p in D.rglob('*'):
 if p.is_file():private(X/rel(p),p.read_bytes())
# Candidate only. Runtime canonical path must contain proposed input for the unchanged compiler.
private(X/'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json',canpath.read_bytes())
print(json.dumps({'candidateRoot':rel(D),'mappingSuccessors':len(mapping_plans),'sourceSuccessors':len(source_proposals),'boundaryGoals':len(ids),'newAdditionalOperatorChanges':len(targeted),'liveWrites':False,'nativeRenders':0}))
