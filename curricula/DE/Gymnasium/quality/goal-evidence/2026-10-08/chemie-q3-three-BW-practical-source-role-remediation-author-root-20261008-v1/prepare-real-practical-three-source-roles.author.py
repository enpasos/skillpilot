# SPDX-License-Identifier: Apache-2.0
"""AUTHOR candidate only. Preserve the official practical operators and old reviews."""
import copy,hashlib,json,shutil,subprocess
from pathlib import Path
from datetime import datetime,timezone
import fitz
ROOT=Path.cwd();OWN=Path(__file__).resolve().parent;REL=OWN.relative_to(ROOT)
def read(p):return json.loads(Path(p).read_text())
def sha(p):return hashlib.sha256(Path(p).read_bytes()).hexdigest()
def bind(p):p=Path(p);return dict(path=str(p.relative_to(ROOT)),sha256=sha(p),bytes=p.stat().st_size)
def write(p,x):
 p=Path(p);p.parent.mkdir(parents=True,exist_ok=True);assert not p.exists(),p
 p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n' if not isinstance(x,str) else x)
canon=ROOT/'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'
mp=ROOT/'curricula/DE/Gymnasium/mapping/DE-BW/upper-secondary/bw_chemistry_upper_secondary_source_extraction_to_canonical_chemistry.review.json'
ex=ROOT/'curricula/DE/Gymnasium/input/BW/upper-secondary/source-extraction/DE_BW_CHEMIE_SEKII_BP2016_V2.source-extraction.json'
pdf=ROOT/'curricula/DE/Gymnasium/input/BW/BP2016BW_ALLG_GYM_CH_V2.pdf'
assert sha(pdf)=='3ae66c6c2db6371aa24153484f78832f1dfc2097deac8b8dfbffeb32bed28c62'
shutil.copyfile(pdf,OWN/'official-BW-chemistry-20220325.observed-original.pdf')
for path,name in [(canon,'canonical480.current-before.snapshot.json'),(mp,'mapping126-211.exact-before.snapshot.json'),(ex,'extraction126.exact-before.snapshot.json')]:shutil.copyfile(path,OWN/name)
oldmap=read(mp);oldex=read(ex);landscape=read(canon);by={g['id']:g for g in landscape['goals']}
assert len(oldmap['decisions'])==126 and len(oldmap['mappings'])==211
process=['91238ba1-5c63-50c7-a4fd-9bbe492c6b61','49b13b33-34b7-5e4e-861c-b21082cb9922']
specs=[
 dict(sourceGoalId='bw-chem-sekii-3-3-2-b07-a01-2cd72615',content='5a24dae0-6d33-5227-8d8b-e8f74c2ccc4c',physical=27,printed=25,operator='die Beeinflussung chemischer Gleichgewichte experimentell untersuchen und mithilfe des Prinzips von Le Chatelier erklären'),
 dict(sourceGoalId='bw-chem-sekii-3-4-2-b06-a01-99efae9b',content='81373fb7-2a4a-5b2c-acd0-b4e775acaa65',physical=33,printed=31,operator='ein Modellexperiment zur Gleichgewichtseinstellung durchführen und auswerten'),
 dict(sourceGoalId='bw-chem-sekii-3-4-7-b06-a01-46c58b93',content='8be14f15-2258-58e6-ae4e-38953f5d0570',physical=41,printed=39,operator='Zellspannungen galvanischer Zellen experimentell ermitteln')]
