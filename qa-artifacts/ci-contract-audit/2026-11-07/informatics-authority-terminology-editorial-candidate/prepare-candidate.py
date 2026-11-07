#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""Prepare a finite two-string/three-file editorial successor,never apply it live."""
from pathlib import Path
import copy,json,hashlib,gzip,shutil,difflib,subprocess,datetime
ROOT=Path('/home/enpasos/projects/skillpilot');REL=Path('qa-artifacts/ci-contract-audit/2026-11-07/informatics-canonical-offering-authority-evidence-input');BASE=ROOT/REL;WORK=Path(__file__).parent
DEST=ROOT/'qa-artifacts/ci-contract-audit/2026-11-07/informatics-authority-terminology-editorial-candidate'
assert not DEST.exists(),'Do not overwrite an existing candidate'
sha=lambda b:hashlib.sha256(b).hexdigest()
original={p.name:p.read_bytes() for p in BASE.iterdir() if p.is_file()}
assert sha(original['catalog.json'])=='47150606060a89fbeb350996d979ee1983045437fcb78228d9249672bb5cac08'
assert sha(original['README.md'])=='a249c4b191a175c2d80ab4250b5ab17da2f7c8d2c8fa034c2411b5e7b1c72f68'
assert sha(original['local-context-excerpts.json'])=='acc65a6ed4a185fd951c5c737095f5d0466270de1f848775f464e085c93341ef'
inventory=json.loads(original['inventory.json']);assert original['inventory.json']==(json.dumps(inventory,ensure_ascii=False,indent=2)+'\n').encode()
for entry in inventory['files']:assert entry['sha256']==sha(original[entry['path']]) and entry['bytes']==len(original[entry['path']])
assert inventory['totalBytesExcludingInventory']==sum(len(v) for k,v in original.items() if k!='inventory.json')
# Private complete copies make byte-level nonchanges directly inspectable.
for stage in ('before','after'):
 for name,blob in original.items():
  p=WORK/stage/REL/name;p.parent.mkdir(parents=True,exist_ok=True);p.write_bytes(blob)
after=copy.deepcopy(original)
oldword='Kompetenzgraphen';newword='Skill-Graph';oldread=original['README.md'].decode()
assert oldread.count(oldword)==1;newread=oldread.replace(oldword,newword,1);assert oldread.splitlines()[4].count(oldword)==1
assert [(i,a,b) for i,(a,b) in enumerate(zip(oldread.splitlines(),newread.splitlines())) if a!=b]==[(4,oldread.splitlines()[4],newread.splitlines()[4])]
after['README.md']=newread.encode()
oldjson=json.loads(original['local-context-excerpts.json']);entry=oldjson['entries'][1];assert entry['id']=='N-AGENTS-CONVERGENCE'
oldpurpose='Shared canonical competence graph with state-scoped sources, reviewed composition and provenance route';newpurpose='Shared canonical skill graph with state-scoped sources, reviewed composition and provenance route'
assert entry['purpose']==oldpurpose
oldfragment='"purpose": '+json.dumps(oldpurpose,ensure_ascii=False);newfragment='"purpose": '+json.dumps(newpurpose,ensure_ascii=False)
text=original['local-context-excerpts.json'].decode();assert text.count(oldfragment)==1
after['local-context-excerpts.json']=text.replace(oldfragment,newfragment,1).encode()
newjson=json.loads(after['local-context-excerpts.json'])
def diff(a,b,path=''):
 if type(a)!=type(b):return [path]
 if isinstance(a,dict):
  assert set(a)==set(b);return [q for k in a for q in diff(a[k],b[k],path+'/'+str(k))]
 if isinstance(a,list):
  assert len(a)==len(b);return [q for i,(x,y) in enumerate(zip(a,b)) for q in diff(x,y,path+'/'+str(i))]
 return [] if a==b else [path]
assert diff(oldjson,newjson)==['/entries/1/purpose']
assert oldjson['structuredPayloads']==newjson['structuredPayloads']
for a,b in zip(oldjson['entries'],newjson['entries']):
 for key in ('exactContext','sourceSha256'):
  if key in a:assert a[key]==b[key]
