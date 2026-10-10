from pathlib import Path
from hashlib import sha256
from datetime import datetime,timezone
import json,struct,subprocess,sys

OUT=Path(__file__).resolve().parent
ROOT=next(p for p in OUT.parents if (p/'AGENTS.md').is_file())
AUTHOR=OUT.parent/'wirtschaft-current125-native-mapping-and-explicit-BE-course-author-20261009-v1'
INDEX=AUTHOR/'actual-twenty-three-exact-reviewed-Source25-images-current470-portable-transitive-index.author.json'
def read(p):return json.loads(p.read_text())
def bind(p):return {'path':str(p.relative_to(ROOT)),'sha256':sha256(p.read_bytes()).hexdigest(),'wholeBytes':p.stat().st_size}
def write(name,x):
    p=OUT/name
    with p.open('x') as f:f.write(json.dumps(x,ensure_ascii=False,indent=2)+'\n')
    read(p);return bind(p)
index=read(INDEX);records=index['records'];assert len(records)==23
inputs={INDEX,ROOT/index['basis']['path']}
for r in records:
    for key in ['actualPNG','exactNativePromptMetadata','originalSelectedPNG','originalProviderPrompt','independentActualVKEEP','originalTechnicalNativeImport']:
        b=r[key];p=ROOT/b['path'];inputs.add(p)
        assert bind(p)['sha256']==b['sha256'],(key,p)
        if p.suffix=='.json':read(p)
    assert r['freshVisualReviewClaimed'] is False and r['humanApproval'] is False
    assert r['newImageGeneration'] is False
guards=[bind(p) for p in sorted(inputs)]
targets=[];operations=[]
for r in records:
    gid=r['goalId'];assert len(gid)==36
    image=ROOT/r['actualPNG']['path'];prompt=ROOT/r['exactNativePromptMetadata']['path']
    body=image.read_bytes();assert body[:8]==b'\x89PNG\r\n\x1a\n' and body[12:16]==b'IHDR'
    size=list(struct.unpack('>II',body[16:24]));assert all(n>0 for n in size)
    for prefix,required in [('curricula/DE/Gymnasium/visualizations/wirtschaftswissenschaften',True),('app/public/assets/goal-visualizations/wirtschaftswissenschaften',True),('backend/src/main/resources/static/assets/goal-visualizations/wirtschaftswissenschaften',False)]:
        destination=ROOT/prefix/gid/(gid+'.png')
        existed=destination.exists()
        if existed:assert destination.read_bytes()==body,('Refusing overwrite of different existing image',destination)
        operations.append({'goalId':gid,'source':bind(image),'destination':str(destination.relative_to(ROOT)),
            'beforeExisted':existed,'before':bind(destination) if existed else None,'requiredCommittableReplayInput':required,
            'optionalIgnoredBackendMirror':not required,'format':'PNG','actualNativeSize':size})
        targets.append((destination,body,required))
    destination=ROOT/'curricula/DE/Gymnasium/visualizations/wirtschaftswissenschaften'/gid/'prompt.de.md'
    body=prompt.read_bytes();existed=destination.exists()
    if existed:assert destination.read_bytes()==body,('Refusing overwrite of different existing prompt',destination)
    operations.append({'goalId':gid,'source':bind(prompt),'destination':str(destination.relative_to(ROOT)),
        'beforeExisted':existed,'before':bind(destination) if existed else None,'requiredCommittableReplayInput':True,
        'optionalIgnoredBackendMirror':False,'exactExistingNativePromptMetadataBytesPreserved':True})
    targets.append((destination,body,True))
write('actual-before-Source23-input-hash-and-standard-target-state.guards.json',{'wholeInputs':guards,'targetStates':operations})
for destination,body,required in targets:
    if not destination.exists():
        destination.parent.mkdir(parents=True,exist_ok=True)
        with destination.open('xb') as f:f.write(body)
    assert destination.read_bytes()==body
for b in guards:assert bind(ROOT/b['path'])==b
after=[]
for row in operations:
    actual=bind(ROOT/row['destination']);assert actual['sha256']==row['source']['sha256']
    after.append({**row,'after':actual,'action':'KEEP-identical-existing' if row['beforeExisted'] else 'COPY-identical-foreign-reviewed-bytes'})
required=sorted(inputs|{p for p,b,r in targets if r}|{Path(__file__).resolve()})
ignore=subprocess.run(['git','check-ignore','--no-index','--']+[str(p.relative_to(ROOT)) for p in required],cwd=ROOT,capture_output=True,text=True)
assert not ignore.stdout.strip(),ignore.stdout
sys.path.insert(0,str(ROOT/'scripts'))
from validate_schemas import curriculum_symlink_errors
symlinks=curriculum_symlink_errors(ROOT);assert not symlinks,symlinks
manifest=write('actual-Source23-required-portable-input-and-copy-manifest.json',[bind(p) for p in required])
result=write('actual-final-Source23-exact-standard-PNG-and-prompt-transfer-with-KEEP-history.receipt.json',{
    'at':datetime.now(timezone.utc).isoformat(),'role':'Root bounded exact existing foreign-reviewed asset byte transfer, not fresh V or new generation',
    'sourceTransitiveIndex':bind(INDEX),'wholeExistingForeignReviewedImages':23,'wholeNativePNGTargetCopies':69,
    'wholeNativePromptMetadataCopies':23,'newPNGCopyFiles':sum(not x['beforeExisted'] and x.get('format')=='PNG' for x in after),
    'newCanonicalPromptFiles':sum(not x['beforeExisted'] and x.get('exactExistingNativePromptMetadataBytesPreserved',False) for x in after),
    'identicalExistingTargetsKEPT':sum(x['beforeExisted'] for x in after),'individualBeforeAfterExactOperations':after,
    'requiredPortableManifest':manifest,'wholeInputGuardsBeforeAfterExact':guards,
    'ignoredRequiredInputs':0,'curriculumSymlinkErrors':symlinks,
    'goodImagesOverwrittenOrReencoded':False,'newOrIndependentVisualApprovalClaimed':False,'humanApproval':False,
    'allOriginalForeignVAndCurrentContractLineagePreserved':True,
    'fullSource336QAOrCurrentPOrDualDescriptionCourseOrRegistryApproval':False,
    'liveCanonicalRegistryQAChanged':False,'runtimeSourceCodePrivacyPluginPublicationChanged':False,
    'strictCurrentCompleted':300,'strictCurrentAtomic':311,'newStrictAcademicClosures':0,'restoredStrictBindings':0,'strictNetGain':0,
    'nextStep':'Bind these identical public image bytes with their unchanged actual foreign KEEP receipts in the final stable current goal/context/P/QA frame; run AI inventory with stable final integration.'})
print(json.dumps({'receipt':result,'images':23,'PNGtargets':69,'newPNGfiles':63,'newCanonicalPrompts':21,'existingWholeTargetsKept':8,'ignoredRequiredInputs':0,'symlinkErrors':0,'strictNetGain':0}))
