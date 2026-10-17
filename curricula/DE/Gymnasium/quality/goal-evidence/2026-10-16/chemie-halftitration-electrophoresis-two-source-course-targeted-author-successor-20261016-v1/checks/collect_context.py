# SPDX-License-Identifier: Apache-2.0
import pathlib,json,hashlib
r=pathlib.Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-16');out=r/'chemie-halftitration-electrophoresis-two-source-course-targeted-author-successor-20261016-v1';tmp=pathlib.Path('tmp/chemie-halftitration-electrophoresis-two-source-course-targeted-author-successor-20261016-v1');mp=r/'chemie-current429-final-normal-host-rebuild-map-technical-20261016-v1/successor-final-QA-history-validation/REBUILD.actual-final-current429-normal-host.portable-input-map.json';cfgp=r/'chemie-current578-final-b608-source-atlas-bounded-technical-20261016-v1/CONFIG.actual-final-b608-source-normal.inputs.json';meta=json.loads(mp.read_text());cfg=json.loads(cfgp.read_text());alias={}
for z in meta['normalAliases']+meta['selectedConfigAndArtifactDependencies']:
 k=z.get('normalHostAlias',z.get('normalHostPath'));v=z.get('physicalRepositorySource');
 if k and v:alias[k]=v
sha=lambda p:'sha256:'+hashlib.sha256(pathlib.Path(p).read_bytes()).hexdigest()
def physical(p):return pathlib.Path(alias.get(p,{'path':p})['path'])
def pin(p):return {'path':str(p),'sha256':sha(p),'bytes':p.stat().st_size}
ids=['059acb11-29b3-5645-ac4c-b4214dc41a2d','d1244f5d-9a12-5b74-97fe-ae974f40af26'];contexts=[]
for normal in cfg['mappingPaths']:
 p=physical(normal);m=json.loads(p.read_text());matches=[row for row in m['mappings'] if row.get('canonicalGoalId') in ids]
 if not matches:continue
 srcp=physical(m['sourceExtractionPath']);src=json.loads(srcp.read_text());sg={g['id']:g for g in src['sourceGoals']};passes={g['id']:g for g in src['passages']}
 for sid in dict.fromkeys(z['legacyGoalId'] for z in matches):
  partners=[z for z in m['mappings'] if z['legacyGoalId']==sid];dec=[z for z in m['decisions'] if z.get('sourceGoalId',z.get('legacyGoalId'))==sid or z.get('id')==sid];g=sg.get(sid)
  contexts.append({'sourceGoalId':sid,'targetIds':[z['canonicalGoalId'] for z in matches if z['legacyGoalId']==sid],'normalMappingPath':normal,'mappingPhysical':pin(p),'normalSourcePath':m['sourceExtractionPath'],'sourcePhysical':pin(srcp),'wholeSourceGoal':g,'wholeSourcePassage':passes.get(g.get('passageId')) if g else None,'wholePartnerMappings':partners,'wholeDecisions':dec})
(tmp/'ALL.current-whole-incoming-contexts.json').write_text(json.dumps({'routingConfig':pin(cfgp),'aliasRouting':pin(mp),'contexts':contexts},ensure_ascii=False,indent=2)+'\n')
print('contexts',len(contexts))
for x in contexts: print(x['targetIds'],x['sourceGoalId'],x['wholeSourceGoal'].get('courseLevel'),x['wholeSourceGoal'].get('sourceSpan'),x['wholeSourceGoal'].get('sourceText',x['wholeSourceGoal'].get('description')),len(x['wholePartnerMappings']),len(x['wholeDecisions']))
# NI halfpoint source clauses are not necessarily current direct 059 mappings.
ni=physical('curricula/DE/Gymnasium/input/NI/upper-secondary/source-extraction/DE_NI_CHEMIE_SEKII_KC2022.source-extraction.json');src=json.loads(ni.read_text());mnorm=next(p for p in cfg['mappingPaths'] if 'DE-NI/upper' in p);mapp=physical(mnorm);m=json.loads(mapp.read_text());selected=[]
for g in src['sourceGoals']:
 text=json.dumps(g,ensure_ascii=False).lower()
 if any(z in text for z in ['halb','äquimolar','equimolar','qprotolyse.2','qprotolyse2']) and 'protolyse' in text:
  row={'wholeSourceGoal':g,'wholeSourcePassage':next(z for z in src['passages'] if z['id']==g['passageId']),'wholePartnerMappings':[z for z in m['mappings'] if z['legacyGoalId']==g['id']],'wholeDecisions':[z for z in m['decisions'] if z.get('sourceGoalId',z.get('legacyGoalId'))==g['id'] or z.get('id')==g['id']]};selected.append(row)
(tmp/'NI.current-whole-protolyse-source-contexts.json').write_text(json.dumps({'mapping':pin(mapp),'source':pin(ni),'contexts':selected},ensure_ascii=False,indent=2)+'\n');print('NI_selected',len(selected));
for x in selected:print(x['wholeSourceGoal']['id'],x['wholeSourceGoal'].get('courseLevel'),x['wholeSourceGoal'].get('sourceText'),x['wholePartnerMappings'])
