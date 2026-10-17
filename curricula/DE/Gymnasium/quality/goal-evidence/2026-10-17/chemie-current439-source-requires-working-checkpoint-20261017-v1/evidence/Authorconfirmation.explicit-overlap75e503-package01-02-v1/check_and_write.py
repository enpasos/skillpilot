from pathlib import Path
import json, hashlib, copy, datetime

B = Path('/mnt/e/skillpilot-chemie-L7-20261017')
O = Path(__file__).parent
S = B/'explicit-overlap75e503-combination-preparation-technical-v1/SELECTOR.unapplied-explicit-overlap-combination.json'
H = lambda b: hashlib.sha256(b).hexdigest()
C = lambda x: json.dumps(x, ensure_ascii=False, sort_keys=True, separators=(',', ':')).encode()
D = lambda x: H(C(x))

def pin(p):
    p = Path(p); data = p.read_bytes()
    return {'path': str(p), 'sha256': H(data), 'bytes': len(data)}

def readpin(p):
    q = Path(p['path']); data = q.read_bytes()
    assert H(data) == p['sha256'] and len(data) == p['bytes'], q
    return json.loads(data)

assert H(S.read_bytes()) == '35de28f204412cc61a833f031f2868d76fcd00f6f52a22b08de705860937e04c'
s = json.loads(S.read_text())
assert s['wholeCAS']['sha256'] == 'ea31feb887e823930b88b620137dd966c7b0396e77a6797dbc05e5310cf03d9c'
cas = readpin(s['wholeCAS']); cl = readpin(s['cleanContentForLaterAuthorConfirmation'])
for pp in cl['inputPins'].values():
    got = pin(pp['path'])
    assert got['sha256'] == pp['sha256'] and got['bytes'] == pp['bytes']
