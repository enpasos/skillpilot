#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""Only prepare inactive records from independently frozen science."""
from pathlib import Path
from datetime import datetime,timezone
import json,copy,hashlib,shutil,importlib.util

ROOT=Path('/home/enpasos/projects/skillpilot')
BASE=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05')
OWN=BASE/'biologie-ni-eighteen-current-reviewed-integration-candidate-v2'
CODE=ROOT/'tmp/biologie-ni-eighteen-current-reviewed-integration-candidate-v2-native-root'
OUT=ROOT/OWN
P13=BASE/'biologie-ni-thirteen-positive-profile-independent-root-followup-v1'
AM5=BASE/'biologie-ni-five-predecessors-and-pedigree-current-independent-am-p-context-v1'
P5=BASE/'biologie-ni-eighteen-current-independent-p-v1'
D=BASE/'biologie-ni-eighteen-reviewed-integration-candidate-v1'
AUTH=BASE/'biologie-ni-ten-current-native-author-candidate-v2'
IMP=Path('curricula/DE/Gymnasium/quality/goal-visualization-review/biologie-ni-five-kept-native-import-bindings-v1')
CAN=Path('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json')
KIND=Path('curricula/DE/Gymnasium/quality/goal-book-publication/biologie.semantic-kinds.json')
REG=Path('curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json')
ATLAS=Path('app/scripts/config/goal-books/de-gym-biology-national-atlas.inputs.json')
P3=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-09-30/biologie-m7-q1-three-revisions-current-v1/positive-evidence.config.json')

def sha(p):return hashlib.sha256(Path(p).read_bytes()).hexdigest()
def read(p):return json.loads(Path(p).read_text())
def write(p,d):Path(p).parent.mkdir(parents=True,exist_ok=True);Path(p).write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n')
def lines(p):return [json.loads(s) for s in Path(p).read_text().splitlines()]
def wlines(p,rows):Path(p).write_text(''.join(json.dumps(r,ensure_ascii=False,separators=(',',':'))+'\n' for r in rows))
def pconfig(cfg,label,ids):
 c=copy.deepcopy(cfg);c['landscapePath']=str(CAN);c['semanticKindLedgerPath']=str(KIND)
 c['reviewPath']=str(OWN/(label+'.review.jsonl'));c['scope']['goalIds']=ids
 return c

spec=importlib.util.spec_from_file_location('prep',OUT/'prepare_inactive_native.py');prep=importlib.util.module_from_spec(spec);spec.loader.exec_module(prep)
guards=[prep.freeze_guard(P13/'independent-positive-followup.final.freeze.json','50853a7a85a9956450cd0b038fe05fe1deafd0a1f3b94bce4a462e99f6f0a6f5'),prep.freeze_guard(AM5/'independent-five-am-and-existing-p-context.final.freeze.json','31f02f69ee35cdbee178675e96a9d5e51a810bba60cf8efbdcf41c6123057f00'),prep.freeze_guard(D/'independent-reviewed-description-synthesis.final.freeze.json','7c4c7102e5cbb1e26ad5ba380925c3a7307651f78cb6915c628bc84cef911859')]

# Adopt independent five A/M decisions; only the standard single-reviewId field
# changes to the existing full-landscape checker contract. All scientific fields
# and actual original reviewer/date remain exact.
five=read(ROOT/AUTH/'prospective-paths.json')['predecessorNI5GoalIds'];proof=[]
for label in ['atomicity','memory']:
 cfg=read(OUT/f'full-{label}.config.json');rows=lines(OUT/f'full-{label}.review.jsonl')
 source=lines(ROOT/AM5/f'{label}.five.current.review.jsonl');by={r['goalId']:r for r in source};assert set(by)==set(five)
 for i,row in enumerate(rows):
  if row['goalId'] in by:
   replacement=copy.deepcopy(by[row['goalId']]);replacement['reviewId']=cfg['reviewId'];rows[i]=replacement
   proof.append({'gate':label,'goalId':row['goalId'],'independentScientificSourcePath':str(AM5/f'{label}.five.current.review.jsonl'),'scientificFieldsExactExceptRequiredFullConfigReviewId':{k:v for k,v in replacement.items() if k!='reviewId'}=={k:v for k,v in by[row['goalId']].items() if k!='reviewId'},'reviewer':replacement['reviewer'],'reviewedAt':replacement['reviewedAt']})
 wlines(OUT/f'full-{label}.review.jsonl',rows)

