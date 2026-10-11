from pathlib import Path
import json,copy,hashlib,shutil,subprocess
R=Path('/home/enpasos/projects/skillpilot');O=R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/wirtschaft-M4-twelve-macro-contracts-coherent-local-material-author-v1';cap=Path('/tmp/skillpilot-economics-macro12-current504-wxkcpkyv');read=lambda p:json.loads(p.read_text());CAN=Path('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json')
def fp(p):return {'path':str(p.relative_to(R)),'sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'bytes':p.stat().st_size}
def ex(p,n):q=O/n;q.parent.mkdir(parents=True,exist_ok=True);assert not q.exists();shutil.copyfile(p,q);return q
def wr(n,d):p=O/n;assert not p.exists();p.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n');return p
def stage(p,q):q.parent.mkdir(parents=True,exist_ok=True);q.unlink(missing_ok=True);shutil.copyfile(p,q)
active=ex(R/CAN,'frozen-current518-inputs/whole-active-current518.exact.json');assert fp(active)['sha256']=='aea52b23ce1bd5d510fa0d6c256fc7fa4c5e3bddca5736bb54c5c505a6a7e309';cfg=read(R/'app/scripts/config/goal-books/de-gym-economics-current-canonical.json');sem=ex(R/cfg['semanticKindLedgerPath'],'frozen-current518-inputs/whole-active-SEM518.exact.json');pp=ex(R/cfg['evidenceReviewPaths'][0],'frozen-current518-inputs/whole-currentP336685.exact.jsonl');regp=Path('curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json');reg=ex(R/regp,'frozen-current518-inputs/whole-active-registry.exact.json');stage(reg,cap/regp);stage(sem,cap/cfg['semanticKindLedgerPath']);views=[]
for p in sorted((R/'curricula/DE/Gymnasium/composition-views/wirtschaft').glob('*.view.json')):
 q=ex(p,'frozen-current518-inputs/whole-before-views/'+p.name);stage(q,cap/p.relative_to(R));views.append(fp(q))
b=read(active);a=copy.deepcopy(b);B=read(O/'whole-nine-macro-twelve-current-contracts-two-case-materials.DRAFT-readable-author-v3.json');a['goals']+=B
for navid,phase in [('1f0ed7e7-5f8b-512a-8d94-4bf05a065bbc','Q1'),('a1c0c574-9cdb-5e9b-a7ad-96d7c15679b0','Q2')]:
 # Actual Q2 id is resolved by existing cluster contract/title, never guessed as evidence.
 matches=[g for g in a['goals']if g['id']==navid]
 if not matches:matches=[g for g in a['goals']if g['title']=='Übungen Q2'and g.get('type')=='cluster']
 assert len(matches)==1;(matches[0]['contains']).extend(g['id']for g in B if g['phase']==phase)
first=wr('whole-current518-plus-nine-DRAFT-two-existing-nav-contains527.inert-first-native.json',a);stage(first,cap/CAN)
cmds=[]
def run(name):
 out=O/(name+'.actual-native.json');argv=[str(cap/'app/node_modules/.bin/tsx'),str(cap/'native-macro12-current504-intake.ts'),str(out)];z=subprocess.run(argv,cwd=cap,capture_output=True,text=True);(O/(name+'.stdout.raw.txt')).write_text(z.stdout);(O/(name+'.stderr.raw.txt')).write_text(z.stderr);cmds.append({'argv':argv,'cwd':str(cap),'exit':z.returncode});assert z.returncode==0,z.stderr;return read(out)
one=run('actual-nine-DRAFT-native-before-two-nav-childunion-binding');bg={g['id']:g for g in b['goals']};changed=[]
for g in a['goals']:
 if g['id']in bg and g!=bg[g['id']]:
  assert g['type']=='cluster';compiled=next(row for row in one['compilerGoals']if row['goalId']==g['id']);g['applicability']=compiled['compiledApplicability'];changed.append(g['id'])
assert len(changed)==2
final=wr('whole-current518-plus-nine-DRAFT-and-two-native-childunion-nav-fields527.inert-candidate.json',a);stage(final,cap/CAN);raw=run('actual-nine-DRAFT-current527-two-nav-childunion-bound-native');assert raw['compilerSummary']['errors']==raw['compilerSummary']['warnings']==0
inputs=wr('actual-native527-DRAFT-inputs-two-nav-fields-and-current518-whole-lineage.index.json',{'role':'INERT_DRAFT_NOT_SCIENCE_APPROVAL','wholeCurrent518':fp(active),'wholeCurrentSEM518':fp(sem),'wholeCurrentP336685':fp(pp),'wholeCurrentRegistry':fp(reg),'wholeCurrentBeforeViews':views,'wholeNineDraftBodies':fp(O/'whole-nine-macro-twelve-current-contracts-two-case-materials.DRAFT-readable-author-v3.json'),'whole527Candidate':fp(final),'actualChanged2NavIDs':changed,'nativeCommands':cmds,'actualNative':fp(O/'actual-nine-DRAFT-current527-two-nav-childunion-bound-native.actual-native.json'),'allOrdinary336AndP685ScienceExact':True,'activeWrites':0,'registeredOrReleased':False});print(json.dumps({'index':fp(inputs),'CAN527':fp(final),'native':raw['compilerSummary'],'rules':[{k:r[k]for k in ['id','status','metrics']}for r in raw['nativeRules']]}))
