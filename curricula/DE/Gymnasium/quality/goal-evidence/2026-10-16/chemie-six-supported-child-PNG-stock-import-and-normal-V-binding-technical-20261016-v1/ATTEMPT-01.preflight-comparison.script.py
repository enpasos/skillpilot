# SPDX-License-Identifier: Apache-2.0
"""Technical import of exact independently reviewed child PNGs; no scientific votes."""
from pathlib import Path
import copy, datetime, hashlib, json, os, shutil, subprocess, time
from PIL import Image
R=Path('/home/enpasos/projects/skillpilot')
H=R/'tmp/chemie-m7-resumed-20261016/current578-one-sparse-own-host-v1'
E=R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-16'
O=E/'chemie-six-supported-child-PNG-stock-import-and-normal-V-binding-technical-20261016-v1'
N=E/'chemie-six-supported-split-children-PNG-author-20261016-v1'
V=E/'chemie-six-split-child-PNGs-actual-independent-V-P-compatibility-20261016-v1'
F=V/'informed-rubber-v3-backbone'
logical='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'
logicalq='curricula/DE/Gymnasium/quality/goal-visualization-qa/chemie.qa.json'
provider='OpenAI / Codex built-in image_gen (model not exposed)'
def load(p):return json.loads(p.read_text())
def pin(p):
 b=p.read_bytes();return {'path':str(p.relative_to(R)),'sha256':'sha256:'+hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def put(p,x):
 assert not p.exists(),p
 p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n');return p
s=load(N/'NEUTRAL.actual-six-current-PNGs-whole-goals-and-twelve-cases.selector.json')
f=load(F/'OUTPUTS.final-finite-informed-rubber-v3-V-P-compatibility.selector.json')
assert f['allSixCurrentImagesSupported'] and f['currentRubberDecision']=='KEEP'
first=load(V/'FIRST.six-actual-images-and-whole-P-case-compatibility.science.frozen.json')
rubber=load(E/'chemie-split-rubber-backbone-targeted-PNG-author-successor-20261016-v3/NEUTRAL.targeted-rubber-backbone-actual-PNG.selector.json')
base=R/s['wholeAuthorGoalAndPrerequisiteSource']['path'];assert pin(base)['sha256']=='sha256:28e3b2eaa62e9fd4f2c61503fbdca4a3679adddad594a81553058738b191993d'
qp=E/'chemie-f0-supported-mobile-PNG-stock-import-and-normal-V-binding-technical-20261016-v1/QA449.f0-supported-current-mobile-image.other448-records-exact.json'
assert pin(qp)['sha256']=='sha256:cfb9e6c5f2ba2385ace23e64852dec85d278defe018a8556fbf1918082589049'
protected=[H/logical,H/logicalq,R/logical,R/logicalq]
before_protected=[{'path':str(p.relative_to(R)),'resolvedPath':str(p.resolve().relative_to(R)),'symlink':p.is_symlink(),'pin':pin(p)} for p in protected]
assert pin(H/logical)['sha256']=='sha256:1e515c907de34430525512da2faa5b7657dd1b12feda338cfb0b8455dc50353f'
assert pin(H/logicalq)==pin(qp) or pin(H/logicalq)['sha256']==pin(qp)['sha256']
before=load(base);master=load(H/logical);assert len(before['goals'])==584 and len(master['goals'])==578
bm={g['id']:g for g in before['goals']};assert all(bm[g['id']]==g for g in master['goals'])
current=[]
for im in s['images']:
 im=copy.deepcopy(im)
 if im['goalId']==rubber['goalId']:
  im['nativeImage']=rubber['nativeImage'];im['actualProviderPrompt']=rubber['actualProviderPrompt'];im['sciencePath']=str((F/'INFORMED.rubber-v3-actual-backbone.science.frozen.json').relative_to(R));im['reviewedAt']=load(R/im['sciencePath'])['reviewedAtUtc']
 else:
  row=next(r for r in first['rows'] if r['goalId']==im['goalId']);assert row['visualDecision']=='KEEP' and row['currentImageSHA256']==im['nativeImage']['sha256'];im['sciencePath']=str((V/'FIRST.six-actual-images-and-whole-P-case-compatibility.science.frozen.json').relative_to(R));im['reviewedAt']=first['frozenAtUtc']
 assert pin(R/im['nativeImage']['path'])==im['nativeImage'];assert pin(R/im['actualProviderPrompt']['path'])==im['actualProviderPrompt'];a=Image.open(R/im['nativeImage']['path']);assert a.format=='PNG' and a.size==(1672,941)
 current.append(im)
ids=[im['goalId'] for im in current]
roots=['curricula/DE/Gymnasium/visualizations/chemie','app/public/assets/goal-visualizations/chemie','backend/src/main/resources/static/assets/goal-visualizations/chemie']
guards=[]
def guard_target_file(p):
 assert p.is_relative_to(H),p
 for parent in p.parents:
  if parent==H:break
  assert not parent.is_symlink(),parent
  if parent.exists():assert parent.resolve().is_relative_to(H),parent
 assert not p.is_symlink(),p
 assert p.resolve().is_relative_to(H),p
for im in current:
 gid=im['goalId']
 for root in roots:
  d=H/root/gid
  assert not d.exists() and not d.is_symlink(),f'Own six leaf must be new: {d}'
  assert not (R/root/gid).exists(),f'Unexpected active normal child directory: {R/root/gid}'
  guard_target_file(d/f'{gid}.png');guards.append({'hostLeaf':str(d.relative_to(H)),'parentContainedInH':True,'preexistingDestination':False})
for name in ['goal_visualization_common.mjs','import_goal_visualization.mjs']:
 assert (H/'scripts'/name).read_bytes()==(R/'scripts'/name).read_bytes()
assert not (O/'CANONICAL.current584.six-supported-child-image-resource-links.stock-imported.json').exists()
canonical=O/'CANONICAL.current584.six-supported-child-image-resource-links.stock-imported.json';shutil.copyfile(base,canonical);assert canonical.is_file() and not canonical.is_symlink()
assert canonical.resolve().is_relative_to(O)
preflight=['node','--preserve-symlinks','--preserve-symlinks-main','--input-type=module','-e','import {ROOT_DIR} from '+json.dumps((H/'scripts/goal_visualization_common.mjs').as_uri())+';console.log(ROOT_DIR)']
p=subprocess.run(preflight,cwd=H/'app',capture_output=True,text=True);assert p.returncode==0 and p.stdout.strip()==str(H),(p.stdout,p.stderr)
put(O/'GUARDS.before-stock-writes.containment-and-normal-aliases.json',{'beforeProtected':before_protected,'newLeaves':guards,'preflightArgv':preflight,'preflightStdout':p.stdout,'preflightExitCode':p.returncode,'explicitCanonicalWriteTarget':str(canonical.relative_to(R)),'ownRegularCanonical':True,'normalAliasesWillNotBeInstalled':True})
alt={
ids[0]:'Poröser Zeolith mit festen negativen Gerüstladungen: Zwei bewegliche Natriumionen werden gegen ein Calciumion ausgetauscht. Ein Balken verdeutlicht begrenzte Enthärtungskapazität.',
ids[1]:'Symbolisches Tensid mit hydrophilem Kopf und hydrophobem Rest wird mikrobiell zunächst zu organischen Zwischenprodukten umgebaut. Weitere aerobe Schritte können zu Kohlenstoffdioxid und Wasser führen; die Bedingungen bleiben entscheidend.',
ids[2]:'Ein schematisches Triglycerid mit drei Estergruppen und Fettsäureresten steht neben Pflanzenquellen und den Beurteilungsfeldern Eigenschaften, Herkunft und Umweltfolgen für die Verwendung als Pflanzenölkraftstoff.',
ids[3]:'Vereinfachtes Gruppenmodell der Umesterung: Ein Triglycerid und drei Methanolbausteine ergeben drei getrennte Fettsäuremethylester und Glycerin mit drei OH-Gruppen. Feld und Transport verweisen auf die Systemgrenze.',
ids[4]:'Monomerbausteine verbinden sich zu beweglichen Polymerketten. In der Vernetzungsskizze verbinden gelbe Schwefelbrücken drei durchgehend rote Ketten; ein Gummiband verdeutlicht elastische Verformbarkeit.',
ids[5]:'Zwei Wege einer schematischen Cellulosekette: Regeneration erhält Cellulose als Viskose; chemische Modifikation ersetzt einige OH-Gruppen durch Acetatgruppen. Fäden und Gewebe zeigen die Textilverwendung.'}
receipts=[]
for index,im in enumerate(current,1):
 gid=im['goalId']
 for root in roots:
  guard_target_file(H/root/gid/f'{gid}.png')
 # All helper-write destinations are contained and are new files.
 for name in ['prompt.de.md','image-reconstruction-prompt.de.md']:
  guard_target_file(H/roots[0]/gid/name)
 cmd=['node','--preserve-symlinks','--preserve-symlinks-main',str(H/'scripts/import_goal_visualization.mjs'),gid,str(R/im['nativeImage']['path']),'--landscape',str(canonical),'--subject','chemie','--provider',provider,'--review-status','pilot','--license','CC-BY-4.0','--prompt',str(R/im['actualProviderPrompt']['path']),'--alt-text',alt[gid]]
 so=O/f'{index:02}.stock-import.stdout.actual.txt';se=O/f'{index:02}.stock-import.stderr.actual.txt';started=datetime.datetime.now(datetime.timezone.utc).isoformat();t=time.monotonic()
 with so.open('wb') as out,se.open('wb') as err:p=subprocess.run(cmd,cwd=H/'app',stdout=out,stderr=err)
 rec={'argv':cmd,'cwd':str((H/'app').relative_to(R)),'startedAtUTC':started,'completedAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'durationSeconds':time.monotonic()-t,'exitCode':p.returncode,'stdout':pin(so),'stderr':pin(se),'allSourcePublicBackendAndPromptParentsContainedHBeforeWrite':True}
 put(O/f'{index:02}.stock-import.execution.actual.json',rec);receipts.append(rec);assert p.returncode==0,se.read_text()
 for root in roots:
  q=H/root/gid/f'{gid}.png';guard_target_file(q);assert pin(q)['sha256']==im['nativeImage']['sha256']
 assert (H/roots[0]/gid/'prompt.de.md').is_file()
after=load(canonical);assert len(after['goals'])==584 and len({g['id'] for g in after['goals']})==584
am={g['id']:g for g in after['goals']};assert [g['id'] for g in after['goals']]==[g['id'] for g in before['goals']]
changes=[]
for g in before['goals']:
 a=am[g['id']]
 if g['id'] in ids:
  assert {k for k in g.keys()|a.keys() if g.get(k)!=a.get(k)}=={'resourceLinks'};assert not g.get('resourceLinks');changes.append({'goalId':g['id'],'wholeBefore':g,'wholeAfter':a,'changedFields':['resourceLinks']})
 else:assert a==g
assert len(changes)==6
stagecopies=[]
for im in current:
 gid=im['goalId'];src=H/roots[0]/gid/f'{gid}.png';dest=O/'staged'/roots[0]/gid/f'{gid}.png';dest.parent.mkdir(parents=True);shutil.copyfile(src,dest)
 prompt=dest.parent/'prompt.de.md';shutil.copyfile(H/roots[0]/gid/'prompt.de.md',prompt)
 copies=[pin(dest)]
 for root in roots[1:]:
  d=O/'staged'/root/gid/f'{gid}.png';d.parent.mkdir(parents=True);os.link(dest,d);copies.append(pin(d));assert not d.is_symlink()
 assert all(p['sha256']==im['nativeImage']['sha256'] for p in copies)
 stagecopies.append({'goalId':gid,'portableRegularAssetCopies':copies,'portablePromptMetadata':pin(prompt),'actualProviderPrompt':im['actualProviderPrompt'],'frozenScience':pin(R/im['sciencePath'])})
qa=load(qp);assert len(qa['records'])==449 and not set(ids)&{r['goalId'] for r in qa['records']};original=copy.deepcopy(qa)
for im in current:
 gid=im['goalId'];g=am[gid];link=g['resourceLinks'][0]
 row={'goalId':gid,'title':' '.join(g['title'].split()),'description':' '.join(g['description'].split()),'subject':'chemie','landscapeId':after['landscapeId'],'landscapePath':logical,'visualizationState':'available','missingReason':'','imageUrl':link['url'],'publicAssetPath':'app/public'+link['url'],'canonicalAssetPath':roots[0]+'/'+gid+'/'+gid+'.png','assetSha256':im['nativeImage']['sha256'],'umlautsCorrectChatGpt':'no','contentApprovedChatGpt':'no','humanApproved':'no','humanIssueIdentified':'no','humanIssueDescription':'','chatGptReviewedAt':None,'chatGptReviewer':'','chatGptNotes':'','humanReviewedAt':None,'humanReviewer':'','aiApproved':'yes','aiApprovedAssetSha256':im['nativeImage']['sha256'],'aiReviewedAt':im['reviewedAt'],'aiReviewer':'Codex independent actual image reviewer /root/chemie_mobile2_current_independent_a_20261016','aiNotes':'Actual native1672x941/360x203/680x383 visual and subject review plus bounded whole-profile/two-case compatibility supports this exact image. Schematic teaching support only, not real execution or learner performance. Frozen science: '+im['sciencePath']}
 qa['records'].append(row)
# Sort with the identical locale comparator used by the unchanged ledger generator.
unsorted=put(O/'QA455.six-new-supported-records.unsorted-before-stock-comparator.json',qa)
node=['node','-e','const fs=require("node:fs");const p=process.argv[1];const x=JSON.parse(fs.readFileSync(p,"utf8"));x.records.sort((a,b)=>a.title.localeCompare(b.title,"de-DE",{numeric:true,sensitivity:"base"})||a.goalId.localeCompare(b.goalId));fs.writeFileSync(process.argv[2],JSON.stringify(x,null,2)+"\\n");',str(unsorted),str(O/'QA455.six-new-child-images.original449-records-exact.json')]
p=subprocess.run(node,cwd=H/'app',capture_output=True,text=True);assert p.returncode==0,p.stderr
qa_path=O/'QA455.six-new-child-images.original449-records-exact.json';qa_sorted=load(qa_path);assert len(qa_sorted['records'])==455;assert [r for r in qa_sorted['records'] if r['goalId'] not in ids]==original['records']
put(O/'CAS6.whole-child-goals.before-and-stock-resource-link-after.json',{'schemaVersion':1,'role':'Exact whole-child CAS from own unadopted584 image-authoring base; resourceLinks only','canonicalBefore':pin(base),'canonicalAfter':pin(canonical),'unchangedExisting578WholeGoals':True,'current578CanonicalBefore':pin(H/logical),'parentClusterThreeAndFiveTextTwoImageFixesNotEdited':True,'rows':changes})
put(O/'PORTABLE.six-source-public-backend-regular-copies-and-frozen-science.json',{'schemaVersion':1,'copies':stagecopies,'noTmpDependentInputSymlinks':True,'provider':provider,'model':'not exposed','formatDecision':'Actual native1672x941 PNG close16:9; independently inspected native/360/680; no format exception.'})
for entry,p in zip(before_protected,protected):assert pin(p)==entry['pin'] and p.is_symlink()==entry['symlink'] and str(p.resolve().relative_to(R))==entry['resolvedPath'],p
assert pin(base)['sha256']=='sha256:28e3b2eaa62e9fd4f2c61503fbdca4a3679adddad594a81553058738b191993d';assert pin(qp)['sha256']=='sha256:cfb9e6c5f2ba2385ace23e64852dec85d278defe018a8556fbf1918082589049'
put(O/'OPERATIONS.actual-stock-six-imports-and-normal-V-bindings.json',{'schemaVersion':1,'role':'Pure technical serialization of already frozen genuine image science','canonical':pin(canonical),'QA':pin(qa_path),'commands':receipts,'allSixStockImportExitCodes':[r['exitCode'] for r in receipts],'actualRegularPortableCopies':stagecopies,'old449WholeQARowsExactlyRetained':True,'existing578WholeGoalsExactlyRetained':True,'new6WholeGoalChanges':['resourceLinks'],'protectedNormalAliasesBeforeAndAfterExact':before_protected,'helperModulePins':[pin(R/'scripts'/n) for n in ['goal_visualization_common.mjs','import_goal_visualization.mjs']],'newScienceVotes':0,'newFullPScienceVotes':0,'newDescriptionVotes':0,'HumanApproval':False,'HumanTrial':False,'activeAdoption':False})
print(json.dumps({'canonical':pin(canonical),'QA':pin(qa_path),'stockImportExitCodes':[r['exitCode'] for r in receipts],'all578Retained':True,'all449QARetained':True}),flush=True)