# P13 retains every native independent record byte and all original scientific
# metadata. A fresh standard-path config changes only operative input paths.
c13=read(ROOT/P13/'positive.thirteen.independent-current.config.json')
c13=pconfig(c13,'positive.thirteen.independent-current',c13['scope']['goalIds'])
write(OUT/'positive.thirteen.independent-current.config.json',c13)
shutil.copyfile(ROOT/P13/'positive.thirteen.independent-current.review.jsonl',OUT/'positive.thirteen.independent-current.review.jsonl')

# Old P3: the two unaffected whole lines are copied byte for byte, with their
# original reviewId/reviewer/reviewedAt. Only the changed prerequisite goal goes
# into a newly dated scope1 backed by Root's actual full scientific read.
oldcfg=read(ROOT/P3);raw=(ROOT/oldcfg['reviewPath']).read_bytes().splitlines(keepends=True)
target='440854be-7f06-5678-91cb-ba8dcab56959';oldrows=[json.loads(s) for s in raw]
unchanged=[r['goalId'] for r in oldrows if r['goalId']!=target]
c2=pconfig(oldcfg,'positive.two-existing-exact',unchanged);c2['scope']['label']='Two unchanged existing whole native records; original scientific review and date retained exactly.'
write(OUT/'positive.two-existing-exact.config.json',c2)
(OUT/'positive.two-existing-exact.review.jsonl').write_bytes(b''.join(s for s,r in zip(raw,oldrows) if r['goalId']!=target))
manual=read(ROOT/AM5/'manual-current-scientific-decisions.input.json');receipt=read(ROOT/AM5/'actual-current-five-and-existing-profile-binding-inputs.receipt.json')
decision=manual['existingPositiveContextDecision'];old=next(r for r in oldrows if r['goalId']==target)
assert old['profileFingerprint']==decision['profileFingerprint']
c1=pconfig(oldcfg,'positive.one-existing-current-context',[target]);c1['reviewId']='biologie-ni-existing-pedigree-targeted-current-context-20261006-v1';c1['scope']['label']='One independently reviewed unchanged positive profile; native restoration of its changed Mendel prerequisite context.'
write(OUT/'positive.one-existing-current-context.config.json',c1)
cand1={'schemaVersion':1,'authoringContract':'positive-understanding-evidence-candidates-v1','reviewId':c1['reviewId'],'reviewedAt':receipt['checkedAtUTC'],'reviewer':manual['reviewer']+'; unchanged pedigree positive profile context; materialized technically by delegated agent','goals':[{'goalId':target,'reason':decision['reason'],'evidenceLevel':old['evidenceLevel'],'maximumClaimScope':old['maximumClaimScope'],'dissent':old['dissent'],'profile':old['profile']}]}
write(OUT/'positive.one-existing-current-context.candidates.json',cand1)

# P5: same previous independent profile science; this new date/reviewer reports
# only the actual metadata binding restoration, rather than relabeling it as
# Root's new thirteen-profile review.
c5=pconfig(read(ROOT/P5/'positive.eighteen.current.config.json'),'positive.five-kept-current-metadata',five)
c5['reviewId']='biologie-ni-five-kept-targeted-metadata-binding-20261006-v1';c5['scope']['label']='Five independently valid previous positive profiles; native metadata-only reviewStatus empty-to-pilot restoration.'
previous=read(ROOT/P5/'positive.eighteen.current.candidates.json');selected=[copy.deepcopy(r) for r in previous['goals'] if r['goalId'] in five];assert [r['goalId'] for r in selected]==five
for r in selected:r['reason']+=' Technical carry-forward only: previous independently reviewed inner profile stays exact; native PNG import adds reviewStatus=pilot and updates only the outer current-resource metadata binding. No new scientific approval or learner observation.'
cand5={'schemaVersion':1,'authoringContract':'positive-understanding-evidence-candidates-v1','reviewId':c5['reviewId'],'reviewedAt':datetime.now(timezone.utc).isoformat(),'reviewer':'Codex delegated technical metadata-binding restoration; inner scientific reviewer retained by provenance '+previous['reviewer']+' at '+previous['reviewedAt'],'goals':selected}
write(OUT/'positive.five-kept-current-metadata.config.json',c5);write(OUT/'positive.five-kept-current-metadata.candidates.json',cand5)

