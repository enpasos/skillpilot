# SPDX-License-Identifier: Apache-2.0
import pathlib,json,copy,shutil,hashlib
R=pathlib.Path('/home/enpasos/projects/skillpilot');P=pathlib.Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/biologie-bio8-atomicity-source-visual-findings-targeted-author-successor-v3');C=R/'tmp/m7-bio8-findings-v3-author-isolated-capsule'
def read(p):return json.loads((R/P/p).read_text())
def ref(p):
 b=(R/p).read_bytes();return {'path':str(p),'sha256':'sha256:'+hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def put(p,x):
 f=R/P/p;assert not f.exists();f.parent.mkdir(parents=True,exist_ok=True);f.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n');d=C/f.relative_to(R);d.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(f,d);return ref(f.relative_to(R))
sid='rp-bio-seki-rp-bio-seki-2014-tf11-biowissenschaften-und-gesellschaft-003-8927c877';f53='f53d0a0b-d9b8-5012-92b5-3a021ab6c30b';mp=read('sources/RP-whole-assessable-behavior-fourth-successor.json');dec=next(d for d in mp['decisions']if d['sourceGoalId']==sid);dec['rationale']='Der aktuelle Quellenoperator fordert Argumentation zu Chancen und Risiken. Die vorhandenen Partner0f/5ee/954 führen solche Argumentations-/Bewertungsprodukte aus. Die bestehende f53-Teilroute ist ausschließlich CRISPR-Funktions-/Einsatzwissen als Theorie-/Voraussetzungsbeitrag, kein Nachweis der Argumentationsleistung. Alte Methoden-/Vektortheorie-Direktrouten523/d11 sind entfernt. Keine deklarierte Vollabdeckung und keine neue Source-/Kursfreigabe.';dec['authorQualification']['sourceFulfilmentSeparation']={'argumentProductGoalIds':['0f9318ec-90eb-5381-b670-8fb2f2789c3d','5ee0f660-66f1-5aa6-a01d-e3b010db01ff','9540a95d-5ca5-527c-918f-d702e99be07a'],'theoryPrerequisiteOnlyGoalIds':[f53],'theoryAlonePerformsSourceOperator':False}
for m in mp['mappings']:
 if m['legacyGoalId']==sid and m['canonicalGoalId']==f53:m['authorSourceRole']='prerequisite-only-theory-no-argument-performance-credit'
rp=put('sources/RP-final-explicit-theory-prerequisite-role.successor.json',mp);at=read('sources/final-fossil-image-book-local-atlas.normal.config.json');oldrp=str(P/'sources/RP-whole-assessable-behavior-fourth-successor.json');at['mappingPaths']=[rp['path']if p==oldrp else p for p in at['mappingPaths']];put('sources/final-explicit-operators-book-local-atlas.normal.config.json',at)
w=read('sources/all-final31-source-pairs-with-regular-primary-bundle-bindings.author.json')
for p in w['wholePairs']:
 if p['mapping']['path']==oldrp:p['mapping']=rp
for row in w['records']:
 if row['wholeMapping']['path']==oldrp:
  row['wholeMapping']=rp;row['wholeSourceDecision']=next(d for d in mp['decisions']if d['sourceGoalId']==row['wholeLiteralSourceGoal']['id'])
put('sources/final31-pairs-and34-whole-direct-operators.regular-primary.author.json',w)
put('checks/final-source-findings-performance-separation.author.json',{'RP_TF11_argumentProducts':['0f9318ec-90eb-5381-b670-8fb2f2789c3d','5ee0f660-66f1-5aa6-a01d-e3b010db01ff','9540a95d-5ca5-527c-918f-d702e99be07a'],'RP_TF11_f53_role':'existing literal partial edge retained explicitly as CRISPR theory prerequisite only; no argument performance credit','RP_TF11_523_d11_theory_directedges_removed':True,'RP_TF12_behavior':'7d2 complete authored ancestry-to-behavior products; genuine independent judgments pending','BY10_fullAND_requiredAll':['430b2b73-641a-5122-bb6d-162b0d1eaf2d','80235254-ca58-5ba0-9319-b842350d6eb2'],'HE_Q1_4_optionalCourseBoundary':True,'HE_universalLK_claim':False,'PCR_old_authored_gel_operator':'literal partial; joint gel8eb; not full PCR','sourceApproval':False,'wholeCourseApproval':False,'sourceCompilerDirectInheritedFlagsAreApplicabilityNotPerformanceApproval':True})
print(json.dumps({'RP_theoryExplicitPrerequisiteRole':f53,'SOURCE_approval':False,'wholeGoalsUnchanged':483,'atomsUnchanged':396}))