a = readpin(cl['inputPins']['package01and02WholeCAS'])
b = readpin(cl['inputPins']['package06and07WholeCAS'])
a = {g['goalId']: g for g in a['ordinaryWholeGoalChanges']}
b = {g['goalId']: g for g in b['wholeObjects']}
cur = {g['id']: g for g in readpin(cl['inputPins']['actualCurrentC650'])['goals']}
orig = {g['id']: g for g in readpin(cl['inputPins']['originalC20'])['goals']}
pnow = {x['goalId']: x for x in map(json.loads, Path(cl['inputPins']['actualCurrentWholeP439']['path']).read_text().splitlines())}
pold = {x['goalId']: x for x in map(json.loads, Path(cl['inputPins']['originalWholeP439']['path']).read_text().splitlines())}
clean = {x['goalId']: x for x in cl['wholeGoalContent']}
assert len(cas['wholeGoalChanges']) == 2
assert cas['absoluteWholeFileGuard'] == cl['inputPins']['actualCurrentC650']
assert cas['otherWholeCanonicalGoalsToMutate'] == 0 and cas['wholePChanges'] == 0
assert cas['requiresChanges'] == 0 and cas['wholeViewChanges'] == 0
assert not cas['applyAuthorizedByThisPreparation'] and not cas['newCompilerInvocation']
check = []; recon = []
for row in cas['wholeGoalChanges']:
    gid = row['goalId']; base = orig[gid]; g = clean[gid]
    combined = row['combinedAfterWholeGoal']; aa = a[gid]; bb = b[gid]
    assert aa['before'] == bb['before'] == base == cur[gid]
    assert base == row['originalBaseWholeGoal'] == row['currentBaselineWholeGoal'] == g['originalWholeGoal'] == g['wholeCurrentBaselineGoal']
    assert aa['after'] == row['package01and02']['wholeAfter'] == g['wholePackage01and02After']
    assert bb['after'] == row['package06and07']['wholeAfter'] == g['wholePackage06and07After']
    assert combined == g['wholeProposedCombinedAfter'] == readpin(row['combinedAfterFile'])
    for label, source in [('package01and02', aa), ('package06and07', bb)]:
        assert row[label]['wholeBefore'] == source['before']
        assert row[label]['sourceBeforeDigest'].removeprefix('sha256:') == D(source['before'])
        assert row[label]['sourceAfterDigest'].removeprefix('sha256:') == D(source['after'])
    assert D(base) == row['currentBaselineWholeGoalDigest'] == row['originalBaseWholeGoalDigest']
    assert D(combined) == row['combinedAfterWholeGoalDigest']
    assert {k:v for k,v in combined.items() if k != 'extendedData'} == {k:v for k,v in base.items() if k != 'extendedData'}
    scopes = {'applicabilityOverrides', 'skillPilotAcquisitionExtensions'}
    assert {k:v for k,v in combined['extendedData'].items() if k not in scopes} == base['extendedData']
    assert combined['extendedData']['skillPilotAcquisitionExtensions'] == aa['after']['extendedData']['skillPilotAcquisitionExtensions'] + bb['after']['extendedData']['skillPilotAcquisitionExtensions']
    sourceRecon = {}
    for label, juris, source in [('package01and02', 'DE-HE', aa), ('package06and07', 'DE-NW', bb)]:
        rebuilt = copy.deepcopy(combined); ed = rebuilt['extendedData']
        ed['skillPilotAcquisitionExtensions'] = [x for x in ed['skillPilotAcquisitionExtensions'] if x['jurisdiction'] == juris]
        selected = [x for x in ed.get('applicabilityOverrides', {}).get('jurisdiction', []) if x == juris]
        if selected:
            ed['applicabilityOverrides'] = {'jurisdiction': selected}
        else:
            ed.pop('applicabilityOverrides', None)
        assert C(rebuilt) == C(source['after'])
        sourceRecon[label] = {'wholeGoalDigest': D(rebuilt), 'wholeObjectAndEveryStringExact': True, 'wholeAfter': rebuilt}
    expected = ['DE-HE'] if gid.startswith('75e2') else ['DE-HE', 'DE-NW']
    assert combined['extendedData']['applicabilityOverrides'] == {'jurisdiction': expected}
    assert combined['applicability'] == base['applicability'] and combined['requires'] == base['requires']
    assert pnow[gid]['profile'] == pold[gid]['profile'] == g['wholeUnchangedCurrentPositiveProfile']
    check.append({'goalId': gid, 'baseDigest': D(base), 'package01and02AfterDigest': D(aa['after']), 'package06and07AfterDigest': D(bb['after']), 'combinedAfterDigest': D(combined), 'bothSourceWholesReconstructExactly': True, 'bothSourceAnnotationObjectsExactAndOrdered': True, 'onlyChangedFields': ['extendedData.applicabilityOverrides', 'extendedData.skillPilotAcquisitionExtensions'], 'rawApplicabilityAndRequiresExact': True, 'wholeCurrentPBodyExact': True, 'profileBodyDigest': D(pnow[gid]['profile']), 'combinedDirectJurisdictionInputs': expected, 'NWTeacherDerivation': 'unchanged 503dedcb.requires -> 75e2eff1; no direct NW override on75e2eff1', 'wholeSourceReconstructionDigestsMatchOriginalCAS': True})
    recon.append({'goalId': gid, 'reconstructedSourceAfters': sourceRecon})
assert cur['503dedcb-0efc-5e6b-bbc9-20761a0951f5']['requires'] == ['75e2eff1-f871-5461-9e3f-26d0b333ce2f']
first = B/'nano-aromatics-and-methods-independent-a-v1/FIRST.independent-a.packages06-07.json'
firstseal = B/'nano-aromatics-and-methods-independent-a-v1/SEAL.independent-a.FIRST.json'
ownseal = B/'arrhenius-and-HE-practice-retained-target-scope-author-v1/SEAL.author-package01-02.json'
assert H(first.read_bytes()) == 'ce5d973947ec75d47eb87d5a9e1a73a938b626135124c276e6c6717bd113d056'
assert H(firstseal.read_bytes()) == '8142d13f64e652ad9aa8b72ae4defa326a0a46a75eb559b0b47f4817ec4d7df9'
assert H(ownseal.read_bytes()) == '1a87da6a115bb3f81e0d1402aca4ff2da7627dc8f3afb5ba11719cb5866ff28f'
now = datetime.datetime.now(datetime.timezone.utc).isoformat()

