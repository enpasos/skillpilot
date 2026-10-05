import copy, hashlib, json, re
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path
OWN=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/chemie-b014-arrhenius-memory-remediation-independent-a-v1')
AUTHOR=OWN.parent/'chemie-b014-arrhenius-memory-remediation-candidate-v1'
ORIGIN='28bb9d15-f865-5843-a035-6066580fea64'; MEMORY='417e65ec-68be-5f2e-9452-c3ba9b1d362f'
DECK='de_gymnasium_chemistry_arrhenius_names_formulas'
NOW=datetime.now(timezone.utc).isoformat()
def read(p): return json.loads(Path(p).read_text())
def write(name,value): (OWN/name).write_text(json.dumps(value,ensure_ascii=False,indent=2)+'\n')
def lines(p): return Path(p).read_text().splitlines()
def keyed(p,key): return {key(json.loads(line)):line for line in lines(p) if line.strip()}
def sha(p): return hashlib.sha256(Path(p).read_bytes()).hexdigest()
sourceurl='https://kultus.hessen.de/sites/kultus.hessen.de/files/2024-10/kcgo_chemie.pdf'
openstax='https://openstax.org/books/chemistry-2e/pages/14-3-relative-strengths-of-acids-and-bases'
DE=read(AUTHOR/f'{DECK}.de.inactive.candidate.json'); EN=read(AUTHOR/f'{DECK}.en.inactive.candidate.json')
assert len(DE['cards'])==len(EN['cards'])==18
assert [c['id'] for c in DE['cards']]==[c['id'] for c in EN['cards']]
solutions={
 'hydrogen_chloride':('Salzsäure','hydrochloric acid','Chlorwasserstoff','hydrogen chloride'),
 'sodium_hydroxide':('Natronlauge','aqueous sodium hydroxide solution','Natriumhydroxid','sodium hydroxide'),
 'potassium_hydroxide':('Kalilauge','aqueous potassium hydroxide solution','Kaliumhydroxid','potassium hydroxide'),
 'calcium_hydroxide':('klarem Kalkwasser','clear limewater','Calciumhydroxid','calcium hydroxide'),
 'barium_hydroxide':('Barytwasser','baryta water','Bariumhydroxid','barium hydroxide')}
original_cards=[]
for de,en in zip(DE['cards'],EN['cards']):
 key=de['id'][len('chem_arrhenius_'):].removesuffix('_name_to_formula').removesuffix('_formula_to_name')
 reverse=de['id'].endswith('_name_to_formula')
 original_cards.append({'cardId':de['id'],'DE':{'front':de['front'],'back':de['back'],'status':'HOLD' if reverse else 'PASS','findings':(['M-DE-WORD-01: ungelöst means undissolved; the explanation concerns dissolved species and must not deny weak-acid molecules.'] if reverse else [])+(['M-REV-02: solution label has no reverse prompt in the 18-card deck although included in the claimed bidirectional association.'] if reverse and key in solutions else [])},'EN':{'front':en['front'],'back':en['back'],'status':'HOLD' if reverse and key in solutions else 'PASS','findings':['M-REV-02: solution label has no reverse prompt.'] if reverse and key in solutions else []},'scientificNameFormulaFact':'PASS','phaseDistinction':'PASS for formula-to-name substance/solution distinction; DE explanatory terminology needs correction on reverse cards' if reverse else 'PASS','answerLeak':'PASS: the requested formula/name is not supplied on the front','atomicRecall':'PASS: one bounded association, two recall directions','necessaryOriginGoalId':ORIGIN})
