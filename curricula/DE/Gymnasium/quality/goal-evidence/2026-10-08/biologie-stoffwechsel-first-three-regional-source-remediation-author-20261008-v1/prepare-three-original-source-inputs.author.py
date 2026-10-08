# SPDX-License-Identifier: Apache-2.0
"""Capture only current three-goal source inputs; no active or historic writes."""
from pathlib import Path
from datetime import datetime, timezone
import hashlib, json, subprocess, shutil, urllib.request
R=Path.cwd();D=Path(__file__).resolve().parent;B=D.parent
A=B/'biologie-he-metabolism-ecology-twenty-four-whole-science-author-20261008-v1'
IDS=['32f47903-0788-5c27-ac88-7464f481f2f7','135447a0-5d55-564a-afc3-3e3fbed77819','ec782ce3-475e-5628-b3fe-947d72e74a74']
sha=lambda p:hashlib.sha256(Path(p).read_bytes()).hexdigest()
def bound(p):
 p=Path(p);assert p.is_file() and not p.is_symlink(),p
 return {'path':str(p.relative_to(R)),'sha256':sha(p),'bytes':p.stat().st_size}
def put(name,value):
 p=D/name;p.parent.mkdir(parents=True,exist_ok=True)
 data=((value if isinstance(value,str)else json.dumps(value,ensure_ascii=False,indent=2))+'\n').encode()
 assert not p.exists(),p;p.write_bytes(data);return bound(p)
def copy(source,name):
 q=D/name;q.parent.mkdir(parents=True,exist_ok=True);assert not q.exists(),q
 shutil.copyfile(source,q);return bound(q)
root=json.loads((R/'curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json').read_text())
subject=next(s for s in root['subjects']if s['subject']=='biologie')
canon=json.loads((R/subject['landscapePath']).read_text());by={g['id']:g for g in canon['goals']};assert len(by)==476
old=json.loads((A/'rebase-current/canonical.current476.exact.json').read_text());oldBy={g['id']:g for g in old['goals']}
assert all(by[i]==oldBy[i]for i in IDS)
inputs=json.loads((R/'app/scripts/config/goal-books/de-gym-biology-national-atlas.inputs.json').read_text())
whole=json.loads((A/'source/whole24-all-current-regional-source-duties-all-1n-partners.lossless.json').read_text())
edges=[e for e in whole['matchedEdgesData']if e['goalId']in IDS];keys={e['sourceKey']for e in edges}
sources=[s for s in whole['sourceGoals']if s['sourceKey']in keys]
assert len(edges)==25 and len(sources)==20 and sum(len(s['allPartnerRows'])for s in sources)==268
guards=[];bodyRows=[]
for ordinal,s in enumerate(sources,1):
 assert s['mappingPath']in inputs['mappingPaths'],s['mappingPath']
 mapping=json.loads((R/s['mappingPath']).read_text())
 decisions=mapping['decisions'];actual=next(x for x in decisions if x['sourceGoalId']==s['wholeRetainedExtractionGoal']['id'])
 assert actual==s['wholeCurrentDecision'],s['sourceKey']
 for row in s['allPartnerRows']:
  assert row['canonicalGoalId']in by
  bodyRows.append({'sourceOrdinal':ordinal,'sourceKey':s['sourceKey'],'wholeMappingPartnerRow':row,'wholeCurrentCanonicalPartnerBody':by[row['canonicalGoalId']],'newScienceApprovalClaimed':False})
 for path in [s['mappingPath'],s['sourceExtractionPath']]:
  if path not in [g['original']['path']for g in guards]:
   guards.append({'original':bound(R/path),'portableWholeCopy':copy(R/path,f'input/source-whole-files/{len(guards)+1:02d}-{Path(path).name}')})
put('input/selected20-whole-duties-all268-partner-rows.exact.json',{'schemaVersion':1,'sourceCount':20,'directEdgeCount':25,'partnerRowCount':268,'wholeSourceDuties':sources,'wholeDirectEdges':edges,'unselectedSourceDuties25UnchangedNotNewlyReviewed':True})
put('input/all268-whole-current-partner-bodies.exact.json',{'schemaVersion':1,'rows':bodyRows,'all268WholePartnerRowsRetained':True,'wholePartnerScienceNewlyApproved':False})
copy(R/subject['landscapePath'],'input/canonical.current476.exact.json')
copy(R/subject['semanticKindLedgerPath'],'input/semantic-kinds.current476.exact.json')
copy(R/'app/scripts/config/goal-books/de-gym-biology-national-atlas.inputs.json','input/current-atlas-inputs.exact.json')
put('input/whole-current-three-goals-and-contexts.exact.json',{'schemaVersion':1,'goals':[{ 'ordinal':n+1,'wholeGoal':by[i],'wholePrerequisiteBodies':[by[x]for x in by[i]['requires']],'wholeParentBodies':[g for g in by.values()if i in g.get('contains',[])],'wholeRequiresConsumers':[g for g in by.values()if i in g.get('requires',[])]}for n,i in enumerate(IDS)],'wholeCurrentBodiesUnchangedFromReviewedAuthorFrame':True})
cases=json.loads((A/'whole48.material-task-model-scoring-independent-fresh-transfer.DEEN.author.json').read_text())
selectedCases=[c for c in cases['cases']if c['goalId']in IDS];assert len(selectedCases)==6
put('science/whole-six-DEEN-cases-and-fresh-transfers.exact-KEEP.json',{'schemaVersion':1,'role':'Exact unchanged scientific inputs, no new case authoring or review','cases':selectedCases,'status':'ai_candidate','humanApproval':False,'performedExperiments':0})
profiles=json.loads((A/'P24.whole48-complete-DEEN-author.candidates.json').read_text())
put('science/whole-three-P-profiles.exact-KEEP.json',{'schemaVersion':1,'role':'Exact unchanged whole profiles; current science is already genuinely reviewed, source followup only','goals':[g for g in profiles['goals']if g['goalId']in IDS],'status':'needs_human_review','reviewAuthority':'ai_candidate'})
originalPair=[]
for prefix,judgment,key,freeze in [
 ('biologie-he-metabolism-ecology-twenty-four-whole-science-independent-a-20261008-v1','whole24-science-source-class-AM-P.independent-a.first.verdicts.json','ownJudgments','whole24-science-source-P.independent-a.first.freeze.json'),
 ('biologie-he-metabolism-ecology-twenty-four-whole-science-independent-b-20261008-v1','whole24-whole48-science-source-P-A-M.independent-b.first.verdicts.json','entries','whole24-whole48-source-science-independent-b.first.freeze.json')]:
  p=B/prefix;v=json.loads((p/judgment).read_text());selected=[x for x in v[key]if x['goalId']in IDS]
  assert len(selected)==3
  originalPair.append({'originalVerdict':bound(p/judgment),'originalFirstSeal':bound(p/freeze),'actualWholeThreeJudgments':selected,'newReviewOrResolvedFindingClaimed':False})
