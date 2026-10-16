# SPDX-License-Identifier: Apache-2.0
"""Read-only finite D16 pairing audit; never rerun synthesis or render."""
from pathlib import Path
import ast, datetime, hashlib, importlib.util, json, os
from jsonschema import Draft202012Validator

REPO=next(p for p in Path(__file__).resolve().parents if (p/'AGENTS.md').is_file())
OWN=Path(__file__).resolve().parents[1]

def load(p):return json.loads(p.read_text())
def ref(p):
    b=p.read_bytes()
    return {'path':p.relative_to(REPO).as_posix(),'sha256':'sha256:'+hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def verified(row):
    p=REPO/row['path'];actual=ref(p)
    assert actual['sha256']==row['sha256'] and ('bytes' not in row or actual['bytes']==row['bytes']),row['path']
    return p

def main():
    transport=load(OWN/'checks/TRANSPORT.exact-native-and-original-rounds.json')
    for row in transport['originalCopies']:
        a,b=verified(row['original']),verified(row['copy'])
        assert a.read_bytes()==b.read_bytes()
    for row in transport['originalNativeV2Artifacts']:verified(row)
    source=load(verified(transport['sourceNativeManifest']))
    relocated=load(verified(transport['relocatedManifest']))
    assert [k for k in source if source[k]!=relocated[k]]==['configPath','configDigest']
    bundle=OWN/'native16/bundle'
    assert bundle.is_symlink() and os.readlink(bundle)==transport['bundleRelativeDirectorySymlink']
    assert bundle.resolve().is_relative_to(REPO) and not os.path.isabs(os.readlink(bundle))
    portable=load(OWN/'checks/REBUILD.portable-check-only.physical-source-alias-map.json')
    refs=portable['stockPhysicalModules']+[r['physicalRepositorySource'] for r in portable['aliases']+portable['selectedCurrentAssetRows']]
    for row in refs:verified(row)
    assert len(portable['stockPhysicalModules'])==31 and len(portable['aliases'])==51 and len(portable['selectedCurrentAssetRows'])==435
    assert any(r['sha256']==portable['sourceFrozenCanonicalSha256'] for r in refs)
    assert any(r['sha256']==portable['sourceFrozenSemanticSha256'] for r in refs)
    host=REPO/portable['executionHost']
    for row in portable['stockPhysicalModules']:
        p=host/row['path']; assert not p.is_symlink() and p.read_bytes()==verified(row).read_bytes()
    for row in portable['aliases']:
        p=host/row['normalHostAlias'];assert not p.is_symlink() and p.read_bytes()==verified(row['physicalRepositorySource']).read_bytes()
    for row in portable['selectedCurrentAssetRows']:
        src=verified(row['physicalRepositorySource'])
        for key in ['normalCanonicalDestination','normalPublicDestination']:
            p=host/row[key];assert p.is_symlink() and p.resolve()==src.resolve()
    host_size=sum(p.stat().st_size for p in host.rglob('*') if p.is_file() and not p.is_symlink())
    assert host_size==5232655 and host_size<portable['maximumRegularHostBytes']
    records={s:[json.loads(x) for x in next((OWN/f'native16/round-{s}/results').glob('*.records.jsonl')).read_text().splitlines()] for s in 'ab'}
    spec=load(OWN/'native16/synthesis-authoring.json')
    index=load(OWN/'native16/resolution-index.json')
    expected_keep=[a['goalId'] for a,b in zip(records['a'],records['b']) if a['decision']==b['decision']=='keep']
    expected_defer=[a['goalId'] for a,b in zip(records['a'],records['b']) if not a['decision']==b['decision']=='keep']
    assert len(expected_keep)==10 and len(expected_defer)==6
    assert [r['goalId'] for r in index['resolutions']]==expected_keep and index['deferredGoalIds']==expected_defer
    assert [r['goalId'] for r in spec['decisions']]==expected_keep and [r['goalId'] for r in spec['deferredGoals']]==expected_defer
    byid={r['goalId']:r for r in spec['decisions']+spec['deferredGoals']}
    for a,b in zip(records['a'],records['b']):
        row=byid[a['goalId']]
        for r in (a,b):
            assert all(r['rationale'] in row['rationale'+lang] for lang in ['De','En'])
            for key,value in r['understandingEvidence'].items():
                assert value in row['rationale'+key[-2:]]
        assert all(len(row['rationale'+lang])<=4000 for lang in ['De','En'])
    stock=[]
    for n in ['native-check','native-summarize','native-synthesis','native-resolutions','native-finalize','native-final-check']:
        receipt=load(OWN/f'checks/{n}.command.actual.json');assert receipt['exitCode']==0;stock.append(receipt)
    portable_check=load(OWN/'checks/portable-stock-check.command.actual.json');assert portable_check['exitCode']==0
    parse_counts={'jsonFiles':0,'jsonlFiles':0,'jsonlRows':0,'pythonAST':0,'schemaInstances':0}
    schemas=set()
    def validate(value):
        if not isinstance(value,dict):return
        url=value.get('$schema','')
        prefix='https://skillpilot.com/schemas/'
        if url.startswith(prefix):
            path=REPO/'contracts'/url[len(prefix):]
            schema=load(path);Draft202012Validator(schema).validate(value)
            schemas.add(path.relative_to(REPO).as_posix());parse_counts['schemaInstances']+=1
    for p in sorted(OWN.rglob('*')):
        if p.is_symlink() or not p.is_file():continue
        if p.suffix=='.json':
            value=load(p);parse_counts['jsonFiles']+=1;validate(value)
        elif p.suffix=='.jsonl':
            rows=[json.loads(x) for x in p.read_text().splitlines() if x.strip()]
            parse_counts['jsonlFiles']+=1;parse_counts['jsonlRows']+=len(rows)
            for r in rows:validate(r)
        elif p.suffix=='.py':ast.parse(p.read_text(),filename=str(p));parse_counts['pythonAST']+=1
    module_path=REPO/'scripts/validate_schemas.py'
    module_spec=importlib.util.spec_from_file_location('stock_validate_schemas',module_path)
    module=importlib.util.module_from_spec(module_spec);module_spec.loader.exec_module(module)
    symlink_errors=module.curriculum_symlink_errors(str(REPO));assert not symlink_errors,symlink_errors
    result={'schemaVersion':1,'role':'Actual bounded read-only audit of original D16 pairing; no scientific decisions',
        'checkedAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),
        'nativeFrozenCanonicalSha256':portable['sourceFrozenCanonicalSha256'],'nativeFrozenSemanticSha256':portable['sourceFrozenSemanticSha256'],
        'keepCurrentGoalIds':expected_keep,'deferredGoalIds':expected_defer,
        'sourceScopeBlockGoalIds':[r['goalId'] for r in records['b'] if r['decision']=='block'],
        'profileRevisionRecommendationsPreservedFromOriginalD':[
            {'round':s,'goalId':r['goalId'],'recordId':r['recordId']} for s in 'ab' for r in records[s] if r.get('evidenceProfileRecommendation')=='revise'],
        'exactOriginalCopiesChecked':len(transport['originalCopies']),'originalDRecords':32,'originalRuns':2,
        'allOriginalRationalesAndUnderstandingPerformanceTransferChainsVerbatimInSynthesis':True,
        'maximumRationaleCharacters':max(len(r[k]) for r in byid.values() for k in ['rationaleDe','rationaleEn']),
        'stockPairingCommands':6,'stockPairingExitCodes':[x['exitCode'] for x in stock],
        'freshPortableStockCheckExitCode':portable_check['exitCode'],
        'regularHostBytes':host_size,'stockPhysicalModules':31,'exactPhysicalJsonAliases':51,'exactReadonlyAssetRows':435,
        'newImagesCopied':0,'newRenders':0,'parseCounts':parse_counts,'schemasRead':[ref(REPO/p) for p in sorted(schemas)],
        'stockSymlinkChecker':ref(module_path),'normalcurriculum_symlink_errors':symlink_errors,
        'stockSymlinkScope':'unchanged stock helper, repository read-only; own relative bundle alias additionally verified explicitly',
        'localTransportScriptFailuresPreserved':2,'stockPipelineFailures':0,
        'centralRuns':0,'newIndependentScienceVotes':0,'newPAMVOrHumanGrants':0,'newM7Claims':0,
        'strictDescriptionCompleteMeaning':'normal D-only technical completion on ten original same-context KEEP pairs; no holistic M7 or source/course acceptance'}
    print(json.dumps(result,ensure_ascii=False,indent=2))

if __name__=='__main__':main()
