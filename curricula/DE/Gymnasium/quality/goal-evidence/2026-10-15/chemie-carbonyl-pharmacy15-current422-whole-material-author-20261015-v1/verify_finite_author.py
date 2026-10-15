#!/usr/bin/env python3
"""Finite read-only verifier: run from any checkout path. No Central/full build."""
import sys
sys.dont_write_bytecode=True
import ast,hashlib,importlib.util,json,math,os,subprocess
from collections import Counter
from pathlib import Path
O=Path(__file__).resolve().parent
R=next(p for p in O.parents if (p/'AGENTS.md').is_file())
SEAL='FILES.finite-author15.seal.json';SELECTOR='FINAL.carbonyl15-current422-inactive-author.json'
def read(p):return json.loads(p.read_text())
def own(p):return read(O/p)
def sha(p):
 h=hashlib.sha256()
 with p.open('rb') as f:
  for b in iter(lambda:f.read(1024*1024),b''):h.update(b)
 return 'sha256:'+h.hexdigest()
def cas(ref,base=R):
 p=base/ref['path'];assert not Path(ref['path']).is_absolute(),ref['path']
 assert p.resolve().is_relative_to(R),ref['path']
 assert p.is_file(),ref['path'];assert p.stat().st_size==ref['bytes'],('bytes',ref['path'])
 assert sha(p)==('sha256:'+ref['sha256'].removeprefix('sha256:')),('hash',ref['path'])
