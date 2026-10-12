import copy,datetime,hashlib,json,pathlib,shutil
BASE=pathlib.Path(__file__).resolve().parent
ROOT=BASE.parents[6]
V7=BASE.parent/'chemie-q3-three-current402-live-context-author-20261012-v7'
def read(p):return json.loads(p.read_text())
def ref(p):b=p.read_bytes();return {'path':str(p.relative_to(ROOT)),'bytes':len(b),'sha256':'sha256:'+hashlib.sha256(b).hexdigest()}
def write(p,v):p.parent.mkdir(exist_ok=True,parents=True);p.write_text(json.dumps(v,ensure_ascii=False,indent=2)+'\n')
seal=read(V7/'FINAL.immutable-author-candidate-CAS-seal.json')
for r in seal['files']:assert ref(ROOT/r['path'])==r
a=BASE.parent/'chemie-q3-three-current402-independent-a-20261012-v7';b=BASE.parent/'chemie-q3-three-current402-independent-b-20261012-v7'
judgment_files=[a/'independent-a-whole-three-DPAMV-decisions.original.json',b/'findings.original-independent-b.json',b/'science/source-clause-attribution.original-independent-b.json']
for p in judgment_files:read(p)
live=ROOT/'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'
assert live.read_bytes()==(V7/'baseline/canonical523.live.exact.json').read_bytes()
for source,destination in [(V7/'candidate/canonical523.live-five-applicability-fixes-Q3-only.inactive.json',BASE/'candidate/canonical523.exact-v7-live-preserving.inactive.json'),(V7/'positive/P3.current402.author.records.jsonl',BASE/'positive/P3.before-v8.exact.jsonl')]:shutil.copyfile(source,destination)
sh=ROOT/'curricula/DE/Gymnasium/mapping/DE-SH/upper-secondary/sh_chemistry_upper_secondary_source_extraction_to_canonical_chemistry.review.json';original=read(sh);proposal=copy.deepcopy(original)
sid='de-sh-chemie-sekii-fachanforderungen-2022-3-2-chemie-der-funktionalen-stoffe-und-materialien-029-c8e1a110';target='c8844ac6-c414-5a0e-9fcd-7d0a82177d09'
removed=[m for m in proposal['mappings'] if m['legacyGoalId']==sid and m['canonicalGoalId']==target];assert len(removed)==1
proposal['mappings']=[m for m in proposal['mappings'] if not(m['legacyGoalId']==sid and m['canonicalGoalId']==target)]
decision=next(d for d in proposal['decisions'] if d['sourceGoalId']==sid);old=copy.deepcopy(decision)
decision['canonicalGoalIds'].remove(target)
decision['rationale']='AUTHOR targeted B-S01 correction: remove only unrelated primary-cell edge from literal micelle/emulsion source. Remaining pre-existing partners are preserved for independent source ownership review; this does not certify their whole clause. Correct detergent rows elsewhere are unchanged.'
decision['reviewedAt']='2026-10-12';decision['reviewer']='Codex AUTHOR targeted source correction, not independent approval'
shutil.copyfile(sh,BASE/'baseline/SH-upper-source-mapping.exact.json')
write(BASE/'candidate/SH-upper-only-micelle-c884-removed.review.json',proposal)
write(BASE/'checks/SH-micelle-target-only-delta.author.json',{'findingId':'B-S01-primary-cell-micelle-source-contradiction','removedCompatibilityMapping':removed,'beforeDecision':old,'afterDecision':decision,'otherMappingRowsExact':True,'otherDecisionRowsExact':True,'remainingLiteralPartnersAreNotDetergentGoals':True,'unrelatedGoodDetergentRowsPreserved':True,'currentSourceGoalId':sid,'normalizedEvidenceIdNotUsedAsIdentity':'e8659 was only historical review citation','activeWrites':False})
inputs={r['path']:ref(ROOT/r['path']) for r in read(V7/'FIRST.author-exact-inputs-CAS.json')['inputs'] if (ROOT/r['path']).is_file() and not r['path'].startswith(str(V7.relative_to(ROOT))+'/')}
for r in seal['files']:inputs[r['path']]=r
for p in [V7/'FINAL.immutable-author-candidate-CAS-seal.json',*judgment_files,*a.glob('FINAL*.json'),*b.glob('FINAL*.json')]:inputs[str(p.relative_to(ROOT))]=ref(p)
for p in sorted(BASE.rglob('*')):
 if p.is_file():inputs[str(p.relative_to(ROOT))]=ref(p)
write(BASE/'FIRST.actual-author-v8-inputs-CAS.json',{'schemaVersion':1,'role':'AUTHOR remediation, reads original A3/B3; not independent','createdAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'files':list(inputs.values()),'v7andOriginalA3B3Preserved':True,'currentCanonicalGoals':523,'currentCurricularAtomic':402,'goalIds':['81373fb7-2a4a-5b2c-acd0-b4e775acaa65','8be14f15-2258-58e6-ae4e-38953f5d0570','c8844ac6-c414-5a0e-9fcd-7d0a82177d09'],'activeWrites':False,'HumanApproval':False,'HumanTrial':False})
print(json.dumps({'inputs':len(inputs),'targetOnlySHRemoval':1,'v7Preserved':True,'activeWrites':False}))
