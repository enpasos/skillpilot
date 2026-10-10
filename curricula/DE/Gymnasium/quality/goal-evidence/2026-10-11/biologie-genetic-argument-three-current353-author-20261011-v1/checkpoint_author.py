# SPDX-License-Identifier: Apache-2.0
"""Seal the actually prepared state; unperformed author/review work stays HOLD."""
import copy, hashlib, importlib.util, json, pathlib, shutil, subprocess
from datetime import datetime, timezone
import jsonschema

ROOT=pathlib.Path('/home/enpasos/projects/skillpilot')
OUT=pathlib.Path(__file__).resolve().parent
REL=OUT.relative_to(ROOT)
IDS=['9540a95d-5ca5-527c-918f-d702e99be07a','5ee0f660-66f1-5aa6-a01d-e3b010db01ff','0f9318ec-90eb-5381-b670-8fb2f2789c3d']
IMAGE=ROOT/'curricula/DE/Gymnasium/quality/goal-visualization-review/biologie-genetic-argument-three-image-targeted-author-20261011-v1'
ENTRY='neutral-three-genetic-argument-author-checkpoint.entry.json'
def read(p): return json.loads(pathlib.Path(p).read_text())
def put(p,x):
    p=OUT/p; p.parent.mkdir(parents=True,exist_ok=True); p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n'); return ref(p)
