# SPDX-License-Identifier: Apache-2.0
"""Exact original20 input inventory; no review/schema/runtime changes."""
import hashlib,json,subprocess
from pathlib import Path
ROOT=Path.cwd();OWN=Path(__file__).resolve().parents[1];REL=OWN.relative_to(ROOT).as_posix()
assert not (OWN/'FILES.finite-author.seal.json').exists()
E='curricula/DE/Gymnasium/quality/goal-evidence/'
BASE=E+'2026-10-15/chemie-lab2-current422-paired-and-inactive-integration-technical-20261015-v1'
CLAIM=E+'2026-10-12/chemie-current402-all182-open-claims-root-20261012-v2/claims/energy-detergents-20.current402.claim.config.json'
def read(p):return json.loads((ROOT/p).read_text())
def bind(p):
 b=(ROOT/p).read_bytes();return {'path':p,'sha256':'sha256:'+hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def write(p,d):
 q=OWN/p;q.parent.mkdir(parents=True,exist_ok=True);q.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n')
claim=read(CLAIM);ids=claim['goalIds'];scope=set(ids);sel=read(BASE+'/INPUTS.final-current422-LAB2-carbonyl3.physical-exact-selector.json');can=read(sel['wholeCanonical']['path']);G={g['id']:g for g in can['goals']}
parents={i:[] for i in G};reverse={i:[] for i in G}
for g in G.values():
 for c in g.get('contains',[]):parents[c].append(g['id'])
 for c in g.get('requires',[]):reverse[c].append(g['id'])
closure=set();todo=list(ids)
while todo:
 i=todo.pop()
 if i in closure:continue
 closure.add(i);todo+=G[i].get('requires',[])
neighbors=set()
for i in ids:
 neighbors.update(parents[i]);neighbors.update(reverse[i])
 for p in parents[i]:neighbors.update(G[p].get('contains',[]))
write('inputs/twenty-whole-current-goals.exact.json',{'wholeCanonical':sel['wholeCanonical'],'claim':bind(CLAIM),'goals':[G[i] for i in ids]})
write('inputs/all-transitive-prerequisites-and-full-neighbors.exact.json',{'role':'Whole actual objects, not abbreviated prerequisite labels','transitivePrerequisites':[G[i] for i in sorted(closure-scope)],'wholeRelevantNeighbors':[G[i] for i in sorted(neighbors-scope)],'directRelations':[{'goalId':i,'parents':parents[i],'requires':G[i].get('requires',[]),'reverseRequires':reverse[i]} for i in ids]})
cfg=read(sel['centralConfig']['path'])['subjects'][0];selected={k:[] for k in ['D','P','A','M','V']}
for label,key in [('P','positiveEvidenceConfigPaths'),('A','semanticAtomicityConfigPaths')]:
 for p in cfg[key]:
  c=read(p)
  for l in (ROOT/c['reviewPath']).read_bytes().splitlines(keepends=True):
   r=json.loads(l)
   if r['goalId'] in scope:selected[label].append({'config':bind(p),'source':bind(c['reviewPath']),'rowSha256':'sha256:'+hashlib.sha256(l).hexdigest(),'wholeRow':r})
for p in cfg['resolutionIndexPaths']:
 for r in read(p)['resolutions']:
  if r['goalId'] in scope:selected['D'].append({'index':bind(p),'wholeEntry':r})
mc=read(cfg['memoryReviewConfigPath'])
for l in (ROOT/mc['reviewPath']).read_bytes().splitlines(keepends=True):
 r=json.loads(l)
 if r['goalId'] in scope:selected['M'].append({'source':bind(mc['reviewPath']),'rowSha256':'sha256:'+hashlib.sha256(l).hexdigest(),'wholeRow':r})
qa=read(sel['normalQA438']['path'])
assetmap={r['goalId']:r for r in read(sel['physicalMap']['path'])['selectedCurrentAssetRows']}
for r in qa['records']:
 if r['goalId'] in scope:selected['V'].append({'source':sel['normalQA438'],'wholeRow':r,'currentPhysicalAsset':assetmap.get(r['goalId']),'policy':'KEEP existing actual hash-bound good image; author makes no new V judgement. Missing primary links remain a separate open image hold; no generation authorized here.'})
write('inventory/current321-selected-science-M20-V20.exact.json',{'role':'Actual current selection inventory, zero new votes','counts':{k:len(v) for k,v in selected.items()},'selected':selected})
older=[]
for date in ['2026-10-04','2026-10-05']:
 for p in sorted((ROOT/E/date).glob('chemie-energy*')):
  rows=[];sourcefiles=[]
  for q in p.iterdir():
   if q.is_file() and q.suffix in ['.jsonl','.md','.json','.snapshot']:
    sourcefiles.append(bind(q.relative_to(ROOT).as_posix()))
    if q.suffix=='.jsonl':
     for l in q.read_text().splitlines():
      if l:
       r=json.loads(l);rows.append({'goalId':r.get('goalId'),'exactClaim20Overlap':r.get('goalId') in scope,'status':r.get('status',r.get('decision'))})
  older.append({'root':p.relative_to(ROOT).as_posix(),'sourceFiles':sourcefiles,'reviewRows':rows,'exactClaim20OverlapIds':sorted({r['goalId'] for r in rows if r['exactClaim20Overlap']})})
write('inventory/older-energy13-four-eight.exact-ID-boundaries.json',{'role':'Historical review reuse boundary, no review restart','olderPackets':older,'allExactClaim20ReviewRowIntersectionsEmpty':all(not r['exactClaim20OverlapIds'] for r in older),'usefulNeighborEvidence':'Older fuel-cell b759 and thermodynamics4928 etc remain exact historical/current prerequisite science; they cannot be relabelled as decisions for these20 different IDs.'})
# Current declared source input set; direct matches only, full partner unions/passages retained.
atlasPath='app/scripts/config/goal-books/de-gym-chemistry-national-atlas.inputs.json';atlas=read(atlasPath);source=[]
for p in atlas['mappingPaths']:
 d=read(p);hit=[r for r in d.get('mappings',[]) if r.get('canonicalGoalId') in scope]
 if not hit:continue
 extraction=d.get('sourceExtractionPath');x=read(extraction) if extraction else {};sourceIds={r['legacyGoalId'] for r in hit};allrows=d.get('mappings',[])
 sg={r.get('id',r.get('goalId')):r for r in x.get('sourceGoals',[])}
 cells=[]
 for i in sorted(sourceIds):
  goal=sg.get(i);partners=[r for r in allrows if r.get('legacyGoalId')==i];decisions=[r for r in d.get('decisions',[]) if r.get('sourceGoalId',r.get('legacyGoalId',r.get('id')))==i]
  refs=set()
  if goal:
   for k in ['passageId','sourcePassageId']:
    if goal.get(k):refs.add(goal[k])
  passages=[r for r in x.get('passages',[]) if r.get('id',r.get('passageId')) in refs or (goal and r.get('topicCode')==goal.get('topicCode'))]
  cells.append({'sourceGoalId':i,'wholeSourceCell':goal,'wholePartnerUnionMappings':partners,'wholePartnerGoalBodies':[G[r['canonicalGoalId']] for r in partners if r['canonicalGoalId'] in G],'wholeExistingSourceDecisions':decisions,'wholeRelevantPassages':passages})
 source.append({'mapping':bind(p),'extraction':bind(extraction) if extraction else None,'sourceDocument':x.get('sourceDocument'),'jurisdiction':x.get('jurisdiction'),'wholeExactDirectCellsAndPartnerUnions':cells})
write('sources/all-direct-current-source-cells-partner-unions-whole-passages.json',{'atlasInput':bind(atlasPath),'role':'Declared current source mappings are evidence to read, not fresh source approval or nationwide scope inference. Partial/needs-canonical/selection holds retained.','sources':source})
# Finite recent artifact discovery: genuine explicit claim/scope/record references, excluding whole graph dumps and historical checkpoint copies.
pattern='|'.join(ids);argv=['rg','-l','--glob','*.jsonl','--glob','*README*.md','--glob','*RESUME*.md','--glob','*HOLD*.json','--glob','*NEUTRAL*.json','--glob','!**/chemie-working-state*/**','--glob','!**/frozen-inputs/**','--glob','!**/native-capsule/**',pattern,*[E+d for d in ['2026-10-12','2026-10-13','2026-10-14','2026-10-15']]]
run=subprocess.run(argv,capture_output=True,text=True);assert run.returncode in [0,1];found=sorted({p for p in run.stdout.splitlines() if not p.startswith(REL+'/')})
write('inventory/recent-E12-E15-explicit-ID-artifact-locators.json',{'role':'Finite exact-ID discovery inventory, locator only; matching an ID does not make a vote current','argv':argv,'exitCode':run.returncode,'files':[bind(p) for p in found]})
write('INPUTS.exact-original20-and-current321.author.json',{'role':'Bounded informed author input, zero new scientific approvals','claim':bind(CLAIM),'current321Neutral':bind(BASE+'/NEUTRAL.final-current422-LAB2-carbonyl3-inactive.json'),'wholeCanonical':sel['wholeCanonical'],'semanticCompanion':sel['semanticCompanion'],'QA':sel['normalQA438'],'goalIds':ids,'wholeGoals':554,'curricularAtomic':422,'lastMeasuredStrict':321,'activeChemistry':'M6 231/402 unchanged','newVotes':0,'M7':False})
print(json.dumps({'goals':len(ids),'transitivePrerequisiteObjects':len(closure-scope),'wholeNeighborObjects':len(neighbors-scope),'currentGateSelected':{k:len(v) for k,v in selected.items()},'olderPackets':len(older),'directSourceLanes':len(source),'directCells':sum(len(r['wholeExactDirectCellsAndPartnerUnions']) for r in source),'recentArtifacts':len(found),'missingImages':[r['wholeRow']['goalId'] for r in selected['V'] if not r['wholeRow']['assetSha256']]}))