initial={'reviewer':'independent-a; informed author candidate, not blind','createdAtUTC':NOW,'authority':'ai_candidate_independent_S_A_M_review','originalAuthorManifestSHA256':sha(AUTHOR/'author-checkpoint.freeze.manifest.json'),'originalCardJudgments':original_cards,'ordinaryOrigin':{'goalId':ORIGIN,'semanticAtomicity':'PASS_candidate: naming/formula tools support one Arrhenius explanation; recall alone is insufficient','memoryDecision':'PASS_memory_required: nine explicitly named compact relationships support fluent explanation','sourceHEPage35NamesFormulas':'PASS for five acids and four hydroxides/solutions','fullSourceCoverage':'HOLD: the same HE clause includes salts; existing global source bindings are not discharged by this memory-only package','introductionFreeAssessment':'PASS_candidate: given new named/formula examples, classify their aqueous effect and explain increased hydrogen/hydroxide ions; do not infer understanding from memorized cards'},'memoryNode':{'goalId':MEMORY,'semanticAtomicity':'PASS_memory_support_only','originTrace':'PASS_candidate: all 18 DE card goal tags and all ledger originGoalIds point to current origin28','visibility':'HOLD_M-SCOPE-03: HE-only memory while origin is visible for all 16 jurisdictions; raw view compilation is insufficient'},'gateBoundary':{'D2':False,'P':False,'V':False,'humanApproval':False,'strictNetDelta':0,'newCurricularAtomicIds':[]}}
if not (OWN/'original-independent-per-card-and-goal.judgments.json').exists():
 write('original-independent-per-card-and-goal.judgments.json',initial)
 (OWN/'original-independent-per-card-and-goal.judgments.sha256').write_text(sha(OWN/'original-independent-per-card-and-goal.judgments.json')+'\n')
corrected_de=copy.deepcopy(DE); corrected_en=copy.deepcopy(EN); corrections=[]
for lang,deck in [('de',corrected_de),('en',corrected_en)]:
 for card in deck['cards']:
  if not card['id'].endswith('_name_to_formula'):continue
  key=card['id'][len('chem_arrhenius_'):].removesuffix('_name_to_formula')
  formula=re.match(r'\$[^$]+\$',card['back']).group(0)
  oldfront,oldback=card['front'],card['back']
  suffix=('Die Formel beschreibt die Zusammensetzung des Stoffes, nicht sämtliche Teilchen in einer wässrigen Lösung.' if lang=='de' else 'The formula describes the composition of the substance, not every particle present in an aqueous solution.')
  prefix=formula+'. '
  if key in solutions:
   de_name,en_name,de_stoff,en_stoff=solutions[key]
   card['front']=(f'Welche Stoffformel gehört zum Ausgangsstoff von {de_name}?' if lang=='de' else f'What is the substance formula of the solute associated with {en_name}?')
   prefix=(de_stoff if lang=='de' else en_stoff.capitalize())+': '+formula+'. '
  card['back']=prefix+suffix
  corrections.append({'cardId':card['id'],'language':lang,'frontBefore':oldfront,'frontAfter':card['front'],'backBefore':oldback,'backAfter':card['back'],'substantiveReason':'Correct misleading dissolved-species wording; preserve weak-acid equilibrium. Include source-named aqueous-solution associations in reverse recall without asking for a substance name already present in an English solution label.','status':'PASS_reviewer_proposed_correction','answerLeak':'PASS: expected formula is absent from front; substance name in back is explanation, not a separate name question'})
