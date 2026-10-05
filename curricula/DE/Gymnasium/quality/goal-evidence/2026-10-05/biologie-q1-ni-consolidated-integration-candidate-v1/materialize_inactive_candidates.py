#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""Materialize selected inactive candidates inside this package only. Never edits live files."""
import argparse,copy,hashlib,json,pathlib,re
HERE=pathlib.Path(__file__).resolve().parent
ROOT=next(p for p in HERE.parents if (p/'AGENTS.md').is_file() and (p/'app/package.json').is_file())
def read(path):return json.loads(pathlib.Path(path).read_text())
def sha(path):return 'sha256:'+hashlib.sha256(pathlib.Path(path).read_bytes()).hexdigest()
def objsha(value):return 'sha256:'+hashlib.sha256(json.dumps(value,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode()).hexdigest()
def rel(path):return str(path.relative_to(ROOT))
def guarded(binding):
 p=ROOT/binding['path'];assert sha(p)==binding['sha256'],'Changed input: '+str(p);return read(p)
def walk(nodes):
 for n in nodes:
  yield n
  yield from walk(n.get('children',[]))
def check_dag(goals,edge):
 by={g['id']:g for g in goals};visiting=set();done=set()
 def visit(gid):
  assert gid in by,'Unknown '+edge+' target '+gid
  assert gid not in visiting,'Cycle '+edge+' at '+gid
  if gid in done:return
  visiting.add(gid)
  for nxt in by[gid].get(edge,[]):visit(nxt)
  visiting.remove(gid);done.add(gid)
 for gid in by:visit(gid)
def main():
 a=argparse.ArgumentParser(description=__doc__);a.add_argument('--units',required=True,help='comma-separated unitId values, or all');a.add_argument('--output-name',required=True);a.add_argument('--include-held',action='store_true');args=a.parse_args()
 assert re.fullmatch(r'[a-z0-9][a-z0-9-]{0,79}',args.output_name),'Output name must be a simple slug'
 delta=read(HERE/'canonical.integration.delta.candidates.json');units=delta['units'];wanted={u['unitId'] for u in units} if args.units=='all' else set(args.units.split(','));assert wanted and wanted<={u['unitId'] for u in units},'Unknown unit'
 selected=[u for u in units if u['unitId'] in wanted];held=[u['unitId'] for u in selected if u['integrationPreparationStatus'].startswith('HOLD')];assert not held or args.include_held,'Held units require explicit --include-held: '+str(held)
 out=HERE/'staged'/args.output_name;assert not out.exists(),'Never overwrite an existing staged candidate';out.mkdir(parents=True)
 written=[]
 def write(name,data):
  p=out/name;assert not p.exists();p.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n');written.append({'path':rel(p),'sha256':sha(p)});return p
 # Guard actual affected records, allowing unrelated current canonical changes to remain intact.
 canonical=read(ROOT/delta['canonicalBefore']['path']);before={g['id']:copy.deepcopy(g) for g in canonical['goals']};by={g['id']:g for g in canonical['goals']}
 for b in read(HERE/'canonical-affected-records.before.json')['records']:
  if b['goalId'] in {op['goalId'] for u in selected for op in u['canonicalOperations']}:
   assert objsha(before[b['goalId']])==b['recordSha256'],'Changed affected canonical record '+b['goalId']
 for u in selected:
  for op in u['canonicalOperations']:
   gid=op['goalId']
   if op['op']=='add_goal':assert gid not in by,'UUID collision '+gid;canonical['goals'].append(copy.deepcopy(op['after']));by[gid]=canonical['goals'][-1]
   elif op['op']=='update_goal_fields':
    assert {k:before[gid].get(k) for k in op['before']}==op['before'],'Before mismatch '+gid
    by[gid].update(copy.deepcopy(op['after']))
   elif op['op']=='append_contains':
    assert before[gid]['contains']==op['before'],'Parent changed '+gid
    for child in op['append']:
     assert child not in by[gid]['contains'];by[gid]['contains'].append(child)
 if 'q1-transcription-factors-plus-methylation' in wanted:
  ex=read(HERE/'exam-3ac1.additive-preservation.delta.candidate.json');gid=ex['goalId'];assert {k:before[gid][k] for k in ex['before']}==ex['before'];by[gid].update(copy.deepcopy(ex['after']))
 check_dag(canonical['goals'],'requires');check_dag(canonical['goals'],'contains')
 canonical_path=write('canonical.biologie.candidate.json',canonical)
 materialized_sources={}
 changed_source_groups={}
 for jurisdiction,filename in [('NI','ni-source-mapping.consolidated.delta.candidates.json'),('HE','he-source-mapping.targeted.delta.candidates.json')]:
  d=read(HERE/filename);ext=guarded(d['sourceExtractionBefore']);mapping=guarded(d['mappingBefore']);chosen=(d['mappingGoalDeltas'] if jurisdiction=='NI' else d['sourceGoalDeltas']);chosen=[x for x in chosen if x['unitId'] in wanted]
  source_items=d['sourceGoalDeltas'];source_by={x['sourceGoalId']:x for x in source_items};changed=[]
  for x in chosen:
   sid=x['sourceGoalId'];src=source_by[sid];assert next(y for y in ext['sourceGoals'] if y['id']==sid)==src['before'],'Source before mismatch '+sid
   idx=next(i for i,y in enumerate(ext['sourceGoals']) if y['id']==sid)
   if src['after'] is None:ext['sourceGoals'].pop(idx)
   else:ext['sourceGoals'][idx]=copy.deepcopy(src['after'])
   assert [r for r in mapping['mappings'] if r['legacyGoalId']==sid]==x['beforeRows'],'Mapping before mismatch '+sid
   assert next(r for r in mapping['decisions'] if r['sourceGoalId']==sid)==x['beforeDecision'],'Decision before mismatch '+sid
   first=next((i for i,r in enumerate(mapping['mappings']) if r['legacyGoalId']==sid),len(mapping['mappings']));mapping['mappings']=[r for r in mapping['mappings'] if r['legacyGoalId']!=sid];mapping['mappings'][first:first]=copy.deepcopy(x['afterRows'])
   di=next(i for i,r in enumerate(mapping['decisions']) if r['sourceGoalId']==sid)
   if x['afterDecisionCandidate'] is None:mapping['decisions'].pop(di)
   else:mapping['decisions'][di]=copy.deepcopy(x['afterDecisionCandidate'])
   changed.append(sid)
  if not chosen:continue
  # Old assertions are preserved in the immutable source, not asserted for an unreviewed successor.
  ext['qualityReview']['status']='inactive_candidate_targeted_review_pending';ext['qualityReview']['reviewedBy']='codex-inactive-materializer';ext['qualityReview']['notes']=list(ext['qualityReview'].get('notes',[])) if isinstance(ext['qualityReview'].get('notes'),list) else [str(ext['qualityReview'].get('notes',''))];ext['qualityReview']['notes'].append('Selected source cells are inactive candidates. Predecessor whole-curriculum review is not a current approval of these changes.')
  for step in ext.get('pipelineStatus',{}).get('steps',[]):
   if step.get('id') in ['MAPPING-2','MAPPING-3']:
    step['status']='pending'
    for check in step.get('checks',[]):check['passed']=False;check['details']='Inactive successor with '+str(len(ext['sourceGoals']))+' current source atoms; selected-cell review and all current mapping checks remain pending.'
  ep=write(jurisdiction.lower()+'.source-extraction.candidate.json',ext);mapping['sourceExtractionPath']=rel(ep);mapping['status']='inactive_candidate_targeted_review_pending';mapping['summary']={'sourceGoals':len(ext['sourceGoals']),'mappedSourceGoals':len({r['legacyGoalId'] for r in mapping['mappings']}),'needsCanonicalGoal':len({g['id'] for g in ext['sourceGoals']}-{r['legacyGoalId'] for r in mapping['mappings']}),'exactMappings':sum(d.get('matchType')=='exact' for d in mapping['decisions']),'partialMappings':sum(d.get('matchType')=='partial' for d in mapping['decisions'])}
  assert {r['legacyGoalId'] for r in mapping['mappings']}<={g['id'] for g in ext['sourceGoals']},'Retired source still mapped'
  assert {r['canonicalGoalId'] for r in mapping['mappings']}<=set(by),'Unknown mapping target'
  mp=write(jurisdiction.lower()+'.mapping.candidate.json',mapping);materialized_sources[jurisdiction]={'extraction':rel(ep),'mapping':rel(mp),'oldMapping':d['mappingBefore']['path']};changed_source_groups[jurisdiction]=changed
 # Concrete source target views and national navigation; no changes to untouched source views.
 vd=read(HERE/'source-and-navigation.integration.delta.candidates.json');views={}
 for item in vd['sourceViewCandidates']:
  view=guarded(item['before']);kind=item['jurisdiction'];targetset={n['goalId'] for n in walk(view['rootNodes']) if n.get('kind')=='goalEntry'}
  if kind=='NI' and kind in materialized_sources:
   m=read(ROOT/materialized_sources[kind]['mapping']);targetset={x['canonicalGoalId'] for x in m['mappings']}
  elif kind=='HE':
   for addition in item['additions']:
    if addition['unitId'] in wanted:targetset.add(addition['goalId'])
  else:continue
  # These source views are a single flat atom list. Refuse to flatten a future authored layout.
  assert len(view['rootNodes'])==1 and all(n['kind']=='goalEntry' for n in view['rootNodes'][0]['children'])
  view['rootNodes'][0]['children']=[{'kind':'goalEntry','goalId':gid} for gid in sorted(targetset)];vp=write(pathlib.Path(item['before']['path']).name,view);views[item['before']['path']]=rel(vp)
 nav=guarded(vd['navigationBefore']);nodes={n.get('id'):n for n in walk(nav['rootNodes']) if n.get('kind')=='structure'}
 for add in vd['navigationAdditions']:
  if add['unitId'] in wanted:
   assert add['goalId'] not in {n.get('goalId') for n in walk(nav['rootNodes'])};nodes[add['parentStructureId']]['children'].append({'kind':'goalEntry','goalId':add['goalId']})
 navids=[n['goalId'] for n in walk(nav['rootNodes']) if n.get('kind')=='goalEntry'];assert len(navids)==len(set(navids)),'Duplicate national navigation target';np=write('navigation.candidate.view.json',nav)
 inputs=guarded(vd['sourceAtlasInputsBefore']);inputs['landscapePath']=rel(canonical_path);inputs['mappingPaths']=[next((x['mapping'] for x in materialized_sources.values() if x['oldMapping']==p),p) for p in inputs['mappingPaths']];inputs['navigationViewPath']=rel(np);inputs['outputDirectory']=rel(out/'generated-source-views');inputs['manifestPath']=rel(out/'generated-source-manifest.json');inputs['expectedCurricularAtomicGoalCount']+=sum(op['op']=='add_goal' for u in selected for op in u['canonicalOperations']);write('source-atlas.inputs.candidate.json',inputs)
 pending={'candidateOnly':True,'machineClosures':0,'humanApproval':False,'unitsSelected':sorted(wanted),'heldUnits':held,'sourceGroupsChanged':changed_source_groups,'unchangedCurrentRecordsNotReReviewed':True,'assetsAndCurrentGateBindings':'Not copied/finalized by this script. See visual-assets.integration.delta.candidates.json and raw gate inventory. New authoritative semantic-ledger entries and current D/P/A/M/V require root decisions after actual integration.','sourceAtlasConfigUse':'Inactive data only: current live semantic-kind ledger lacks new goal IDs. Finalize semantic classifications honestly in the root integration before attempting source-atlas/build checks.','writtenFiles':written};write('materialization.receipt.json',pending)
 print(json.dumps({'output':rel(out),'units':len(selected),'heldUnits':held,'sourceAtomCounts':{j:len(read(ROOT/x['extraction'])['sourceGoals']) for j,x in materialized_sources.items()},'canonicalGoalCount':len(canonical['goals']),'candidateOnly':True,'machineClosures':0}))
if __name__=='__main__':main()