def write(n, v):
    p = O/n
    with p.open('x') as f:
        json.dump(v, f, ensure_ascii=False, indent=2); f.write('\n')
    return pin(p)

foreign = [pin(S), s['wholeCAS'], s['cleanContentForLaterAuthorConfirmation']] + list(cl['inputPins'].values()) + [x['combinedAfterFile'] for x in cas['wholeGoalChanges']] + [pin(first), pin(firstseal), pin(ownseal)]
reconstruction = write('CHECK.own-exact-whole-source-after-reconstruction.json', {'role': 'metadata-only author compatibility check; not independent scientific review', 'createdAtUTC': now, 'checks': check, 'wholeReconstructedSources': recon, 'foreignPins': foreign, 'applicationPerformed': False, 'compilerRun': False})
confirmation = {'role': 'Additive metadata compatibility confirmation by author of package01/02; no additional independent science vote', 'createdAtUTC': now, 'status': 'ai_candidate', 'humanReviewStatus': 'needs_human_review', 'decision': 'COMPATIBLE_METADATA_COMBINATION_ONLY', 'scope': 'Exactly two whole-goal objects75e2eff1/503dedcb in the pinned unapplied combination; original package01/02 remains immutable', 'proposedWholeCAS': s['wholeCAS'], 'baselineCanonical': cl['inputPins']['actualCurrentC650'], 'selector': pin(S), 'wholeContentInput': s['cleanContentForLaterAuthorConfirmation'], 'ownExactCheck': reconstruction, 'wholeGoalFindings': check, 'substantiveCompatibilityFindingDe': 'Beide ganzen Ziele behalten Wortlaut, eigene Frage-/Hypothesenleistung, Gegenbefunde, Theorie-/Modellgültigkeitsgrenzen, Requires, SekI/SekII-Tags, Rohgeltung, Bild-/Quellen-/Provenienzdaten und P-Bodys. HE bleibt eigener vorbereitender Erwerb für bestehende Endpunkte; quantitative schwache-Säure-Arbeit im HE-GK bleibt ausdrücklich eigene Vertiefung. NW bleibt eigener bereits authored Erwerb in den zwei vorhandenen NW-Ansichten. Beide Quellannotationen stehen wörtlich und in Quellreihenfolge nebeneinander, ohne amtliche Vollpflicht oder tatsächliche Wahl zu behaupten.503 hat beide direkten HE/NW-Eingaben;75e ausschließlich HE direkt und unverändert den tatsächlich vorhandenen NW-Lehrerweg über503.requires. Beschreibende Metadaten implementieren keinen Stufen-/Kursfilter.', 'boundaries': ['Confirms lossless compatibility of my own package01/02 annotations with06/07; not a new independent scientific approval of my own work.', 'My already sealed foreign06/07 FIRST and seal preceded any parent report of its peer root result and remain byte-exact unchanged. No peer report opened for this confirmation.', 'Each source whole-after is reconstructable exactly by retaining its HE or NW annotation and matching input. Sequential application of original whole-afters would discard other metadata and remains disallowed.', 'No new source rereading, full-source coverage, execution, laboratory, learner-choice or learner-performance claim. Prior practical/digital/independent-work requirements and open limits remain.', 'Does not apply CAS, run compiler, replace fingerprints, rewrite P/requires/rawApplicability, authorize integration or claim actual compiled after-state. Later guarded assembly and current binding remain separate.'], 'sourceInputsUnchanged': True, 'priorArtifactsUnchanged': True, 'independentScienceVoteAdded': False, 'sourceOrScienceLevelRaised': False, 'mainNormalL6L7OtherCapsulesMutated': False, 'applicationPerformed': False, 'compilerRun': False, 'M7': False, 'HumanApproval': False, 'HumanTrial': False, 'hostAcceptance': False, 'foreignInputPins': foreign, 'immutableAfterSeal': True}
write('AUTHORCONFIRMATION.explicit-overlap75e503.metadata-only.json', confirmation)
md = '''# Additive Autorenbestätigung:75e/503

**COMPATIBLE_METADATA_COMBINATION_ONLY — ai_candidate / needs_human_review.**

Rolle: Autor von Paket01/02; kein weiterer unabhängiger Sciencevote. Bestätigt werden ausschließlich die zwei vollständigen Objekte des gepinnten, unangewandten Whole-CAS.

- Beide Quell-Nachherobjekte sind aus der Kombination vollständig feld- und wortgleich rekonstruierbar. HE- und NW-Annotationen bleiben jeweils wörtlich; Quellen-/Kurs-/Wahlgrenzen bleiben erhalten.
- **503dedcb:** direkte Jurisdiktionseingaben HE und NW. **75e2eff1:** ausschließlich HE direkt; NW bleibt der echte Lehrerweg über die unveränderte `503dedcb.requires`-Kante. Kein eigenständiger NW-Override auf75e.
- Ganze Inhalte, Requires, rohe Geltung, Stufen-/Kurs-Tags, Bilder/Provenienz und aktuelle P-Bodys bleiben exakt gleich. HE-GK-Arbeit an quantitativen schwachen Säuren bleibt ausdrücklich eigener Zusatzumfang. Beschreibende Metadaten implementieren keinen neuen Laufzeitfilter.
- Tatsächliche Experimente, eigene Hypothesen/Produkte und bisher offene Prüfgrenzen bleiben erforderlich. Die Vereinigung belegt weder amtliche Vollabdeckung noch individuelle Wahl oder Lernendenleistung.

Mein früheres06/07-FIRST/Siegel und der eigene01/02-Autorstand bleiben unverändert. Das fremde FIRST war versiegelt, bevor der Parent den Root-Peerstatus mitteilte. Für diese Bestätigung wurde kein Peerbericht geöffnet.

Keine Anwendung, kein Compiler, keine P-/Requires-/Rohgeltungsänderung, keine Integrationsfreigabe und keine Native-/M7-/Human-/Hostabnahme. Später tatsächlich gemessene Kombination und Bindung bleiben getrennt. Die ursprünglichen Whole-Afters dürfen wegen gegenseitigen Überschreibens nicht nacheinander angewandt werden.

Exakte Datei-, Ganzobjekt- und Profilpins sowie vollständige rekonstruierte Quellobjekte stehen in den JSON-Artefakten.
'''
with (O/'AUTHORCONFIRMATION.explicit-overlap75e503.metadata-only.md').open('x') as f:
    f.write(md)
