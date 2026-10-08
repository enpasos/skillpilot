#!/usr/bin/env python3
"""Bounded inactive source-role preparation and exact existing evidence reuse."""
import hashlib,json,math,shutil
from pathlib import Path
from datetime import datetime,timezone

R=Path('/home/enpasos/projects/skillpilot');B=Path(__file__).resolve().parent;REL=str(B.relative_to(R))
def load(p):return json.loads(Path(p).read_text())
def dump(name,x):
 p=B/name;p.parent.mkdir(exist_ok=True,parents=True);p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n')
def digest(p):return 'sha256:'+hashlib.sha256(Path(p).read_bytes()).hexdigest()
ids=load(B/'scope20.json');rows=load(B/'whole20.original-source-duties.all-current-partners.json')
canon=load(B/'frozen-inputs/01.DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json');gs={g['id']:g for g in canon['goals']}
registry=load(B/'frozen-inputs/04.de-gymnasium-math-physics.config.json');chem=next(s for s in registry['subjects'] if s['subject']=='chemie')

source_documents=[
 {'id':'HE2026','originalUrl':'https://kultus.hessen.de/sites/kultus.hessen.de/files/2026-07/kcgo_chemie_21.04.2026.pdf',
  'repositoryOriginal':'curricula/DE/Gymnasium/input/HE/upper-secondary/kcgo_chemie_21.04.2026.pdf','readPrintedPages':[45,46,47,48],
  'readMethod':'Actual primary official PDF opened with web tool, repository original pdftotext layout read; page46 visually inspected from retained original. Ausgabe2024, Stand21.04.2026. Q3.1-3 obligations depend on yearly decree; Q3.4-5 are optional context fields, not universal mandatory stage content.'},
 {'id':'HB2022','originalUrl':'https://www.lis.bremen.de/sixcms/media.php/13/BP%20Che%20GyO_final.pdf',
  'repositoryOriginal':'curricula/DE/Gymnasium/input/HB/GyO_Chemie_2022.pdf','readPrintedPages':[22,24,31,32],
  'readMethod':'Actual primary official PDF opened by web tool; retained original layout text read and original page24 visually inspected. Original inputs URL/GyO_Chemie_2022.pdf is now404 on direct retrieval; current alternate web primary locator was readable through web tool, direct curl also404. No successful live-byte-match asserted. Thick-framed duties and optional/experiment-example sections kept distinct.'},
 {'id':'BY12GA','originalUrl':'https://www.lehrplanplus.bayern.de/fachlehrplan/gymnasium/12/chemie/grundlegend','readSections':['C12.6','C12.7','C12.8'],
  'readMethod':'Live official native page text read. Original current operators and context differ from any shortened canonical label; GK/LK are technical projection labels; native page is grundlegendes Anforderungsniveau.'},
 {'id':'BY12EA','originalUrl':'https://www.lehrplanplus.bayern.de/fachlehrplan/gymnasium/12/chemie/erhoeht','readSections':['C12.6','C12.7','C12.8'],
  'readMethod':'Live official native page text read. Native erhöhtes Anforderungsniveau is preserved; source occurrences are not all separately certified.'},
 {'id':'BY13GA','originalUrl':'https://www.lehrplanplus.bayern.de/fachlehrplan/gymnasium/13/chemie/grundlegend','readSections':['C13.5'],
  'readMethod':'Live official native page text read: current hydrogen and corrosion duties, protection mechanisms and ecological/economic judgment.'},
 {'id':'BY13EA','originalUrl':'https://www.lehrplanplus.bayern.de/fachlehrplan/gymnasium/13/chemie/erhoeht','readSections':['C13.5'],
  'readMethod':'Live official native page text read: ion discharge/overpotential, quantitative Faraday, hydrogen/corrosion. Scope of native higher level retained.'},
]
for d in source_documents:
 if 'repositoryOriginal' in d:d['repositoryOriginalSha256']=digest(R/d['repositoryOriginal'])
dump('source/actual-original-primary-locators-and-read-boundaries.json',{'documents':source_documents,'noRawPdfHtmlRequired':True,'actualExperimentsPerformed':False,'wholeNationwideSourcesReviewed':False})