write(f'{DECK}.de.reviewed.inactive.candidate.json',corrected_de)
write(f'{DECK}.en.reviewed.inactive.candidate.json',corrected_en)
write('exact-card-corrections.receipt.json',{'corrections':corrections,'DECards':18,'ENCards':18,'additionalCards':0,'unchangedForwardCardsPerLanguage':9,'changedReverseCardsPerLanguage':9,'reverseSolutionPromptCorrectionsPerLanguage':5})
landscape=read(AUTHOR/'canonical-with-one-memory-goal.inactive.candidate.json'); byid={g['id']:g for g in landscape['goals']}; origin=byid[ORIGIN]; mem=byid[MEMORY]
oldapp=copy.deepcopy(mem['applicability']); mem['applicability']=copy.deepcopy(origin['applicability'])
mem['extendedData']['vocabularySource']=str(OWN/f'{DECK}.de.reviewed.inactive.candidate.json')
mem['extendedData']['vocabularySourceEn']=str(OWN/f'{DECK}.en.reviewed.inactive.candidate.json')
write('canonical-with-one-memory-goal.reviewed.inactive.candidate.json',landscape)
write('exact-memory-scope-correction.receipt.json',{'goalId':MEMORY,'originGoalId':ORIGIN,'before':oldapp,'after':mem['applicability'],'reason':'Necessary compact facts are required by the globally scoped current canonical origin. Align support scope with that origin; do not claim that every regional source names this exact HE example set. No jurisdiction-specific fallback or checker exception.','sourceAuthority':'actual HE page35 supplies explicit nine-name/formula requirement; universally valid chemical name/formula facts independently checked','noChangeToOrdinaryApplicabilityOrRequires':True,'intendedDeploymentRequiresSeparateFinalRuntimePaths':True})
# Exact raw preservation of every current unmodified judgment: root current registry selects this config.
current=read('curricula/DE/Gymnasium/quality/memory-card-review/chemie-stoffmenge-nine-current-20261005-v1/canonical-chemistry-full.config.json')
curm=keyed(current['reviewPath'],lambda r:r['goalId']); author_m=keyed(AUTHOR/'memory-review.candidate.jsonl',lambda r:r['goalId'])
assert len(curm)==376 and len([id for id in curm if id!=ORIGIN])==375
for id,line in curm.items():
 if id!=ORIGIN:assert json.loads(line)==json.loads(author_m[id]),id
curcards=keyed(current['cardReviewPath'],lambda r:(r['deckId'],r['cardId'])); authorcards=keyed(AUTHOR/'cards-review.candidate.jsonl',lambda r:(r['deckId'],r['cardId']))
assert len(curcards)==55
for key,line in curcards.items():assert json.loads(line)==json.loads(authorcards[key]),key
# The independent decision is substantive; only affected fingerprints are computed from the now reviewed candidate.
mrow=json.loads(author_m[ORIGIN]); mrow.update(reviewedAt=NOW,reviewer='independent-a-informed-S-A-M-review',reason='Independent actual HE page35 and nine primary formula checks: compact 9 associations in two recall directions necessary; corrected DE wording, aqueous-solution reverse prompts and jurisdiction visibility verified separately. Cards do not prove Arrhenius explanation; salts/source breadth and D/P/V remain HOLD.')
rows=[json.dumps(mrow,ensure_ascii=False) if json.loads(line)['goalId']==ORIGIN else curm[json.loads(line)['goalId']] for line in lines(AUTHOR/'memory-review.candidate.jsonl') if line.strip()]
(OWN/'memory-review.reviewed.candidate.jsonl').write_text('\n'.join(rows)+'\n')
(OWN/'one-goal.memory-review.reviewed.candidate.jsonl').write_text(json.dumps(mrow,ensure_ascii=False)+'\n')
def stable(o):return json.dumps(o,ensure_ascii=False,sort_keys=True,separators=(',',':'))
newrows=[]
for card in corrected_de['cards']:
 row=json.loads(authorcards[(DECK,card['id'])]); row.update(reviewedAt=NOW,reviewer='independent-a-informed-S-A-M-cards-review',reason='Actual HE page35 name/formula requirement, independently checked elemental composition, substance versus aqueous mixture distinction, no leaked requested formula/name, necessary compact origin28 association; corrected reverse solution prompts reviewed in both languages.')
 payload={'ruleVersion':current['ruleVersion'],'deckId':DECK,'cardId':card['id'],'front':card['front'],'back':card['back'],'category':card['category'],'tags':card['tags']}
 row['fingerprint']='sha256:'+hashlib.sha256(stable(payload).encode()).hexdigest()
 newrows.append(json.dumps(row,ensure_ascii=False))
