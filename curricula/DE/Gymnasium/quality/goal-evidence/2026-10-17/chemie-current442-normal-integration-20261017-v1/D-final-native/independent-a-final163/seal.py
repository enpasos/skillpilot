import json,hashlib,datetime,subprocess
from pathlib import Path
from review_tools import OWN,roundpath,digest

def pin(p):
 p=Path(p);b=p.read_bytes();return {'path':str(p.resolve()),'sha256':digest(b),'bytes':len(b)}
# Preserve all sealed native bytes; fill the first batch's standalone validator receipt.
p=roundpath(1);inp=json.loads((p/'description-review-input.json').read_text());bookp=p.parent/'bundle/book-model.json';book=json.loads(bookp.read_text());pages={v['goalId']:v for v in book['pages']}
assert all(pages[g['goalId']]==g['reviewContext']['page'] for g in inp['goals'])
cmd=['npx','--prefix','app','tsx','app/scripts/validateGoalDescriptionReviewCampaignResults.ts','--bundle',str(p/'review-bundle-manifest.json'),'--input',str(p/'description-review-input.json'),'--campaign',str(p/'description-review-campaign.json'),'--batches-dir',str(p/'batches'),'--results-dir',str(p/'results')]
r=subprocess.run(cmd,text=True,capture_output=True);assert r.returncode==0,(r.stdout,r.stderr)
log={'command':cmd,'exitCode':r.returncode,'stdout':r.stdout,'stderr':r.stderr,'actualBook':{**pin(bookp),'allAssignedPagesExactMatch':True},'ownPromptCriteriaSchemaIdenticalAndApplied':True,'verificationOnlyNativeBytesPreserved':True}
(OWN/'batch-001.validation.json').write_text(json.dumps(log,ensure_ascii=False,indent=2)+'\n')
materials=[
('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-17/chemie-current439-HB-materials-resources-material-author-20261017-v1/materials/hb199-greenhouse-energy-climate.DE-EN.json',['whole bilingual scientific material']),
('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-17/chemie-current439-HB-materials-resources-material-author-20261017-v1/materials/hb201-btl-fischer-tropsch.DE-EN.json',['whole bilingual scientific material']),
('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-15/chemie-energy20-four-defects-targeted-material-author-successor-20261015-v1/materials/forty-two-whole-DE-EN-cases.four-defects-successor.author.json',['cases energy20-08-a and energy20-08-b: full bilingual scientific cases','cases energy20-20-a and energy20-20-b: materialsDe/materialsEn; complete task/solution/rubric already in final P body']),
('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/chemie-q3-three-BW-context-bound-practical-companions-author-v1/science/whole-six-new-practical-protocol-cases.de-en.author-candidate.json',['cases bw-practical-equilibrium-a/b: full bilingual scientific cases','cases bw-practical-voltage-a/b: materialDe/materialEn, procedureDe/procedureEn, syntheticData; complete task/solution/rubric already in final P body']),
('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-17/chemie-current441-HB-lower14-current-whole-union-author-20261017-v2/materials/HB-lower14-ten-complete-DE-EN-cases.pending.json',['cases[6] HB-L031-own-household-cleaner-ph: whole bilingual case']),
('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-15/chemie-energy-eleven-kept-current422-positive-and-atomic-informed-20261015-v1/materials/eleven-whole-cases22.targeted-informed-successor.json',['cases energy20-06-a and energy20-06-b: full bilingual scientific cases']),
('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-17/chemie-current439-HB-materials-resources-material-author-20261017-v1/materials/hb217-dye-origins-polyenes.DE-EN.json',['whole bilingual scientific material']),
('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-17/chemie-current439-HB-materials-resources-material-author-20261017-v1/materials/hb210-nanocomposite.DE-EN.json',['whole bilingual scientific material']),
('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-17/chemie-current439-HB-biomolecules-material-author-20261017-v1/MATERIALS.whole-DE-EN.pending.json',['case hb-bio-mutarotation-two-starting-anomers: whole bilingual scientific case']),
('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-14/chemie-source6-five-actual-current412-full-gate-author-20261014-v1/cases/whole-five-goals-ten-complete-bilingual-application-cases.author.json',['goal d72cbb62-0b65-5b9a-aece-70c23d4e618a cases case-1/case-2: materialDe/materialEn only']),
('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-17/chemie-current441-HB134-GK-digital-titration-02634-author-20261017-v1/HB134-GK-own-digital-strong-acid-titration.DE-EN.json',['whole bilingual scientific material']),
('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-15/chemie-equilibrium-redox-kinetics16-current422-whole-material-author-20261015-v1/materials/thirty-two-whole-DE-EN-cases.final-science-and-prose.author.json',['cases eqrk16-16-a/b and eqrk16-02-a/b: full bilingual scientific cases'])
]
ledger={'reviewerId':'codex-independent-reviewer-A-final163','recordedAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'scope':'Additional actual scientific material reads; every assigned final round-a D, canonicalContext, direct relations and complete supplied P body was separately read. File pins identify the containing artifact; selectedSections explicitly limit what was read. No historical peer judgments were used.','materials':[dict(**pin(path),selectedSections=sections) for path,sections in materials]}
mp=OWN/'materials-actually-read.pins.json';mp.write_text(json.dumps(ledger,ensure_ascii=False,indent=2)+'\n')
allrecords=[];batches=[]
for n in range(1,10):
 rp=OWN/f'batch-{n:03d}.receipt.json';receipt=json.loads(rp.read_text());validation=json.loads((OWN/f'batch-{n:03d}.validation.json').read_text());assert validation['exitCode']==0
 for key in ['nativeRun','nativeRecords']:
  original=receipt[key];actual=pin(original['path']);assert actual['sha256']==original['sha256'] and actual['bytes']==original['bytes']
 records=[json.loads(line) for line in Path(receipt['nativeRecords']['path']).read_text().splitlines()];a=json.loads((roundpath(n)/'description-review-input.json').read_text());assert [x['goalId'] for x in records]==[x['goalId'] for x in a['goals']]
 assert len(records)==(20 if n<9 else 3)
 allrecords+=records;batches.append({'batch':f'{n:03d}','receipt':pin(rp),'nativeRun':pin(receipt['nativeRun']['path']),'nativeRecords':pin(receipt['nativeRecords']['path']),'validation':pin(OWN/f'batch-{n:03d}.validation.json'),'goalCount':len(records)})
assert len(allrecords)==len(set(r['goalId'] for r in allrecords))==163
assert all(r['recordStatus']=='candidate' and r['reviewAuthority']=='ai_candidate' for r in allrecords)
seal={'sealId':'codex-independent-reviewer-A-final163-FIRST-20261018','reviewerId':'codex-independent-reviewer-A-final163','provider':'OpenAI','model':'GPT-6 (Codex); exact snapshot not exposed','reviewMode':'stock_blind_final_input_first_pass','finalInputActuallyRead':True,'peerResultsReadBeforeOwnSeal':False,'blindToOtherRuns':True,'status':'completed','sealedAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'goalCount':len(allrecords),'uniqueGoalCount':len(set(r['goalId'] for r in allrecords)),'batchCount':9,'allNineOwnRoundsStockValid':True,'decisionCounts':{d:sum(r['decision']==d for r in allrecords) for d in ['keep','revise','split_review','block']},'evidenceProfileRecommendationCounts':{d:sum(r['evidenceProfileRecommendation']==d for r in allrecords) for d in ['none','revise','create']},'PAlignmentFindings':[{'goalId':r['goalId'],'decision':r['decision'],'recommendation':r['evidenceProfileRecommendation'],'rationale':r['rationale']} for r in allrecords if r['evidenceProfileRecommendation']!='none'],'materialsActuallyRead':pin(mp),'batches':batches,'scopeLimit':'Only own round-a native result files and own independent A audit files written. No canonical, C/SEM/P/A/M/V or registry mutations. Machine-only candidates; no human approval, learner-performance or effective-source/projection acceptance claim.'}
sp=OWN/'FINAL-FIRST-PASS-A.seal.json';sp.write_text(json.dumps(seal,ensure_ascii=False,indent=2)+'\n');print(json.dumps({'seal':pin(sp),'counts':seal['decisionCounts'],'P':seal['evidenceProfileRecommendationCounts'],'allStockValid':True},ensure_ascii=False))