# Source extraction wording is preserved without relabeling it an original quote.
# Store each source goal once with ALL partners/decision, and retain each matched
# target edge separately. This lossless deduplication avoids repeating 1:n rows.
pooled={};edges=[]
for r in rows:
 key=r['mappingPath']+'#'+r['sourceGoal']['id']
 if key not in pooled:
  m=load(R/r['mappingPath']);sid=r['sourceGoal']['id']
  pooled[key]={'sourceKey':key,'mappingPath':r['mappingPath'],'sourceExtractionPath':r['sourceExtractionPath'],
   'sourceDocument':r['sourceDocument'],'sourceDocuments':r['sourceDocuments'],'wholeRetainedExtractionGoal':r['sourceGoal'],
   'wholeRetainedPassages':r.get('passages',[]),
   'allPartnerRows':r['allPartnerRows'],'wholeCurrentDecision':next((d for d in m.get('decisions',[]) if d.get('sourceGoalId')==sid),None),
   'wordingAuthority':'retained-extraction-not-automatically-original-quotation',
   'reviewStatus':'not-newly-reviewed-nationwide-duty'}
 edges.append({'sourceKey':key,'mappingRow':r['mappingRow']})
dump('source/whole-all-current-source-goals-and-1n-partners.lossless.json',{'schemaVersion':1,'matchedEdges':len(edges),'uniqueSourceDuties':len(pooled),'sourceGoals':list(pooled.values()),'matchedEdgesData':edges})

boundaries=[
 ('HE2026 Q3.1 p46 GK_LK; BY12GA C12.7; HB2022 p22','Species coexistence and nonzero equal rates, closed model. HB normalized experimental wording is not copied as an original literal. Original HB process section requires planning/execution separately; written model does not prove it.'),
 ('HE2026 Q3.1 p46 GK_LK / LK split; BY12GA C12.7; HB2022 p22','Simplified equal-sum coefficients versus extended LK coefficients/concentration calculation including quadratics stay separate. Current simplified MWG target alone does not clear the original full LK duty.'),
 ('HE2026 Q3.1 p46; BY12GA C12.7; HB2022 p22','All concentration/pressure/temperature effects retained. HE Q3.4 phosphate-buffer partner remains required; neither that partner nor its complete source duty is newly approved.'),
 ('BY12GA/EA C12.7; HB2022 p22','Source mathematical optimization is one process argument. HB normalized sentence is interpretation of broader original equilibrium-calculation and sustainable-process duties, not literal original operator.'),
 ('BY12GA C12.7; HB2022 p22','Original BY links information selection/checking to explanation, but whole A compound HOLD remains. HB normalized source-critical label combines original sustainability duties with process/media duties; no fresh original literal match claimed.'),
 ('HE2026 Q3.1 p46 and Q3.5 p48; BY12GA/EA C12.6; HB2022 p24','Homogeneous and heterogeneous examples plus kinetics-only catalyst effect retained. Broad BY model competency keeps every partner, including independent model-selection/limits goals. Enzyme-specific source partners stay intact and unapproved.'),
 ('HE2026 Q3.1 p46 LK','Haber-Bosch is explicit LK expansion; basic ammonia-example row remains GK_LK. Partner20f must not carry the whole unequal-stoichiometry/quadratic duty alone; source binding remains HOLD until current complete partner union is evidenced.'),
 ('HE2026 Q3.3 p47 LK; BY13EA C13.5; HB2022 p31 LK','Original requires overpotential/decomposition voltage and current higher-level discharge explanation. Local-state potentials, electrode material and transport retained. HB generalized all-three electrolysis row requires partner electrolysis/Faraday roles too.'),
 ('HE2026 Q3.3 p47 LK; BY13EA C13.5; HB2022 p31 LK','HE Faraday explicitly without calculations. BY/higher and HB/LK quantitative role supports these calculation cases. Do not transform HE into mandatory quantitative application or claim all mapped GK visibility normative.'),
 ('HE2026 Q3.3 p47 GK_LK; BY12GA/EA C12.8; HB2022 p31','Standard cell prediction and voltage retained; higher BY source Nernst portion stays at b752 partner, not newly certified here. HB original has measurement-method/practical duties beyond written standard-voltage cases.'),
 ('BY12GA/EA C12.8; HB2022 p31','Original BY includes spatial separation and work from U/I measurements; A compound HOLD retained. Thermodynamic maximal non-expansion electrical work is -ΔG at T,p, not automatically -ΔH. Synthetic measurement interpretation proves no performed measurement.'),
 ('BY12GA/EA C12.8; HB2022 p31','Primary-cell comparison retained. HB full source includes explicit alkali,lead and lithium-ion reactions and practical/secondary-cell roles; all accumulator/fuel-cell/social partners remain unchanged, without whole-union approval.'),
 ('HE2026 Q3.3 p47 GK_LK; BY13GA/EA C13.5; HB2022 p31 broad electrochemical context and p32 optional Power-to-X extension','Renewable electrolysis,physical/chemical storage and chain efficiency retained. BY original comparison also includes photocatalysis/artificial photosynthesis and raw materials/catalysts. HB p32 lists Power-to-X only as a Vertiefung,not an explicit binding hydrogen-storage competency. Current20 target does not clear those separate broader duties; all partner roles remain open.'),
 ('BY13GA/EA C13.5; HE2026 Q3.3 p47; HB2022 p31','Oxygen/acid corrosion both retained with donor/acceptor,local cells,balanced half-equations. HB normalized microlevel phrasing is interpretation; original broader explanation/protection duty also retains other partners.'),
 ('BY13GA/EA C13.5; HB2022 p31','Contact-corrosion whole principle retained,including two conduction paths. HB all-protection partner union is not narrowed or newly approved.'),
 ('BY13GA/EA C13.5','Original deviation/use duty includes standard-potential expectation versus spontaneous passivation. Current whole title/body is retained; environment-specific use requires stated data,not universal immunity.'),
 ('BY13GA/EA C13.5; HB2022 p31','All passive/active mechanisms and ecological/economic judgment retained. Original HB also includes practical corrosion context; synthetic judgment does not stand for experimental performance.'),
 ('HE2026 Q3.5 p48 optional field; BY12GA/EA C12.6; HB2022 p24','Current mean/instantaneous and c/n/V representations retained. HE factor row currently points at rate goal although factor explanation is current3ce; preserve it as unresolved source-role concern,not a cleared exact whole obligation.'),
 ('HE2026 Q3.5 p48 optional field; BY12GA/EA C12.6; HB2022 p24','All four current factors with collision reasoning retained. Original HB includes pressure and quantitative effects too; source partner561 and inquiry/media rows remain intact,not approved. BY12GA requires hypothesis-led experiment planning; BY12EA additionally requires execution. Written model cases do not certify either performed experimental duty. The retained HE Q4.1 enzyme partner is not newly reviewed. Enzyme temperature effects are not replaced by unlimited monotonic rule.'),
 ('HB2022 p24 only direct current mapping','SOURCE HOLD: actual primary page24 and binding LK terms do not specify Arrhenius. Normalized row also bundles mechanisms/autocatalysis/catalysis types; preserve all1383/5cdf/16f partner duties. HE2026 p48 also supplies no Arrhenius obligation. Mathematical cases are coherent but do not create official normative source support.'),
]
out=[]
for i,gid in enumerate(ids):
 src=[e for e in edges if e['mappingRow'].get('canonicalGoalId')==gid or gid in e['mappingRow'].get('canonicalGoalIds',[])]
 out.append({'goalId':gid,'wholeGoal':gs[gid],'selectedOriginalLocators':boundaries[i][0],
  'authorInterpretationAndRemainingDuties':boundaries[i][1],
  'sourceQuoteAuthority':'Locator refers to actual original read; above is author interpretation, not a quotation of the extraction string.',
  'allMappedDutyReferences':list(dict.fromkeys(e['sourceKey'] for e in src)),
  'allMappedDutiesNewlyReviewed':False,'all1nPartnersRetained':True,
  'wholeSourceClearance':'HOLD' if i in [1,6,8,12,17,18,19] else 'bounded-author-candidate-only',
  'experimentalSourceDutyCountsAsPerformed':False})
