# SPDX-License-Identifier: Apache-2.0
"""Guarded integration of actual independent Chemistry2 reviews; no new review."""
import copy,hashlib,json,shutil
from datetime import datetime,timezone
from pathlib import Path
ROOT=Path.cwd();OWN=Path(__file__).resolve().parent;BASE=OWN.parent;TECH=BASE/'chemie-q3-two-reviewed-integration-preparation-technical-20261008-v1'
def read(p):return json.loads(Path(p).read_text())
def sha(p):return hashlib.sha256(Path(p).read_bytes()).hexdigest()
def bind(p):p=Path(p);return dict(path=str(p.relative_to(ROOT)),sha256=sha(p),bytes=p.stat().st_size)
def write(p,x):
 p=Path(p);p.parent.mkdir(parents=True,exist_ok=True);assert not p.exists(),p
 p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n')
def verify(b):
 path=ROOT/b['path'];assert sha(path)==b['sha256'].removeprefix('sha256:'),(path,'digest');assert path.stat().st_size==b['bytes'],path
 return path
readySeal=TECH/'two-genuine-reviewed-root-integration-ready.technical.freeze.json'
assert sha(readySeal)=='5d222940f1469d272a677ad48923575b23d1b9a0cf5e53177f7e13f301990dfd'
ready=read(readySeal)
for b in ready.get('files',ready.get('ownFiles',[])):verify(b)
G=read(TECH/'current-two-protected-baseline-and-original-pair.technical.guard.json');AD=read(TECH/'checks/genuine-A2-P2-QA2-and-whole-current-native-adoption.actual.json')
for x in G['before'].values():verify(x['active']);verify(x['snapshot'])
for side in G['originalGenuinePair'].values():
 verify(side['seal'])
 for b in side['verifiedOriginalFiles']:verify(b)
# Exact science/source/native judgments and controlled whole-page integration,
# not digest-only scientific review. All of these actual guards are required.
for k in ['other479BeforeWholeCanonicalGoalsExact','other377BeforeCurrentWholePageObjectsExact','actualAll378CompiledPageObjectsExactToReviewedFrame','originalProfilesAndAllFourCasesExact','other377WholeRawQARecordsExact','other376CurrentAtomicQARecordsExact','retainedExtraNonCurricularQARowExact','all379RawHumanFieldsExact','all378CurrentAtomicHumanFieldsExact','all378MemoryRecordsCardsAndSevenActualViewsExact','sourceAll1602_929_5459AndSelectedFiveThreePartnersExact','allOther18HoldsRetained']:assert AD[k] is True,k
assert AD['actualP2ClosedSchemaNativeSemanticErrors']==0 and AD['actualFutureP2ConfigClosedSchemaErrors']==0
assert AD['genuineWholeAtomicityA2Rows']==2 and AD['existing201ARecordsNotTouched'] is True
assert AD['reviewRunIdsEmptyAndDRunNotPManifest'] is True
for label in ['A2-genuine-reviewed-adoption','M378-seven-current-real-scopes-retained','D2-native-round-a','D2-native-round-b']:
 r=read(TECH/'checks'/f'{label}.terminal.actual.json');assert r['actualExitCode']==0,(label,r)
oldcanon=read(verify(G['before']['canonical']['active']));oldqa=read(verify(G['before']['qa']['active']));oldregistry=read(verify(G['before']['registry']['active']))
canonPath=TECH/'candidate/canonical.current480.reviewed-corrosion-two.future-active.json';qaPath=TECH/'candidate/visualization-qa.current378.paired-two.future-active.json';newcanon=read(canonPath);newqa=read(qaPath)
ids=G['goalIds'];assert len(ids)==2;target=ids[1];assert target=='c95f6059-d7c2-5bcd-b61e-95e3577efdb2';beforegoals={g['id']:g for g in oldcanon['goals']};aftergoals={g['id']:g for g in newcanon['goals']};assert set(beforegoals)==set(aftergoals) and len(aftergoals)==480
for gid,goal in aftergoals.items():
 if gid!=target:assert goal==beforegoals[gid]
 else:assert {k:v for k,v in goal.items() if k!='resourceLinks'}=={k:v for k,v in beforegoals[gid].items() if k!='resourceLinks'}