put('science/genuine-original-three-science-P-AM-and-open-source-judgments.KEEP.json',{'schemaVersion':1,'pair':originalPair,'unchangedSciencePProfilesAndCasesRetained':True,'sourceFindingsStillOpenUntilIndependentFollowups':True})
pages={'BB':[29,30],'BE':[29,30],'HE':[45,46],'MV':[21,22],'NW':[22,30,31],'SH':[27],'SN':[37,38,39],'ST':[28,29,30,31,34,35,36,37],'TH':[22,23,24,26,27]}
documents={}
for s in sources:
 if not s['sourceDocument']['path'].endswith('.pdf'):continue
 tags=s['wholeRetainedExtractionGoal'].get('tags',[])
 jurisdiction=next(t.split(':')[1].removeprefix('DE-')for t in tags if t.startswith('jurisdiction:'))
 documents[jurisdiction]=s['sourceDocument']
assert set(documents)==set(pages)
captures=[]
for jurisdiction,ns in pages.items():
 doc=documents[jurisdiction];pdf=R/doc['path'];assert pdf.is_file()
 for n in ns:
  q=D/f'primary/{jurisdiction}-physical-page-{n:03d}.whole-official.txt';q.parent.mkdir(parents=True,exist_ok=True);assert not q.exists()
  cmd=['pdftotext','-layout','-f',str(n),'-l',str(n),str(pdf),str(q)]
  p=subprocess.run(cmd,capture_output=True,text=True);assert p.returncode==0 and q.is_file(),p.stderr
  captures.append({'jurisdiction':jurisdiction,'wholeOriginalPDF':bound(pdf),'officialURL':doc['url'],'physicalPage':n,'zeroBasedPDFPage':n-1,'wholeOriginalPage':bound(q),'actualExtractionCommand':cmd,'actualExitCode':p.returncode,'extractionNormalization':'none, complete primary page layout bytes','originalNativeStageNotSilentlyWidened':True})
for level in ['EA','GA']:
 copy(A/f'primary/BY13-{level}-official.actual-text.txt',f'primary/BY13-{level}.whole-retained-official.txt')
 url='https://www.lehrplanplus.bayern.de/fachlehrplan/gymnasium/13/biologie/'+('erhoeht'if level=='EA'else'grundlegend')
 q=D/f'primary/BY13-{level}.actual-current-official-HTML.txt';assert not q.exists()
 with urllib.request.urlopen(url,timeout=45)as response:raw=response.read();status=response.status
 assert status==200 and b'Chromatographie'in raw;q.write_bytes(raw)
 captures.append({'jurisdiction':'BY','actualOfficialCourse':level,'officialURL':url,'actualHTTPStatus':status,'rawOfficialHTMLBytes':bound(q),'completeRetainedReadableText':bound(D/f'primary/BY13-{level}.whole-retained-official.txt'),'readCurrentOfficialWebPageThisAuthorTurn':True,'technicalMergedSourceCourseLabelsAreNotNativeNames':True})
put('primary/actual-targeted-whole-source-page-capture.author.receipt.json',{'schemaVersion':1,'capturedAt':datetime.now(timezone.utc).isoformat(),'role':'Author actual original source reading and capture, not independent release','wholePhysicalPDFPages':len([c for c in captures if'physicalPage'in c]),'captures':captures,'sourceOriginalsAuthoritativelyRetained':True,'activeWrites':0,'strictGainClaimed':0,'humanApproval':False,'humanTrial':False})
put('input/actual-current-source-and-protected-goal-input.guards.json',{'schemaVersion':1,'goalIds':IDS,'activeCanonicalBefore':bound(R/subject['landscapePath']),'activeKindsBefore':bound(R/subject['semanticKindLedgerPath']),'activeAtlasBefore':bound(R/'app/scripts/config/goal-books/de-gym-biology-national-atlas.inputs.json'),'sourceWholeFileGuards':guards,'all20CurrentWholeSourceDecisionsExactToOriginalAuthor':True,'all268WholeCurrentPartnerBodiesRetained':True,'originalIndependentPair':originalPair,'activeWrites':0})
print(json.dumps({'folder':str(D.relative_to(R)),'goals':3,'sources':20,'edges':25,'wholePartnerRows':268,'wholePDFPages':30,'activeWrites':0,'strictGainClaimed':0}))