dump('source/whole20-original-source-scope-operator-assessment.author-candidate.json',out)

# Existing mapping-review envelope only, no invented source-role schema.
# Narrow candidate: mark HB Arrhenius bundled row partial and explicit unresolved
# rationale, retaining each partner and mapping edge. It is deliberately inert.
mp='curricula/DE/Gymnasium/mapping/DE-HB/upper-secondary/hb_chemistry_upper_secondary_source_extraction_to_canonical_chemistry.review.json'
m=load(R/mp);shutil.copyfile(R/mp,B/'frozen-inputs/hb-current-all-eight-roles-already-adopted.review.json')
sid='hb-chemistry-sekii-gyo2022-3-3-1-3-kinetik-045-9b33e04d'
decision=next(d for d in m['decisions'] if d['sourceGoalId']==sid)
before=json.loads(json.dumps(decision))
decision['matchType']='partial'
decision['rationale']='INACTIVE E1/G1 author source HOLD; no fresh independent review. Actual original HB2022 printed page24 was read and visually inspected: its LK duties concern reaction order and SN1/SN2; the normalized extraction phrase Arrhenius is not confirmed as an original normative statement. All original source identity, full extracted text and all four existing canonical partners remain unchanged. No mapping edge deleted or added. Do not use this row as normative Arrhenius clearance; re-extract original operators and obtain a reviewed correct source/role binding before activation.'
decision['reviewer']='Inactive author candidate, independent source/science review pending'
decision['reviewedAt']=datetime.now(timezone.utc).isoformat()
dump('source/hb-arrhenius-original-duty-hold.inactive.review.json',m)
dump('source/one-existing-schema-source-binding-candidate.exact-delta.json',{'activePath':mp,'candidatePath':f'{REL}/source/hb-arrhenius-original-duty-hold.inactive.review.json','before':before,'after':decision,'mappingEdgesChanged':0,'allPartnerGoalIdsUnchanged':before['canonicalGoalIds']==decision['canonicalGoalIds'],'activeWrite':False,'activationPermittedByThisArtifact':False})

