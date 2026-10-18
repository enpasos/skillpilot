# SPDX-License-Identifier: Apache-2.0
"""Only three SL author goals, two actual literal endpoint witnesses and selected cell CAS."""
from pathlib import Path
import json,hashlib,re,subprocess,importlib.util
R=Path.cwd();O=Path(__file__).resolve().parent.parent;read=lambda p:json.loads(Path(p).read_text())
def digest(x):return hashlib.sha256(json.dumps(x,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode()).hexdigest()
def pin(p):
 p=Path(p);b=p.read_bytes();return {'path':p.resolve().relative_to(R).as_posix(),'sha256':hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def verify(p):assert pin(p['path'])==p,p

def norm(s):return re.sub(r'\s+',' ',re.sub(r'(?<=\w)-\s*\n\s*(?=\w)','',s)).strip()
whole=read(O/'INPUT.three-current-whole-C-P-and-two-whole-literal-endpoints.json');by={w['goalId']:w for w in whole};C={g['id']:g for g in read('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json')['goals']};subject=next(s for s in read('curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json')['subjects'] if s['subject']=='chemie');old=read(O.parent/'chemie-current450-fourteen-method-multistate-source-author-20261018-v1/INPUT.fourteen-whole-current-C-and-P.exact.json');old={w['goalId']:w for w in old};cp=[]
for w in whole:
 gid=w['goalId'];assert C[gid]==w['wholeGoal'];cfgpath=w['activeConfig']['path'];cfg=read(cfgpath);assert cfgpath in subject['positiveEvidenceConfigPaths'];assert gid in cfg['scope']['goalIds'] and cfg['reviewPath']==w['nativeReview']['path'];native=json.loads(Path(cfg['reviewPath']).read_text().splitlines()[w['nativeLine']-1]);assert native==w['wholeNativeRecord'];assert 'DE-SL' in C[gid]['applicability']['jurisdiction']
 if w['actualFullOwnReadingReusedFromMethod14']:assert C[gid]==old[gid]['wholeGoal'] and native['profile']==old[gid]['wholeNativeRecord']['profile']
 cp.append({'goalId':gid,'wholeGoalSha256':digest(C[gid]),'wholeProfileBodySha256':digest(native['profile']),'activeConfig':pin(cfgpath),'nativeReview':pin(cfg['reviewPath']),'lineOneBased':w['nativeLine'],'wholeEarlierOwnReadingReusedAfterExactEquality':w['actualFullOwnReadingReusedFromMethod14']})
assert len(cp)==5 and sum(w['actualFullOwnReadingReusedFromMethod14']for w in whole)==3
cells=read(O/'INPUT.six-whole-operative-SL-cells-and-actual-passages.json');assert len(cells)==6;literal=[]
for w in cells:
 verify(w['primaryPdf']);d=read(w['baseExtraction']['path']);g=next(x for x in d['sourceGoals']if x['id']==w['wholeSourceGoal']['id']);assert g==w['wholeSourceGoal'] and digest(g)==w['wholeSourceGoalSha256'];assert next(x for x in d['passages']if x['id']==g['passageId'])==w['wholeCurrentPassage'];s=subprocess.check_output(['pdftotext','-layout','-f',str(w['physicalPdfPage']),'-l',str(w['physicalPdfPage']),w['primaryPdf']['path'],'-']).decode();literalText=s
 if norm(g['sourceText'])not in norm(literalText):
  assert w['key']=='GREEN_ONLY'
  literalText=subprocess.check_output(['pdftotext','-layout','-f',str(w['physicalPdfPage']),'-l',str(w['physicalPdfPage']),'-x','0','-y','0','-W','420','-H','600',w['primaryPdf']['path'],'-']).decode()
 assert norm(g['sourceText'])in norm(literalText),g['id']
 literal.append({'key':w['key'],'sourceGoalId':g['id'],'wholeSourceObjectMatchesActual':True,'entireOperatorLiteralPrimaryMatch':True,'physicalPage':w['physicalPdfPage'],'wholeSourceGoalSha256':digest(g)})
m=read(O/'CANDIDATE.three-direct-partial-contributions.INACTIVE.json')['mappings'];assert len(m)==3 and len({(x['legacyGoalId'],x['canonicalGoalId'])for x in m})==3
for x in m:
 w=by[x['canonicalGoalId']];assert x['matchType']=='partial' and not x['wholeSourceCredit'] and not x['actualLearnerExecutionClaim'];assert digest(w['wholeGoal'])==x['currentGoalSha256'] and digest(w['wholeNativeRecord']['profile'])==x['currentProfileBodySha256']
deltas=[]
for p in sorted((O/'candidate/mapping-cell-appends').glob('*.json')):
 d=read(p);current=read(d['mappingPath']);assert not d['wholeFileReplacement'];assert not d['wholeSourceCredit']
 for x in d['cellAppends']:
  pair=x['pairAbsentExpectedBefore'];assert not any(z.get('legacyGoalId')==pair['legacyGoalId'] and z.get('canonicalGoalId')==pair['canonicalGoalId']for z in current['mappings'])
  for cas in x['existingAuthoritativeSourceDecisionsCAS']:
   j=int(cas['jsonPointer'].split('/')[-1]);assert current['decisions'][j]==cas['wholeDecision'] and digest(cas['wholeDecision'])==cas['sha256']
 deltas.append({'candidate':pin(p),'actualAlias':pin(d['mappingPath']),'newTupleCount':len(d['cellAppends']),'wholeDecisionCellsCAS':sum(len(x['existingAuthoritativeSourceDecisionsCAS'])for x in d['cellAppends'])})
assert len(deltas)==4 and sum(x['newTupleCount']for x in deltas)==6
acq=read(O/'CANDIDATE.one-source-conditional-literal-acquisition.INACTIVE.json')['entries'];assert len(acq)==1;a=acq[0];e=a['proposedStockEntry'];assert e['goalId'] in C[e['requiredByGoalId']]['requires'];assert not C[e['requiredByGoalId']].get('examData') and not C[e['requiredByGoalId']].get('contains');assert a['sourceBackedEndpointCurrentlyDirectlyMapped'] is False and a['registryCellExpectedBefore'] is None;assert len(a['proposedEndpointSourceBindings'])==2
reg=read(a['registryPath']);assert not any(x.get('goalId')==e['goalId'] and x.get('jurisdiction')=='DE-SL'for x in reg.get('entries',[]));assert all(not x['directCurrentMatches']for x in read(O/'FACTS.current-endpoint-direct-source-absence-not-cluster-proof.json'))
mat=read(O/'MATRIX.three-SL-method-HOLD-successor-author.json');assert len(mat['rows'])==3;assert sum(x['authorDisposition'].startswith('HOLD')for x in mat['rows'])==1;assert all(x['oldOwnHistoricalHOLDUnchanged']['decision']=='HOLD'for x in mat['rows']);assert mat['counts']['newSourceCells']==0 and mat['counts']['PChanges']==0 and mat['counts']['newCurrentGateClosures']==0
before=read(O/'INPUT.before-pins.for-finite-author-scope.json')
for k in ('historicalOwnAuthorSeal','historicalOwnReadReceipt'):verify(before[k])
for k in ('sourceExtractions','mappingAliases','views'):
 for p in before[k]:verify(p)
assert read(O/'CHECK.actual-current-three-goals-two-endpoints-two-SL-views.json')['status']=='PASS'
spec=importlib.util.spec_from_file_location('validate_schemas',R/'scripts/validate_schemas.py');mod=importlib.util.module_from_spec(spec);spec.loader.exec_module(mod);allErrors=mod.curriculum_symlink_errors(R);own=[x for x in allErrors if O.relative_to(R).as_posix()in x];assert not own
for p in O.rglob('*.json'):json.loads(p.read_text())
print(json.dumps({'status':'PASS','scope':'Only three SL author goals and two literal endpoint witnesses; no independent review or normal activation','fiveWholeCurrentCAndNativeP':cp,'threeEarlierOwnWholeCAndPReadingsReusedExactly':True,'sixWholeSourceCellsAndWholeCurrentPassages':literal,'directPartialSourceContributionsProposed':3,'mappingCellDeltas':deltas,'literalAcquisitionEntry':'One actual direct366→requiredBy3c9 relationship; inactive conditional on new endpoint source acceptance, current direct endpoint mapping absent','threeScopedSLAcquisitionRegistryEntriesCurrentlyPresent':0,'explicitWholeSourceGapsRetained':['135 no final solution volume, no whole defined mass concentration','3c9 no explicit current ban judgment or current law proof','805 no actual SL collection-route source/operator or ordinary SL literal endpoint'],'historicalThreeHoldsUnchanged':True,'newSourceCells':0,'POrMaterialOrDAGOrViewChanges':0,'normalWrites':0,'newCurrentGateClosures':0,'newDPAMVVotes':0,'APCompilerBuildOrWholeRuns':0,'actualStockGlobalSymlinkErrors':len(allErrors),'ownScopedSymlinkErrors':own},ensure_ascii=False,indent=2))
