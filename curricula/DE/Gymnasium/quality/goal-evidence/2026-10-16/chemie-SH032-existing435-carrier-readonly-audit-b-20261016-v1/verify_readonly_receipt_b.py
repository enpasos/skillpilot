"""Bounded reproducibility checks for this read-only diagnosis; no new QA votes."""
from pathlib import Path
import json,hashlib,subprocess,datetime,collections,sys
R=Path('/home/enpasos/projects/skillpilot')
H=R/'tmp/chemie-m7-resumed-20261016/current578-one-sparse-own-host-v1'
O=Path(__file__).resolve().parent
C=R/'tmp/chemie-SH032-readonly-b-stock-capsule-20261016'
def sha(b):return hashlib.sha256(b).hexdigest()
def rd(p):return json.loads(p.read_text())
def pin(p):
 b=p.read_bytes();return {'path':str(p.relative_to(R)),'sha256':sha(b),'bytes':len(b)}
checks=[]
def check(name,ok):
 assert ok,name
 checks.append({'name':name,'pass':True})
data=rd(O/'INPUT.current629-selected-whole-goals-and-all435-text-index.actual.json')
canonical=rd(C/'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json')
by={g['id']:g for g in canonical['goals']}
check('Frozen actual H canonical is exact 6bed',sha((C/'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json').read_bytes())==data['canonical']['sha256']=='6bed948af8d0ba47d722fb6205bacba6f8792e233f58c1772366395dd8450d8e')
check('All 63 selected whole objects equal pinned actual H canonical',len(data['selectedWholeGoals'])==63 and all(g==by[g['id']] for g in data['selectedWholeGoals']))
pharma=by['4a98bbee-41cb-5aef-91c6-f18d7bf2a214']
check('Complete pharmacy subtree has 10 exact current children',len(pharma['contains'])==10 and all(x in {g['id'] for g in data['selectedWholeGoals']} for x in pharma['contains']))
ledger=rd(H/'curricula/DE/Gymnasium/quality/goal-book-publication/chemie.semantic-kinds.json')
ordinary={d['goalId'] for d in ledger['decisions'] if d['semanticKind']=='curricularAtomic'}
check('Text search index exactly current 435 ordinary IDs',len(ordinary)==435 and ordinary=={g['id'] for g in data['all435TextIndex']})
contexts=rd(O/'INPUT.current435-selected-whole-P-contexts.actual.json');configs=[];scopes=set();checkedrows=[]
central=rd(H/contexts['selectedCentralConfig'])['subjects'][0]
for rel in central['positiveEvidenceConfigPaths']:
 p=H/rel;cfg=rd(p);configs.append(pin(p));scopes.update(cfg['scope']['goalIds'])
check('Explicit current435 selected P config union is all 435',len(configs)==101 and scopes==ordinary)
for row in contexts['rows']:
 cfg=rd(H/row['configPath']);review=H/row['reviewPath'];rows=[json.loads(z) for z in review.read_text().splitlines() if z.strip()]
 check('Stored whole P row and config exact '+row['wholeCurrentRow']['goalId'],row['config']==cfg and row['wholeCurrentRow'] in rows)
 checkedrows.append(pin(review))
check('All selected current ordinary P contexts captured',len(contexts['rows'])==51 and {x['wholeCurrentRow']['goalId'] for x in contexts['rows']}==ordinary&{g['id'] for g in data['selectedWholeGoals']})
materials=rd(O/'INPUT.existing-nearest-carriers-six-whole-case-materials.actual.json')
check('Six existing whole material cases captured',sum(len(x['wholeCases']) for x in materials)==6)
for m in materials:check('Bound existing material hash '+m['actualReadPath'],sha((R/m['actualReadPath']).read_bytes())==m['sha256'])
source=rd(O/'INPUT.after-supported-integration-SH-whole-source-passages-and-aliases.actual.json')
check('Complete current affected official passage captured',len(source['wholePassages'])==1)
check('Source032 common and Source034/035 additional LK',all(g['courseLevel']==('GK_LK' if '-032-' in g['id'] else 'LK') for g in source['wholeGoals']))
for a in source['aliases']:
 current=rd(H/a['path']);d32=next(d for d in a['wholeDecisions'] if '-032-' in d['sourceGoalId']);edges=[e for e in a['wholeEdges'] if '-032-' in e['legacyGoalId']]
 check('Current whole decision still unreviewed and exact '+a['path'],d32['decision']=='unreviewed' and len(d32['canonicalGoalIds'])==3 and d32 in current['decisions'])
 check('Removed BY partner not reintroduced '+a['path'],len(edges)==3 and all(e['canonicalGoalId']!='cf2631d9-da24-50e8-9e50-db625e6efaad' for e in edges))
