# SPDX-License-Identifier: Apache-2.0
import datetime,hashlib,json
from pathlib import Path
R=Path('/home/enpasos/projects/skillpilot');B=R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-07';A=B/'biologie-q1-four-current390-native-source-operator-candidate-author-20261007-v1';O=B/'biologie-q1-four-current390-fresh-independent-b-20261007-v1'
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def read(p):return json.loads(p.read_text())
def item(p):return {'path':str(p.relative_to(R)),'sha256':sha(p),'bytes':p.stat().st_size}
def write(p,v):
 with p.open('x') as f:f.write(json.dumps(v,ensure_ascii=False,indent=2)+'\n')
freeze=A/'author.final.freeze.json';assert sha(freeze)=='4a11b0a483ef565b634a72f343a8794ec712ce4ba35215acf5a39484e8a6e410'
af=read(freeze);bad=[]
for x in af['payloads']+af['declaredInputs']:
 p=R/x['path']
 if not p.exists() or sha(p)!=x['sha256'] or p.stat().st_size!=x['bytes']:bad.append(x['path'])
assert not bad,bad
paths=[freeze,A/'README.md',A/'review-routing-and-current-native-contracts.author.json',A/'four-current-native-whole-goals-cases-source-review-input.author.raw.json',A/'native/four/book.pdf',A/'native/four/book-model.json',A/'native/four-source-context/book.pdf',A/'native/four-source-context/book-model.json',A/'native/four/bundle/review-bundle-manifest.json',A/'native/four/round-b/description-review-input.json',A/'native/positive-four.current-author-candidate.jsonl',A/'ST-three-actual-primary-stage-and-operator-binding.author.json',A/'retained-material/standard-code-sun.codon-data.actual.json',A/'retained-material/standard-code-sun.author-material.svg']
raw=read(A/'four-current-native-whole-goals-cases-source-review-input.author.raw.json')
paths.extend(R/x['path'] for x in raw['actualPrimaryAndFactualInputBindings']);paths.extend(sorted((A/'source-overlays-inert').glob('*.json')));paths.extend(sorted((A/'selected-existing-images').glob('*.png')))
paths.extend([R/'curricula/DE/Gymnasium/input/RP/Biologie_Gymnasium_RLP_2014.pdf'] if (R/'curricula/DE/Gymnasium/input/RP/Biologie_Gymnasium_RLP_2014.pdf').exists() else [])
# Source-inspection rasters are included in own payloads; their source PDF paths are bound by the sealed author inputs.
paths=list(dict.fromkeys(p for p in paths if p.exists()))
write(O/'inspected-input-bindings.actual.json',{'role':'Exact own inspected-input binding before new peer opinion exposure','authorFreeze':item(freeze),'authorPayloadsReverified':len(af['payloads']),'authorDeclaredSnapshotsReverified':len(af['declaredInputs']),'mismatches':bad,'inputs':[item(p) for p in paths],'currentPeerReportsRead':False,'humanApproval':False})
files=sorted(p for p in O.rglob('*') if p.is_file() and p.name!='own.first-pass.freeze.json')
write(O/'own.first-pass.freeze.json',{'schemaVersion':1,'createdAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'role':'Immutable fresh independent B first-pass seal before Root current Bio4 disagreement or peer report','reviewer':'/root/chem17_fresh_blind_a','authorFreezeSHA256':sha(freeze),'payloads':[item(p) for p in files],'payloadCount':len(files),'actualVerdicts':{'D':'KEEP4','P':'KEEP4 current candidate science','A':'atomic4','M':'no_memory_needed4','V':'KEEP4 at original and actual360/680','source':'KEEP bounded partial corrections; whole-source/partner HOLDs remain'},'currentPeerReportsReadBeforeSeal':False,'nativeCheckExitCodes':{'ownCampaignAndPSemantics':0,'DResults':0,'AAtomicity':0,'MMemory':0,'firstOrdinaryCLI':1},'humanApproval':False,'humanTrial':False,'activeWrites':False,'globalBuildOrCentralRun':False,'strictGain':0})
sf=O/'own.first-pass.freeze.json';print(json.dumps({'sealPath':str(sf.relative_to(R)),'sealSHA256':sha(sf),'payloadCount':len(files),'DRecordSHA256':sha(next((O/'native-d-b/results').glob('*.records.jsonl'))),'DRunSHA256':sha(next((O/'native-d-b/results').glob('*.run.json'))),'PScienceRecordSHA256':sha(O/'four-current-P-and-24-complete-component-case-science.independent-b.first-pass.json'),'VRecordSHA256':sha(O/'four-current-selected-images.independent-v-b.first-pass.json'),'sourceRecordSHA256':sha(O/'source-stage-operator-and-routes.independent-b.first-pass.json')}))