def ref(p):
    p=pathlib.Path(p); p=p if p.is_absolute() else ROOT/p; b=p.read_bytes()
    return {'path':str(p.relative_to(ROOT)),'sha256':'sha256:'+hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def exact(p,dest):
    p=pathlib.Path(p); p=p if p.is_absolute() else ROOT/p; a=ref(p); dst=OUT/dest; dst.parent.mkdir(parents=True,exist_ok=True); shutil.copyfile(p,dst)
    b=ref(dst); assert a['sha256']==b['sha256']; return {'original':a,'regularExactCopy':b}

assert not (OUT/ENTRY).exists(),'A sealed checkpoint must not be overwritten'
# Correct the one uncommittable PDF locator before the first seal.
old=OUT/'primary/307f5d841072-book.pdf'; new=OUT/'primary/307f5d841072/bundle/book.pdf'
if old.exists():
    before=ref(old); new.parent.mkdir(parents=True,exist_ok=True); shutil.copyfile(old,new); assert ref(new)['sha256']==before['sha256']
    oldrel=str(old.relative_to(ROOT)); newrel=str(new.relative_to(ROOT))
    for p in OUT.rglob('*.json'):
        content=p.read_text()
        if oldrel in content: p.write_text(content.replace(oldrel,newrel))
    old.unlink()
else:
    assert new.is_file()
assert subprocess.run(['git','check-ignore',str(new.relative_to(ROOT))],cwd=ROOT,capture_output=True).returncode==1

image_entry=read(IMAGE/'neutral-three-argument-images-author.entry.json')
imagecopy=exact(IMAGE/'neutral-three-argument-images-author.entry.json','images/root-selected-three.entry.exact.json')
freeze_path=IMAGE/'FINAL.three-argument-images-author.freeze.json'
assert freeze_path.is_file()
freezecopy=exact(freeze_path,'images/root-selected-three.freeze.exact.json')
root_candidate=read(ROOT/image_entry['whole479ImageOnlyCandidate']['path']); root_goals={g['id']:g for g in root_candidate['goals']}
land=read(OUT/'candidate/whole483-before-three-images.inactive.json'); before=copy.deepcopy(land); gm={g['id']:g for g in land['goals']}
bindings=[]
for row in image_entry['selectedAssets']:
    i=row['goalId']; assert i in IDS
    goal=gm[i]; root_goal=root_goals[i]
    # Preserve the accepted v4 split route rather than importing the active image-production prerequisites.
    assert {k:v for k,v in goal.items() if k not in ['resourceLinks','requires']}=={k:v for k,v in root_goal.items() if k not in ['resourceLinks','requires']}
    before_requires=copy.deepcopy(goal['requires'])
    goal['resourceLinks']=copy.deepcopy(root_goal['resourceLinks'])
    assert goal['requires']==before_requires
    pngcopy=exact(row['PNG']['path'],f'images/{i}/{i}.png'); assert pngcopy['regularExactCopy']['sha256']==row['PNG']['sha256']
    metadata=exact(row['importedMetadata']['path'],f'images/{i}/prompt.de.md')
    prompt=exact(row['actualProviderPrompt']['path'],f'images/{i}/actual-provider-prompt.de.md')
    bindings.append({'goalId':i,'wholeV4GoalWithOnlyImageLinksImported':goal,'exactSelectedPNG':pngcopy,'exactNormalImportedMetadata':metadata,'exactProviderPrompt':prompt,'normalPublicURL':goal['resourceLinks'][0]['url'],'normalRootImageImportAlreadyExecuted':image_entry['normalImportProof'],'normalPOrNativeExecutedInThisPacket':False,'independentVisualApproval':False})
assert {g['id'] for g in before['goals'] if g!={q['id']:q for q in land['goals']}[g['id']]}==set(IDS)
assert all({k:v for k,v in gm[i].items() if k!='resourceLinks'}=={k:v for k,v in {g['id']:g for g in before['goals']}[i].items() if k!='resourceLinks'} for i in IDS)
candidate=put('candidate/whole483-v4-with-three-selected-image-links.inactive.json',land)
put('images/three-current-v4-image-technical-bindings.author.json',{'rootSelectedImageEntry':imagecopy,'rootSelectedImageFreeze':freezecopy,'wholeCandidate':candidate,'records':bindings,'other480WholeGoalObjectsExactToV4':True,'allThreeDescriptionsUnchanged':True,'allThreeV4PrerequisitesUnchanged':True,'9540PreexistingV4SplitRoute528Retained':True,'V4Requires9540IsDifferentFromRootActiveImageProductionInput':True,'noNewScientificClaim':True,'normalCurrentNativePagesNotMaterialized':True,'strictGain':0,'humanApproval':0})

holds=[
    {'gate':'AUTHOR_CASES','status':'HOLD','remaining':'No complete DE/EN application cases were authored in this checkpoint. Author two different complete material/task/worked-performance/rubric/fresh-transfer cases per existing goal; six in total. Separate general opportunity/risk discussion, ethically reasoned position and modern-method risk reasoning. Fictional data must be labelled.'},
    {'gate':'P3','status':'HOLD','remaining':'Create substantive full profiles from the six completed cases, then use the unchanged normal materializePositiveGoalEvidenceCandidates helper against this exact v4 goal/image input; ai_candidate/needs_human_review/E1/G1, approved0. No P3 record or normal P validation exists yet.'},
    {'gate':'NATIVE_D3','status':'HOLD','remaining':'Build normal affected-three native HTML/PDF from this exact whole483 candidate with the complete P3 profiles and exact selected rasters in an execution capsule outside curricula. Actually view the complete three HTML/PDF pages. No native artifact or page review was produced here.'},
    {'gate':'A_M_CURRENT_BINDINGS','status':'HOLD','remaining':'The original current A3/M3 rows are copied exactly. Check normal fingerprints and materialize candidate bindings where required, especially 9540.requires528 after the already authored Bio8-v4 split. These exact historical records are not claimed to approve the changed v4/image input.'},
    {'gate':'SOURCE','status':'HOLD','remaining':'Review the bounded actual RP TF11 argument duty against the finished six performance contracts and existing current BY/HE/RP compiled scopes. Retain f53 theory-only partial without crediting it with argument performance; no whole-source or whole-course approval.'},
    {'gate':'INDEPENDENT_D_P_V_SOURCE','status':'HOLD','remaining':'Two genuine independent reviews of the exact completed three goal/profile/material/native/image/source products remain necessary. No independent or human acceptance is supplied by this author checkpoint.'}
]
put('continuation-and-open-gates.json',{'role':'sealed author preparation checkpoint; incomplete author packet','goalIds':IDS,'holds':holds,'nextConcreteStep':'Author six complete DE/EN cases; do not route this incomplete checkpoint to an approving independent review. Continue additively in a new namespace while retaining these sealed bytes.','reviewAuthorityIntended':'ai_candidate','statusIntended':'needs_human_review','evidenceLevelIntended':'E1','maximumClaimScopeIntended':'G1','actualNewPositiveProfiles':0,'actualNewNativePages':0,'newScientificCompletions':0,'strictGain':0,'humanApproval':0,'humanTrial':0,'activeWrites':[],'gitWrites':[],'githubWrites':[]})

# Normal schemas use their declared draft (2020-12 where declared).
schema_results=[]
for path,schema_path in [('candidate/whole483-before-three-images.inactive.json','docs/landscape-runtime.schema.json'),('candidate/whole483-v4-with-three-selected-image-links.inactive.json','docs/landscape-runtime.schema.json')]:
    schema=read(ROOT/schema_path); validator=jsonschema.validators.validator_for(schema)(schema); errors=[e.message for e in validator.iter_errors(read(OUT/path))]; assert not errors,errors
    schema_results.append({'artifact':ref(OUT/path),'schema':ref(ROOT/schema_path),'declaredDraft':schema.get('$schema'),'errors':errors})
schema_by_name={'A3.current-exact.jsonl':'contracts/semantic-atomicity/v1/semantic-atomicity-review-record.schema.json','M3.current-exact.jsonl':'contracts/memory-card-review/v1/memory-card-review-record.schema.json'}
for name,schema_path in schema_by_name.items():
    sp=ROOT/schema_path
    if sp.exists():
        schema=read(sp); validator=jsonschema.validators.validator_for(schema)(schema); rows=[json.loads(l) for l in (OUT/'atomicity-memory'/name).read_text().splitlines()]; errors=[e.message for row in rows for e in validator.iter_errors(row)]; assert not errors,errors
        schema_results.append({'artifact':ref(OUT/'atomicity-memory'/name),'schema':ref(sp),'declaredDraft':schema.get('$schema'),'records':len(rows),'errors':errors})
spec=importlib.util.spec_from_file_location('normal_validate_schemas',ROOT/'scripts/validate_schemas.py'); mod=importlib.util.module_from_spec(spec); spec.loader.exec_module(mod)
symlinks=mod.curriculum_symlink_errors(ROOT); assert not symlinks,symlinks
parsed=[]
for p in sorted(OUT.rglob('*')):
    if not p.is_file(): continue
    assert not p.is_symlink()
    if p.suffix=='.json': json.loads(p.read_text()); parsed.append(str(p.relative_to(ROOT)))
    elif p.suffix=='.jsonl':
        assert p.read_bytes().endswith(b'\n')
        for l in p.read_text().splitlines(): assert l.strip(); json.loads(l)
        parsed.append(str(p.relative_to(ROOT)))
files=[p for p in OUT.rglob('*') if p.is_file()]
ignored=[]
for p in files:
    if subprocess.run(['git','check-ignore',str(p.relative_to(ROOT))],cwd=ROOT,capture_output=True).returncode==0: ignored.append(str(p.relative_to(ROOT)))
assert not ignored,ignored
put('checks/normal-schema-JSON-and-portability.actual.json',{'normalSchemaResults':schema_results,'completeJSON_JSONLParsed':parsed,'allOwnFilesRegular':True,'normalCurriculumSymlinkErrors':symlinks,'ownIgnoredFiles':ignored,'ownFilesInspected':len(files),'noExecutionCapsulesInsideCurricula':True,'noNormalPOrNativeCheckClaim':True,'actualCheck':'PASS for prepared files only','scientificApproval':False})
oldguard=read(OUT/'checks/root-guard.before.json'); newguards=[]
for b in oldguard['bindings']:
    now=ref(b['path']); assert now==b,(b,now); newguards.append(now)
put('checks/root-guard.after.actual.json',{'bindings':newguards,'allPreparedActiveRootBindingsUnchanged':True,'protected353NoEdits':True,'activeWrites':[],'strictGain':0,'humanApproval':0})
readme='''# Argument3 – versiegelter Autoren-Zwischenstand

Dieser Stand enthält vorbereitete reguläre Eingaben, keine abgeschlossene fachliche Autorenarbeit und keine unabhängige Freigabe.

- Drei bestehende Zieltexte/IDs bleiben erhalten. Der bereits in Bio8 v4 geänderte 9540-Prerequisite `528a3cd3` bleibt bestehen; die aktive Bildproduktion verwendete noch `d11b3b18`. Dieser Unterschied muss in der nächsten echten D/P/A-Prüfung berücksichtigt werden.
- Finale drei Root-Bildkandidaten und Metadaten sind als identische reguläre Kopien technisch an den ganzen V4-Kandidaten gebunden. Alle anderen 480 Goalobjekte bleiben exakt erhalten.
- Aktuelle A3/M3-Historien, aktuelle P3-Abwesenheit, BY/HE/RP-Mitgliedschaften, ganze RP-Quellzeile/Partnerentscheidung und Primärseite sind gebunden. Der Argumentlocator ist sachlich auf gedruckt44/physisch46 korrigiert. f53 behält ausschließlich seinen gültigen Theoriebeitrag; die Teilabbildung wird nicht zur Vollabdeckung.
- Noch fehlen alle sechs vollständigen DE/EN-Fallprodukte, die P3-Profile/Normalmaterialisierung, neue ganze Native3-HTML/PDF-Seiten mit tatsächlicher Sichtung, aktuelle A/M-Bindungsprüfung sowie die unabhängigen D/P/V/SOURCE-Prüfungen. Diese Gates stehen ausdrücklich HOLD.
- Die vorhandenen JSON-/Landschaftsschemas, regulären Dateien, Kommittierbarkeit und der normale ROOT-Symlinkguard sind geprüft. P/native wurden nicht ausgeführt. Aktiv/CAN/Registry/Git/GitHub bleiben unverändert; strictGain0, human0.

## Fortsetzung

`continuation-and-open-gates.json` nennt die konkreten nächsten Schritte. Zuerst sechs vollständige DE/EN-Fälle erstellen, danach normale P3 und Native3 auf genau diesem V4-Prerequisite-/Bildkontext materialisieren und tatsächlich prüfen. Neue Arbeit additiv in einem neuen Namespace ablegen; diese Seal-Bytes erhalten. Keine zusätzlichen Partnerpakete beginnen und keinen ungeprüften strict-Zuwachs behaupten.
'''
(OUT/'README.md').write_text(readme)
artifacts=[ref(p) for p in sorted(OUT.rglob('*')) if p.is_file() and p.name not in [ENTRY,'neutral-three-genetic-argument-author-checkpoint.freeze.json','FINAL.json']]
entry=put(ENTRY,{'schemaVersion':1,'role':'neutral portable author preparation checkpoint; not complete author/review evidence','goalIds':IDS,'wholeV4CandidateWithThreeSelectedImages':candidate,'preparedInputs':artifacts,'rootImageEntry':imagecopy,'rootImageFreeze':freezecopy,'continuation':ref(OUT/'continuation-and-open-gates.json'),'preparedSchemaPortabilityChecks':ref(OUT/'checks/normal-schema-JSON-and-portability.actual.json'),'rootGuard':ref(OUT/'checks/root-guard.after.actual.json'),'authorCases':0,'positiveProfiles':0,'nativePages':0,'independentApprovals':0,'scientificCompletionClaim':False,'strictGain':0,'humanApproval':0,'humanTrial':0,'activeWrites':[],'gitWrites':[],'githubWrites':[]})
final=put('FINAL.json',{'status':'FINAL_AUTHOR_PREPARATION_CHECKPOINT_WITH_HOLD_GATES','entry':entry,'holds':holds,'normalPreparedFileChecks':'PASS','normalPValidation':'NOT_RUN','normalNativeBuildAndInspection':'NOT_RUN','scientificApproval':False,'strictGain':0,'humanApproval':0})
freeze=put('neutral-three-genetic-argument-author-checkpoint.freeze.json',{'schemaVersion':1,'freezeKind':'byte-exact-prepared-author-checkpoint','createdAt':datetime.now(timezone.utc).isoformat(),'entry':entry,'final':final,'files':[ref(p) for p in sorted(OUT.rglob('*')) if p.is_file() and p.name!='neutral-three-genetic-argument-author-checkpoint.freeze.json'],'completedAuthorPacket':False,'pendingGates':holds,'strictGain':0,'humanApproval':0})
print(json.dumps({'entry':entry,'final':final,'freeze':freeze,'filesSealed':len(read(OUT/'neutral-three-genetic-argument-author-checkpoint.freeze.json')['files']),'normalPreparedFileChecks':'PASS','P3':'HOLD_NOT_AUTHORED','Native3':'HOLD_NOT_RUN','independentReviews':'HOLD','strictGain':0,'humanApproval':0},ensure_ascii=False))
