import copy,datetime,hashlib,json,pathlib
J=pathlib.Path(__file__).resolve().parent;K=J/'capsule'
handoff=json.loads((J/'HANDOFF.exact-current-AM-P-prospective-integration.json').read_text())
src=K/handoff['newCentralConfigRelativePath'];cfg=json.loads(src.read_text());out=copy.deepcopy(cfg);s=out['subjects'][0]
Q=pathlib.Path(handoff['newCentralConfigRelativePath']).parent
native='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-17/chemie-current439-remediation14-author-assembly-technical-v1/native14/resolution-index.json'
def pin(p):
 b=p.read_bytes();return {'path':str(p),'sha256':hashlib.sha256(b).hexdigest(),'bytes':len(b)}
guards={str(src):pin(src),str(K/native):pin(K/native)}
assert guards[str(K/native)]['sha256']=='d2d9b071aec28cfdfef9ea42e01f9b53a617960307e7b4e46d394f6a43c608f3'
claims={}
for path in s['resolutionIndexPaths']:
 p=K/path;guards[str(p)]=pin(p)
 for r in json.loads(p.read_text())['resolutions']:claims.setdefault(r['goalId'],[]).append(path)
index=json.loads((K/native).read_text());assert len(index['resolutions'])==14
assert native not in s['resolutionIndexPaths'];s['resolutionIndexPaths'].append(native)
added=[]
for r in index['resolutions']:
 gid=r['goalId'];assert not any(w['goalId']==gid for w in s['resolutionWithdrawals'])
 historical=set(claims.get(gid,[]));oldnodes={e['supersededIndexPath'] for e in s['resolutionSupersessions'] if e['goalId']==gid};terminal=historical-oldnodes
 assert len(terminal)==1,(gid,terminal)
 edge={'goalId':gid,'supersededIndexPath':terminal.pop(),'replacementIndexPath':native};s['resolutionSupersessions'].append(edge);added.append(edge)
assert len(s['resolutionIndexPaths'])==112 and len(s['resolutionSupersessions'])==356
for key,val in cfg['subjects'][0].items():
 if key not in {'resolutionIndexPaths','resolutionSupersessions'}:assert s[key]==val
out['reportId']=cfg['reportId']+'-actual-native14-D112-prospective'
target=K/Q/'central.current439.actual-AM4-frozen-P14.D112-PROSPECTIVE-P4-open.config.json';assert not target.exists();target.write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n')
for p,g in guards.items():assert pin(pathlib.Path(p))==g,p
receipt={'role':'Prospective exact14 actual-current native D owners added, P4 material findings open, no activation','atUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'source':pin(src),'candidate':pin(target),'candidateRelativePath':str(target.relative_to(K)),'currentPaired14Index':guards[str(K/native)],'addedExactEdges':added,'counts':{'indices':112,'supersessionEdges':356,'activeWithdrawalsConditionalStill':2},'sourceGuards':list(guards.values()),'sourceGuardsUnchanged':True,'AM_P_QA_ConfigLanesUnchanged':True,'P4FindingsOpen':True,'fullWholeChainContentValidationNotYetDone':True,'humanApproval':False,'mainMutation':False,'M7Claim':False}
p=J/'PLAN.current14-exact-D112-additive-owners-P4-findings-open.json';assert not p.exists();p.write_text(json.dumps(receipt,ensure_ascii=False,indent=2)+'\n');print(json.dumps({'plan':pin(p),'candidate':pin(target),'counts':receipt['counts']}))
