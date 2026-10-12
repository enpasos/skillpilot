from pathlib import Path
import json,hashlib,shutil,copy
R=Path('/home/enpasos/projects/skillpilot');E=R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-12'
N=E/'chemie-q4-eleven-final-frozen-V-source-native-root-20261012-v10';B=E/'chemie-q4-eleven-final-native-fresh-independent-b-20261012-v6';Q=E/'chemie-q4-eleven-current220-preserving-root-preparation-20261012-v5';S=E/'chemie-q4-four-bounded-source-rows-author-successor-root-20261012-v6'
LIVE='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json';SEM='curricula/DE/Gymnasium/quality/goal-book-publication/chemie.semantic-kinds.json';REG='curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json'
rd=lambda p:json.loads(p.read_text());rp=lambda p:str(p.relative_to(R));sha=lambda p:'sha256:'+hashlib.sha256(p.read_bytes()).hexdigest()
def wr(p,d):
 p.parent.mkdir(parents=True,exist_ok=True);assert not p.exists(),p;p.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n')
def cp(p,q):
 q.parent.mkdir(parents=True,exist_ok=True);assert not q.exists(),q;shutil.copyfile(p,q)
pc=rd(N/'configs/P11.inactive.config.json');lines=(R/pc['reviewPath']).read_bytes().splitlines(keepends=True);ids=[json.loads(x)['goalId'] for x in lines];chosen=set(ids)
groups=[('P9',[x for x in lines if not json.loads(x)['goalId'].startswith(('5169','bef4'))]),('P1-5169',[x for x in lines if json.loads(x)['goalId'].startswith('5169')]),('P1-bef4',[x for x in lines if json.loads(x)['goalId'].startswith('bef4')])]
positive=[]
for label,raw in groups:
 target=N/'positive'/f'{label}.final-native-bound.original-author.exact.jsonl';assert not target.exists();target.write_bytes(b''.join(raw))
 c=copy.deepcopy(pc);c.update(landscapePath=LIVE,semanticKindLedgerPath=SEM,reviewPath=rp(target));c['scope']={'label':'Q4 genuine paired original and corrected native reviews '+label,'goalIds':[json.loads(x)['goalId'] for x in raw]};p=N/'active-configs'/f'{label}.config.json';wr(p,c);positive.append(rp(p));c['landscapePath']=rp(N/'candidate/canonical523.exact-final.inactive.json');c['semanticKindLedgerPath']=pc['semanticKindLedgerPath'];wr(N/'inactive-check-configs'/f'{label}.config.json',c)
ac=rd(B/'atomic/A11.normal.config.json');assert set(ac['scope']['leafGoalIds'])==chosen;target=N/'atomicity/A11.original-independent-b.exact.jsonl';cp(R/ac['reviewPath'],target);ac.update(landscapePath=LIVE,reviewPath=rp(target));p=N/'active-configs/A11.config.json';wr(p,ac);atomic=rp(p);ac['landscapePath']=rp(N/'candidate/canonical523.exact-final.inactive.json');wr(N/'inactive-check-configs/A11.config.json',ac)
reg=rd(R/REG);chem=next(s for s in reg['subjects'] if s['subject']=='chemie');mc0=rd(R/chem['memoryReviewConfigPath']);mcb=rd(B/'memory/M402.normal.config.json')
old=(R/mc0['reviewPath']).read_bytes().splitlines(keepends=True);new=(R/mcb['reviewPath']).read_bytes().splitlines(keepends=True);assert len(old)==len(new)==402
assert [json.loads(x)['goalId'] for x in old]==[json.loads(x)['goalId'] for x in new]
assert all(a==b for a,b in zip(old,new) if json.loads(a)['goalId'] not in chosen)
assert (R/mc0['cardReviewPath']).read_bytes()==(R/mcb['cardReviewPath']).read_bytes()
mp=N/'memory/M402.current391-exact-plus-independent-eleven.exact.jsonl';cp(R/mcb['reviewPath'],mp);cp(R/mc0['cardReviewPath'],N/'memory/cards75.current-exact.jsonl')
mc=copy.deepcopy(mcb);mc.update(landscapePath=LIVE,reviewPath=rp(mp),cardReviewPath=rp(N/'memory/cards75.current-exact.jsonl'),reportPath=rp(N/'active-checks/M402.actual.md'));p=N/'active-configs/M402.config.json';wr(p,mc);memory=rp(p);mc['landscapePath']=rp(N/'candidate/canonical523.exact-final.inactive.json');mc['reportPath']=rp(N/'checks/M402.inactive.actual.md');wr(N/'inactive-check-configs/M402.config.json',mc)
baseline=rd(R/LIVE);candidate=rd(N/'candidate/canonical523.exact-final.inactive.json');a={g['id']:g for g in baseline['goals']};b={g['id']:g for g in candidate['goals']};assert len(a)==523 and set(a)==set(b)
assert all(a[g]==b[g] for g in a if g not in chosen);assert all(a[g].get('requires',[])==b[g].get('requires',[]) and a[g].get('contains',[])==b[g].get('contains',[]) for g in a)
changes=[g for g in a if a[g]!=b[g]];assert len(changes)==6
images=[]
sources={
 '0a5a49f2-8e8a-5edb-b6ca-3f8636957a17':(Q/'assets/0a5a49f2-8e8a-5edb-b6ca-3f8636957a17.png',E/'chemie-q4-three-proven-image-corrections-author-root-20261012-v3/0a5a49f2-8e8a-5edb-b6ca-3f8636957a17/actual-imagegen-tool-prompt.txt'),
 'dc5173e8-6e63-58d3-a79b-bd74ef3cb98b':(Q/'assets/dc5173e8-6e63-58d3-a79b-bd74ef3cb98b.png',E/'chemie-q4-three-proven-image-corrections-author-root-20261012-v3/dc5173e8-6e63-58d3-a79b-bd74ef3cb98b/actual-imagegen-tool-prompt.txt'),
 '56115f9d-1d32-5454-94b1-00dbc4a7bc6f':(Q/'assets/56115f9d-1d32-5454-94b1-00dbc4a7bc6f.png',E/'chemie-q4-rgt-five-A-five-B-author-root-20261012-v5/actual-imagegen-tool-prompt.txt'),
 '5169bb6b-f065-5798-8164-9b4521e44ae8':(E/'chemie-q4-5169-current220-final-image-native-root-20261012-v8/assets/5169bb6b-f065-5798-8164-9b4521e44ae8.png',E/'chemie-q4-5169-gibbs-image-author-root-20261012-v7/actual-imagegen-tool-prompt.txt'),
 'bef4c8eb-1d80-50fb-88cd-3a9904e38b4e':(E/'chemie-q4-bef4-current220-final-image-native-root-20261012-v8/assets/bef4c8eb-1d80-50fb-88cd-3a9904e38b4e.png',E/'chemie-q4-bef4-coupling-image-author-root-20261012-v7/actual-imagegen-tool-prompt.txt')}
