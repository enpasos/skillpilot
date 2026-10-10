from pathlib import Path
import json,hashlib,copy,shutil
R=Path('/home/enpasos/projects/skillpilot');Q=R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10';O=Q/'wirtschaft-current678-qualified-fifteen-graph-v18-active-root-v1';O.mkdir(exist_ok=False)
H=Q/'wirtschaft-current678-fifteen-qualified-graph-SEM-P43-AM-book-technical-author-b-v18/actual-final-v18-fifteen-qualified-graph-SEM-P43-AM-book-technical-author.handoff.json'
T=Q/'wirtschaft-current678-v18-technical-independent-root-v1/actual-final-v18-SEM-P43-AM-book-technical-independent-KEEP.receipt.json'
def rd(p):return json.loads(p.read_text())
def bind(p):return {'path':str(p.relative_to(R)),'sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'bytes':p.stat().st_size}
def ck(b):
 p=R/b['path'];assert bind(p)==b;return p
def save(n,x):
 p=O/n;assert not p.exists();p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n');return bind(p)
h=rd(H);t=rd(T);assert t['decision'].startswith('KEEP') and t['wholeAuthorHandoff']==bind(H)
gh=rd(ck(h['qualifiedScienceRootH']));assert gh['actualNativeGraphPass'] and gh['actualAllRouteRulesPass']
b=rd(ck(h['wholeBeforeCAN']));a=rd(ck(h['wholeAfterCAN']));CAN=R/'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json';REG=ck(h['oldRegistry']);BOOK=ck(h['oldBookConfig']);assert bind(CAN)['sha256']==h['wholeBeforeCAN']['sha256']
protected=rd(Q/'wirtschaft-current678-remaining33-active-root-v1/actual-current678-thirtythree359-before-mutation-whole-input-guards.json')['protectedWholeInputs']
for x in protected:ck(x)
for k in ['oldSEM','oldPaggregate','oldAconfig','oldAreview','oldMconfig','oldMreview','unchangedCardsBinding']:ck(h[k]);protected.append(h[k])
for z in h['all43ConfigChanges']:protected.extend([z['old'],z['oldReview']])
for p in sorted((R/'curricula/DE/Gymnasium/composition-views/wirtschaft').glob('*.json')):protected.append(bind(p))
protected=list({x['path']:x for x in protected}.values())
before=rd(REG);after=rd(ck(h['newRegistry']));ob=rd(BOOK);ab=rd(ck(h['newBookConfig']))
clone=copy.deepcopy(after);s=next(s for s in clone['subjects'] if s['subject']=='wirtschaftswissenschaften');old=next(s for s in before['subjects'] if s['subject']=='wirtschaftswissenschaften');keys=['semanticKindLedgerPath','positiveEvidenceConfigPaths','semanticAtomicityConfigPath','memoryReviewConfigPath']
for k in keys:s[k]=old[k]
assert clone==before;clone=copy.deepcopy(ab)
for k in ['semanticKindLedgerPath','evidenceReviewPaths']:clone[k]=ob[k]
assert clone==ob
bg={g['id']:g for g in b['goals']};ag={g['id']:g for g in a['goals']};current=rd(CAN);assert current==b
cg={g['id']:g for g in current['goals']};deltas=rd(ck(gh['wholeDeltas']));assert len(deltas)==15;changed=[]
for z in deltas:
 gid=z['goalId'];assert cg[gid]==z['wholeBefore']==bg[gid]
 for d in z['actualDeltas']:
  parts=d['field'].strip('/').split('/');obj=cg[gid]
  for k in parts[:-1]:obj=obj[k]
  assert obj[parts[-1]]==d['before'];obj[parts[-1]]=copy.deepcopy(d['after']);changed.append({'goalId':gid,**d})
assert len(changed)==23 and current==a
mutations=[]
for name,p,candidate in [('CAN',CAN,h['wholeAfterCAN']),('REG',REG,h['newRegistry']),('BOOK',BOOK,h['newBookConfig'])]:
 backup=O/('whole-before-active-'+name+'.json');backup.write_bytes(p.read_bytes());mutations.append({'activePath':str(p.relative_to(R)),'wholeBefore':bind(backup),'qualifiedCandidate':candidate})
guards=save('actual-qualified-fifteen-before-active-fieldwise-mutation-guards.json',{'actualMutations':mutations,'protectedWholeInputs':protected,'independentGraphDeltaKEEP':h['qualifiedScienceRootH'],'independentTechnicalKEEP':bind(T),'actual15Goals23Fields':changed,'strictNet':0,'humanApproval':False})
CAN.write_text(json.dumps(current,ensure_ascii=False,indent=2)+'\n')
for k in keys:old[k]=copy.deepcopy(next(s for s in after['subjects'] if s['subject']=='wirtschaftswissenschaften')[k])
assert before==after;REG.write_text(json.dumps(before,ensure_ascii=False,indent=2)+'\n')
for k in ['semanticKindLedgerPath','evidenceReviewPaths']:ob[k]=copy.deepcopy(ab[k])
assert ob==ab;BOOK.write_text(json.dumps(ob,ensure_ascii=False,indent=2)+'\n')
for x in protected:ck(x)
assert rd(CAN)==a and rd(REG)==after and rd(BOOK)==ab
shutil.copyfile(__file__,O/'actual-executed-three-active-fields-only-integration.py')
final=save('actual-current678-qualified-fifteen-graph-and-v18-followers-active.receipt.json',{'role':'actual fieldwise active integration of independently qualified15 graph repairs and independently checked truthful technical followers; stable central and required closing checks remain separate','wholeAuthorHandoff':bind(H),'independentGraphKEEP':h['qualifiedScienceRootH'],'independentTechnicalKEEP':bind(T),'beforeGuards':guards,'actual15Goal23FieldMutations':changed,'actualActiveWrites':[bind(x) for x in [CAN,REG,BOOK]],'allProtectedWholeInputsExact':True,'protectedWholeInputCount':len(protected),'all663OtherWholeGoalObjectsExact':True,'all336Descriptions685PositiveCases66CardsAnd34ViewRolesExact':True,'allOtherFourRegistrySubjectsExact':True,'newStrictScientificClosures':0,'restoredStrictBindings':0,'strictNet':0,'M6CommitReadyClaim':False,'humanApproval':False,'imagesGenerated':0,'commitCreated':False})
print(json.dumps({'final':final}),flush=True)