for pp in foreign:
    got = pin(pp['path'])
    assert got['sha256'] == pp['sha256'] and got['bytes'] == pp['bytes']
files = [pin(p) for p in sorted(O.iterdir()) if p.is_file()]
seal = write('SEAL.author-compatibility-confirmation.json', {'role': 'Immutable additive author compatibility confirmation; no independent science vote', 'createdAtUTC': now, 'status': 'ai_candidate', 'humanReviewStatus': 'needs_human_review', 'allOwnFilesBeforeSeal': files, 'foreignInputPins': foreign, 'laterChangesRequireAdditiveSuccessor': True, 'applicationPerformed': False, 'compilerRun': False, 'M7': False, 'HumanApproval': False})
with (O/'SEAL.sha256').open('x') as f:
    f.write(seal['sha256'] + '  SEAL.author-compatibility-confirmation.json\n')
for p in O.iterdir():
    if p.is_file(): p.chmod(0o444)
for n in ['AUTHORCONFIRMATION.explicit-overlap75e503.metadata-only.json', 'AUTHORCONFIRMATION.explicit-overlap75e503.metadata-only.md', 'CHECK.own-exact-whole-source-after-reconstruction.json', 'SEAL.author-compatibility-confirmation.json']:
    print(json.dumps(pin(O/n)))
