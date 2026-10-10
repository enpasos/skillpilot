# SPDX-License-Identifier: Apache-2.0
import argparse, copy, hashlib, json, pathlib, shutil
R=pathlib.Path(__file__).resolve().parents[7]
B=pathlib.Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10')
O=B/'biologie-bio8-atomicity-source-visual-findings-targeted-author-successor-v3'
P=B/'biologie-bio8-targeted-text-and-source-author-successor-20261010-v4'
G='374e6de5-0747-57cb-99e3-e50ccb371124'
args=argparse.ArgumentParser();args.add_argument('--selected-png',required=True);args.add_argument('--whole-goal',required=True);a=args.parse_args()
def read(p):return json.loads((R/p).read_text())
def ref(p):
 b=(R/p).read_bytes();return {'path':str(p),'sha256':'sha256:'+hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def put(p,x):
 f=R/P/p;f.parent.mkdir(parents=True,exist_ok=True);f.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n');return ref(P/p)
image=pathlib.Path(a.selected_png);goalpath=pathlib.Path(a.whole_goal)
assert not image.is_absolute() and not goalpath.is_absolute()
root_input=read(goalpath)
selected=next(g for g in root_input['goals'] if g['id']==G) if 'goals' in root_input else root_input
assert selected['id']==G
land=read(P/'candidate/whole483-text-source.inactive.json');goal=next(g for g in land['goals'] if g['id']==G)
outside=lambda g:{k:v for k,v in g.items()if k!='resourceLinks'}
assert outside(goal)==outside(selected),'Root image import changed an unrelated goal field'
goal['resourceLinks']=copy.deepcopy(selected['resourceLinks'])
put('candidate/whole483-final-text-source-image.inactive.json',land)
qa=read(O/'candidate/QA396.final-fossil-image-pending.json');row=next(q for q in qa['records'] if q['goalId']==G)
row.update(assetSha256=ref(image)['sha256'],canonicalAssetPath=str(image),aiApproved='no',aiApprovedAssetSha256=None,aiNotes='Root targeted mobile-legibility raster author correction; genuine independent current V review pending.')
put('candidate/QA396.author-pending.json',qa)
capsule=R/'tmp/bio8-targeted-text-source-v4-native-capsule';dst=capsule/row['publicAssetPath'];dst.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(R/image,dst)
put('checks/root-V374-import.exact-binding.json',{'rootSelectedPNG':ref(image),'rootImportedCandidateContainingWholeGoal374':ref(goalpath),'whole374OutsideResourceLinksExact':True,'newIndependentVApproval':False,'historical374BytesPreserved':True,'rootOwnsImageAuthorCorrection':True})
print(json.dumps({'V374RasterSHA256':ref(image)['sha256'],'whole483Candidate':ref(P/'candidate/whole483-final-text-source-image.inactive.json'),'newIndependentVApproval':False}))
