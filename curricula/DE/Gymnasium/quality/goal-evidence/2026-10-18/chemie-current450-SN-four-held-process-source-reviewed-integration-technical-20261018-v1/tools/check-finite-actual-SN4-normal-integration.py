# SPDX-License-Identifier: Apache-2.0
"""Check exact bounded SN4 post-integration data, retained whole objects and active C/P."""
from pathlib import Path
import hashlib,json,importlib.util
R=Path.cwd();O=Path(__file__).resolve().parent.parent;V=O.parent/'chemie-current450-SN-four-held-process-source-informed-independent-a-20261018-v1';A=O.parent/'chemie-current450-SN-four-held-process-source-author-successor-20261018-v1';read=lambda p:json.loads(Path(p).read_text())
def digest(x):return hashlib.sha256(json.dumps(x,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode()).hexdigest()
def pin(p):
 p=Path(p);b=p.read_bytes();return {'path':p.resolve().relative_to(R).as_posix(),'sha256':hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def verify(p):assert pin(p['path'])==p,p
b=read(O/'BEFORE.selected-SN-source-alias-CAS-and-old-object-fingerprints.json')
for p in (b['foreignAuthorSeal'],b['independentSeal']):
 verify(p)
 for f in read(p['path'])['files']:verify(f)
for p in b['protectedExactPins']:verify(p)
for p,arrays in b['beforeArrays'].items():
 d=read(p)
 for k,item in arrays.items():assert [digest(x) for x in d[k][:item['count']]]==item['orderedWholeObjectsSha256'],(p,k)
a=read(A/'candidate/SN.six-complete-general-competence-cells.additions.INACTIVE.json');d=read(a['baseExtraction']['path']);assert len(d['sourceGoals'])==183 and len(d['passages'])==34
for k,add in [('sourceGoals',a['sourceGoalsToAppend']),('passages',a['passagesToAppend'])]:
 for x in add:assert next(y for y in d[k] if y['id']==x['id'])==x
assert len({s['id'] for s in d['sourceGoals']})==183;assert all(x['passageId'] in {p['id'] for p in d['passages']} for x in a['sourceGoalsToAppend']);m3=next(s for s in d['pipelineStatus']['steps'] if s['id']=='MAPPING-3');assert m3['status']=='incomplete';assert all(c['passed'] is False for c in m3['checks'] if c['id'] in ('m3-all-source-goals-reviewed','m3-all-source-goals-covered-by-canonical'));assert d['pipelineStatus']['selectedProcessIntegration']['wholeSourceCoverageComplete'] is False
accepted=read(b['accepted']['path'])['mappings'];aliases=[]
for p in b['normalFilesToChange']:
 if '/mapping/' not in p['path']:continue
 x=read(p['path']);tuples=[(m['legacyGoalId'],m['canonicalGoalId'],m['matchType']) for m in x['mappings']];assert len(tuples)==858
 for m in accepted:assert tuples.count((m['legacyGoalId'],m['canonicalGoalId'],'partial'))==1
 if 'decisions' in x:
  assert len(x['decisions'])==183
  for c in x['decisions'][177:]:
   assert c['wholeSourceCredit'] is False and c['matchType']=='partial'
   for r in c['additionalAcceptedPartialContributions']:assert r['wholeSourceCredit'] is False and r['actualLearnerExecutionClaim'] is False
 aliases.append(pin(p['path']))
C={g['id']:g for g in read('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json')['goals']};subject=next(s for s in read('curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json')['subjects'] if s['subject']=='chemie');cp=[]
for w in read(A/'INPUT.four-whole-actual-current-C-and-native-P.json'):
 gid=w['goalId'];assert C[gid]==w['wholeCurrentGoal'];assert w['currentConfigPath'] in subject['positiveEvidenceConfigPaths'];cfg=read(w['currentConfigPath']);assert gid in cfg['scope']['goalIds'] and cfg['reviewPath']==w['reviewPath'];r=json.loads(Path(w['reviewPath']).read_text().splitlines()[w['lineOneBased']-1]);assert r==w['wholeCurrentNativeRecord'];cp.append({'goalId':gid,'wholeGoalSha256':digest(C[gid]),'wholeProfileSha256':digest(r['profile']),'sameWholeCurrentCAndNativeP':True})
spec=importlib.util.spec_from_file_location('validate_schemas',R/'scripts/validate_schemas.py');mod=importlib.util.module_from_spec(spec);spec.loader.exec_module(mod);errors=mod.curriculum_symlink_errors(R);own=[e for e in errors if O.relative_to(R).as_posix() in e];assert not own
for p in O.rglob('*.json'):json.loads(p.read_text())
print(json.dumps({'status':'PASS','scope':'Only actual selected SN4 post-integration data; no fixtures/global evaluation','wholeOldLowerSourceObjectsRetained':177,'wholeOldLowerPassagesRetained':29,'wholeNewGeneralSourceObjects':6,'newWholeSelectedPassages':5,'sevenPartialTuplesExactlyOncePerLowerAlias':True,'old851MappingsPerAliasAnd177ReviewDecisionsRetained':True,'source60ExistingSNWholeCellsAndTwoPartialRelationsRetained':True,'upper302AndUpperAliasesViewsHistoricalHoldsProtectedExact':True,'fourExactCurrentCAndP':cp,'actualAfterPins':[pin(a['baseExtraction']['path']),*aliases],'wholeSourceM3':'incomplete; whole coverage checks remain false','actualGlobalStockSymlinkErrorCount':len(errors),'ownScopedStockSymlinkErrors':own,'normalFilesModifiedByIntegration':3,'newScientificVotesByTechnicalStep':0,'newDPAMVVotes':0,'APCompilerBuildOrGlobalRuns':0},ensure_ascii=False,indent=2))
