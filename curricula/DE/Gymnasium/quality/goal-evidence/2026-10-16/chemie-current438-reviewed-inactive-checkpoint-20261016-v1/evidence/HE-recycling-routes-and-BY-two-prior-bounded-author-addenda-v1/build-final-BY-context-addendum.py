# SPDX-License-Identifier: Apache-2.0
import json,copy,hashlib
from pathlib import Path
R=Path('/home/enpasos/projects/skillpilot');O=Path(__file__).parent;V=R/'tmp/chemie-m7-resumed-20261016/HE-admission-A-B-informed-author-successor-v2';L=R/'tmp/chemie-m7-resumed-20261016/chemie-shared640-recycling-native-author-capsule-L6-v1'
def read(p):return json.loads(Path(p).read_text())
def fp(o):return 'sha256:'+hashlib.sha256(json.dumps(o,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode()).hexdigest()
def pin(p):return {'path':str(p.relative_to(R)),'sha256':'sha256:'+hashlib.sha256(p.read_bytes()).hexdigest(),'bytes':p.stat().st_size}
def put(n,d):
 p=O/n
 with p.open('x')as f:f.write(json.dumps(d,ensure_ascii=False,indent=2)+'\n')
 return pin(p)
cp='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json';base={g['id']:g for g in read(L/cp)['goals']};gid=lambda p:next(i for i in base if i.startswith(p))
cf=next(o for o in read(V/'CAS.nine-selected-WHOLE-goals.A-B-informed-AUTHOR-v2.inactive.json')['operations']if o['goalId']==gid('0cf2'))
bmrel='curricula/DE/Gymnasium/mapping/DE-BY/gymnasium/bavaria_chemistry_source_extraction_to_canonical_chemistry.b007-normal-source-scope-20261011-v1.review.json';bm=read(L/bmrel);sid='b246897e-21d3-5b31-82e8-7736de8a112c';sourcecell={'mappings':[m for m in bm['mappings']if m['legacyGoalId']==sid],'decision':next(d for d in bm['decisions']if d['sourceGoalId']==sid)}
assert sourcecell['decision']['canonicalGoalIds']==[gid('4928')]
configrel='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-11/chemie-b007-v7-root-normal-final-integration-20261011-v1/active-configs/positive-retained-19.config.json';cfgp=L/configrel
if not cfgp.exists():cfgp=R/configrel
cfg=read(cfgp);rp=L/cfg['reviewPath']
if not rp.exists():rp=R/cfg['reviewPath']
row=next(json.loads(l)for l in rp.read_text().splitlines()if json.loads(l).get('goalId')==gid('4928'))
mat=put('INPUT.4928-WHOLE-goal-current-P-record-and-existing-BY-source-cell.exact.json',{'canonical':pin(L/cp),'whole4928':base[gid('4928')],'currentPConfig':pin(cfgp),'currentPReviewPath':pin(rp),'wholeCurrentP4928Record':row,'currentWholeBYSourceCell':sourcecell,'mapping':pin(L/bmrel),'currentComplete0cf2Materials':pin(V/'INPUT.0cf2-whole-current-P-and-two-FULL-linked-material-cases.readonly.json'),'firstlaw801PrototypeFinding':'Actual attempted801 target had three newly missing transitive BY acquisition priors8ece/8ceb/2be9; not selected as a closed remedy. Whole4928 genuinely teaches the same system boundaries and first-law balance needed by0cf2.'})
science=put('AUTHOR.final-BY-4928-context-and-4bdb-actual-target.frozen.json',{'role':'AUTHOR only, not nonauthor review or gate approval','actualWholeInputs':mat,'actualBYWholeSourcesAndPrimaryPages':pin(O/'INPUT.actual-BY-two-foundations-WHOLE-sources-primary-pages.json'),'actualAll25Existing4928Targets':pin(O/'CHECK.actual-existing4928-all0cf2-containing-role-occurrences.json'),'rationale':{'0cf2':'Actual full material energy20-10-a/b asks comparisons of supplied energy input, electricity/nutzwaerme, efficiencies and boundary-dependent carbon/cost/social criteria. It does not require Kelvin-Planck or entropy. Unchanged current4928 P explicitly teaches open/closed/isolated system boundaries, conservation through ΔU=q+w and heat/work/state distinctions, with full supplied500J/200J and isolated-system examples. This is a substantive didactic replacement for the overbroad entropy prior and supplies the same actual foundation as801 without importing801 wider acquisition chain. It is already an actual target in all25 0cf2-containing views, but that role fact alone is not the scientific justification. Retainecce fuel-cell prior. Do not change801 itself.','4bdb':'Unchanged whole goal/P treats benzene electron delocalization, resonance contributors as models, equal bonds and stabilization/substitution. Actual BYEA C12.5.6 and5.7 require aromatic bonding, mesomeric/orbital/energetic interpretation and contributor-model limits. Add existing4bdb as actual BY-LK target before already present17ab; keep all ordinary bodies and BY-GK unchanged. Add two partial source contributions retaining exact currentac700 andb44 whole partners.','officialCourseScope':'First-law source cell keeps both existing GA/EA occurrences and current4928 mapped partner unchanged. New4bdb placement and two source partial additions apply only to BY-LK/EA aromatic duties. No general BY-GK aromatic obligation inferred.'},'rejectedUnsealed801Prototype':{'initialAuthorScience':pin(O/'AUTHOR.bounded-routing-and-BY-acquisition-proposal.frozen.json'),'twoTargetViewPrototype':pin(O/'CAS.ONE-WHOLE-BY-LK-view.post-V2-two-existing-foundations-TARGET.AUTHOR.inactive.json'),'threeCellPrototype':pin(O/'CAS.three-WHOLE-BY-source-cells.two-foundation-partial-contributions.AUTHOR.inactive.json'),'selectedForIntegration':False,'reason':'Actual transitive closure revealed three acquisition goals absent in BY-LK; no incorrect PASS asserted.'},'noNormalWrites':True,'newIndependentVotes':0,'HumanApproval':False,'HumanTrial':False,'M7Claim':False})
b=cf['after'];a=copy.deepcopy(b);assert a['requires']==[gid('ecce'),gid('801790')];a['requires']=[gid('ecce'),gid('4928')]
put('CAS.ONE-WHOLE-0cf2.post-V2-existing4928-firstlaw-context.AUTHOR.inactive.json',{'operation':'replace-whole-goal-if-before-exact','goalId':gid('0cf2'),'beforeStage':'exact-selected-sealed-V2-after','before':b,'beforeWholeGoalFingerprint':fp(b),'after':a,'afterWholeGoalFingerprint':fp(a),'science':science,'onlyRequiresChanged':True,'other639WholeGoalsExactRelativeToThisOperation':True,'noNormalWrites':True,'newIndependentVotes':0})
proto=read(O/'CAS.ONE-WHOLE-BY-LK-view.post-V2-two-existing-foundations-TARGET.AUTHOR.inactive.json');b=proto['before'];a=copy.deepcopy(proto['after']);removed=[]
def filt(ns):
 for n in list(ns):
  if n.get('goalId')==gid('801790'):ns.remove(n);removed.append(True)
  elif 'children'in n:filt(n['children'])
filt(a['rootNodes']);assert len(removed)==1
put('CAS.ONE-WHOLE-BY-LK-view.post-V2-existing4bdb-only-TARGET.AUTHOR.inactive.json',{'operation':'replace-whole-view-if-before-exact','path':proto['path'],'beforeStage':'exact-selected-V2-BY-LK-after-with-cf270','before':b,'beforeWholeViewFingerprint':fp(b),'after':a,'afterWholeViewFingerprint':fp(a),'addedTargetGoalIds':[gid('4bdb')],'allOtherGoalRolesExact':True,'science':science,'noNormalWrites':True,'newIndependentVotes':0})
cells=read(O/'CAS.three-WHOLE-BY-source-cells.two-foundation-partial-contributions.AUTHOR.inactive.json');cells['operations']=[x for x in cells['operations']if x['sourceGoalId']!=sid]
for op in cells['operations']:op['after']['decision']['boundedAuthorAddition']['science']=science;op['afterWholeCellFingerprint']=fp(op['after'])
cells['role']='Inactive AUTHOR two partial benzene contributions, no new whole-source vote';cells['firstlawExistingWhole4928CellExact']=True
put('CAS.TWO-WHOLE-BY-aromatic-source-cells.partial4bdb.AUTHOR.inactive.json',cells)
print(json.dumps({'science':science,'ordinaryContext':gid('0cf2'),'newPrior':gid('4928'),'BYTarget':gid('4bdb'),'sourceCellOps':len(cells['operations'])},indent=2))
