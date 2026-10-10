# SPDX-License-Identifier: Apache-2.0
from pathlib import Path
import json,copy,hashlib,shutil,datetime
R=Path.cwd();Q=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10');N=Q/'chemie-b008-current517-seven-BY-source-two-direct-routes-author-20261010-v1';I=Q/'chemie-b008-current517-dual38-P38-reviewed-inactive-integration-technical-20261010-v1';A=Q/'chemie-b008-current517-machine-content-native-readiness-author-20261010-v1';S=Q/'chemie-b008-source24-dual-bounded-scope-technical-20261010-v1';C=R/'tmp/m7-resumption-20261010/chemistry-b008-P26-native-author/isolated-normal-capsule'
def read(p):return json.loads(Path(p).read_text())
def put(p,x):p=Path(p);p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n')
for d in ['checks','native','positive','source-atlas','inputs/capsule-before-stage']: (N/d).mkdir(parents=True,exist_ok=True)
wholepath=N/'candidate/whole517.two-direct-orientation-routes.author-candidate.json';mappingpath=N/'candidate/BY-whole-original-partners-plus-seven-current-leaf-source-obligation.author-candidate.review.json';mapping=read(mappingpath)
for d in mapping['decisions']:
 if d.get('authorCandidateBoundary',{}).get('newLeafSourceObligationCoverageIndependentReviewPending'):
  d['reviewer']='Codex SOURCE/route AUTHOR; current independent review pending'
  d['reviewedAt']='2026-10-10'
put(mappingpath,mapping)
ledger=read(A/'candidate/current517-final-learner-copy-semantic-kinds.portable.inactive.json');ledger['sourceLandscapePath']=str(wholepath);put(N/'candidate/current517.semantic-kinds.author-portable.json',ledger)
ledgeractive=copy.deepcopy(ledger);ledgeractive['sourceLandscapePath']='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json';put(N/'candidate/current517.semantic-kinds.author-future-active.json',ledgeractive)
model=read(A/'native/final-current398-whole-P205-normal-model.config.json');model.update(bookId='chemie-current517-seven-source-two-routes-author',landscapePath=str(wholepath),semanticKindLedgerPath=str(N/'candidate/current517.semantic-kinds.author-portable.json'),goalVisualizationQaPath=str(I/'candidate/current398-normal-whole-context-QA.additive.future-active.json'),outputPath=str(N/'native/current398-whole-normal.author-model.json'));put(N/'native/current398-whole-normal.author-model.config.json',model)
atlas=read(A/'source-atlas/final-current517-bounded378-normal.inputs.json');atlas.update(landscapePath=str(wholepath),semanticKindLedgerPath=str(N/'candidate/current517.semantic-kinds.author-portable.json'),outputDirectory=str(N/'source-atlas/generated/source-views'),manifestPath=str(N/'source-atlas/generated/source-manifest.json'),navigationViewPath=str(N/'source-atlas/generated/navigation.view.json'));oldby=str(S/'candidate/BY-whole-retained-with-current-paired-partial-source-review.inactive.review.json');assert atlas['mappingPaths'].count(oldby)==1;atlas['mappingPaths']=[str(mappingpath)if p==oldby else p for p in atlas['mappingPaths']];put(N/'source-atlas/current517-bounded378.author.inputs.json',atlas)
stages={Path('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'):wholepath,Path('curricula/DE/Gymnasium/quality/goal-book-publication/chemie.semantic-kinds.json'):N/'candidate/current517.semantic-kinds.author-future-active.json',Path('curricula/DE/Gymnasium/mapping/DE-BY/gymnasium/bavaria_chemistry_source_extraction_to_canonical_chemistry.review.json'):mappingpath}
rows=[]
for rel,source in stages.items():
 target=C/rel;assert target.parent.resolve().is_relative_to(C.resolve());before=target.read_bytes();backup=N/'inputs/capsule-before-stage'/rel.name
 if not backup.exists():backup.write_bytes(before)
 if target.exists()or target.is_symlink():target.unlink()
 shutil.copyfile(source,target)
 rows.append({'capsulePath':str(rel),'authorSourcePath':str(source),'beforeSha256':hashlib.sha256(before).hexdigest(),'afterSha256':hashlib.sha256(target.read_bytes()).hexdigest(),'operativePathUntouched':True})
put(N/'checks/capsule-staging.actual.json',{'schemaVersion':1,'capsuleRoot':str(C),'role':'SOURCE/route AUTHOR machine checks only; independent current science pending','stages':rows,'activeWrites':[]})
print('Staged 3 regular Chem capsule files; original operative files untouched')
