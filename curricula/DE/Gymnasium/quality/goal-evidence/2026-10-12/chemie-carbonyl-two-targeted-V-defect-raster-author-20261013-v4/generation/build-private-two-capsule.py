"""Apache-2.0: small private normal-script capsule; no active writes."""
from pathlib import Path
import datetime,hashlib,json,shutil,stat
R=Path.cwd(); E=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-12'); O=E/'chemie-carbonyl-two-targeted-V-defect-raster-author-20261013-v4'; old=E/'chemie-carbonyl-three-necessary-raster-author-20261013-v2'; P=R/'tmp/chemie-carbonyl-two-v-defects-private'; assert not P.exists(); assert not (O/'FINAL.two-targeted-author.seal.json').exists()
h=lambda p:'sha256:'+hashlib.sha256(Path(p).read_bytes()).hexdigest();read=lambda p:json.loads(Path(p).read_text());bindings=[]
scripts=['scripts/import_goal_visualization.mjs','scripts/goal_visualization_common.mjs','scripts/prepare_goal_visualization.mjs','app/scripts/materializePositiveGoalEvidenceCandidates.ts','app/scripts/positiveGoalEvidenceProfileModel.ts','app/scripts/positiveGoalEvidenceReview.ts','app/scripts/goalEvidenceProfileModel.ts']
inputs=['app/package.json','contracts/goal-evidence/v2/goal-evidence-profile.schema.json','contracts/goal-evidence/v2/goal-evidence-review-config.schema.json','contracts/goal-evidence/v1/goal-evidence-ai-run-manifest.schema.json','curricula/DE/Gymnasium/quality/goal-book-publication/chemie.semantic-kinds.json','curricula/DE/Gymnasium/quality/goal-evidence/prompts/chemistry-positive-understanding-evidence-profile-criteria-v1.md']
for rel in scripts+inputs:
 src=R/rel;dst=P/rel;dst.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(src,dst);assert h(src)==h(dst);bindings.append(dict(path=rel,sourceSHA=h(src),privateSHA=h(dst),byteExact=True))
canrel=Path('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json');dst=P/canrel;dst.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(old/'visual-candidate'/canrel,dst)
ids=read(O/'inputs/before-edit-protected-CAS.actual.json')['goalIds'];keep='3de28598-672f-5753-8a45-8f559c2f9dc2'
for i in ids+[keep]:
 for prefix in ['curricula/DE/Gymnasium/visualizations','app/public/assets/goal-visualizations','backend/src/main/resources/static/assets/goal-visualizations']:
  rel=Path(prefix)/'chemie'/i/(i+'.png');dst=P/rel;dst.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(old/'visual-candidate'/rel,dst)
 for fn in ['prompt.de.md','image-reconstruction-prompt.de.md']:
  rel=Path('curricula/DE/Gymnasium/visualizations/chemie')/i/fn;shutil.copyfile(old/'visual-candidate'/rel,P/rel)
# Dependency link is read-only and outside curricula; every mutable target parent stays real.
(P/'app/node_modules').symlink_to(R/'app/node_modules',target_is_directory=True)
profiles=read(O/'inputs/whole15.profile-payloads.author.json');by={x['goalId']:x['profile']for x in profiles['profiles']};reviewid='chemie-carbonyl-two-targeted-v-defect-private-p-input-probe-20261013-v4';cs=dict(schemaVersion=1,authoringContract='positive-understanding-evidence-candidates-v1',reviewId=reviewid,reviewedAt=datetime.datetime.now(datetime.timezone.utc).isoformat(),reviewer='Carbonyl author; asset input fingerprint probe only',goals=[dict(goalId=i,reason='Retained original P-v2 profile and whole cases; probe new raster input only, not approval',evidenceLevel='E1',maximumClaimScope='G1',dissent=['Fresh independent V decision remains required; original source/body/atomicity holds retained'],profile=by[i])for i in ids]);payload=Path('probe/P2.same-retained-profile-payload.json');(P/payload).parent.mkdir(parents=True,exist_ok=True);(P/payload).write_text(json.dumps(cs,ensure_ascii=False,indent=2)+'\n');shutil.copyfile(P/payload,O/'P-probe/P2.same-retained-profile-payload.json')
config=read(E/'chemie-carbonyl-pharmacy15-current231-scientific-author-20261013-v1/configs/P15.author.inactive.config.json');config['reviewId']=reviewid;config['scope']=dict(label='Private two-image input probe only; ai_candidate and needs_human_review',goalIds=ids);config['reviewPath']='probe/P2.before.normal.jsonl';(P/'probe/P2.private.config.json').write_text(json.dumps(config,ensure_ascii=False,indent=2)+'\n');shutil.copyfile(P/'probe/P2.private.config.json',O/'P-probe/P2.private.config.before.json')
parents=[]
for leaf in [P/canrel,P/'probe/P2.before.normal.jsonl']:
 parent=leaf.parent
 while parent.is_relative_to(P):
  s=parent.lstat();assert stat.S_ISDIR(s.st_mode)and not stat.S_ISLNK(s.st_mode);parents.append(dict(path=str(parent.relative_to(P)),inode=s.st_ino,realDirectory=True))
  if parent==P:break
  parent=parent.parent
out=dict(schemaVersion=1,privateRoot=str(P),recordedAtUTC=datetime.datetime.now(datetime.timezone.utc).isoformat(),normalScriptsAndInputs=bindings,priorCandidateCanonicalSHA=h(P/canrel),selectedPreviousPngs=[dict(goalId=i,sha256=h(P/'app/public/assets/goal-visualizations/chemie'/i/(i+'.png')))for i in ids+[keep]],mutableParentChains=list({x['path']:x for x in parents}.values()),readOnlyDependencySymlink=dict(path=str(P/'app/node_modules'),target=str(R/'app/node_modules'),underCurricula=False,mutableOutputUsesLink=False),activeWrites=False,independentVotes=0)
(O/'checks/private-normal-small-capsule.actual.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n');print(json.dumps(dict(privateRoot=str(P),normalFiles=len(bindings),baseSHA=out['priorCandidateCanonicalSHA'],activeWrites=False)))
