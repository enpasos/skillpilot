# SPDX-License-Identifier: Apache-2.0
import json, hashlib, shutil, datetime
from pathlib import Path

OWN=Path(__file__).resolve().parent
ROOT=OWN.parents[6]
V3=OWN.parent/'biologie-q1-four-current383-source-scope-author-remediation-v3'
OLD_ISOLATE=ROOT/'tmp/biologie-q1-source-scope-remediation-native-20261006-v3'
ISOLATE=ROOT/'tmp/biologie-q1-source-scope-remediation-native-20261006-v4'
NOW=datetime.datetime.now(datetime.timezone.utc).isoformat()
def read(p):return json.loads(p.read_text())
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def write(p,d):p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n')
def rel(p):return str(p.relative_to(ROOT))

assert ROOT.name=='skillpilot'
assert not ISOLATE.exists(), 'Never reuse or mutate a frozen or existing isolation'
ISOLATE.mkdir(parents=True)
canonical=V3/'prospective-canonical.unchanged.snapshot.json'
write(OWN/'canonical-preserved.inert-envelope.json',dict(schemaVersion=1,role='inert author snapshot; not a discoverable landscape',
    originalSHA256=sha(canonical),preservedCanonicalUTF8=canonical.read_text(),canonicalWholeGoalsChanged=0,newAssignedCanonicalGoalIds=[]))
for name in ['positive-four.native-candidate-records.json','visualization-final-candidate-inputs.v3.json','prospective-four.semantic-kinds.snapshot.json','prospective-qa.no-approval.snapshot.json','standard-code-sun.author-material.svg','standard-code-sun.codon-data.actual.json','standard-code-sun.author-render.preview.png']:
    shutil.copyfile(V3/name,OWN/name)
relations=read(V3/'47-source-relations.before-after.author-candidate.json')
overlays=[]
for i,entry in enumerate(relations['mappingOverlays'],1):
    src=ROOT/entry['candidatePath'];out=OWN/'source-overlays-inert'/f'lane-{i:02d}.candidate-envelope.json'
    write(out,dict(schemaVersion=1,role='inert author mapping payload; materialize only in a separate tmp workspace',
                  replacesPath=entry['replacesPath'],v3CandidatePath=entry['candidatePath'],preservedV3BytesSHA256=sha(src),
                  candidatePayload=read(src),wholeSourceClosure=False))
    overlays.append(dict(replacesPath=entry['replacesPath'],envelopePath=rel(out),preservedV3PayloadExact=read(out)['candidatePayload']==read(src),v3PayloadSHA256=sha(src)))
source_paths={entry['sourceExtractionPath'] for entry in relations['mappingOverlays'] if '/quality/' in entry['sourceExtractionPath']}
sources=[]
for i,name in enumerate(sorted(source_paths),1):
    src=ROOT/name;out=OWN/'source-overlays-inert'/f'source-{i:02d}.candidate-envelope.json'
    write(out,dict(schemaVersion=1,role='inert source-extraction payload, not a discoverable landscape',v3SourcePath=name,
                  preservedV3BytesSHA256=sha(src),candidatePayload=read(src),wholeSourceClosure=False))
    sources.append(dict(v3SourcePath=name,envelopePath=rel(out),v3SHA256=sha(src)))
write(OWN/'thirteen-retained-partial-lanes.inert-payload-index.json',dict(mappingOverlays=overlays,sourcePayloads=sources,
    purpose='All v3 partial component bindings retained exactly. No null-ID is inserted into a runtime mapping. Replacement of held overbroad stages requires independently reviewed resolved IDs first.',
    rootMappingDirectoriesCreated=0,rawLandscapeFilesCreatedUnderQuality=0,activeWrites=0))

# Read only explicit native inputs from the frozen old private workspace. No broad repo copy.
receipt=read(V3/'source-atlas.native-technical.actual.json')
paths={x['path'] for x in receipt['inputBindings']}
paths.update(['app/scripts/config/goal-books/de-gym-biology-national-atlas.inputs.json',
              'app/scripts/config/goal-books/de-gym-biology-national-atlas.json',
              'curricula/DE/Gymnasium/quality/goal-visualization-qa/biologie.qa.json'])
qa=read(OLD_ISOLATE/'curricula/DE/Gymnasium/quality/goal-visualization-qa/biologie.qa.json')
for record in qa['records']:
    if record.get('visualizationState')=='available':
        paths.add('app/public'+record['imageUrl'])
copied=[]
for path in sorted(paths):
    src=OLD_ISOLATE/path;dst=ISOLATE/path
    assert src.is_file(), str(src)
    dst.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(src,dst)
    assert sha(src)==sha(dst)
    copied.append(dict(path=rel(dst),sourcePath=rel(src),sha256=sha(dst),bytes=dst.stat().st_size))
write(OWN/'native-physical-isolation.inputs.actual.json',dict(createdAtUTC=NOW,isolatePath=rel(ISOLATE),inputFiles=copied,
    fileCount=len(copied),bytes=sum(x['bytes'] for x in copied),method='Explicit 57 source bindings plus native config/QA/available primary assets only; regular files under tmp. Current native code is imported read-only.',
    historicalInputBytesChanged=0,activeWrites=0))
print(json.dumps(dict(inertMappingLanes=len(overlays),inertSourcePayloads=len(sources),copiedNativeInputs=len(copied),nativeBytes=sum(x['bytes'] for x in copied),activeWrites=0)))