newinventory=copy.deepcopy(inventory)
for entry in newinventory['files']:
 if entry['path'] in ('README.md','local-context-excerpts.json'):
  entry['bytes']=len(after[entry['path']]);entry['sha256']=sha(after[entry['path']])
newinventory['totalBytesExcludingInventory']=sum(len(v) for k,v in after.items() if k!='inventory.json')
after['inventory.json']=(json.dumps(newinventory,ensure_ascii=False,indent=2)+'\n').encode()
changed=[name for name in original if after[name]!=original[name]];assert sorted(changed)==['README.md','inventory.json','local-context-excerpts.json']
expectedInventoryDiffs=[]
for i,e in enumerate(inventory['files']):
 if e['path'] in ('README.md','local-context-excerpts.json'):expectedInventoryDiffs += [f'/files/{i}/bytes',f'/files/{i}/sha256']
expectedInventoryDiffs.append('/totalBytesExcludingInventory');assert set(diff(inventory,newinventory))==set(expectedInventoryDiffs)
for name,blob in after.items():(WORK/'after'/REL/name).write_bytes(blob)
# Proof by applying the actual patch to a separate RAM copy;no live paths changed.
patch=''.join(''.join(difflib.unified_diff(original[name].decode().splitlines(keepends=True),after[name].decode().splitlines(keepends=True),fromfile='a/'+str(REL/name),tofile='b/'+str(REL/name),n=1)) for name in changed)
patchfile=WORK/'editorial.patch';patchfile.write_text(patch)
applyroot=WORK/'patch-replay';shutil.copytree(WORK/'before',applyroot,dirs_exist_ok=True)
command=subprocess.run(['patch','--batch','-p1','-d',str(applyroot),'-i',str(patchfile)],text=True,capture_output=True)
assert command.returncode==0,(command.stdout,command.stderr)
for name,blob in after.items():assert (applyroot/REL/name).read_bytes()==blob
# Source21 and floor guard inputs are read-only;this finite prose edit requires no native rerun.
guards=json.load(open(ROOT/'qa-artifacts/ci-contract-audit/2026-11-07/informatics-q2-source-scope-material-implementation-candidate/final-input-guards.json'))['all21']
source21=[]
for item in guards:
 p=ROOT/item['path'];actual=sha(p.read_bytes());assert actual==item['sha256'];source21.append({'path':item['path'],'sha256':actual,'matchesExistingSourcePin':True})
floorpaths=['app/scripts/checkCurriculumMaturityFloors.ts','app/scripts/config/curriculum-maturity-floor-policy.json'];floors=[{'path':p,'sha256':sha((ROOT/p).read_bytes())} for p in floorpaths]
rows=[]
for name in changed:
 rows.append({'path':str(REL/name),'before':{'bytes':len(original[name]),'sha256':sha(original[name])},'after':{'bytes':len(after[name]),'sha256':sha(after[name])},'byteDelta':len(after[name])-len(original[name])})