assert len(newqa['records'])==len(oldqa['records'])==379
oldrows={r['goalId']:r for r in oldqa['records']}
for r in newqa['records']:
 old=oldrows[r['goalId']]
 if r['goalId'] not in ids:assert r==old
 assert {k:v for k,v in r.items() if k.startswith('human')}=={k:v for k,v in old.items() if k.startswith('human')}
selected=read(ROOT/'curricula/DE/Gymnasium/quality/goal-visualization-review/chemie-q3-corrosion-one-typo-correction-author-root-20261008-v1/selected-one-corrosion-typo.author.json')
for k in ['png','prompt','provenance']:verify(selected[k])
assert selected['png']['sha256']=='c2b9f04acd7d2f3fe8bfa2cde3d152e16803c364ba6d420e0d9b386ca090f35b'
roots=[ROOT/'curricula/DE/Gymnasium/visualizations',ROOT/'app/public/assets/goal-visualizations',ROOT/'backend/src/main/resources/static/assets/goal-visualizations']
oldrel=f'chemie/{target}/{target}.jpg';newrel=f'chemie/{target}/{target}.png';oldsha='3d26d07d4c811667b3b5d619c14771172d811bb184ae4ea17b596ec96bb8a221'
for r in roots:assert sha(r/oldrel)==oldsha and not (r/newrel).exists()
goodid=ids[0];goodsha='a8b823f1c3d3406888bf7aea217339ca984e42c5c8e7cee8e1e8113f105c5c67'
for r in roots:assert sha(r/f'chemie/{goodid}/{goodid}.jpg')==goodsha
histpath=ROOT/'scripts/config/historical-goal-visualization-assets.json';oldhist=read(histpath);assert not any(r['path']==oldrel for r in oldhist['assets']);hist=copy.deepcopy(oldhist)
hist['assets'].append(dict(path=oldrel,sha256=oldsha,supersededBy=newrel,reason='Former exact JPEG retained after a genuine independently confirmed German caption defect and independently reviewed minimal PNG correction. Historical retention does not approve the old faulty caption.',reviewEvidencePath=str((TECH/'checks/genuine-A2-P2-QA2-and-whole-current-native-adoption.actual.json').relative_to(ROOT))))
registry=copy.deepcopy(oldregistry);s=next(s for s in registry['subjects'] if s['subject']=='chemie');index=str((TECH/'native-d-two-current/resolution-index.json').relative_to(ROOT));pcfg=str((TECH/'positive/current-two.future-active.config.json').relative_to(ROOT));acfg=str((TECH/'atomicity/current-two.future-active.config.json').relative_to(ROOT))
for key,value in [('resolutionIndexPaths',index),('positiveEvidenceConfigPaths',pcfg),('semanticAtomicityConfigPaths',acfg)]:assert value not in s[key];s[key].append(value)
for bs,cs in zip(oldregistry['subjects'],registry['subjects']):
 if bs['subject']!='chemie':assert bs==cs
for key in s:
 if key not in ['resolutionIndexPaths','positiveEvidenceConfigPaths','semanticAtomicityConfigPaths']:assert s[key]==next(o for o in oldregistry['subjects'] if o['subject']=='chemie')[key]
