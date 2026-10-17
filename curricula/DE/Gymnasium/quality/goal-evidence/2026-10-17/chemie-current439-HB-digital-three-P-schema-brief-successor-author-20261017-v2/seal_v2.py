import json,pathlib,hashlib
ROOT=pathlib.Path('/home/enpasos/projects/skillpilot');OUT=pathlib.Path(__file__).resolve().parent
def read(p):return json.loads(p.read_text())
def pin(p):return {'path':str(p.relative_to(ROOT)),'sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'bytes':p.stat().st_size}
def dump(n,x):(OUT/n).write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n')
pins=read(OUT/'INPUTS.pinned.json')
for p in pins:assert pin(ROOT/p['path'])==p,('Input changed',p['path'])
v1seal=read(ROOT/pins[0]['path'])
for p in v1seal['outputPins']:assert pin(ROOT/p['path'])==p,('Frozen author output changed',p['path'])
profiles=read(OUT/'AUTHOR.three-whole-profiles.schema-brief-v2.pending.json')['records'];delta=read(OUT/'DELTA.exact-nine-fields.before-after-charcounts.json')['fields'];ajv=read(OUT/'CHECKS.actual-Ajv2020-inner-profile-preflight.json')
assert len(profiles)==3 and len(delta)==9 and ajv['allValid'] and all(x['valid'] and not x['errors'] for x in ajv['records'])
original=read(ROOT/pins[1]['path'])['records'];originals={r['goalId']:r for r in original}
for r in profiles:
    old=originals[r['goalId']];restored=json.loads(json.dumps(r['profile']))
    assert r['goalExact']==old['goalExact']
    for d in delta:
        if d['goalId']==r['goalId']:
            i=int(d['path'].split('/')[-2]);k=d['path'].split('/')[-1]
            assert restored['applicationCaseBriefs'][i][k]==d['after']
            assert d['after'].startswith(d['preservedOldPrefix']) and len(d['after'])==d['afterChars'] and len(d['before'])==d['beforeChars']
            restored['applicationCaseBriefs'][i][k]=d['before']
    assert restored==old['profile']
maxall=max(len(v) for r in profiles for c in r['profile']['applicationCaseBriefs'] for v in c.values() if isinstance(v,str))
checks={'result':'PASS bounded exact-retention + actual Ajv2020 schema preflight','profileCount':3,'changedFieldCount':9,'allOriginalPreDigitalCasePrefixesRetainedExact':True,'onlyNineAppendedNewSummariesReplaced':True,'allOtherWholeProfileValuesExact':True,'fullMaterialsAndFrozenV1OutputsUnchanged':True,'changedFieldMaxChars':max(d['afterChars'] for d in delta),'allCaseBriefScalarMaxChars':maxall,'allScalarsWithinOriginal2000Limit':maxall<=2000,'actualContractFragmentAjvValidCount':3,'schemaRelaxed':False,'targetedIndependentFollowups':'pending_two','nativeWriterInvoked':False,'nativeFingerprintRebinding':False,'activeWrites':False,'gitOperations':False,'scienceOrHumanApprovalClaimed':False}
dump('CHECKS.exact-nine-field-retention-and-inputs.json',checks)
files=[p for p in sorted(OUT.iterdir()) if p.is_file() and not p.name.startswith('SELECTOR.')]
dump('SELECTOR.HB-digital-three-P-schema-brief-v2.pending.sealed.json',{'role':'Sealed technical AUTHOR v2, summary-only nine-field successor pending two targeted reviews','inputPins':pins,'outputPins':[pin(p) for p in files],'checks':checks})
print(json.dumps({'selector':pin(OUT/'SELECTOR.HB-digital-three-P-schema-brief-v2.pending.sealed.json'),'checks':checks}))