app=rd(O/'TECHNICAL.after-supported-H-integration-stock-selected-applicability.actual.json')
aromaids={'ac700167-001f-5ff8-9a7d-85909f5daa4f','b8d3b453-d638-5518-aab0-d84ec2e8567c','f0f67a7a-b06a-50b9-8edc-1f2a0d97520d','17ab1148-7383-5cab-8b91-73aff795f1e4'}
selected={g['goalId']:g for g in app['selectedGoals']}
check('Actual compiled SH membership for ac700 and all 3 children',all('DE-SH' in selected[x]['compiledApplicability']['jurisdiction'] for x in aromaids))
check('ac700 SH specifically backed by child union',any(e['kind']=='child-union' and e['value']=='DE-SH' for e in selected['ac700167-001f-5ff8-9a7d-85909f5daa4f']['evidence']))
check('No error findings for the four bounded ac700 objects',not any(f['severity']=='error' and f.get('goalId') in aromaids for f in app['findings']))
check('Whole compilation findings honestly preserved, no global PASS',app['summary']['errors']==575 and app['summary']['warnings']==142 and app['summary']['diagnostics']==2189)
memory=H/'curricula/DE/Gymnasium/quality/memory-card-review/canonical-chemistry-full.config.json';m=rd(memory);report=H/m['reportPath'];text=report.read_text()
check('Actual existing M435 normal report has zero blockers and complete memories','| ordinary atomic goals reviewed | 435 |' in text and '| memory goals traced | 57/57 |' in text and '| composition visibility scopes | 39 |' in text and '| blocking issues | 0 |' in text)
pdf=R/'curricula/DE/Gymnasium/input/SH/Fachanforderungen_Chemie_Sekundarstufe_2022_barrierearm.pdf'
check('Actual official PDF exact pinned primary',sha(pdf.read_bytes())=='ab56f18400f427991d6c7a7fba64be3e027c2a48c2d7d0c2c42f85db690981f9')
primarytext=subprocess.check_output(['pdftotext','-f','69','-l','71','-layout',str(pdf),'-'],text=True)
check('Primary pages contain actual source32 terms and selection boundary',all(t in primarytext for t in ['Forschung und Entwicklung','großtechnische Produktion','Vermarktung','Ergänzend können auf grundlegendem Niveau weitere Themenbereiche']))
current=rd(H/'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json');cb={g['id']:g for g in current['goals']}
check('All selected carrier whole objects remain unchanged at final receipt',all(g==cb[g['id']] for g in data['selectedWholeGoals']))
receipt={'role':'Reproducible bounded read-only receipt; no new science approval','capturedUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'checks':checks,'checkCount':len(checks),'currentCanonicalAtReceipt':pin(H/'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'),'selectedCurrentPConfigs':configs,'selectedPReviewFiles':list({x['path']:x for x in checkedrows}.values()),'existingNormalM435':pin(memory),'existingNormalM435Report':pin(report),'officialPDF':pin(pdf),'officialPages69to71Text':primarytext,'normalWrites':0,'newAuthorOrDPAMVVotes':0,'humanApproval':False}
target=Path(sys.argv[1]).resolve() if len(sys.argv)>1 else O/'CHECK.final-bounded-read-receipt.actual.json'
if target.exists():raise RuntimeError('Refusing to overwrite frozen check output; choose a new output path before reproducing')
target.write_text(json.dumps(receipt,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'checksPass':len(checks),'currentCanonical':receipt['currentCanonicalAtReceipt']['sha256'],'newVotes':0,'normalWrites':0}))