def equal_number(got,expected,tol=1e-8):assert math.isclose(got,expected,rel_tol=tol,abs_tol=tol),(got,expected)
def main():
 preseal='--preseal' in sys.argv
 files=sorted(p for p in O.rglob('*') if p.is_file() or p.is_symlink())
 assert not any(p.is_symlink() for p in files),'Own payload intentionally contains physical bounded files only'
 if not preseal:
  seal=own(SEAL);expected={a['path'] for a in seal['files']};actual={str(p.relative_to(O)) for p in files if p.name!=SEAL}
  assert actual==expected,{'missing':sorted(expected-actual),'extra':sorted(actual-expected)}
  for a in seal['files']:cas(a,O)
  assert seal['fileCount']==len(expected)
  selector=own(SELECTOR)
  for a in selector['selectedOwnArtifacts']:cas(a,O)
 originals=own('inputs/CAS.bound-original-inputs.repository-relative.json');assert len(originals['files'])==originals['fileCount']
 for a in originals['files']:cas(a)
 first=own('FIRST.author15.material-science.original.json');assert sha(O/'FIRST.author15.material-science.original.json')=='sha256:c5ad6d1941f54e98aeafcfe974be1eb761b7ea5c03ae972d853dd52cd097dc56'
 fs=own('FIRST.author15.material-science.seal.json')
 # FIRST is separately sealed, and finite seal also binds its exact bytes.
 assert sha(O/'FIRST.author15.material-science.seal.json')=='sha256:907053d1d48b7224b91b4839ce620fb2a9e6dd84c2486559f9b6a3fd9c740cfe'
 ctx=own('inputs/WHOLE.current15-and-prerequisite-parent-context.deduplicated.json');ids=ctx['goalIds'];assert len(ids)==15 and len(set(ids))==15 and ids==first['goalIds']
 c=read(R/ctx['canonical']['path']);canon={g['id']:g for g in c['goals']};assert len(canon)==560
 for g in ctx['wholeGoals']:assert canon[g['id']]==g
 # Full prerequisite closure and parent references are recomputed against the current canonical.
 for row in ctx['contexts']:
  gid=row['goalId'];assert row['DirectPrerequisiteIds']==canon[gid]['requires']
  seen=set();stack=list(canon[gid]['requires'])
  while stack:
   p=stack.pop()
   if p not in seen:seen.add(p);stack.extend(canon[p].get('requires',[]))
  assert seen==set(row['TransitivePrerequisiteIds'])
  assert not row['missingPrerequisiteIds'] and not row['currentStrictCompletionInActualCentral338']
 report=read(R/ctx['actualCentralReport']['path']);s=next(s for s in report['subjects'] if s['subject']=='chemie')
 assert s['denominator']==422 and s['strictComplete']==338 and s['remaining']==84
 assert set(ids)<=set(s['currentGoalIds']) and not set(ids)&set(s['strictCompleteGoalIds'])
 ownership=own('inputs/OWNERSHIP.carbonyl15.current338.readonly.json');claim=read(R/ownership['claim']['path']);assert ids==claim['goalIds']
 ledger=read(R/ownership['ledger']['path']);claims={p:read(R/p)['goalIds'] for p in ledger['activeBatchConfigPaths']}
 for gid in ids:assert [p for p,g in claims.items() if gid in g]==[ownership['claim']['path']],gid
 other=read(R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-12/chemie-current402-all182-open-claims-root-20261012-v2/claims/equilibrium-redox-kinetics-16.current402.claim.config.json');assert not set(ids)&set(other['goalIds'])
 coupled=own('inputs/INPUTS.coupled479-sourcecells.current560-whole-partners.technical.json');assert len(coupled['cells'])==479 and len(coupled['wholeCurrentCanonicalPartnerGoals'])==150
 assert not coupled['changedMappingOrExtractionBytesSinceOriginalScope'] and not coupled['missingCurrentSourceIds'] and not coupled['missingCurrentPassageIds']
 cache={}
 def ext(p):
  if p not in cache:cache[p]=read(R/p)
  return cache[p]
 for cell in coupled['cells']:
  e=ext(cell['extraction']['path']);actual=next(g for g in e['sourceGoals'] if g['id']==cell['resolvedSourceGoalId']);assert actual==cell['wholeCurrentSourceGoal']
  edges=[v for v in ext(cell['mapping']['path'])['mappings'] if v['legacyGoalId'] in {cell['originalSourceGoalId'],cell['resolvedSourceGoalId']}];assert edges==cell['wholeCurrentSourceCellUnionEdges']
  assert {v['canonicalGoalId'] for v in edges}==set(cell['currentWholePartnerGoalIds'])
 for g in coupled['wholeCurrentCanonicalPartnerGoals']:assert canon[g['id']]==g
 for a in coupled['tenAdditionalBYNTGCellsAsOriginallyDeclared']:assert any(v['extraction']['path']==a['extractionPath'] and v['resolvedSourceGoalId']==a['sourceGoalId'] for v in coupled['cells'])
 passages=own('inputs/PASSAGES.deduplicated-whole-source-bodies.current.json');assert len(passages['wholePassages'])==183 and len(passages['deduplicatedExactTextBodies'])==155
 dedup={};text_only=0
 for row in passages['wholePassages']:
  p=next(p for p in ext(row['extraction']['path'])['passages'] if p['id']==row['passageId']);assert p==row['wholePassage']
  fields={k:p[k] for k in ['rawText','text'] if k in p};assert fields and any(v.strip() for v in fields.values()),row['passageId']
  text_only+=int('text' in fields and 'rawText' not in fields)
  h='sha256:'+hashlib.sha256(json.dumps(fields,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode()).hexdigest();assert h==row['exactTextBodySha256'];dedup[h]=fields
 assert text_only==120
 for d in passages['deduplicatedExactTextBodies']:assert dedup[d['sha256OfExactTextFieldObject']]==d['wholeTextFields']
 keep=own('inputs/KEEP.three-current338-PNG.unmodified-bindings.json');assert len(keep['assets'])==3
 for a in keep['assets']:
  assert canon[a['goalId']]==a['currentWholeGoal'] and a['resourceLinksEqualPreviouslyReviewedLinks'] and not a['newReview'] and a['imageBodyWrites']==0
  assert len(a['PNGFileBindings'])==4 and len({v['sha256'] for v in a['PNGFileBindings']})==1
  for b in a['PNGFileBindings']:cas(b)
 oldroot=R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-12/chemie-carbonyl-pharmacy15-current231-scientific-author-20261013-v1/author'
 old=read(oldroot/'whole30.expanded-cases.author.json')['cases'];whole=own('materials/whole30.current422.bilingual-cases.author.json');cases=whole['cases'];assert len(cases)==30 and Counter(c['goalId'] for c in cases)==Counter({g:2 for g in ids})
 changed=[a['caseId'] for a,b in zip(cases,old) if a!=b];assert changed==whole['targetedRevisedCaseIds'] and len(changed)==6
 assert len([1 for a,b in zip(cases,old) if a==b])==24
 pld=own('materials/whole15.current422.profile-payloads.author.json');profiles={p['goalId']:p['profile'] for p in pld['profiles']};assert set(profiles)==set(ids)
 oldp={p['goalId']:p['profile'] for p in read(oldroot/'whole15.profile-payloads.author.json')['profiles']}
 for gid in ids:
  if not gid.startswith(('5f151','f71','126c')):assert profiles[gid]['expectations']==oldp[gid]['expectations']
  for b in profiles[gid]['applicationCaseBriefs']:
   cc=next(c for c in cases if c['caseId']==b['id']);assert cc['goalId']==gid
   for lang in ['De','En']:
    assert b['taskDemand'+lang]==cc['task'+lang] and b['expectedPerformance'+lang]==cc['modelAnswer'+lang]
   assert 'keine Pflichtaufgabenquote' in b['understandingFocusDe'] and 'not a mandatory task quota' in b['understandingFocusEn']
 rubric_count=0
 for cc in cases:
  assert cc['expectationIds']==['e1','e2','e3'] and len(cc['rubric'])==3 and len(cc['expectationCoverage'])==3
  for lang,head in [('De','Daten und Bedingungen:\n'),('En','Data and conditions:\n')]:
   assert cc['task'+lang].startswith(head+cc['data'+lang])
   assert cc['modelAnswer'+lang]=='\n'.join(str(i+1)+'. '+r['criterion'+lang] for i,r in enumerate(cc['rubric']))
   for r,cov in zip(cc['rubric'],cc['expectationCoverage']):
    assert r['taskClause'+lang] in cc['task'+lang] and r['taskClause'+lang]==cov['observableTaskClause'+lang]
  for r,cov in zip(cc['rubric'],cc['expectationCoverage']):assert r['expectationIds']==[cov['expectationId']]
  assert sum(r['maximumPoints'] for r in cc['rubric'])==cc['maximumPoints']==6;rubric_count+=3
 # Independently recomputed numerical consequences needed by the revised cases, plus material stoichiometry anchors.
 nums=[(1200*500/1000,600),(1800*200/1000,360),(1000*500/1000,500),(600/200*30/60,1.5),(800/400,2),(600*250/1000,150),(800*400/1000,320),((12.2-10.0),2.2),((12.2-10.0)/10*100,22),(10-8,2),(10-.2,9.8),(.6*3,1.8),(1-.6,.4),((40-12)/40*100,70),(2*.500/100.09*1000,9.99100809),(.500/100.09*1000,4.99550405),(2*.300/58.32*1000,10.28806584),(-math.log10(.004/.1000),1.39794001),(-math.log10(.003/.1000),1.52287875),((.005-.001)*1000,4),((.005-2*.001)*1000,3),(500-8*2,484),((500-8*2)/500*100,96.8),((35-1),34),((25-6)/20*100,95),((100-25)/100*100,75),(37.2/60,.62),(18/60,.30)]
 for a,b in nums:equal_number(a,b)
 # Retained current M lines remain byte exact; these are not new memory votes.
 mr=own('inputs/MEMORY.current15.raw-retention.references.json');lines=[b for b in (R/mr['wholeCurrent422MemoryRows']['path']).read_bytes().splitlines(keepends=True) if json.loads(b)['goalId'] in ids]
 assert len(lines)==15 and b''.join(lines)==(O/'author/M15.current422.raw-lines.exact-retained.jsonl').read_bytes()
 proposal=own('materials/BOUNDED.goal-wording-and-source-course-proposals.author.json');assert len(proposal['proposals'])==1 and not proposal['proposals'][0]['applied'] and not proposal['otherGoalTextsAndEdgesChanged']
 assert proposal['proposals'][0]['currentWholeGoal']==canon[proposal['proposals'][0]['goalId']]
 import jsonschema
 rs=read(R/'contracts/goal-evidence/v2/goal-evidence-profile.schema.json');cfg=own('author/P15.current422.raw-author.inactive.config.json');jsonschema.validate(cfg,read(R/'contracts/goal-evidence/v2/goal-evidence-review-config.schema.json'))
 records=[json.loads(l) for l in (O/'author/P15.normal-v2.raw-E0G0.author-inputs.jsonl').read_text().splitlines() if l.strip()];assert [r['goalId'] for r in records]==ids
 for rec in records:jsonschema.validate(rec,rs);assert rec['reviewAuthority']=='ai_candidate' and rec['status']=='needs_human_review' and rec['evidenceLevel']=='E0' and rec['maximumClaimScope']=='G0'
 check=subprocess.run([str(R/'app/node_modules/.bin/tsx'),str(O/'author/bind_raw_E0G0.ts'),'--check'],cwd=R,env={**os.environ,'PYTHONDONTWRITEBYTECODE':'1'},capture_output=True,text=True);assert check.returncode==0,(check.stdout,check.stderr);stock=json.loads(check.stdout);assert not stock['errors'] and stock['recordCount']==15
 spec=importlib.util.spec_from_file_location('production_validate_schemas',R/'scripts/validate_schemas.py');production=importlib.util.module_from_spec(spec);spec.loader.exec_module(production)
 runtime_schema=read(R/'docs/landscape-runtime.schema.json');json_count=0;jsonl_records=0;ast_count=0
 for p in files:
  if p.suffix=='.json':assert production.validate_file(p,runtime_schema),str(p);json_count+=1
  elif p.suffix=='.jsonl':
   for line in p.read_text().splitlines():
    if line.strip():json.loads(line);jsonl_records+=1
  elif p.suffix=='.py':ast.parse(p.read_text(),filename=str(p));ast_count+=1
 symlinks=production.curriculum_symlink_errors(R);assert not symlinks,symlinks
 out=subprocess.run(['git','ls-files','--cached','--others','--exclude-standard','-z','--',str(O.relative_to(R))],cwd=R,capture_output=True,check=True).stdout
 committable={os.fsdecode(v) for v in out.split(b'\0') if v};assert all(str(p.relative_to(R)) in committable for p in files)
 result={'schemaVersion':1,'role':'Finite technical author-package verification only; no independent review or gate approval','status':'PASS','preseal':preseal,'ownFilesChecked':len(files),'ownJsonFilesProductionValidateFile':json_count,'ownJsonlRecordsParsed':jsonl_records,'ownPythonAST':ast_count,'originalCASFilesExact':len(originals['files']),'originalCASBytes':originals['totalBytes'],'currentWholeGoals':15,'currentOpenGoals':15,'exclusiveLedgerGoals':15,'otherClaimOverlap':0,'wholeCanonicalDefinitionsExact':len(ctx['wholeGoals']),'sourceCellsExact':479,'wholePartnerGoalsExact':150,'wholePassagesExact':183,'deduplicatedExactTextBodies':155,'textOnlyPassages':120,'caseObjectsRetainedExact':24,'caseObjectsTargetedRevised':6,'caseCount':30,'bilingualRubricClausesJoined':rubric_count,'independentArithmeticRecomputations':len(nums),'rawE0G0StockSemanticRecords':15,'retainedRawMemoryLines':15,'existingPNGsUnmodified':3,'stockCurriculumSymlinkErrors':symlinks,'newIndependentVotes':0,'newPAMVApproval':0,'newStrictCompletions':0,'activeWrites':0,'humanApproval':False,'humanTrials':False}
 print(json.dumps(result,ensure_ascii=False,indent=2))
if __name__=='__main__':main()