doc=fitz.open(pdf);mapping=copy.deepcopy(oldmap);extraction=copy.deepcopy(oldex);selected={s['sourceGoalId'] for s in specs};deltas=[];rows=[]
for spec in specs:
 text=doc[spec['physical']-1].get_text();write(OWN/f"primary-physical-{spec['physical']:03d}-printed-{spec['printed']:03d}.actual-whole-page.txt",text)
 assert ' '.join(spec['operator'].split()) in ' '.join(text.split())
 original=next(g for g in oldex['sourceGoals'] if g['id']==spec['sourceGoalId'])
 goal=next(g for g in extraction['sourceGoals'] if g['id']==spec['sourceGoalId'])
 assert original['sourceText']==spec['operator']
 newref=original['sourceRef'].rsplit(', S.',1)[0]+f", S. {spec['printed']}."
 goal['sourceRef']=newref
 for key in ['sourceText','rawSourceText','sourceSpan','rawSourceSpan','parentBulletText','rawParentBulletText','courseLevel','tags']:assert goal[key]==original[key]
 partners=[r for r in oldmap['mappings'] if r['legacyGoalId']==spec['sourceGoalId']]
 assert len(partners)==1 and partners[0]['canonicalGoalId']==spec['content']
 for row in mapping['mappings']:
  if row['legacyGoalId']==spec['sourceGoalId']:row['matchType']='partial'
 for pid in process:mapping['mappings'].append(dict(legacyGoalId=spec['sourceGoalId'],canonicalGoalId=pid,matchType='partial',reviewDecisionId=spec['sourceGoalId']))
 decision=next(d for d in mapping['decisions'] if d['sourceGoalId']==spec['sourceGoalId']);old=copy.deepcopy(decision)
 decision['canonicalGoalIds']=[spec['content'],*process];decision['matchType']='partial'
 decision['rationale']='AUTHOR-Kandidat: Die vollständige originale experimentelle Pflicht bleibt erhalten. Das Inhaltsziel übernimmt nur Erklärung/Deutung; der Prozesspartner91238 übernimmt Planung und sichere Durchführung, Datenpartner49b13 Dokumentation und Auswertung. Fachliche und didaktische Eignung dieses gemeinsamen kontextspezifischen1:n-Verbunds ist unabhängig noch zu prüfen. Keine tatsächliche Versuchsdurchführung, nationale Quellenvollfreigabe oder Lernendenleistung behauptet.'
 decision['reviewer']='Codex AUTHOR; independent current source-role reviews pending';decision['reviewedAt']='2026-10-08'
 deltas.append(dict(sourceGoalId=spec['sourceGoalId'],originalWholeDecision=old,candidateWholeDecision=decision,oldSourceRef=original['sourceRef'],candidateSourceRef=newref,officialPhysicalPage=spec['physical'],officialPrintedPage=spec['printed']))
 rows.append(dict(sourceGoalId=spec['sourceGoalId'],wholeOriginalExtractionGoal=original,wholeCandidateExtractionGoal=goal,wholeOfficialPage=str((OWN/f"primary-physical-{spec['physical']:03d}-printed-{spec['printed']:03d}.actual-whole-page.txt").relative_to(ROOT)),wholeOriginalPartners=partners,wholeCandidatePartners=[r for r in mapping['mappings'] if r['legacyGoalId']==spec['sourceGoalId']],wholePartnerCanonicalGoals=[by[i] for i in [spec['content'],*process]],scope='Actual BW content-course duty with all original execution/evaluation operators; process-applicability and conjunctive contribution require independent judgment',reviewStatus='author_candidate_pending_independent_review'))
for g in extraction['sourceGoals']:
 if g['id'] not in selected:assert g==next(o for o in oldex['sourceGoals'] if o['id']==g['id'])
for d in mapping['decisions']:
 if d['sourceGoalId'] not in selected:assert d==next(o for o in oldmap['decisions'] if o['sourceGoalId']==d['sourceGoalId'])
for r in oldmap['mappings']:
 if r['legacyGoalId'] not in selected:assert r in mapping['mappings']
assert len(mapping['decisions'])==126 and len(mapping['mappings'])==217
extraction['sourceDocument']['path']=str((OWN/'official-BW-chemistry-20220325.observed-original.pdf').relative_to(ROOT))
for passage in extraction['passages']:
 if 'sourcePath' in passage:passage['sourcePath']=extraction['sourceDocument']['path']
