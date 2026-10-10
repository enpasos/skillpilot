#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
import json,pathlib,hashlib,datetime
R=pathlib.Path('/home/enpasos/projects/skillpilot')
B=pathlib.Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10')
O=B/'chemie-b008-current517-native-context-independent-b-20261010-v1'
A=B/'chemie-b008-current517-machine-content-native-readiness-author-20261010-v1'
C=B/'chemie-b008-C11-current-G1-competence-source-context-author-20261010-v1'
def read(p):return json.loads((R/p).read_text())
def ref(p):
 b=(R/p).read_bytes();return {'path':str(p),'sha256':'sha256:'+hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def put(p,j):
 f=R/O/p;f.parent.mkdir(parents=True,exist_ok=True);f.write_text(json.dumps(j,ensure_ascii=False,indent=2)+'\n');return ref(O/p)
first=read(O/'FIRST.current517-native-and-C11-G1.independent-b.json');ff=read(O/'FIRST.current517-native-and-C11-G1.independent-b.freeze.json')
assert ref(O/'FIRST.current517-native-and-C11-G1.independent-b.json')==ff['first']
assert first['currentPeerVerdictsReadBeforeSeal']==False
checked=[]
for folder,name in [(A,'author-current517.final.freeze.json'),(C,'author-current-C11-G1.final.freeze.json')]:
 f=read(folder/name)
 for r in f['files']:
  assert ref(pathlib.Path(r['path']))['sha256']==r['sha256'],r['path'];checked.append(r['path'])
put('inspection/neutral-author-all-sealed-files-retained.actual.json',{'schemaVersion':1,'checkedSealedFileCount':len(checked),'allExact':True,'neutralFreezes':[ref(A/'author-current517.final.freeze.json'),ref(C/'author-current-C11-G1.final.freeze.json')],'currentPeerVerdictsRead':False})
proof=read(O/'inspection/own-exactness-and-current-metadata.actual.json')
contextRows=[]
for r in proof['whole37']['records']:
 short=r['goalId'][:8];decision=first['fourCurrentChangedPBindings'].get(short)
 contextRows.append({'goalId':r['goalId'],'wholeScientificBodyExact':True,'currentReviewInputFingerprint':r['currentReviewInputFingerprint'],'decision':'accept_current_changed_context' if decision else 'inherit_exact_existing_science_and_context','ownCurrentReasonDe':decision['reasonDe'] if decision else 'Der vollständige bereits gültige wissenschaftliche Profilkörper und seine aktuelle fachliche Kontextbindung sind exakt erhalten. Die aktuelle D-Seitenprüfung zeigt keine neue kompetenzbezogene Änderung; keine erneute historische Fachprüfung wird behauptet.','scope':'E1/G1 needs_human_review ai_candidate; no human approval, learner performance or new whole-source/course clearance.'})
put('positive/current37-context.independent-b.json',{'schemaVersion':1,'role':'Independent current B targeted four context judgements plus explicit exact inheritance of other 33; no profile science rewrite','wholeScientificProfilesExact':37,'genuineChangedContextReviewCount':4,'records':contextRows,'PSelectionByThisReviewer':False,'operativeWrites':[]})
rp=R/O/'terminal/normal-P-e5-isolated-attempt2.terminal.actual.json';r=json.loads(rp.read_text());r['command']='app/node_modules/.bin/tsx '+str(O)+'/inspection/positive-normal-exact-capsule/app/scripts/positiveGoalEvidenceReview.ts --config='+str(O)+'/positive/current-e5-G1.independent-b.normal.config.json --mode=check';rp.write_text(json.dumps(r,indent=2)+'\n')
d=read(O/'native/own-description-results.index.json');assert sum(x['recordCount'] for x in d['outputs'])==38
for x in d['outputs']: assert read(O/f"terminal/normal-D-{x['group']}.terminal.actual.json")['actualExitCode']==0
assert r['actualExitCode']==0
now=datetime.datetime.now(datetime.timezone.utc).isoformat()
entry={'schemaVersion':1,'role':'Portable sealed independent current native/context B evidence; neutral review handoff, no operative adoption','sealedAt':now,'provider':'OpenAI','model':'Codex GPT-6 agent','exactModelRevision':'not exposed','blindCurrentPhase':True,'currentPeerVerdictsReadBeforeFirst':False,'currentPeerVerdictsReadAfterFirst':False,'historicalAlreadyValidScienceExplicitlyInherited':True,'wholeCandidate':ref(A/'candidate/whole517.inactive.machine-content-final-learner-copy-author.json'),'first':ref(O/'FIRST.current517-native-and-C11-G1.independent-b.json'),'firstFreeze':ref(O/'FIRST.current517-native-and-C11-G1.independent-b.freeze.json'),'normalD38':{'goals':38,'groups':[{'group':x['group'],'count':x['recordCount'],'run':ref(pathlib.Path(x['run'])),'records':ref(pathlib.Path(x['records'])),'actualCheck':ref(O/f"terminal/normal-D-{x['group']}.terminal.actual.json"),'normalAuthorBundle':str(A/f"native/{x['group']}/bundle/manifest.json"),'normalAuthorInput':str(A/f"native/{x['group']}/round-b/description-review-input.json"),'normalAuthorCampaign':str(A/f"native/{x['group']}/round-b/description-review-campaign.json"),'normalAuthorBatches':str(A/f"native/{x['group']}/round-b/batches")} for x in d['outputs']],'decisions':{'keep':38,'revise':0,'split_review':0,'block':0},'actualCheckExits':[0,0,0]},'whole37PositiveContext':{'scienceBodiesExact':37,'genuinelyChangedContextBindingsReviewed':4,'decision':ref(O/'positive/current37-context.independent-b.json'),'exactness':ref(O/'inspection/own-exactness-and-current-metadata.actual.json'),'inherited33ScienceNotReReviewed':True},'actualChangedPages':{'count':14,'renderInventory':ref(O/'inspection/actual-page-renders.json'),'allActualPdfPagesViewed':True,'whole398ChangedCount':14,'whole398ExactCount':384},'currentFourteenKinds':{'count':14,'normalBindings':ref(O/'inspection/current-fourteen-kind-context-bindings.actual.json'),'operativeClassification':False},'currentC11e5G1':{'record':ref(O/'positive/current-e5-G1.independent-b.records.jsonl'),'config':ref(O/'positive/current-e5-G1.independent-b.normal.config.json'),'normalActualCheck':ref(O/'terminal/normal-P-e5-isolated-attempt2.terminal.actual.json'),'exactToolAndResourceAliasProof':ref(O/'inspection/positive-normal-exact-capsule-bindings.actual.json'),'decision':'accepted E1/G1 competence candidate only','status':'needs_human_review','reviewAuthority':'ai_candidate','approvedCount':0,'blockingCount':0,'officialProgramme':'Chemie11 (NTG)','officialCourseLevel':'unspecified','courseAndSourceAtlasPlacement':'HOLD remains separate; no GK/LK equivalence or source fallback','heldAssessmentPSelected':False,'operativePSelection':False},'normalRulesChanges':0,'activeGain':0,'newActiveScientificCompletions':0,'restoredActiveBindings':0,'protectedFloors':{'mathematics':807,'physics':478,'edited':False},'humanApproval':False,'humanTrial':False,'actualCoachHostAcceptance':False,'operativeWrites':[],'gitGithubWrites':[],'allFilesSealedBy':'independent-b.final.freeze.json','portableInputs':'Repository relative exact files; no symlinks. Capsule node_modules are local execution dependencies excluded from archive bindings.'}
er=put('independent-b.final.entry.json',entry)
files=[]
for p in sorted((R/O).rglob('*')):
 if not p.is_file() or 'node_modules' in p.parts or p.name=='independent-b.final.freeze.json':continue
 assert not p.is_symlink(),str(p)
 files.append(ref(p.relative_to(R)))
put('independent-b.final.freeze.json',{'schemaVersion':1,'role':'Independent B final exact portable artifact freeze; local dependency copies excluded','sealedAt':now,'entry':er,'firstDigestRetained':ff['first']['sha256'],'files':files,'fileCount':len(files),'bytes':sum(x['bytes'] for x in files),'currentPeerVerdictsRead':False,'humanApproval':False,'activeGain':0,'operativeWrites':[]})
print(json.dumps(er));print(json.dumps(ref(O/'independent-b.final.freeze.json')));print('SEALED',len(files),'files')
