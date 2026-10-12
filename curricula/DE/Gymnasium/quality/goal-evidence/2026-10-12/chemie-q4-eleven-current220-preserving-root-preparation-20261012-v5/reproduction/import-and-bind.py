import hashlib, json, shutil, subprocess
from pathlib import Path

R=Path('/home/enpasos/projects/skillpilot')
E=R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-12'
B=E/'chemie-q4-eleven-current220-preserving-root-preparation-20261012-v5'
I=R/'tmp/chemie-q4-current220-prep/image-import-capsule'
rp=lambda p:str(p.relative_to(R))
rd=lambda p:json.loads(p.read_text())
def wr(p,d):
 p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n')
def cp(s,d):
 d.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(s,d)
canonical=B/'candidate/canonical523.current220-plus-Q4.inactive.json'
target=I/'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'
cp(canonical,target)
for name in ['prepare_goal_visualization.mjs','import_goal_visualization.mjs','goal_visualization_common.mjs']:
 cp(R/'scripts'/name,I/'scripts'/name)
prompts={
 '0a5a49f2-8e8a-5edb-b6ca-3f8636957a17':E/'chemie-q4-three-proven-image-corrections-author-root-20261012-v3/0a5a49f2-8e8a-5edb-b6ca-3f8636957a17/actual-imagegen-tool-prompt.txt',
 'dc5173e8-6e63-58d3-a79b-bd74ef3cb98b':E/'chemie-q4-three-proven-image-corrections-author-root-20261012-v3/dc5173e8-6e63-58d3-a79b-bd74ef3cb98b/actual-imagegen-tool-prompt.txt',
 '56115f9d-1d32-5454-94b1-00dbc4a7bc6f':E/'chemie-q4-rgt-five-A-five-B-author-root-20261012-v5/actual-imagegen-tool-prompt.txt',
}
for gid,prompt in prompts.items():
 g=next(g for g in rd(target)['goals'] if g['id']==gid)
 link=next(x for x in g['resourceLinks'] if x['type']=='goal-visualization')
 prepare=['node',str(I/'scripts/prepare_goal_visualization.mjs'),gid,'--landscape='+str(target),'--subject=chemie','--provider=OpenAI / ChatGPT-Codex image generation']
 imp=['node',str(I/'scripts/import_goal_visualization.mjs'),gid,str(B/'assets'/f'{gid}.png'),'--landscape='+str(target),'--subject=chemie','--provider=OpenAI / ChatGPT-Codex image generation','--prompt='+str(prompt),'--alt-text='+link['alt']]
 if link.get('description'):imp.append('--description='+link['description'])
 logs=[]
 for cmd in [prepare,imp]:
  out=subprocess.run(cmd,cwd=I,text=True,capture_output=True)
  logs.append(out.stdout+out.stderr)
  if out.returncode:raise RuntimeError(out.stdout+out.stderr)
 (B/'checks').mkdir(parents=True,exist_ok=True)
 (B/'checks'/f'{gid}.normal-prepare-import.actual.txt').write_text('\n'.join(logs))
 for p in (I/'curricula/DE/Gymnasium/visualizations/chemie'/gid).iterdir():
  cp(p,B/'assets/imported-source'/gid/p.name)
before=rd(canonical);after=rd(target)
old={g['id']:g for g in before['goals']};assert all(g==old[g['id']] for g in after['goals'] if g['id'] not in prompts)
cp(target,canonical)
V=E/'chemie-q4-four-selected-V-initial-independent-b-20261012-v5'
v1=rd(V/'V4.initial-independent-b.asset-review.actual.json')
v2=rd(V/'V1.RGT-v5-successor-independent-b.asset-review.actual.json')
accepted={a['goalId']:a for a in v1['records'] if a['aiApproved']=='yes'}
accepted.update({a['goalId']:a for a in v2['records'] if a['aiApproved']=='yes'})
assert len(accepted)==4
q=rd(B/'candidate/QA.current-plus-three-pending-images.inactive.json')
for record in q['records']:
 if record['goalId'] not in accepted:continue
 a=accepted[record['goalId']]
 assert record['assetSha256']==a['assetSha256']
 record.update(aiApproved='yes',aiApprovedAssetSha256=a['assetSha256'],aiReviewedAt=v1['reviewedAtUtc'],aiReviewer=v1['reviewer'],aiNotes='Independent asset-only full/360/680 review; no human or whole-goal approval. '+json.dumps(a['scientificReasons'],ensure_ascii=False))
wr(B/'candidate/QA.current-plus-four-actual-B-asset-reviews.inactive.json',q)
wr(B/'checks/normal-import-and-actual-four-asset-B-binding.actual.json',{'schemaVersion':1,'role':'technical binding of original actual image-import outputs and genuine independent asset judgments','normalHelpers':['scripts/prepare_goal_visualization.mjs','scripts/import_goal_visualization.mjs'],'execution':'ignored private real-copy import capsule, no active paths written','changedResourceLinkGoalIds':list(prompts),'retainedOtherWholeGoalBodies':len(old)-len(prompts),'currentVJudgments':{gid:a['assetSha256'] for gid,a in accepted.items()},'originalVRecords':[rp(V/'V4.initial-independent-b.asset-review.actual.json'),rp(V/'V1.RGT-v5-successor-independent-b.asset-review.actual.json')],'historicalRGTv4HoldUnchanged':True,'newScienceVotes':0,'activeWrites':False,'strictGain':0})
print(json.dumps({'normalImports':3,'boundActualIndependentAssetReviews':4,'canonical':rp(canonical),'sha256':hashlib.sha256(canonical.read_bytes()).hexdigest()}))
