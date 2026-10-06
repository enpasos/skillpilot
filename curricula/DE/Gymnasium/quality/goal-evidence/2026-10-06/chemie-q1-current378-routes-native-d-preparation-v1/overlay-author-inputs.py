from pathlib import Path
import hashlib, json, shutil, datetime
ROOT=Path('/home/enpasos/projects/skillpilot')
REL=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/chemie-q1-current378-routes-native-d-preparation-v1')
OWN=ROOT/REL
ISO=ROOT/'tmp/chemie-q1-current378-routes-native-d-preparation-20261006-v1'
OLD=ROOT/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/chemie-q1-quantitative-reviewed-integration-candidate-v1'
ROUTE=ROOT/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/chemie-q1-he-quantitative-routes-author-candidate-v1'
V2=ROOT/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/chemie-q1-he-quantitative-routes-controls-author-remediation-v2'
def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()
def cp(src,dst):
    dst.parent.mkdir(parents=True,exist_ok=True)
    shutil.copy2(src,dst)
def wr(p,obj):
    p.parent.mkdir(parents=True,exist_ok=True)
    p.write_text(json.dumps(obj,ensure_ascii=False,indent=2)+'\n')
assert (ISO/REL/'native-models/full-current376.book-model.json').is_file()
cp(ISO/REL/'native-models/full-current376.book-model.json',OWN/'native-models/full-current376.book-model.json')
cp(ISO/REL/'full-current376.config.json',OWN/'full-current376.config.json')
cp(ISO/REL/'full-current378-routes-v2.config.json',OWN/'full-current378-routes-v2.config.json')
cp(ISO/'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json',OWN/'actual-current376-inputs/canonical.chemie.json')
cp(ISO/'curricula/DE/Gymnasium/quality/goal-book-publication/chemie.semantic-kinds.json',OWN/'actual-current376-inputs/semantic-kinds.json')
cp(ISO/'curricula/DE/Gymnasium/quality/goal-visualization-qa/chemie.qa.json',OWN/'actual-current376-inputs/visualization-qa.json')
plan=json.loads((OLD/'guarded-apply-plan.json').read_text())
rows=[]
for row in plan['writes']:
    src=ROOT/row['sourcePath'];dst=ISO/row['targetPath']
    before=sha(dst) if dst.is_file() else None
    assert before==row['beforeSHA256'],row['targetPath']
    assert sha(src)==row['afterSHA256'] and src.stat().st_size==row['afterBytes'],row['sourcePath']
    cp(src,dst)
    rows.append({'action':'write','targetPath':row['targetPath'],'sourcePath':row['sourcePath'],'beforeSHA256':before,'afterSHA256':sha(dst),'afterBytes':dst.stat().st_size})
for row in plan['deletes']:
    dst=ISO/row['targetPath'];before=sha(dst)
    assert before==row['beforeSHA256'],row['targetPath']
    dst.unlink()
    rows.append({'action':'delete','targetPath':row['targetPath'],'beforeSHA256':before,'afterExists':False})
cp(ISO/'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json',OWN/'old-reviewed378-before-routes.canonical.json')
canon='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'
cp(V2/'proposed-active-tree'/canon,ISO/canon)
ledger='curricula/DE/Gymnasium/quality/goal-book-publication/chemie.semantic-kinds.json'
cp(ROUTE/'semantic-kinds.author-binding-candidate.json',ISO/ledger)
cp(ROUTE/'semantic-kinds.author-binding-candidate.json',OWN/'semantic-kinds.routeauthor-before-v2.snapshot.json')
for name in ['goal-description-understanding-evidence-review-v2.md','chemistry-goal-description-understanding-evidence-review-criteria-v1.md']:
    rel=Path('curricula/DE/Gymnasium/quality/goal-evidence/prompts')/name
    cp(ROOT/rel,ISO/rel)
wr(OWN/'author-overlays.actual.receipt.json',{'schemaVersion':1,'createdAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'isolatePath':str(ISO),'writes':rows,'oldGuardedPlanWriteCount':len(plan['writes']),'oldGuardedPlanDeleteCount':len(plan['deletes']),'routeControlsV2CanonicalSHA256':sha(ISO/canon),'routeAuthorSemanticLedgerBeforeV2SHA256':sha(ISO/ledger),'activeWrites':False,'nativeToolsModified':False,'scienceReviewDecisions':[]})
print('Overlay exact: 40 writes, 9 deletes, author-controls-v2 canonical and route-author classification ledger')