(OWN/'eighteen.cards-review.reviewed.candidate.jsonl').write_text('\n'.join(newrows)+'\n')
(OWN/'cards-review.reviewed.candidate.jsonl').write_text('\n'.join(list(curcards.values())+newrows)+'\n')
for source_name,target_name,targeted in [('memory-candidate.config.json','memory-reviewed.config.json',False),('memory-one-goal-candidate.config.json','memory-one-goal-reviewed.config.json',True)]:
 cfg=read(AUTHOR/source_name);cfg['landscapePath']=str(OWN/'canonical-with-one-memory-goal.reviewed.inactive.candidate.json');cfg['reviewPath']=str(OWN/('one-goal.memory-review.reviewed.candidate.jsonl' if targeted else 'memory-review.reviewed.candidate.jsonl'));cfg['cardReviewPath']=str(OWN/('eighteen.cards-review.reviewed.candidate.jsonl' if targeted else 'cards-review.reviewed.candidate.jsonl'));cfg['reportPath']=str(OWN/('native-m-one-goal-reviewed-report.md' if targeted else 'native-m-full-reviewed-report.md'));write(target_name,cfg)
write('current-unmodified-records.exact-byte-preservation.receipt.json',{'currentConfigPath':'curricula/DE/Gymnasium/quality/memory-card-review/chemie-stoffmenge-nine-current-20261005-v1/canonical-chemistry-full.config.json','authorRetains375OldMAnd55OldCardRecordContentsButReserializesWhitespace':True,'reviewerCandidateOrdinaryOther375RawJSONLLinesExactlyRetained':True,'existing55CardRawJSONLLinesExactlyRetained':True,'oldOrdinaryReReviews':0,'oldCardReReviews':0,'ruleVersionUnchanged':True,'reviewIdUnchanged':True,'currentFullScopeAndCoveragePolicyUnchanged':True,'targetedCoverageRequired':True,'ordinaryOriginReReviewed':ORIGIN,'newCardCandidateReviews':18,'newMemoryNodeId':MEMORY,'activeWrites':0})
# Compare element counts, not character order of database molecular formulas.
def counts(formula):
 tokens=re.findall(r'[A-Z][a-z]?|\d+|\(|\)',formula.replace('_','').replace('$',''))
 def parse(i=0):
  out=Counter()
  while i<len(tokens) and tokens[i]!=')':
   if tokens[i]=='(':value,i=parse(i+1);assert tokens[i]==')';i+=1
   else:value=Counter({tokens[i]:1});i+=1
   n=int(tokens[i]) if i<len(tokens) and tokens[i].isdigit() else 1
   if i<len(tokens) and tokens[i].isdigit():i+=1
   for el,num in value.items():out[el]+=num*n
  return out,i
 return dict(parse()[0])
primary=read(OWN/'nine-formulas.pubchem-primary.actual.receipt.json')['actualPropertyRetrievals']
assert len(primary)==9
formulachecks=[]
for card,primaryrow in zip(DE['cards'][::2],primary):
 f=re.search(r'\$([^$]+)\$',card['front']).group(1); p=primaryrow['properties'][0]
 assert primaryrow['httpStatus']==200 and counts(f)==counts(p['MolecularFormula'])
 formulachecks.append({'cardAssociationId':card['id'].removesuffix('_formula_to_name'),'cardFormula':f,'primaryFormula':p['MolecularFormula'],'elementCounts':counts(f),'CID':p['CID'],'url':primaryrow['url'],'status':'PASS_elemental_composition_not_phase_or_solution_identity'})
write('nine-facts.independent-primary-formula-checks.receipt.json',{'scientificFormulaFacts':formulachecks,'additionalScientificReference':openstax,'actualHEPrintedPage35Read':True,'fiveAcidsFourHydroxides':True,'saltBreadthStatus':'HOLD_not_in_this_deck','sourceLimits':'PubChem elemental formulas verify chemical composition only. Its HCl compound record also uses hydrochloric-acid naming and is not authority for distinguishing a pure gas from aqueous mixture. Actual normative HE page and chemical phase semantics support that distinction. Weak-acid species may coexist with ions; the revised wording makes no complete-dissociation claim.','ENCheckedIndependentlyAgainstDE':True})
print(json.dumps({'built':'inactive reviewed correction only','originalDECardHOLDs':9,'originalENCardHOLDs':5,'correctedCardsEachLanguage':18,'untouchedCurrentMRecords':375,'untouchedCurrentCards':55,'nativeExecutionPending':True}))