# Protect unchanged floors, other disciplines, source semantics, ledger and assets.
protected=[ROOT/'app/scripts/config/curriculum-maturity-floor-policy.json',ROOT/'curricula/DE/Gymnasium/quality/goal-description-review/in-flight-work-ledger.json',ROOT/'curricula/DE/Gymnasium/quality/goal-book-publication/chemie.semantic-kinds.json',ROOT/'app/scripts/config/goal-books/de-gym-chemistry-national-atlas.inputs.json',ROOT/'app/scripts/config/goal-books/de-gym-chemistry-national-atlas.json']
for sub in ['BIOLOGIE','MATHEMATIK','PHYSIK']:protected.append(ROOT/f'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_{sub}.de.json')
for sub in ['biologie','mathematik','physik']:protected.append(ROOT/f'curricula/DE/Gymnasium/quality/goal-visualization-qa/{sub}.qa.json')
protection=[bind(p) for p in protected]
for name,b in G['before'].items():
 p=verify(b['active']);dest=OWN/'before'/f'{name}.exact.json';dest.parent.mkdir(exist_ok=True);assert not dest.exists();shutil.copyfile(p,dest)
shutil.copyfile(histpath,OWN/'before/historical-assets.exact.json')
prompt=roots[0]/f'chemie/{target}/prompt.de.md';assert prompt.is_file();shutil.copyfile(prompt,OWN/'before/original16-JPEG-prompt.exact.md')
write(OWN/'reviewed-two-pre-apply-guard.actual.json',dict(schemaVersion=1,actualTechnicalGuard=bind(TECH/'current-two-protected-baseline-and-original-pair.technical.guard.json'),actualPairedAdoption=bind(TECH/'checks/genuine-A2-P2-QA2-and-whole-current-native-adoption.actual.json'),actualSourcePair=G['originalGenuinePair'],protectedFiles=protection,candidateCanonical=bind(canonPath),candidateQA=bind(qaPath),actualCorrectedSource=selected,historicalOldJPEG=oldrel,historicalOldJPEGExactSha256=oldsha,unchangedGood15JPEG=goodid,newScientificApprovalByIntegrator=False,activeWritesBeforeGuard=0,humanApproval=False,humanTrial=False))
# All dependent writes happen only after every guard has passed.
for r in roots:shutil.copyfile(verify(selected['png']),r/newrel)
shutil.copyfile(verify(selected['prompt']),prompt);shutil.copyfile(verify(selected['provenance']),roots[0]/f'chemie/{target}/provenance.json')
shutil.copyfile(canonPath,verify(G['before']['canonical']['active']));shutil.copyfile(qaPath,verify(G['before']['qa']['active']))
histpath.write_text(json.dumps(hist,ensure_ascii=False,indent=2)+'\n');verify(G['before']['registry']['active']).write_text(json.dumps(registry,ensure_ascii=False,indent=2)+'\n')
for b in protection:verify(b)
for r in roots:assert sha(r/oldrel)==oldsha and sha(r/newrel)==selected['png']['sha256'] and sha(r/f'chemie/{goodid}/{goodid}.jpg')==goodsha
write(OWN/'genuine-two-applied-central-pending.actual.json',dict(schemaVersion=1,appliedAt=datetime.now(timezone.utc).isoformat(),goalIds=ids,actualAssets=[bind(r/newrel) for r in roots],historicalOldJPEGAllThreeRootsExact=True,good15JPEGAllThreeRootsExact=True,originalPromptBeforeCorrection=bind(OWN/'before/original16-JPEG-prompt.exact.md'),activeRegistry=bind(ROOT/G['before']['registry']['active']['path']),activeCanonical=bind(ROOT/G['before']['canonical']['active']['path']),activeQA=bind(ROOT/G['before']['qa']['active']['path']),newA2SeparateGenuineReviews=True,prior201ADecisionsExact=True,allOther18SourceHoldsRetained=True,affectedChecks='pending',centralCurrentReport='pending',strictGainClaimed=0,humanApproval=False,humanTrial=False))
print(json.dumps(dict(guardedApply='PASS',actualNewPNGAllThreeRoots=3,goodOldJPEG15='KEEP_exact',historicalOldJPEG16='retained_exact_all3',central='pending',strictGain=0)))