# Current V reuse: exact files and QA bytes only, not new image review.
qa=load(B/'frozen-inputs/03.chemie.qa.json');qr={x['goalId']:x for x in qa['records']};v=[]
for gid in ids:
 q=qr[gid];g=gs[gid];links=[x for x in g.get('resourceLinks',[]) if x.get('type')=='goal-visualization']
 assets=[]
 for link in links:
  p=R/'app/public'/link['url'].lstrip('/');h=digest(p)
  assets.append({'url':link['url'],'path':str(p.relative_to(R)),'sha256':h,'qaAssetMatch':h==q.get('assetSha256'),'qaAIApprovedAssetMatch':h==q.get('aiApprovedAssetSha256')})
 v.append({'goalId':gid,'existingQARecord':q,'currentAssetHashes':assets,
           'existingVValid':q.get('aiApproved')=='yes' and bool(assets) and all(a['qaAIApprovedAssetMatch'] and a['qaAssetMatch'] for a in assets),
           'newImageCreated':False,'newImageReviewed':False,'humanApprovalGranted':False})
dump('existing-whole20-V-exact-hash-reuse.actual.json',{'checkedGoals':20,'validExistingV':sum(x['existingVValid'] for x in v),'records':v})

# Baseline evidence is the root's actual exit0 report, never stale sibling totals.
base='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08/chemie-b014-eight-reviewed-source-roles-active-integration-root-v1/active-after-eight-source-roles-central.actual.json'
central=load(R/base)
dump('central-at-author-start.reference.actual.json',{'sourcePath':base,'sourceSha256':digest(R/base),'subjectRecords':central.get('subjects',[]),'interpretation':'Historical observed root central result at author start. This inactive package changes no active counts. Parallel Biology integrations must be read live by root,not inferred from this chemistry snapshot.'})

# Correct independent numerical checks use arithmetic, not implementation clones.
arithmetic=[('equilibrium_K',.4*.4/(.2*.2),4),('addition_quadratic_x',(10-math.sqrt(28))/6,.784749562),('compression_reverse_x',(5-math.sqrt(17))/4,.219223594),('Haber_Kc',.4**2/(.2*.6**3),3.703703704),('Cu_mass',1930/(2*96485)*63.55,.635598798),('Al_time',.1*3*96485/5,5789.1),('cell_work_variable',1.1*.2*100+.9*.1*200,40),('H2_chain',100*.7*.9*.5,31.5),('Arrhenius_Ea',8.314*math.log(4)/(1/300-1/320),55323.126328)]
for name,actual,expected in arithmetic:assert abs(actual-expected)<max(1e-5,abs(expected)*1e-8),(name,actual,expected)
dump('quantitative-arithmetic.independent.actual.json',{'exitCode':0,'checks':[{'id':name,'actual':a,'expected':e,'passed':True} for name,a,e in arithmetic],'correctedBeforeSeal':'Arrhenius two-point value corrected to55323.1J/mol=55.32kJ/mol; native P records regenerated afterward.'})

# early holds remain transparent; no A20 success inflation.
dump('whole20-author-clear-candidates-and-HOLD-list.json',{'atomicAuthorCandidateGoalIds':[gid for i,gid in enumerate(ids) if i not in [4,10]],'wholeAtomicityHolds':[ids[4],ids[10]],'additionalOriginalSourceHoldGoalIds':[ids[1],ids[6],ids[8],ids[12],ids[17],ids[18],ids[19]],'sourceHoldReasons':'Read whole20 source assessment. Some are partner-role/track boundary holds,not absence of any source. Arrhenius has unconfirmed normative original support. No historical valid review restarted. All candidates remain inactive; no integration-ready or strict-gain claim.'})
print(f'Prepared bounded original-source analysis, {len(pooled)} whole source duties/all1:n partners, V20 exact reuse and arithmetic; inactive only.')
