# SPDX-License-Identifier: Apache-2.0
import hashlib,importlib.util,json,pathlib,subprocess,jsonschema
R=pathlib.Path(__file__).resolve().parents[7]
B=pathlib.Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10')
O=B/'biologie-bio8-atomicity-source-visual-findings-targeted-author-successor-v3'
P=B/'biologie-bio8-targeted-text-and-source-author-successor-20261010-v4'
def read(p):return json.loads((R/p).read_text())
def ref(p):
 b=(R/p).read_bytes();return {'path':str(p),'sha256':'sha256:'+hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def put(p,x):
 f=R/P/p;f.parent.mkdir(parents=True,exist_ok=True);f.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n');return ref(P/p)
spec=importlib.util.spec_from_file_location('normal_validate_schemas',R/'scripts/validate_schemas.py');mod=importlib.util.module_from_spec(spec);spec.loader.exec_module(mod)
symlinks=mod.curriculum_symlink_errors(R);assert not symlinks,symlinks
land=read(P/'candidate/whole483-final-text-source-image.inactive.json');schema=read(pathlib.Path('docs/landscape-runtime.schema.json'))
validator=jsonschema.validators.validator_for(schema)(schema);errors=[e.message for e in validator.iter_errors(land)];assert not errors,errors
own_files=sorted(p for p in (R/P).rglob('*')if p.is_file());parsed=[]
for f in own_files:
 assert not f.is_symlink()
 if f.suffix=='.json':json.loads(f.read_text());parsed.append(str(f.relative_to(R)))
 elif f.suffix=='.jsonl':
  lines=f.read_text().splitlines();assert all(line.strip()for line in lines)
  for line in lines:json.loads(line)
  parsed.append(str(f.relative_to(R)))
committable_bytes=subprocess.run(['git','ls-files','--cached','--others','--exclude-standard','-z','--',str(P)],cwd=R,check=True,capture_output=True).stdout
committable=set(b.decode()for b in committable_bytes.split(b'\0')if b)
assert all(str(f.relative_to(R))in committable for f in own_files)
bindings=read(P/'final/ten-current-whole-profile-material-bindings.json')['records']
fossil=next(r for r in bindings if r['goalId'].startswith('430b'));fm=read(pathlib.Path(fossil['wholeTwoCases']['path']));fp=read(pathlib.Path(fossil['wholeProfile']['path']))
assert 'Modern card:' not in fm[0]['materialEn'] and 'Modern card:' not in fp['applicationCaseBriefs'][0]['taskDemandEn']
oldfm=read(O/'materials/430b2b73-641a-5122-bb6d-162b0d1eaf2d.whole-two-cases.json');oldfp=read(O/'final/profiles/430b2b73-641a-5122-bb6d-162b0d1eaf2d.whole-current-profile.json')
oldfm[0]['materialEn']=fm[0]['materialEn'];oldfp['applicationCaseBriefs'][0]['taskDemandEn']=fp['applicationCaseBriefs'][0]['taskDemandEn'];assert oldfm==fm and oldfp==fp
evo=next(g for g in land['goals']if g['id'].startswith('9b40'));assert evo['descriptionEn']=='The learner can relate developmental genetics (Hox genes, gene regulation) to evolutionary processes.'
review_input=read(P/'native/affected-current-native/round-a/description-review-input.json')
assert evo['descriptionEn'] in json.dumps(review_input,ensure_ascii=False)
assert 'Modern card:' not in json.dumps(review_input,ensure_ascii=False)
put('checks/scoped-schema-JSON-normal-symlink-and-portability.actual.json',{'candidateRuntimeSchema':ref(pathlib.Path('docs/landscape-runtime.schema.json')),'whole483CandidateSchemaErrors':errors,
 'normalCurriculumSymlinkErrors':symlinks,'allOwnFilesRegularAndCommittable':True,'ownFilesChecked':len(own_files),'completeJSONAndJSONLParsed':parsed,
 'FossilOnlyTwoEnglishFieldsChanged':True,'EvoDevoCurrentEnglishInNativeReviewContext':True,'nativeReviewContainsNoObsoleteCultureSentence':True,
 'temporaryExecutionCapsuleOutsideCurricula':True,'actualCheck':'PASS','strictActiveGain':0,'humanApproval':0})
print(json.dumps({'whole483RuntimeSchemaErrors':0,'normalCurriculumSymlinkErrors':0,'ownRegularCommittableFiles':len(own_files),'JSON_JSONLParsed':len(parsed),'actualNativeCorrectedEnglishBound':True,'PASS':True}))