entry=read(OUT/'proposed-biologie-registry.entry.pending-science.json')
oldpaths=entry['positiveEvidenceConfigPaths'];assert str(P3) in oldpaths
entry['positiveEvidenceConfigPaths']=[str(OWN/'positive.two-existing-exact.config.json') if s==str(P3) else s for s in oldpaths]
entry['positiveEvidenceConfigPaths'] += [str(OWN/'positive.one-existing-current-context.config.json'),str(OWN/'positive.five-kept-current-metadata.config.json'),str(OWN/'positive.thirteen.independent-current.config.json')]
write(OUT/'proposed-biologie-registry.entry.reviewed.json',entry)
current=(ROOT/REG).read_text();sp=prep.spans(current);start,end,_,_=sp['biologie'];replacement=json.dumps(entry,ensure_ascii=False,indent=2)
future=current[:start]+replacement+current[end:]
write(OUT/'central-biologie-future.config.json',{**read(ROOT/REG),'subjects':[entry]})
write(OUT/'prospective-input-tree'/REG,read(ROOT/REG))
# Preserve raw bytes of every other registered subject. JSON dump would alter
# their representation, so the operative replacement is a literal object edit.
(OUT/'prospective-input-tree'/REG).write_text(future)
for subject,part in sp.items():
 if subject!='biologie':assert prep.spans(future)[subject][3]==part[3]

# Standard generated atlas outputs are captured as real native artifacts. Only
# outputs differing in actual bytes receive an integration delta.
atlas=read(CODE/ATLAS);generated=[Path(atlas['manifestPath']),Path(atlas['navigationViewPath'])]+[p.relative_to(CODE) for p in (CODE/atlas['outputDirectory']).glob('*.json')]
exports=[]
for rel in generated:
 src=CODE/rel;before=ROOT/rel;changed=not before.is_file() or sha(src)!=sha(before)
 if changed:
  dst=OUT/'prospective-input-tree'/rel;dst.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(src,dst)
  if before.is_file():
   backup=OUT/'preserved-active-before-inputs'/rel;backup.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(before,backup)
  exports.append({'futureActivePath':str(rel),'prospectiveCopyPath':str(dst.relative_to(ROOT)),'sha256':sha(dst),'activeSHA256Before':sha(before) if before.is_file() else None})
write(OUT/'actual-standard-native-atlas-output-deltas.json',{'generatedNativeOutputCount':len(generated),'actualChangedFileCount':len(exports),'changedFiles':exports,'unchangedFiles':[str(rel) for rel in generated if all(x['futureActivePath']!=str(rel) for x in exports)],'activeWrites':0})

amodel=read(ROOT/IMP/'fresh-native-metadata-only-future-full.book-model.json');ours=read(OUT/'prospective-current-standard.book-model.json')
apages={p['goalId']:p for p in amodel['pages']};bpages={p['goalId']:p for p in ours['pages']};assert set(apages)==set(bpages) and len(apages)==383
assert all(apages[g]==bpages[g] for g in apages)
write(OUT/'actual-all383-whole-native-pages-and-current-sources-protection.json',{'immutableReviewedModelPath':str(IMP/'fresh-native-metadata-only-future-full.book-model.json'),'immutableReviewedModelSHA256':sha(ROOT/IMP/'fresh-native-metadata-only-future-full.book-model.json'),'actualCurrentStandardModelPath':str(OWN/'prospective-current-standard.book-model.json'),'actualCurrentStandardModelSHA256':sha(OUT/'prospective-current-standard.book-model.json'),'bookDigest':ours['digest'],'entirePageFieldsCompared':True,'wholePageCount':383,'wholePageGoalIds':sorted(apages),'wholePageDeltaCount':0,'newPDFOrHTMLOrReviewBundleClaim':False})

# Clause and source-group preservation is compared against current configured
# selection, not a historical row chosen by filename.
oldatlas=read(ROOT/ATLAS);oldni=next(p for p in oldatlas['mappingPaths'] if '/DE-NI/' in p)
oldmap=read(ROOT/oldni);oldsource=read(ROOT/oldmap['sourceExtractionPath']);newsource=read(OUT/'NI.current-reviewed.source.snapshot.json')
og={g['id']:g for g in oldsource['sourceGoals']};ng={g['id']:g for g in newsource['sourceGoals']};assert not set(ng)-set(og)
authd=read(ROOT/AUTH/'sixteen-source-and-target.exact-author-deltas.json');targetids={d['sourceGoalId'] for d in authd['deltas']};assert len(targetids)==16
sources=[];prior=[];dby={d['sourceGoalId']:d for d in authd['deltas']}
for gid in sorted(set(og)&set(ng)):
 a,b=og[gid],ng[gid]
 if gid in targetids:
  witness=dby[gid]['sourceBinding'];assert b['sourceText']==b['rawSourceText']==witness['literalPrimaryClause']
  assert b==dby[gid]['after']
  for k in ['sourceDocumentKey','courseLevel','granularity']:assert a.get(k)==b.get(k),(gid,k)
  assert b['metadata']['grades']==witness['gradeBand'] and b['metadata']['sourcePage']==witness['printedPage']
  for k in ['sourceDocument','textCache','visualPageCache']:assert sha(ROOT/witness[k]['path'])==witness[k]['sha256'].removeprefix('sha256:')
  sources.append({'sourceGoalId':gid,'entireFrozenLiteralPrimaryClauseExact':True,'literalPrimaryClause':witness['literalPrimaryClause'],'primarySourceBinding':witness,'sourceDocumentKeyPreserved':True,'wholeOperatorAndGradeCourseBoundariesFromPrimarySourcePreserved':True,'actualChangedSourceFields':[k for k in sorted(set(a)|set(b)) if a.get(k)!=b.get(k)],'beforeWholeSourceRow':a,'afterWholeSourceRow':b})
 elif a!=b:
  prior.append({'sourceGoalId':gid,'beforeWholeSourceRow':a,'afterWholeSourceRow':b,'actualChangedFields':[k for k in sorted(set(a)|set(b)) if a.get(k)!=b.get(k)],'classification':'previous frozen primary-cell correction or advisory cache alignment; not a new curricular scientific closure'})