for gid,(png,prompt) in sources.items():
 assert png.is_file() and prompt.is_file();oldlink=next(l for l in a[gid]['resourceLinks'] if l['type']=='goal-visualization');oldpath=R/'curricula/DE/Gymnasium/visualizations'/oldlink['url'].removeprefix('/assets/goal-visualizations/');assert oldpath.is_file()
 images.append({'goalId':gid,'oldImage':{'path':rp(oldpath),'sha256':sha(oldpath)},'correctedPNG':{'path':rp(png),'sha256':sha(png)},'prompt':{'path':rp(prompt),'sha256':sha(prompt)}})
source=rd(S/'configs/source32.four-only.inactive.inputs.json');current=rd(R/'app/scripts/config/goal-books/de-gym-chemistry-national-atlas.inputs.json');oldpaths=current['mappingPaths'];deltas=[]
for i,(oldpath,newpath) in enumerate(zip(oldpaths,source['mappingPaths'])):
 if oldpath==newpath:continue
 assert '/DE-' in oldpath and Path(oldpath).parent.name=='upper-secondary'
 suffix=Path(oldpath).name.removesuffix('.review.json')+'.q4-four-bounded-reviewed-20261013-v1.review.json';dest=Path(oldpath).parent/suffix
 q=N/'sources/future-active-mappings'/suffix;cp(R/newpath,q)
 deltas.append({'before':oldpath,'prepared':rp(q),'target':str(dest),'sha256':sha(q)})
assert len(deltas)==3 and any('DE-SH' in p and 'micelle' in p for p in oldpaths)
for key,skey in [('positiveEvidenceConfigPaths','goalIds'),('semanticAtomicityConfigPaths','leafGoalIds')]:
 for p in chem[key]:assert not chosen&set(rd(R/p)['scope'].get(skey,[])),p
wr(N/'ROOT.future-active-adoption.plan.json',{'role':'Root-controlled prospective Q4 adoption; genuine paired reviews, no new scientific votes from transport','currentCanonicalDependency':{'path':LIVE,'sha256':sha(R/LIVE)},'candidateCanonical':{'path':rp(N/'candidate/canonical523.exact-final.inactive.json'),'sha256':sha(N/'candidate/canonical523.exact-final.inactive.json')},'selectedGoalIds':ids,'changedWholeGoalIds':changes,'all523IdsAndEdgesRetained':True,'other517WholeGoalsExact':True,'current220NormalPagesExact':True,'futureActiveConfigPaths':{'positive':positive,'atomicity':atomic,'memory':memory},'correctedImages':images,'boundedSourceMappingAdoptions':deltas,'deferredSourceClause':'NW experimental derivation of Faraday/Nernst/Gibbs is not demonstrated by identity checks; original row retained exact','activeWrites':False,'newScientificClosuresExpected':11,'bindingOnlyRestorationsExpected':0,'protectedSubjects':['mathematik','physik','biologie'],'HumanApproval':False,'HumanTrial':False})
print(json.dumps({'futurePgroups':[len(x[1]) for x in groups],'M402Other391Exact':True,'cards75Exact':True,'correctedImages':len(images),'sourceMappingFiles':len(deltas),'activeWrites':False}))