# Whole passage scientific content retained: two individual goal locators repaired,
# full-passage page spans may begin on the preceding page and are not blindly rewritten.
for passage,original in zip(extraction['passages'],oldex['passages']):assert {k:v for k,v in passage.items() if k!='sourcePath'}=={k:v for k,v in original.items() if k!='sourcePath'}
expath=OWN/'DE_BW_CHEMIE_SEKII_BP2016_V2.practical-three-locators.author.source-extraction.json';write(expath,extraction)
mapping['sourceExtractionPath']=str(expath.relative_to(ROOT));mapping['reviewId']='bw_chemistry_sekii_practical_three_role_remediation_author_20261008_v1';mapping['status']='author_candidate';mapping['note']='Three sole-target practical-operator mismatches retained and proposed as explicit content plus execution/data1:n contributions. Original126duties retained, other123decisions and208mappingrows exact. Two goal-specific printed-page locators corrected against actual whole originalPDFpages; no raw official operators changed. Independent source-role judgment pending.'
mappath=OWN/'bw_chemistry_upper_secondary.practical-three-role-remediation.author.review.json';write(mappath,mapping)
write(OWN/'three-whole-source-duties-and-all-old-and-new-partners.author.json',dict(schemaVersion=1,rows=rows,sourceDuties=3,allThreeActualOriginalWholePagesRead=True,independentApproval=False,humanApproval=False,humanTrial=False))
write(OWN/'exact-source-role-and-two-real-page-locator-deltas.author.json',dict(schemaVersion=1,deltas=deltas,retainedSourceGoalIds=126,retainedSourceRawOperators=126,other123WholeSourceGoalRowsExact=True,other123WholeDecisionsExact=True,other208MappingRowsExact=True,appendedPartnerRows=6,sourcePageNumericOnlyChangeNotClaimedScientificReview=True,wholePassageContentExact=True,activeWrites=0,strictGain=0))
entry=dict(schemaVersion=1,role='Neutral AUTHOR source-role remediation candidate; actual review pending',selectedSourceGoalIds=sorted(selected),selectedContentGoalIds=[s['content'] for s in specs],executionDataPartnerIds=process,wholeCaseScience='No whole-goal or P-case text changed by this package. Current whole input content supplied; source-only repair does not close D/P/A/M/V.',originalPrimaryPDF=bind(OWN/'official-BW-chemistry-20220325.observed-original.pdf'),originalOfficialURL=oldex['sourceDocument']['url'],candidateMapping=bind(mappath),candidateExtraction=bind(expath),wholeSourcePartnerInput=bind(OWN/'three-whole-source-duties-and-all-old-and-new-partners.author.json'),actualDelta=bind(OWN/'exact-source-role-and-two-real-page-locator-deltas.author.json'),reviewerInstructions='Independently verify actual whole original pages27/33/41 printed25/31/39, preserve all original practical operators and inspect whole original+proposed partner goals and role conjunction. Determine whether generic process goals are sufficient in the exact content context and target course scope, or HOLD with specific additional practical goal requirement. Do not silently turn planning/text explanation into performed experiment evidence. No review of unchanged123 source rows required. No whole-source or human release approval.',allOtherChemQ3SourceHoldsRetained=True,activeWrites=0,strictGain=0,humanApproval=False,humanTrial=False)
write(OWN/'neutral-practical-three-whole-source-roles.author.entry.json',entry)
owned=[bind(p) for p in sorted(OWN.iterdir()) if p.is_file()];write(OWN/'practical-three-source-role-author.first-input.freeze.json',dict(schemaVersion=1,sealedAt=datetime.now(timezone.utc).isoformat(),files=owned,sourceApprovalPending=True,activeWrites=0,strictGain=0,humanApproval=False,humanTrial=False))
print(json.dumps(dict(authorSourceDuties=3,currentPartnerWholeBodies=5,retainedOfficialDuties=126,retainedMappings=211,proposedMappings=217,actualWholePages=[27,33,41],newScientificApprovals=0,activeWrites=0)))