mapobj={'kind':'exact three-file after-map;candidate only,not applied','files':{str(REL/name):after[name].decode() for name in changed}}
mapblob=gzip.compress((json.dumps(mapobj,ensure_ascii=False,indent=2)+'\n').encode(),mtime=0)
(WORK/'three-file-aftermap.json.gz').write_bytes(mapblob)
report={'kind':'finite terminology editorial candidate only','authoredChanges':[{'path':str(REL/'README.md'),'line':5,'old':oldword,'new':newword},{'path':str(REL/'local-context-excerpts.json'),'jsonPointer':'/entries/1/purpose','entryId':'N-AGENTS-CONVERGENCE','old':oldpurpose,'new':newpurpose}],'files':rows,'inventoryStructuralChanges':diff(inventory,newinventory),'inventoryTotals':{'before':inventory['totalBytesExcludingInventory'],'after':newinventory['totalBytesExcludingInventory'],'delta':newinventory['totalBytesExcludingInventory']-inventory['totalBytesExcludingInventory']},'exactlyOneJsonPurposeLeafChanged':diff(oldjson,newjson)==['/entries/1/purpose'],'exactContextAndSourceShaValuesUnchanged':True,'structuredPayloadsUnchanged':True,'catalogSha256Unchanged':sha(after['catalog.json']),'allOtherAuthorityPackageFilesByteIdentical':True,'source21':source21,'floorGuardInputs':floors,'patchReplay':{'exitCode':command.returncode,'stdout':command.stdout,'stderr':command.stderr,'exactAfterBytesForEntirePackage':True},'historicalDownstreamMeasurements':'ScopeAnalysis.provenance,final-input-integrity,and analysis-seal remain bound to the original observed files and inventory;this candidate does not relabel them','applicationBoundary':'Prepared only. Root must preserve originals in its Git checkpoint and record a separate editorial receipt before applying this three-file after-map.','noWhitelistExceptionOrBaseline':True,'noMaterialsChangedOrMaterialSuiteRerun':True}
(WORK/'three-file-hashmap-and-proof.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
# Recheck live authority originals and read-only guard files after all RAM mutations.
for name,blob in original.items():assert (BASE/name).read_bytes()==blob
for item in source21+floors:assert sha((ROOT/item['path']).read_bytes())==item['sha256']
DEST.mkdir(parents=True)
for name in ['prepare-candidate.py','editorial.patch','three-file-aftermap.json.gz','three-file-hashmap-and-proof.json']:shutil.copyfile(WORK/name,DEST/name)
readme='''# Endlicher redaktioneller Terminologie-Kandidat\n\nVorbereitet sind genau zwei neu verfasste Begriffskorrekturen: README.md:5 verwendet Skill-Graph; /entries/1/purpose in local-context-excerpts.json verwendet skill graph. Zusätzlich werden nur die zwei zugehörigen Inventareinträge und die berechnete Gesamtgröße aktualisiert.\n\n`three-file-aftermap.json.gz` enthält die vollständigen Afterbytes genau dieser drei Dateien als UTF-8-Strings. `editorial.patch` ist derselbe endliche Übergang. `three-file-hashmap-and-proof.json` nennt Before-/Afterhashes, Bytewerte und strukturelle Belege. Der Patch wurde auf einer weiteren RAM-Kopie angewendet; deren gesamte Paketdateien stimmen mit der vorgesehenen Afterkopie überein.\n\nDie aktiven Originale wurden nicht angefasst. exactContext, sourceSha256, strukturierte Payloads, amtliche Beobachtungen, Urteile und historische Guardlogs bleiben unverändert. catalog.json bleibt SHA25647150606060a89fbeb350996d979ee1983045437fcb78228d9249672bb5cac08. Alle21 kanonischen Sourcepins und die gelesenen Floor-Guarddateien sind unverändert. Material-, Native- oder265er-Referenzläufe sind für diese beiden erläuternden Strings nicht erforderlich.\n\nDieser Kandidat wird nicht selbst angewendet. Root sichert zuerst die ursprünglichen Pakete exakt im Gitcheckpoint und verankert den begrenzten Nachfolger mit einer separaten EditorialReceipt. Bestehende ScopeAnalysis.provenance-, final-input-integrity- und analysis-seal-Messungen bleiben Aussagen über die damals gelesenen Originalbytes; sie werden nicht auf die redaktionell neuen Dateien umetikettiert. Es wird keine Terminologieausnahme, Whitelist oder Baseline geschaffen.\n'''
(DEST/'README.md').write_text(readme)
files=[p for p in sorted(DEST.iterdir()) if p.is_file()];seal={'kind':'editorial candidate integrity only,not applied','createdAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'files':[{'path':p.name,'bytes':p.stat().st_size,'sha256':sha(p.read_bytes())} for p in files],'totalBytesBeforeSeal':sum(p.stat().st_size for p in files)}
(DEST/'candidate-seal.json').write_text(json.dumps(seal,ensure_ascii=False,indent=2)+'\n');assert sum(p.stat().st_size for p in DEST.iterdir())<100000
print(json.dumps({'destination':str(DEST),'totalBytes':sum(p.stat().st_size for p in DEST.iterdir()),'candidateSealSha256':sha((DEST/'candidate-seal.json').read_bytes()),'afterFiles':rows,'inventoryDelta':report['inventoryTotals'],'readmeCorrections':1,'purposeLeafCorrections':1,'originalsUnchanged':True,'source21AndFloorInputsUnchanged':True},ensure_ascii=False,indent=2))