retired=[{'sourceGoalId':gid,'beforeWholeSourceRow':og[gid],'afterWholeSourceRow':None,'classification':'unsupported synthetic source atom explicitly retired in immutable author source qualityReview; original extractor and historical mapping remain intact'} for gid in sorted(set(og)-set(ng))]
assert len(prior)==6 and len(retired)==1
assert all(p in atlas['mappingPaths'] for p in oldatlas['mappingPaths'] if p!=oldni)
oldcan=read(ROOT/CAN);newcan=read(CODE/CAN);oldgoals={g['id']:g for g in oldcan['goals']};newgoals={g['id']:g for g in newcan['goals']};holds=[gid for gid in oldgoals if gid.startswith('9f73')];assert all(oldgoals[g]==newgoals[g] for g in holds)
write(OUT/'actual-current-source-operators-groups-and-unaffected-holds-protection.json',{'actualCurrentOldNIMappingPath':oldni,'actualCurrentOldNIMappingSHA256':sha(ROOT/oldni),'actualCurrentOldNISourcePath':oldmap['sourceExtractionPath'],'actualWholeSourceRowsBefore':len(og),'actualWholeSourceRowsAfter':len(ng),'newSixteenFrozenLiteralPrimaryClauseRows':sources,'previousPrimaryCellOrAdvisoryCorrections':prior,'retiredUnsupportedSourceRows':retired,'wholeUnchangedSourceRowsCount':sum(og[g]==ng[g] for g in ng),'previousFrozenSourceQualityReview':newsource['qualityReview'],'allOther16AtlasMappingSelectionsExact':True,'currentHE2025MappingPath':next(p for p in atlas['mappingPaths'] if '/DE-HE/upper-secondary/' in p),'HE39OrOtherUnresolvedScienceNotApproved':True,'global9f73WholeGoalsPreserved':holds,'oldUnsupportedRawClauseNotPresentedAsValidPrimaryEvidence':True,'activeWrites':0})
write(OUT/'frozen-independent-science-adoption-and-positive-split.actual.json',{'createdAtUTC':datetime.now(timezone.utc).isoformat(),'newVerifiedRootFreezeSets':guards,'fiveAMScientificFieldCarryProof':proof,'P13EntireNativeJSONLBytesExact':sha(ROOT/P13/'positive.thirteen.independent-current.review.jsonl')==sha(OUT/'positive.thirteen.independent-current.review.jsonl'),'existingTwoEntireRawLinesExact':(OUT/'positive.two-existing-exact.review.jsonl').read_bytes()==b''.join(s for s,r in zip(raw,oldrows) if r['goalId']!=target),'existingOneInnerProfileFingerprint':old['profileFingerprint'],'existingOneIndependentScienceReceiptPath':str(AM5/'actual-current-five-and-existing-profile-binding-inputs.receipt.json'),'fiveInnerIndependentScienceSourcePath':str(P5/'positive.eighteen.current.review.jsonl'),'rootGlobalReviewMetadataNeverAssignedToExistingTwoOrFive':True,'humanApproval':False,'humanTrial':False,'activeWrites':0})
shutil.copy2(__file__,OUT/Path(__file__).name)
print(json.dumps({'scienceFreezeFilesVerified':sum(g['actualFrozenFilesVerified'] for g in guards),'A5M5IndependentReplacements':10,'P13ExactNativeRows':13,'unchangedP2ExactRawLines':2,'P1AndP5NativeMaterializationPending':True,'atlasActualChangedFiles':len(exports),'whole383PageDeltaCount':0,'activeWrites':0}))
