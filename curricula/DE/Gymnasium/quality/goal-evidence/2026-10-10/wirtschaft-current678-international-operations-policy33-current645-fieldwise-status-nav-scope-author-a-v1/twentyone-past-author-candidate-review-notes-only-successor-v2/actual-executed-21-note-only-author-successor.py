from pathlib import Path
import json,hashlib,copy,os,shutil
R=Path('/home/enpasos/projects/skillpilot');Q=R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10';O=Q/'wirtschaft-current678-international-operations-policy33-current645-fieldwise-status-nav-scope-author-a-v1';V=O/'twentyone-past-author-candidate-review-notes-only-successor-v2';V.mkdir(exist_ok=False);CAP=Path('/tmp/economics-combined678-current645-author-a-path.txt').read_text().strip();CAP=Path(CAP)
def read(p):return json.loads(p.read_text())
def bind(p):return {'path':str(p.relative_to(R)),'sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'bytes':p.stat().st_size}
oldcan=O/'whole-current678-thirtythree-qualified-fiveNav-one-real-Q4-HB-childunion.INERT-author-candidate.json';oldbody=O/'whole33-foreign-science-qualified-status-only-released.INERT-author-candidate.json';a=read(oldcan);b=read(oldbody);before=copy.deepcopy(a);beforeb=copy.deepcopy(b);ids=[];deltas=[]
old='Die Länder-/Kursbindung ist ein inaktiver Autorenkandidat und benötigt die unabhängige Scopeprüfung.';new='Die Länder-/Kursbindung wurde als inaktiver Autorenkandidat erstellt; ihre Integration setzt einen gesonderten unabhängigen Scope-Nachweis voraus.'
for g in a['goals']:
 if old in g.get('examData',{}).get('reviewNote',''):
  prev=g['examData']['reviewNote'];g['examData']['reviewNote']=prev.replace(old,new);ids.append(g['id']);deltas.append({'goalId':g['id'],'field':'examData.reviewNote','wholeBefore':prev,'wholeAfter':g['examData']['reviewNote']})
for g in b:
 if g['id'] in ids:g['examData']['reviewNote']=g['examData']['reviewNote'].replace(old,new)
assert len(ids)==len(deltas)==21
for x,y in zip(before['goals'],a['goals']):
 t=copy.deepcopy(y)
 if y['id'] in ids:t['examData']['reviewNote']=x['examData']['reviewNote']
 assert t==x
for x,y in zip(beforeb,b):
 t=copy.deepcopy(y)
 if y['id'] in ids:t['examData']['reviewNote']=x['examData']['reviewNote']
 assert t==x
np=V/'whole-current678.only21-past-candidate-reviewNotes-other-whole-fields-exact.INERT-author-v2.json';nb=V/'whole33.only21-past-candidate-reviewNotes-status-body-exact.INERT-author-v2.json';np.write_text(json.dumps(a,ensure_ascii=False,indent=2)+'\n');nb.write_text(json.dumps(b,ensure_ascii=False,indent=2)+'\n')
cp=CAP/'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json';assert cp.resolve().is_relative_to(CAP.resolve()) and not cp.is_symlink() and not os.path.samefile(cp,R/cp.relative_to(CAP));assert cp.read_bytes()==oldcan.read_bytes();cp.write_bytes(np.read_bytes())
ix=read(O/'actual-fieldwise678-foreign33-fiveNav359-references-author-index.json');ix['wholeAfterCAN']=bind(np);ix['wholeForeign33StatusOnlyBodies']=bind(nb);ix['wholePreviousV1Index']=bind(O/'actual-fieldwise678-foreign33-fiveNav359-references-author-index.json');ix['actual21ReviewNotePastTemporalOnlyDeltas']=deltas;ix['actualScopeNativeV1ReuseReason']='Only administrative reviewNote chronology changed. Entire tasks, solutions, rubrics, statuses, IDs, tags, requires, contains, applicability, views, all previous scope semantics and source claims exactly unchanged. Native semantic source FPs for these21 practice rows are followed separately, not represented as scientific rereview.'
idx=V/'actual-final-fieldwise678-V2-21note-only-full-before-after-binding-index.AUTHOR.json';idx.write_text(json.dumps(ix,ensure_ascii=False,indent=2)+'\n')
# The readonly scope observer can reuse its final foreign-qualified33 input because closure/course fields are identical.
helper=CAP/'app/scripts/internationalOperationsPolicy33Current645Conditional678NoteSourceFPOnlyAuthorA.mts';assert helper.resolve().is_relative_to(CAP.resolve()) and not helper.is_symlink();helper.write_text("import{readFileSync,writeFileSync,realpathSync,statSync}from'node:fs';import{join}from'node:path';import assert from'node:assert/strict';import{fingerprintSemanticKindSourceGoal}from'./goalBookModel.ts';const[CAP,OUT,ROOT]=process.argv.slice(2),read=(p:string)=>JSON.parse(readFileSync(p,'utf8'));const c=read(join(CAP,'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json')),r=read(join(CAP,'curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json')),s=r.subjects.find((s:any)=>s.subject==='wirtschaftswissenschaften'),p=join(CAP,s.semanticKindLedgerPath);assert.notEqual(realpathSync(p),realpathSync(join(ROOT,s.semanticKindLedgerPath)));assert.notEqual(statSync(p).ino,statSync(join(ROOT,s.semanticKindLedgerPath)).ino);const l=read(p),ids=new Set(read(join(OUT,'actual-final-fieldwise678-V2-21note-only-full-before-after-binding-index.AUTHOR.json')).actual21ReviewNotePastTemporalOnlyDeltas.map((d:any)=>d.goalId)),g=new Map(c.goals.map((g:any)=>[g.id,g]));for(const d of l.decisions){if(ids.has(d.goalId)){assert.equal(d.semanticKind,'practiceAssessment');d.sourceFingerprint=fingerprintSemanticKindSourceGoal(g.get(d.goalId));}}assert.equal(ids.size,21);assert(l.decisions.every((d:any)=>d.sourceFingerprint===fingerprintSemanticKindSourceGoal(g.get(d.goalId))));writeFileSync(p,JSON.stringify(l,null,2)+'\\n');writeFileSync(join(OUT,'whole-conditional678-SEM.only21-note-FP-followers.PRIVATE-native-only-INERT-v2.json'),JSON.stringify(l,null,2)+'\\n');console.log(JSON.stringify({goals:678,actualNoteOnlyFPFollowers:21,wholeOther657DecisionsExact:true,all678NativeSourceFPsMatched:true}));")
shutil.copyfile('/tmp/economics-combined678-review-note-temporal-successor-author-a.py',V/'actual-executed-21-note-only-author-successor.py')
print(json.dumps({'wholeFinalCAN':bind(np),'whole33Bodies':bind(nb),'finalIndex':bind(idx),'notes':21}))
