# SPDX-License-Identifier: Apache-2.0
"""Transport original D16 reviews; prepare no new scientific decisions."""
from pathlib import Path
import collections, datetime, hashlib, json, os, shutil

REPO = next(p for p in Path(__file__).resolve().parents if (p/'AGENTS.md').is_file())
OWN = Path(__file__).resolve().parents[1]
E15 = OWN.parent
NATIVE = E15/'chemie-equilibrium16-final-PNG-current422-native-preparation-technical-20261015-v2'
TEMPLATE = E15/'chemie-carbonyl15-native-paired12-with-three-open-technical-20261015-v1'

def dump(path, value):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2)+'\n')

def ref(path):
    b = path.read_bytes()
    return {'path':path.relative_to(REPO).as_posix(), 'sha256':'sha256:'+hashlib.sha256(b).hexdigest(), 'bytes':len(b)}

def main():
    assert not (OWN/'checks/TRANSPORT.exact-native-and-original-rounds.json').exists()
    for d in ['checks','config','originals/a','originals/b','native16']:
        (OWN/d).mkdir(parents=True, exist_ok=True)
    cfg = json.loads((NATIVE/'config/native16.normal-prepare-only.config.json').read_text())
    cfg['outputDirectory'] = (OWN/'native16').relative_to(REPO).as_posix()
    config_path = OWN/'config/native16.original-context-paired10.config.json'
    dump(config_path, cfg)
    source_manifest = json.loads((NATIVE/'native-sixteen/batch-manifest.json').read_text())
    relocated = dict(source_manifest)
    relocated['configPath'] = config_path.relative_to(REPO).as_posix()
    relocated['configDigest'] = ref(config_path)['sha256']
    dump(OWN/'native16/batch-manifest.json', relocated)
    assert [k for k in source_manifest if source_manifest[k] != relocated[k]] == ['configPath','configDigest']
    bundle_target = os.path.relpath(NATIVE/'native-sixteen/bundle', OWN/'native16')
    (OWN/'native16/bundle').symlink_to(bundle_target, target_is_directory=True)
    sources, original_copies, records, runs, authorities = [], [], {}, {}, {}
    native_refs = [ref(NATIVE/'native-sixteen/batch-manifest.json')]
    for p in sorted((NATIVE/'native-sixteen/bundle').rglob('*')):
        if p.is_file(): native_refs.append(ref(p))
    for side in 'ab':
        source = E15/f'chemie-equilibrium16-final-native-fresh-independent-{side}-20261015-v1'
        selector = source/('SELECTOR.final-independent-a.json' if side=='a' else 'INPUTS.finite-independent-b.selector.json')
        seal = source/('SEAL.final-independent-a.json' if side=='a' else 'FILES.finite-independent-b.seal.json')
        first = source/('D-FIRST.independent-science.md' if side=='a' else 'FIRST.d16.independent-b.json')
        first_seal = source/('D-FIRST.seal.json' if side=='a' else 'FIRST.d16.independent-b.seal.json')
        authority = json.loads(selector.read_text())
        authoritative = {r['path']:r for r in authority.get('artifacts',authority.get('refs',[]))}
        seal_data = json.loads(seal.read_text())
        if side=='a':
            assert ref(selector)['sha256'] == seal_data['sha256']
        else:
            assert next(x for x in seal_data['files'] if x['path']==ref(selector)['path']) == ref(selector)
        sources.extend([ref(selector),ref(seal),ref(first),ref(first_seal)])
        for p in [selector,seal,first,first_seal,source/'D-generation-parameters.json']:
            if p not in [selector,seal]:
                assert authoritative[ref(p)['path']]['sha256'] == ref(p)['sha256']
            dest = OWN/'originals'/side/p.name
            shutil.copyfile(p,dest)
            original_copies.append({'original':ref(p),'copy':ref(dest),'wholeBytesExact':p.read_bytes()==dest.read_bytes()})
        shutil.copytree(NATIVE/f'native-sixteen/round-{side}',OWN/f'native16/round-{side}')
        for p in sorted((NATIVE/f'native-sixteen/round-{side}').rglob('*')):
            if p.is_file():native_refs.append(ref(p))
        results = OWN/f'native16/round-{side}/results'; results.mkdir()
        for p in sorted((source/'D-results').glob('*')):
            assert p.is_file() and (p.name.endswith('.records.jsonl') or p.name.endswith('.run.json'))
            assert authoritative[ref(p)['path']]['sha256'] == ref(p)['sha256']
            dest = results/p.name; shutil.copyfile(p,dest)
            original_copies.append({'original':ref(p),'copy':ref(dest),'wholeBytesExact':p.read_bytes()==dest.read_bytes()})
        record_path = next(results.glob('*.records.jsonl'))
        records[side] = [json.loads(x) for x in record_path.read_text().splitlines()]
        runs[side] = json.loads(next(results.glob('*.run.json')).read_text())
        authorities[side] = ref(selector)
    assert all(x['wholeBytesExact'] for x in original_copies)
    assert [r['goalId'] for r in records['a']] == cfg['goalIds'] == [r['goalId'] for r in records['b']]
    assert all(r['blindToOtherRuns'] for r in runs.values())
    assert len({r['independenceGroupId'] for r in runs.values()}) == 2
    authoring = {'schemaVersion':1,'manifestId':'chemie-equilibrium16-original-independent-pair10-with-six-open-20261015-v1',
      'synthesizedBy':'Codex informed technical synthesizer of sealed original independent A/B; no new scientific vote or human approval',
      'decisions':[], 'deferredGoals':[]}
    overlap = []
    for a,b in zip(records['a'],records['b']):
        assert all(a[k]==b[k] for k in ['goalId','goalFingerprint','pageFingerprint','currentTitleDe','currentTitleEn','currentDescriptionDe','currentDescriptionEn','bookDigest','bundleFingerprint'])
        keep = a['decision']==b['decision']=='keep'
        de = ('Technische Paarung der unveränderten Originale: beidseitiges KEEP; ausschließlich die aktuelle Beschreibung bleibt erhalten. ' if keep else
              f"Zurückgestellt: Original A={a['decision']}, Original B={b['decision']}. Kein Konsens für eine Auflösung; Quellen-/Kursgrenzen und beide abweichenden Vorschläge bleiben offen. ")
        en = ('Technical pairing of unchanged originals: both KEEP; retain only the current description. ' if keep else
              f"Deferred: original A={a['decision']}, original B={b['decision']}. No resolution consensus; source/course limits and both proposed alternatives remain open. ")
        de += 'Keine P-/A-/M-/V-, Quellen-, Kurs- oder Humanfreigabe. Vollständige Originalbegründungen folgen ohne Kürzung. '
        en += 'No P/A/M/V, source, course or human approval. Complete original rationales follow without shortening. '
        for label,r in [('A',a),('B',b)]:
            de += f"\n{label} ({r['recordId']}), Originalbegründung: {r['rationale']}\n"
            en += f"\n{label} ({r['recordId']}), original rationale: {r['rationale']}\n"
            for name in ['essentialUnderstanding','observablePerformance','transferExpectation']:
                de += f"{label} {name}: {r['understandingEvidence'][name+'De']}\n"
                en += f"{label} {name}: {r['understandingEvidence'][name+'En']}\n"
        de, en = de.strip(), en.strip()
        assert len(de)<=4000 and len(en)<=4000,(a['goalId'],len(de),len(en))
        row={'goalId':a['goalId'],'rationaleDe':de,'rationaleEn':en}
        if keep:
            row.update(resolutionDecision='keep_current', evidenceRound='second')
            authoring['decisions'].append(row)
        else:authoring['deferredGoals'].append(row)
        overlap.append({'goalId':a['goalId'],'titleDe':a['currentTitleDe'],'firstDecision':a['decision'],'secondDecision':b['decision'],
                        'technicalDisposition':'keep_current' if keep else 'defer','sourceScopeBlockRetained':b['decision']=='block',
                        'firstRecordId':a['recordId'],'secondRecordId':b['recordId'],
                        'firstEvidenceProfileRecommendation':a.get('evidenceProfileRecommendation'),
                        'secondEvidenceProfileRecommendation':b.get('evidenceProfileRecommendation')})
    assert len(authoring['decisions'])==10 and len(authoring['deferredGoals'])==6
    dump(OWN/'native16/synthesis-authoring.json',authoring)
    dump(OWN/'checks/OVERLAP.original-D16-no-new-votes.json',{
        'role':'Mechanical original D decision pairing; no new scientific judgment','goalIds':cfg['goalIds'],
        'firstDecisionCounts':dict(collections.Counter(r['decision'] for r in records['a'])),
        'secondDecisionCounts':dict(collections.Counter(r['decision'] for r in records['b'])),
        'keepCurrentCount':10,'deferredCount':6,'sourceScopeBlocksRetained':4,'rows':overlap,
        'newScientificVotes':0,'newStrictClaims':0,'noSourceCourseHumanGrant':True,
        'normalRationalesIncludeBothCompleteOriginalRationalesAndBothUnderstandingChains':True,
        'maximumRationaleCharacters':max(len(x[k]) for x in authoring['decisions']+authoring['deferredGoals'] for k in ['rationaleDe','rationaleEn'])})
    source_map_path=NATIVE/'checks/REBUILD.native16.current338-exact-physical-map.json'
    inherited=json.loads(source_map_path.read_text())
    modules=[r for r in inherited['stockPhysicalModules'] if r['path']!='app/scripts/materializePositiveGoalEvidenceCandidates.ts']
    assert len(modules)==31
    portable={'schemaVersion':1,'role':'Original native16 D pair check-only portable host; no rendering or new votes',
      'ownRoot':OWN.relative_to(REPO).as_posix(),'sourceNativeV2PhysicalMap':ref(source_map_path),
      'normalPairedConfig':config_path.relative_to(REPO).as_posix(),
      'aliases':inherited['aliases'],'selectedCurrentAssetRows':inherited['selectedCurrentAssetRows'],
      'stockPhysicalModules':modules,'legacyQaDispositionDiscoveryInput':inherited['legacyQaDispositionDiscoveryInput'],
      'maximumRegularHostBytes':6500000,'physicalImageCopies':0,'physicalAssetPolicy':'all canonical and public asset aliases read exact immutable repository bytes',
      'newScientificVotes':0,'centralRuns':0,'earlierTemporaryHostDependency':False}
    dump(OWN/'checks/REBUILD.portable-check-only.physical-source-alias-map.json',portable)
    shutil.copyfile(TEMPLATE/'scripts/rebuild_portable_check_host.py', OWN/'scripts/rebuild_portable_check_host.py')
    dump(OWN/'checks/TRANSPORT.exact-native-and-original-rounds.json',{
      'role':'Exact transport of final Native16-v2 and two original independent D rounds; no scientific editing',
      'createdAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),
      'sourceNativeManifest':ref(NATIVE/'native-sixteen/batch-manifest.json'),
      'relocatedManifest':ref(OWN/'native16/batch-manifest.json'),
      'onlyNativeManifestChangedFields':['configPath','configDigest'],'bundleRelativeDirectorySymlink':bundle_target,
      'sourceRoundArtifactsCopiedExact':True,'originalCopies':original_copies,
      'sourceReviewSelectors':authorities,'originalNativeV2Artifacts':native_refs,
      'resolutionsPlanned':10,'deferralsPlanned':6,'newScientificVotes':0,'newStrictClaims':0})
    print(json.dumps({'keep':10,'defer':6,'sourceBlocks':4,'rationaleMax':max(len(x[k]) for x in authoring['decisions']+authoring['deferredGoals'] for k in ['rationaleDe','rationaleEn'])}))

if __name__=='__main__':main()
