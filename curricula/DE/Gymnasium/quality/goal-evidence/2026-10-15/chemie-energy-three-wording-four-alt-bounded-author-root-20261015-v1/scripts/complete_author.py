from pathlib import Path
import copy, json, hashlib

REPO = Path.cwd()
OWN = Path(__file__).resolve().parents[1]
REL = OWN.relative_to(REPO).as_posix()
V3 = REPO / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-15/chemie-energy20-nernst-alt-context-author-and-native-final-preparation-20261015-v1'

def sha(p): return 'sha256:' + hashlib.sha256(p.read_bytes()).hexdigest()
def art(p): return {'path': p.relative_to(REPO).as_posix(), 'sha256': sha(p), 'bytes': p.stat().st_size}
def write(p, d):
    p.parent.mkdir(parents=True, exist_ok=True)
    assert not p.exists(), p
    p.write_text(json.dumps(d, ensure_ascii=False, indent=2) + '\n')

assert not (OWN/'FILES.finite-bounded-author.seal.json').exists()
canon = OWN/'candidate/canonical560.current422.three-wording-four-alt.author.json'
assert sha(canon) == 'sha256:e36d631c46c019466478d2f4a900ae0b5161d52b52e85bb6e701aadf7ee90545'
originals = [art(p) for p in sorted(OWN.rglob('*')) if p.is_file() and 'scripts' not in p.relative_to(OWN).parts]
cases_path = V3/'materials/forty-two-whole-DE-EN-cases.exact-no-change.json'
cases = {c['id']: c for c in json.loads(cases_path.read_text())['cases']}
profiles_path = V3/'candidate/twenty-author-E0G0.only-Nernst-input-binding.jsonl'
lines = profiles_path.read_text().splitlines(keepends=True)
profiles = [json.loads(l) for l in lines]
case_changes = []
for cid in ['energy20-02-a', 'energy20-05-b']:
    before = cases[cid]
    after = copy.deepcopy(before)
    if cid == 'energy20-02-a':
        assert 'Beschreibe Laden/Entladen' in after['taskDe']
        assert 'Describe charging/discharging' in after['taskEn']
        after['taskDe'] = after['taskDe'].replace('Beschreibe Laden/Entladen', 'Erläutere Laden/Entladen')
        after['taskEn'] = after['taskEn'].replace('Describe charging/discharging', 'Explain charging/discharging')
    else:
        a, b = after['criterionToObservableRubric'][:2]
        assert a['criterionId'] == 'e1' and b['criterionId'] == 'e2'
        for lang in ['De', 'En']:
            a['observable'+lang], b['observable'+lang] = b['observable'+lang], a['observable'+lang]
    path = OWN/'materials'/(cid+'.whole-targeted-author-successor.json')
    write(path, after)
    case_changes.append({'caseId': cid, 'wholeBefore': before, 'wholeAfter': after, 'successor': art(path), 'sourceOriginal42': art(cases_path)})
    record = next(p for p in profiles if p['goalId'] == after['goalId'])
    brief = next(c for c in record['profile']['applicationCaseBriefs'] if c['id'] == cid)
    brief['taskDemandDe'] = 'Ganzes eigenes gezieltes Material '+path.relative_to(REPO).as_posix()+' #'+cid+','+sha(path)+'. '+after['taskDe']
    brief['taskDemandEn'] = 'Whole own targeted material '+path.relative_to(REPO).as_posix()+' #'+cid+','+sha(path)+'. '+after['taskEn']
    if cid == 'energy20-05-b':
        for lang in ['De','En']:
            e1, e2 = record['profile']['expectations'][:2]
            assert e1['id']=='e1' and e2['id']=='e2'
            old1 = next(r for r in before['criterionToObservableRubric'] if r['criterionId']=='e1')['observable'+lang]
            old2 = next(r for r in before['criterionToObservableRubric'] if r['criterionId']=='e2')['observable'+lang]
            e1['observablePerformance'+lang] = e1['observablePerformance'+lang].replace(cid+': '+old1,cid+': '+old2)
            e2['observablePerformance'+lang] = e2['observablePerformance'+lang].replace(cid+': '+old2,cid+': '+old1)
raw = OWN/'candidate/twenty-author-E0G0.two-targeted-briefs-four-input-bindings.jsonl'
raw.parent.mkdir(exist_ok=True)
assert not raw.exists()
raw.write_text(''.join(json.dumps(p, ensure_ascii=False, separators=(',', ':'))+'\n' if p['goalId'] in {c['wholeAfter']['goalId'] for c in case_changes} else l for p,l in zip(profiles,lines)))
write(OWN/'CAS.two-whole-targeted-cases-and-local-profile-fields.json', {'role':'Unreviewed bounded author case design successor; no P/A vote','cases':case_changes,'allOther40OriginalCaseBodiesUnchanged':True,'source42Unchanged':art(cases_path),'all18OtherInnerProfilesUnchanged':True,'whole42HashBroadcast':False})
write(OWN/'checks/AUTHOR.initial-existing-files-and-source-bindings.json', {'existingFiles':originals,'sourceCases42':art(cases_path),'sourceProfiles20':art(profiles_path),'rawDraft':art(raw),'newScientificVotes':0})
print(json.dumps({'completeTargetedCaseSuccessors':2,'profileBodiesChanged':2,'allOther18InnerProfilesExact':True,'canonicalSHA':sha(canon)}))
