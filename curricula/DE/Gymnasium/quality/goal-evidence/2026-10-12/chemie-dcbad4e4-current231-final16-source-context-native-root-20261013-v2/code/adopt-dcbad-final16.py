from pathlib import Path
import json,hashlib,shutil,copy,datetime
R=Path('/home/enpasos/projects/skillpilot');E=R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-12';A=E/'chemie-dcbad4e4-one-applicability-alignment-technical-independent-a-20261013-v1';N=E/'chemie-dcbad4e4-current231-final16-source-context-native-root-20261013-v2'
L=R/'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json';RG=R/'curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json';G='dcbad4e4-e954-51d7-97ca-3bacb6f0d8d5'
rd=lambda p:json.loads(p.read_text());rp=lambda p:str(p.relative_to(R));sha=lambda p:'sha256:'+hashlib.sha256(p.read_bytes()).hexdigest()
def wr(p,d):
 p.parent.mkdir(parents=True,exist_ok=True);assert not p.exists(),p;p.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n')
proof=rd(A/'FINAL.one-field-technical-proof.freeze.json')
for row in proof['files']:
 p=A/row['path'];assert sha(p)=='sha256:'+row['sha256'].removeprefix('sha256:') and p.stat().st_size==row['sizeBytes'],p
assert sha(L)=='sha256:a6943a47c3cfe9b024730b2d072fc61250e03d404597ad56706d27cb5c12842c'
C=A/'candidate/canonical523.one-jurisdiction-list.inactive.json';assert sha(C)=='sha256:9a68501347031f266572dea551e71c3507b66fb5ed94142a1a99f6a282708960'
a=rd(L);b=rd(C);am={x['id']:x for x in a['goals']};bm={x['id']:x for x in b['goals']};assert len(am)==523 and list(am)==list(bm)
assert [g for g in am if am[g]!=bm[g]]==[G]
x=copy.deepcopy(bm[G]);x['applicability']['jurisdiction']=am[G]['applicability']['jurisdiction'];assert x==am[G];assert len(bm[G]['applicability']['jurisdiction'])==16 and 'DE-NW' in bm[G]['applicability']['jurisdiction']
IX=N/'native-D1/resolution-index.json';ix=rd(IX);assert len(ix['resolutions'])==1 and ix['resolutions'][0]['goalId']==G and ix['resolutions'][0]['strictDescriptionComplete']
rg=rd(RG);protected=copy.deepcopy([s for s in rg['subjects'] if s['subject']!='chemie']);ch=next(s for s in rg['subjects'] if s['subject']=='chemie')
old='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-12/chemie-q4-original-eleven-D9-technical-adoption-agent-20261013-v1/native-D11/resolution-index.json';assert old in ch['resolutionIndexPaths'] and rp(IX) not in ch['resolutionIndexPaths'];ch['resolutionIndexPaths'].append(rp(IX));ch['resolutionSupersessions'].append({'goalId':G,'supersededIndexPath':old,'replacementIndexPath':rp(IX)});assert [s for s in rg['subjects'] if s['subject']!='chemie']==protected
for p in [L,RG,R/'curricula/DE/Gymnasium/provenance/chemistry-evidence-watch-baseline.json']:
 q=N/'before-active'/p.relative_to(R);q.parent.mkdir(parents=True,exist_ok=True);assert not q.exists();shutil.copyfile(p,q)
shutil.copyfile(C,L);RG.write_text(json.dumps(rg,ensure_ascii=False,indent=2)+'\n')
wr(N/'APPLIED.one-declared-scope-genuine-context-pair.actual.json',{'schemaVersion':1,'atUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'goalId':G,'onlyCanonicalFieldChanged':'applicability.jurisdiction','canonicalBeforeSHA':'sha256:a6943a47c3cfe9b024730b2d072fc61250e03d404597ad56706d27cb5c12842c','canonicalAfterSHA':sha(L),'allOther522WholeGoalsExact':True,'current231PExactAndAll402PagesExact':True,'genuineFreshIndependentTargetedPair':True,'newDIndex':rp(IX),'newDIndexSHA':sha(IX),'oldIndexPreservedWithOnlyOneExplicitSupersession':True,'protectedAllNonChemistryRegistryEntriesExact':True,'newScientificCompletionsFromThisContextRefresh':0,'checkpointScientificGainRemains11':True,'humanApproval':False,'humanTrial':False,'normalAPVStatusAndCentralCheckStillRequired':True})
print(json.dumps({'adopted':G,'declaredJurisdictions':16,'newScientificCompletions':0,'centralAndFloorChecksStillPending':True}))
