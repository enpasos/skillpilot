from pathlib import Path
import json,hashlib,shutil
H=Path(__file__).resolve().parent;R=H.parents[2];G=R/'tmp/approach-review-20261101/cone-complex-four-plus-b2-integration-20261104-v1/check-host'
ids=['803d910d-96d1-5118-b9ca-29e93d0da76d','d3c42193-f1b7-5c6d-a991-bf034d99359f','5748633c-113f-5ea8-9041-24da55919de7','7bb3c312-f714-55e6-a31f-f31605a93760']
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def put(n,v): (H/n).write_text(json.dumps(v,ensure_ascii=False,indent=2)+'\n')
def bind(p,base=G):return {'path':str(p.relative_to(base)),'sha256':sha(p),'inputRoot':str(base.relative_to(R)) if base!=R else '.'}
p=G/'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json';d=json.loads(p.read_text());by={g['id']:g for g in d['goals']};assert sha(p)=='4b1e946f920829f423d2500971c799c9bc1056c5e3e13f27e2e7004150e71f35'
def closure(start):
 seen=set();todo=list(start)
 while todo:
  x=todo.pop()
  if x in seen:continue
  seen.add(x);todo.extend(by[x].get('requires',[]))
 return seen
rs=closure(ids);put('frozen-input.json',{'canonical':bind(p),'wholeGoals':[by[x] for x in ids],'nativeN2':bind(R/'tmp/approach-review-20261101/cone-complex-four-plus-b2-native-20261104-v1/candidate.json.gz',R),'authoringScope':'Private content-only drafts. No R, identity, applicability, source, type, semanticKind, review row, role, canonical or native mutation.'})
put('whole-contracts-and-preparation.json',{'canonical':bind(p),'preparationIsNotCoverage':True,'perGoal':[{'goalId':x,'wholeContract':by[x],'originalRequires':by[x].get('requires',[]),'transitivePreparationGoalIds':sorted(closure([x])-{x})} for x in ids],'wholePreparationContracts':[by[x] for x in sorted(rs)],'count':len(rs)})
for x in ids:
 (H/x).mkdir(exist_ok=True);(H/x/'competency-contract.current.json').write_text(json.dumps(by[x],ensure_ascii=False,indent=2)+'\n')
rows=[]
for lane in ['semantic-atomicity','memory-card-review']:
 c=G/f'curricula/DE/Gymnasium/quality/{lane}/canonical-math-full.config.json';cfg=json.loads(c.read_text());rp=G/cfg['reviewPath'];lines=rp.read_text().splitlines()
 for i,line in enumerate(lines,1):
  row=json.loads(line)
  if row['goalId'] in ids:rows.append({'lane':lane,'registeredConfig':bind(c),'registeredReview':bind(rp),'line':i,'wholeCurrentRow':row})
assert len(rows)==8
put('current-eight-registered-am-rows.json',{'status':'ORIGINAL_CURRENT_ROWS_ONLY_NO_NEW_REVIEW_DECISION','rows':rows})
lp=G/'curricula/DE/Gymnasium/quality/release-model/mathematik.semantic-kinds.json';ld=json.loads(lp.read_text());put('current-semantic-kind-context.json',{'ledger':bind(lp),'counts':ld['counts'],'wholeRows':[r for r in ld['decisions'] if r['goalId'] in ids]})
mp=G/'curricula/DE/Gymnasium/mapping/DE-HE/upper-secondary/hessen_math_upper_secondary_source_extraction_to_canonical_math.review.json';m=json.loads(mp.read_text());ep=G/m['sourceExtractionPath'];e=json.loads(ep.read_text());sg={g['id']:g for g in e['sourceGoals']};pg={g['id']:g for g in e['passages']};records=[]
for mr in m['mappings']:
 if mr['canonicalGoalId'] not in ids:continue
 s=sg[mr['legacyGoalId']];passage=pg[s['passageId']];doc=e['sourceDocuments'][0];physical=G/doc['path'];records.append({'canonicalGoalId':mr['canonicalGoalId'],'mapping':bind(mp),'extraction':bind(ep),'wholeMappingRow':mr,'wholeMappingDecisions':[v for v in m['decisions'] if v.get('sourceGoalId')==s['id']],'wholeSourceGoal':s,'wholeSourcePassage':passage,'selectedSourceDocument':doc,'selectedPhysicalDocument':bind(physical)})
put('document-specific-source-context.json',{'status':'ORIGINAL_SOURCE_AND_MAPPING_CONTEXT_NO_NEW_OFFICIAL_SCOPE_CLAIM','records':records})
# Keep all whole potential same-domain forms, including genuine existing assessed actions.
related=['942de65f-e8cc-417c-a66b-5f597b26d965','81823f27-0c92-5444-ac4e-32b83169f318','e3c70a12-7886-51f7-8bcd-ed54865415d6','3449ecb6-7f5b-5ff2-b058-7eb6ca09ea39','4eaf7b88-ca73-537c-8067-029a7b1116fa','03b00864-7001-5c6a-875b-dc269b3484d9','6cff2b2e-be7f-531a-8849-e5fb3a55978a','1878f680-095c-511d-aaed-e98393f7fde9','fd4b7145-5c28-5b33-bf2e-0ca68f29f2fc','a7896fa5-993e-52b9-8aa4-10420b35bfd9','e98672c6-871a-5d0b-889c-5afc51040f0d']
put('whole-existing-exams-and-reuse.json',{'canonical':bind(p),'wholeExistingExams':[by[x] for x in related],'wholeExistingExamPreparationContracts':[by[x] for x in sorted(closure(related)-set(related))],'allExistingExamRReachability':[{'goalId':x,'reachedByExistingExamIds':[g['id'] for g in d['goals'] if g.get('examData') and x in closure(g.get('requires',[]))]} for x in ids],'warning':'Coverage labels and similar titles alone do not establish whole-form reuse. Read task, solution, rubric, preparation and scope together.'})
