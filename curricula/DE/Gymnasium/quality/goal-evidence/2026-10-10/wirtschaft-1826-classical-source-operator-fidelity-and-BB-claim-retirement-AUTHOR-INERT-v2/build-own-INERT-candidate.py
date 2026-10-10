#!/usr/bin/env python3
"""Bounded author proposal only. Never edits active files or refreshes native QS."""
import copy, hashlib, json, os, pathlib, re, shutil, subprocess

ROOT = pathlib.Path(__file__).resolve().parents[7]
BASE = pathlib.Path(__file__).resolve().parent
PRE = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/wirtschaft-1826-classical-seven-state-source-facets-and-bounded-rerouting-AUTHOR-INERT-v1'
CAN = ROOT / 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json'
THREE = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/wirtschaft-1826-three-atomic-competences-six-real-P-cases-AUTHOR-INERT-root-v1/three-whole-goal-candidates.INERT.json'
MONO='1826fe19-4d06-5183-9b41-9121ae1cc219'; INFO='a2fa1186-df35-5954-a9a9-e311a55e218f'; PUB='df17fd21-e9b7-598f-970e-8f541d059694'
EXT='bad728f2-e375-5f98-8f65-511a9e2e6751'; ECO='80c92945-155b-56ea-8aa2-46ee72852303'; CONS='a60e0541-80e1-5f94-86fd-073f5a00bee8'; RESP='e90586d8-8e0a-5355-87d0-4ecd90dbe021'
BB_OLD='bb-wirtschaft-sekii-q-lk-markt-preis-g03-5ffe6d79'
NW_TEXTS={
 'de-nw-sowi-sekii-wirtschaft-ef-if2-marktwirtschaft-g03-aa22c122': 'Anspruch und erfahrene Realität des Leitbilds der Konsumentensouveränität unter Berücksichtigung von Informations- und Machtasymmetrien analysieren.',
 'de-nw-sowi-sekii-wirtschaft-ef-if2-marktwirtschaft-g15-5ea6bf3c': 'Die Leistungsgrenzen des Marktsystems erklären, insbesondere bezüglich Konzentration und Wettbewerbsbeschränkungen, sozialer Ungleichheit, Wirtschaftskrisen und ökologischer Fehlsteuerungen.',
 'de-nw-sowi-sekii-wirtschaft-q-lk-if5-wirtschaftspolitik-vertiefung-g05-c76581c7': 'Die Ursachen von Markt- und Staatsversagen beschreiben, bezogen auf einen möglichen Konflikt zwischen Ökonomie und Ökologie.'
}
def read(p): return json.loads(pathlib.Path(p).read_text())
def rel(p): return str(pathlib.Path(p).relative_to(ROOT))
def write(name,obj): (BASE/name).write_text(json.dumps(obj,ensure_ascii=False,indent=2)+'\n')
def sha(p): return 'sha256:'+hashlib.sha256(pathlib.Path(p).read_bytes()).hexdigest()
def binding(p): return dict(path=rel(p),sha256=sha(p),bytes=pathlib.Path(p).stat().st_size)

assert ROOT.name=='skillpilot', ROOT
index=read(PRE/'author-file-index.INERT.json')
inputs=[ROOT/x['path'] for x in read(PRE/'actual-bound-inputs.before.READONLY.json')]
predecessor_files=sorted(p for p in PRE.rglob('*') if p.is_file())
bound_files=list(dict.fromkeys(inputs+predecessor_files+[THREE]))
before=[binding(p) for p in bound_files];write('actual-bound-inputs.before.READONLY.json',before)
for old in read(PRE/'actual-bound-inputs.before.READONLY.json'):
 assert sha(ROOT/old['path'])==old['sha256'], ('active input changed before v2',old['path'])
for folder in ['history-active','history-predecessor-candidates','source-candidates','mapping-candidates']:(BASE/folder).mkdir(exist_ok=True)
newindex=copy.deepcopy(index)
sources={}; maps={}; predecessor={}
for original,entry in index['files'].items():
 history=ROOT/entry['history']; dest=BASE/'history-active'/history.name;shutil.copyfile(history,dest)
 assert dest.read_bytes()==(ROOT/original).read_bytes()
 newindex['files'][original]['history']=rel(dest)
 if 'candidate' not in entry:continue
 previous=ROOT/entry['candidate']; hist=BASE/'history-predecessor-candidates'/previous.name;shutil.copyfile(previous,hist)
 candidate=BASE/('source-candidates' if '/source-extraction/' in original else 'mapping-candidates')/previous.name
 obj=read(previous);predecessor[original]=copy.deepcopy(obj)
 newindex['files'][original]['predecessorCandidate']=rel(hist)
 newindex['files'][original]['candidate']=rel(candidate)
 if '/source-extraction/' in original:sources[original]=obj
 else:maps[original]=obj

nw_orig=next(o for o in sources if '/input/NW/' in o)
bb_orig=next(o for o in sources if '/input/BB/' in o)
bb_map=next(o for o in maps if '/mapping/DE-BB/' in o)
nw_map=next(o for o in maps if '/mapping/DE-NW/' in o)
delta=[]
for atom in sources[nw_orig]['sourceGoals']:
 if atom['id'] not in NW_TEXTS:continue
 old=copy.deepcopy(atom);oldtext=old['sourceText'];text=NW_TEXTS[atom['id']]
 for field in ['title','description','sourceText','parentBulletText','rawSourceText','rawParentBulletText']:
  assert oldtext in atom[field];atom[field]=atom[field].replace(oldtext,text)
 passage=next(p for p in sources[nw_orig]['passages'] if p['id']==atom['passageId'])
 for field in ['text','rawText']:
  assert passage[field].count(oldtext)==1;passage[field]=passage[field].replace(oldtext,text)
 delta.append(dict(action='correct_original_operator_and_scope',sourceExtractionPath=nw_orig,sourceGoalId=atom['id'],wholePredecessor=old,wholeCandidate=copy.deepcopy(atom),changedAtomFields=[k for k in atom if atom[k]!=old[k]],originalOperator={'g03':'analysieren','g15':'erklären','g05':'beschreiben'}[next(k for k in ['g03','g15','g05'] if '-'+k+'-' in atom['id'])],limitations='Own complete-performance paraphrase of the actually read original; no entire PDF text, no native fingerprint or science approval. Locator/PID/span/course fields unchanged from v1.'))

bb=sources[bb_orig];retired=next(g for g in bb['sourceGoals'] if g['id']==BB_OLD);bbpass=next(p for p in bb['passages'] if p['id']==retired['passageId']);retiredpass=copy.deepcopy(bbpass)
bb['sourceGoals']=[g for g in bb['sourceGoals'] if g['id']!=BB_OLD]
bbpass['sourceGoalIds']=[i for i in bbpass['sourceGoalIds'] if i!=BB_OLD]
assert bbpass['text'].count('(3) '+retired['sourceText'])==1
bbpass['text']='\n'.join(l for l in bbpass['text'].splitlines() if l!='(3) '+retired['sourceText'])
assert bbpass['rawText'].splitlines().count(retired['sourceText'])==1
bbpass['rawText']='\n'.join(l for l in bbpass['rawText'].splitlines() if l!=retired['sourceText'])
retired_mappings=[m for m in maps[bb_map]['mappings'] if m['legacyGoalId']==BB_OLD]
retired_decisions=[d for d in maps[bb_map]['decisions'] if d['sourceGoalId']==BB_OLD]
maps[bb_map]['mappings']=[m for m in maps[bb_map]['mappings'] if m['legacyGoalId']!=BB_OLD]
maps[bb_map]['decisions']=[d for d in maps[bb_map]['decisions'] if d['sourceGoalId']!=BB_OLD]
summary=maps[bb_map]['summary']
summary['sourceGoals']=len(bb['sourceGoals']);summary['reviewedSourceGoals']=len(maps[bb_map]['decisions']);summary['seedMappedSourceGoals']-=1
summary['mappedSourceGoals']=len({m['legacyGoalId'] for m in maps[bb_map]['mappings']})
for typ in ['exact','partial','inherited']:summary[typ+'Mappings']=sum(d.get('matchType')==typ and d.get('decision')=='mapped' for d in maps[bb_map]['decisions'])
delta.append(dict(action='retire_unproved_official_source_claim_preserving_whole_history',sourceExtractionPath=bb_orig,sourceGoalId=BB_OLD,wholePredecessor=retired,wholeCandidate=None,wholePredecessorParentPassage=retiredpass,wholeCandidateParentPassage=copy.deepcopy(bbpass),wholePredecessorMappings=retired_mappings,wholePredecessorDecisions=retired_decisions,why='No exact external-cost/benefit market-failure performance was found in the whole original. S.24 belongs to macroeconomics, not the claimed LK market/price source. Sustainability at GK S.19 / optional LK S.26 is not a licence to relabel the old LK market-price atom as an official externality competence.',consequence='The sole direct BB mapping of EXT is removed in this candidate; the old direct BB EXT source/scope claim loses its support; actual original coverage and role must be rederived, with no invented normative BB externality gap. No historical source/review artifact is deleted or overwritten.'))

routes=read(PRE/'actual-whole-mapping-route-before-after-proposals.AUTHOR-INERT.json')['routes']
# Each note assesses this whole route once. Retained broad bindings do not become
# new full-source evidence simply because their bytes are kept.
notes=[
 ('none; claim retirement',[],'No official externality claim survives this route. Old BB EXT normative claim is retired; actual source coverage and any independent pedagogical role must be rederived, with no invented compulsory externality gap.',{}),
 ('vergleichen + bewerten',[MONO],'Polypol/Monopol supply comparison is compulsory in LK. The new causal price/output competence operationalises one part; it does not certify the full comparative evaluation or elective concentration/competition field.',{MONO:'explicit monopoly concept; derived partial mechanism; evaluation remains separate'}),
 ('erklären + beurteilen',[INFO,EXT,'c386592a-b259-538c-9929-25775af99b83'],'Information asymmetry and negative externality are z.B. choices. INFO covers pre-contract selection only; other information mechanisms and assessment of solutions are not completed by it. EXT/regulation have partial contextual links, not whole original assessment.',{INFO:'named example; derived pre-contract mechanism only',EXT:'named negative-externality example; partial', 'c386592a-b259-538c-9929-25775af99b83':'solution explanation is related, but judgement operator remains outside whole target'}),
 ('erklären + bewerten',[PUB,'becf0989-ee9f-5c8e-8173-5b8246e7944a','7d4d7a90-a1d0-5818-8d55-a0c3e995957b'],'PUB explains a public-good free-rider setting only. Prisoner dilemma, other social dilemmas and evaluation of actor behaviour remain beyond this one provision atom.',{PUB:'derived public-good free-rider operationalisation; partial','becf0989-ee9f-5c8e-8173-5b8246e7944a':'game-model application related; does not alone prove full normative evaluation','7d4d7a90-a1d0-5818-8d55-a0c3e995957b':'strategy development goes beyond this source performance; retained without new strength claim'}),
 ('darstellen + erläutern',[MONO,INFO,EXT,'c386592a-b259-538c-9929-25775af99b83'],'Named z.B. causes do not establish all three separate mandatory examples. MONO/INFO explain bounded causes; source solution breadth and general information asymmetry stay open. Cartel assessment is not directly demanded by this source atom.',{MONO:'named market power; causal mechanism partial',INFO:'named information asymmetry; pre-contract mechanism partial',EXT:'named externalities; partial','c386592a-b259-538c-9929-25775af99b83':'general regulation/solutions related; partial'}),
 ('own Hessen classic explains; official E2 fields distinguish roles',[MONO,INFO,PUB],'Classic source atom bundles three facets. Official E2.2 and E2.3 fall under compulsory 1–4; information E2.6 is outside that compulsory declaration. A single classic source atom/mapping cannot author target roles or complete broader information and goods coverage.',{MONO:'derived partial from compulsory E2.2 concentration/competition',INFO:'derived partial from E2.6 information/consumer choice; optional/choice role unresolved',PUB:'derived provision part of compulsory E2.3 goods/environment; goods classification/common-resource use not whole covered'}),
 ('same classic atom; seed route separately bounded',[MONO,INFO,PUB],'This seed is not a second independent official proof. Same official role restrictions as route 6; no automatic prerequisiteOnly or all-facet compulsory inference.',{MONO:'same partial source claim as route 6',INFO:'same partial source claim as route 6',PUB:'same partial source claim as route 6'}),
 ('überprüfen',['8ad94aeb-81ad-58ce-8792-c691f97efd53'],'General checking of market-process results does not expressly require monopoly, information selection or public provision. MARKET is a related partial operationalisation; full critical model comparison is not expressly demanded by this atom.',{'8ad94aeb-81ad-58ce-8792-c691f97efd53':'general market application; partial, no three named mechanisms'}),
 ('beschreiben',[PUB,EXT,ECO],'Original gA p21 explicitly names public goods and negative externalities in environmental market failure. PUB/EXT are causal extensions, not an exact whole-source match; environmental context remains necessary and internalising-measure breadth is not established by this one description atom.',{PUB:'explicit concept; derived provision mechanism in environmental context only',EXT:'explicit negative externality; internalising measures not whole sourced here',ECO:'environmental market problems explicit; related partial context'}),
 ('herausarbeiten',[PUB,'e3cd6940-26f0-55a9-a348-4a90c245266c'],'Conflict between self-interest and common welfare has a derived public-financing example, not a uniquely required public-goods mechanism. General normative/environmental conflicts and source operator remain wider than the provision atom.',{PUB:'context-derived contribution conflict; partial','e3cd6940-26f0-55a9-a348-4a90c245266c':'environment-policy conflicts are related in parent context, not whole general conflict coverage'}),
 ('beschreiben',[PUB,EXT],'Original eA p29 independently repeats the explicit two-cause environmental clause. It is not inherited gA evidence. Same causal extension/remaining environmental and instrument scope as route 9.',{PUB:'explicit eA concept; derived environmental provision mechanism partial',EXT:'explicit eA negative externality; internalisation not whole sourced by this clause'}),
 ('analysieren',[INFO,'5b5ed3cb-7c2c-5b0f-a515-c967d8d23644','cb21bcbe-755d-5b0d-b02a-be22c9d26e43','8ad94aeb-81ad-58ce-8792-c691f97efd53'],'Whole original compares ideal consumer sovereignty and experienced reality under information AND power asymmetry. INFO covers only pre-contract selection. It does not complete the required broader analysis, power asymmetry or other consumer-sovereignty cases. Unrelated legacy macro/indicator bindings remain unqualified here.',{INFO:'derived pre-contract submechanism; original broader analyse operator and power scope remain open','5b5ed3cb-7c2c-5b0f-a515-c967d8d23644':'consumer information decisions related; partial, no whole sovereignty analysis','cb21bcbe-755d-5b0d-b02a-be22c9d26e43':'concentration may operationalise power asymmetry; derived partial','8ad94aeb-81ad-58ce-8792-c691f97efd53':'critical market-model comparison related; partial'}),
 ('beschreiben',[PUB,EXT],'Source p76 requires causes of market AND state failure in an ecology/economy conflict. p77 adds a public-environment judgement context but is a different whole performance. PUB is a derived environmental provision cause; state-failure causes and judgement are not covered by the three-facet repair. General macro/instrument bindings are not sourced wholesale by this clause.',{PUB:'public-environment concept in adjacent original context; derived provision submechanism only',EXT:'negative-externality causal example in ecology context; partial; internalisation remains beyond this source atom'}),
 ('diskutieren',[CONS],'Discuss ecological consumer behaviour; existing CONS provides a relevant evaluation route but includes advertising/psychology/budget beyond this one source. No monopoly mechanism. All unrelated law/budget/instrument legacy rows are preserved as history-shaped candidates without a new source-strength endorsement.',{CONS:'ecological consumer evaluation partial'}),
 ('beurteilen',[CONS],'Evaluate sustainable consumer decisions. Related CONS evaluation is partial because its whole contract also covers scarcity, incentives, advertising and behavioural factors. No three-facet market-failure duty from this source.',{CONS:'sustainability criterion directly related; remaining whole CONS aspects not sourced by this atom'}),
 ('beurteilen',[RESP,'b215bd82-2b6b-5b00-8a0b-85c7ff249bc2'],'Company decisions under economic/social/environmental criteria relate to stakeholder responsibility. RESP is partial: all stakeholders and significance of firms are wider; source does not demand balance sheets, production processes or generic market-failure mechanisms.',{RESP:'direct evaluative responsibility context; wider whole target partly derived','b215bd82-2b6b-5b00-8a0b-85c7ff249bc2':'business objective interactions related; partial, long-term objective reasoning not wholly established'}),
 ('prüfen',[CONS,RESP],'General sustainability testing of economic activities is operationalised by consumer and company cases. Neither narrower whole target covers all activities; no monopoly proof. Other policy/ecology mappings need their own whole source justification.',{CONS:'derived consumer-activity case; partial',RESP:'derived business-activity case; partial'}),
 ('prüfen',[RESP,'b215bd82-2b6b-5b00-8a0b-85c7ff249bc2'],'Sustainability test of business decisions supports a responsibility evaluation part. It does not demand every balance-sheet, profit, co-determination or environmental-policy performance in retained rows.',{RESP:'derived stakeholder/responsibility evaluation; partial','b215bd82-2b6b-5b00-8a0b-85c7ff249bc2':'business objectives related to sustainability; partial'}),
 ('bewerten',[RESP,'b215bd82-2b6b-5b00-8a0b-85c7ff249bc2'],'Social responsibility of an entrepreneur in sustainable business decisions is directly evaluative. RESP is the closest existing contract, but its full stakeholder/significance breadth exceeds this source. Production concepts, break-even and generic externality mechanisms are not directly proven by this atom.',{RESP:'direct responsibility evaluation; whole target still wider', 'b215bd82-2b6b-5b00-8a0b-85c7ff249bc2':'objective/stakeholder interactions related; partial'}),
 ('beschreiben',[MONO,'8ad94aeb-81ad-58ce-8792-c691f97efd53','50e07b86-428c-5f9c-8c7e-0d0669343af5'],'TH right eA column only: describe price formation in polypol and monopoly. MONO uses this as a partial price/output mechanism; efficient welfare, entry restrictions and cost/rule variation are didactic extensions, not whole explicit source demands. Marketing/product analysis is not proven by this price-description atom.',{MONO:'explicit monopoly-price concept; derived causal/efficiency mechanism partial, eA only','8ad94aeb-81ad-58ce-8792-c691f97efd53':'price-model application partial','50e07b86-428c-5f9c-8c7e-0d0669343af5':'competitive-price model related; elasticity/surplus analysis not explicit here'})
]
assert len(routes)==len(notes)==20
all_source={}
for original,entry in newindex['files'].items():
 if 'source-extraction' in original:
  obj=sources.get(original) or read(ROOT/entry['history']);all_source.update({g['id']:g for g in obj['sourceGoals']})
all_source[BB_OLD]=retired
goals={g['id']:g for g in read(CAN)['goals']};goals.update({g['id']:g for g in read(THREE)['goals']})
assess=[]
for i,(route,note) in enumerate(zip(routes,notes),1):
 if route['sourceGoalId']==BB_OLD:
  route['afterCanonicalGoalIds']=[];route['removeCanonicalGoalIds']=copy.deepcopy(route['beforeCanonicalGoalIds']);route['matchTypeAfter']=None;route['evidenceStrength']='no_original_support_retirement_candidate';route['openBlocker']='Old BB EXT claim retired; actual original coverage/course-role derivation remains to check. No invented normative BB duty or automatic M6 failure.';route['reason']=delta[-1]['why'];route['action']='retire_source_claim_and_all_its_active_mapping_claims'
 route['wholeSourceCandidate']=copy.deepcopy(all_source[route['sourceGoalId']]) if route['sourceGoalId']!=BB_OLD else None
 op,related,remaining,strengths=note
 route['originalPerformanceOperatorOrBoundary']=op;route['sourceRemainingFacets']=remaining;route['wholeSourceCompletedByThisRoute']=False
 target_checks=[]
 for gid in route['afterCanonicalGoalIds']:
  target_checks.append(dict(canonicalGoalId=gid,wholeGoalContract=copy.deepcopy(goals[gid]),wholeTargetExplicitlyDemandedByThisOneAtom=False,strength=strengths.get(gid,'Retained prior broad binding: this specific whole source performance does not independently establish this whole target. No new source-strength approval; own source/role justification remains required.'),classification='related_partial_operationalisation' if gid in related else 'retained_without_new_source_strength_claim'))
 assess.append(dict(routeNumber=i,mappingPath=route['mappingPath'],sourceGoalId=route['sourceGoalId'],wholeSourceAtom=copy.deepcopy(all_source[route['sourceGoalId']]),originalPerformanceOperatorOrBoundary=op,scopeBoundary=route['scopeBoundary'],wholeTargetChecks=target_checks,sourceRemainingFacets=remaining,status='E1/G1 ai_candidate needs_human_review; author analysis only'))
 if route['sourceGoalId']==BB_OLD:continue
 mapping=maps[route['mappingPath']]
 if 'decisions' in mapping:
  dec=next(d for d in mapping['decisions'] if d['sourceGoalId']==route['sourceGoalId'])
  dec['rationale']='UNREVIEWED AUTHOR INERT v2: '+route['reason']+' WHOLE-SOURCE LIMIT: '+remaining
  dec['reviewer']='Codex source-facet author (independent counterreview pending)';dec['reviewedAt']='2026-10-10'
 # Seed has no reviewer-approved decision object; retain exact mapping rows.

# g15 was not one of the twenty reroutes. Its atom was corrected; existing rows
# stay unchanged, but the relevant source limitation is explicit.
g15='de-nw-sowi-sekii-wirtschaft-ef-if2-marktwirtschaft-g15-5ea6bf3c'
g15rows=[m for m in maps[nw_map]['mappings'] if m['legacyGoalId']==g15]
g15note='Original S.56 erklärt Leistungsgrenzen, insbesondere Konzentration/Wettbewerbsbeschränkung, soziale Ungleichheit, Krisen und ökologische Fehlsteuerung. MONO deckt nur einen abgeleiteten Preis-/Mengenmechanismus ab. Andere Grenzen und etwaige Eingriffs-/Urteilsaspekte bleiben außerhalb dieses Atoms; alle bisherigen anderen Mappingrows unverändert, keine pauschale whole-source-Freigabe.'
g15dec=next(d for d in maps[nw_map]['decisions'] if d['sourceGoalId']==g15)
g15dec['rationale']='UNREVIEWED AUTHOR INERT v2: '+g15note;g15dec['reviewer']='Codex source-facet author (independent counterreview pending)';g15dec['reviewedAt']='2026-10-10'

for original,obj in sources.items():
 write(pathlib.Path(newindex['files'][original]['candidate']).relative_to(BASE.relative_to(ROOT)),obj)
for original,obj in maps.items():
 if 'sourceExtractionPath' in obj:
  oldpath=obj['sourceExtractionPath'];obj['sourceExtractionPath']=oldpath.replace(rel(PRE),rel(BASE)) if oldpath.startswith(rel(PRE)+'/source-candidates/') else oldpath
 if 'reviewId' in obj:obj['reviewId']=obj['reviewId'].replace('-1826-FACET-AUTHOR-INERT-20261010-1','-1826-FACET-AUTHOR-INERT-20261010-2')
 if 'status' in obj:obj['status']='incomplete'
 write(pathlib.Path(newindex['files'][original]['candidate']).relative_to(BASE.relative_to(ROOT)),obj)
write('author-file-index.INERT.json',newindex)
write('actual-whole-source-atom-v1-to-v2-operator-and-retirement-deltas.AUTHOR-INERT.json',dict(status='UNREVIEWED AUTHOR INERT',evidenceLevel='E1',gateLevel='G1',deltas=delta,inheritedMetadataLimit='Any pipelineStatus / qualityReview / seed metadata retained in whole source candidate files is historical template content; not a new source science/native acceptance.'))
write('actual-twenty-route-proposals-with-whole-source-limits.AUTHOR-INERT.json',dict(status='UNREVIEWED AUTHOR INERT',routes=routes))
write('actual-twenty-whole-route-source-operator-and-target-strength-author-audit.AUTHOR-INERT.json',dict(status='UNREVIEWED AUTHOR INERT',reviews=assess,additionalCorrectedNWg15=dict(wholeSourceAtom=copy.deepcopy(all_source[g15]),wholeRetainedMappings=copy.deepcopy(g15rows),wholeRetainedTargetContracts=[copy.deepcopy(goals[m['canonicalGoalId']]) for m in g15rows],sourceRemainingFacets=g15note,wholeSourceCompleted=False)))

# Own complete original search, retaining only search metadata and paraphrases.
exe='/tmp/skillpilot-native-poppler-56ptay2_/extracted/usr/bin/pdftotext'
env=dict(os.environ,LD_LIBRARY_PATH='/tmp/skillpilot-native-poppler-56ptay2_/extracted/usr/lib/x86_64-linux-gnu')
pdf=ROOT/'curricula/DE/Gymnasium/input/BB/upper-secondary/Teil_C_RLP_GOST_2018_Wirtschaftswissenschaft.pdf'
text=subprocess.check_output([exe,'-layout',str(pdf),'-'],text=True,env=env)
normalized=re.sub(r'[-\u00ad]\s*\n\s*','',text).replace('\u00ad','');normalized=re.sub(r'\s+',' ',normalized).lower()
patterns=['extern','marktversag',r'öffentliche[nrsm]?\s+güter',r'information.?asym']
counts={p:len(re.findall(p,normalized)) for p in patterns};assert all(n==0 for n in counts.values())
write('actual-BB-whole-original-search-and-retirement-own-paraphrases.READONLY.json',dict(kind='READONLY original search and bounded author retirement recommendation',pdfPath=rel(pdf),pdfSha256=sha(pdf),url='https://bildungsserver.berlin-brandenburg.de/fileadmin/bbb/unterricht/rahmenlehrplaene/gymnasiale_oberstufe/curricula/2022/Teil_C_RLP_GOST_2018_Wirtschaftswissenschaft.pdf',exactCommand=[exe,'-layout',rel(pdf),'-'],environmentOverride=dict(LD_LIBRARY_PATH=env['LD_LIBRARY_PATH']),normalization='Remove soft hyphens / join line-break hyphens, lowercase and collapse whitespace; inspect whole relevant chapters as well. Zero text hits are supporting search evidence, not proof of conceptual absence.',wholeOriginalSearchTermCounts=counts,wholeChapterPagesActuallyRead=[19,22,23,24,26],ownParaphrases=[dict(page=19,course='GK fourth semester',role='compulsory sustainable economics',performance='Analyse connections among production/consumption/environment/political conditions; examine growth limits and alternative welfare indicators; discuss sustainable economics and international agreements.',limit='Related environmental breadth does not explicitly prescribe an external-cost/benefit market-failure causal explanation.'),dict(page=23,course='LK second semester',role='compulsory market and price',performance='Compare market supply under polypol and monopoly and evaluate results.',limit='Supports the new monopoly source atom partially; concentration/competition is a separate elective field.'),dict(page=24,course='LK third semester',role='macroeconomics',performance='Separate macroeconomic curricular chapter.',limit='Does not locate the old LK market/price externality atom.'),dict(page=26,course='LK fourth semester',role='sustainable economics as an alternative within Wahlobligatorium',performance='The sustainable-economics option analyses production/consumption/environment/policy relationships and discusses limits, welfare indicators and international sustainability.',limit='Cannot be copied as a compulsory LK market/price externality claim. A genuinely new contextual derived mapping would need separate full-target and role review.' )],retirement=dict(sourceGoalId=BB_OLD,fullHistoricalClaimPreserved=True,onlyCurrentCandidateSourceGoalAndParentLineAndMappingDecisionRemoved=True,remainingBBdirectEXTMappings=[],sourceScopeM6Effect='Old direct BB EXT support was only this unproved atom. This does not create a normative BB gap: no explicit such performance was located. Native source-count/actual-curriculum coverage and scope-role derivation remain to check; extra externalities require separate pedagogical or other-source roles, not a false BB official claim. No automatic M6 failure or all-source-covered claim.')))
write('actual-NW-three-original-performance-own-paraphrases.READONLY.json',dict(kind='Bounded primary-performance author correction',pdfPath='curricula/DE/Gymnasium/input/NW/upper-secondary/klp_gost_sowi.pdf',pdfSha256=sha(ROOT/'curricula/DE/Gymnasium/input/NW/upper-secondary/klp_gost_sowi.pdf'),url='https://www.schulentwicklung.nrw.de/lehrplaene/lehrplan/180/KLP_GOSt_SoWi.pdf',entries=[dict(sourceGoalId=g,printedPage=page,physicalPage=page,courseRole=role,ownCompletePerformanceParaphrase=NW_TEXTS[g],wholeOriginalPageRead=True) for g,page,role in [(list(NW_TEXTS)[0],55,'Wirtschaft variant EF shared course entry'),(list(NW_TEXTS)[1],56,'Wirtschaft variant EF shared course entry'),(list(NW_TEXTS)[2],76,'Wirtschaft variant Q-LK IF5')]],adjacentPage77='Judgement of conflicts with the public good environment is a separate wider performance; not identical to the corrected p76 description-of-causes atom.',parentPassageLocatorLimit='Existing aggregate passage page48/page74 is not rewritten into a single false new locator. Individual corrected sourceRefs 55/56/76 are exact; all untouched aggregate content remains an unreviewed historical template.'))

matrix=read(PRE/'actual-seven-state-course-facet-matrix.AUTHOR-INERT.json')
matrix['predecessor']=rel(PRE/'actual-seven-state-course-facet-matrix.AUTHOR-INERT.json')
matrix['v2ExplicitLimits']=['BB old LK externality source atom and its last direct EXT mapping proposed retired. Old BB EXT official claim is retired, not a proven normative gap; rederive actual source count/coverage and any separately justified pedagogical role.','NW g03 analyse consumer sovereignty under information AND power asymmetries; new pre-contract INFO is derived partial only.','NW g15 explain wider market-system limits, not merely monopoly.','NW g05 describe market/state-failure causes in ecology/economy conflict. PUB from adjacent environment context is derived partial only.','No canonical applicability fields changed. No blind copying of old seven-country applicability to new INFO/PUB. Roles/whole source/Scope/M6 remain independently to determine.']
write('actual-seven-state-course-facet-matrix-with-v2-limits.AUTHOR-INERT.json',matrix)
# A plain authored status document, no approval or active application.
(BASE/'README.AUTHOR-INERT.txt').write_text('UNREVIEWED AUTHOR INERT v2 — E1 / G1 / ai_candidate / needs_human_review.\nPredecessor v1 stays byte-exact and sealed. Proposed successor corrects exactly three NW operators/scopes in whole atoms + matching parent strings and retires the unproved BB old externality atom + parent line + its mapping/decision. All remaining whole source atoms are preserved exactly from v1. Twenty mapping routes are individually bounded with whole source and whole target contracts; none is claimed to complete its whole source. The old BB EXT claim is removed; actual curricular coverage/course roles must be rederived without inventing a normative BB gap. No active source, canonical, registry, cards, images, practice, scope, reviewer files or native checker changed.\nFollow-up after independent original/source review: native extraction/fingerprints, source validation, explicit country/course/target roles, scope and M6, whole practice requires/coveredGoalIds, memory/cards, images and P/A/D/V/Q gates. No release or machine M7 claimed.\n')

# Technical preservation checks, intentionally not scientific acceptance.
checks={}
for original,obj in sources.items():
 old=predecessor[original];oldgoals={g['id']:g for g in old['sourceGoals']};newgoals={g['id']:g for g in obj['sourceGoals']}
 allowed=set(NW_TEXTS) if original==nw_orig else {BB_OLD} if original==bb_orig else set()
 assert all(newgoals[i]==g for i,g in oldgoals.items() if i not in allowed)
 assert set(newgoals)==set(oldgoals)-({BB_OLD} if original==bb_orig else set())
 assert {k:v for k,v in old.items() if k not in ['sourceGoals','passages']}=={k:v for k,v in obj.items() if k not in ['sourceGoals','passages']}
 assert len(obj['passages'])==len(old['passages'])
 affected={oldgoals[i]['passageId'] for i in allowed}
 assert all(new==prev for new,prev in zip(obj['passages'],old['passages']) if prev['id'] not in affected)
 assert all(set(p['sourceGoalIds'])<=set(newgoals) for p in obj['passages'])
 checks[original]=dict(sourceAtoms=len(newgoals),unchangedWholeAtoms=len(oldgoals)-len(allowed),onlyAllowedAtomAndParentChanges=True)
for original,obj in maps.items():
 old=predecessor[original];oldrows=old['mappings'];rows=obj['mappings']
 assert rows==([r for r in oldrows if r['legacyGoalId']!=BB_OLD] if original==bb_map else oldrows)
 assert all(r['canonicalGoalId'] in goals for r in rows)
 if 'decisions' in old:
  changed={r['sourceGoalId'] for r in routes if r['mappingPath']==original};changed|={g15} if original==nw_map else set()
  olddecs={d['sourceGoalId']:d for d in old['decisions']};newdecs={d['sourceGoalId']:d for d in obj['decisions']}
  assert all(d==newdecs[i] for i,d in olddecs.items() if i not in changed)
 checks[original]=dict(mappingRows=len(rows),onlyRetiredBBRowRemovedAllOtherMappingRowsExact=True,unaffectedDecisionsExact=True)
after=[binding(p) for p in bound_files];write('actual-bound-inputs.after.READONLY.json',after);assert before==after
write('actual-technical-only-preservation-boundaries.READONLY.json',dict(checks=checks,allBoundInputsExactBeforeAfter=True,boundInputCount=len(before),activeInputCount=len(inputs),predecessorFilesExact=True,noNativeCheckerOrFingerprintRefresh=True,noActiveMutationByAuthor=True,notScienceOrGateApproval=True))
artifacts=[binding(p) for p in sorted(BASE.rglob('*')) if p.is_file() and p.name!='actual-SEALED-unreviewed-v2-operator-fidelity-and-retirement.receipt.json']
write('actual-SEALED-unreviewed-v2-operator-fidelity-and-retirement.receipt.json',dict(kind='SEALED UNREVIEWED AUTHOR INERT v2',authorTask='/root/economics_final679_required_gate_plan',date='2026-10-10',status='ai_candidate_needs_human_review',evidenceLevel='E1',gateLevel='G1',predecessorReceipt=rel(PRE/'actual-SEALED-unreviewed-source-facet-author-handoff.receipt.json'),predecessorReceiptSha256=sha(PRE/'actual-SEALED-unreviewed-source-facet-author-handoff.receipt.json'),threeCorrectedNWAtoms=list(NW_TEXTS),retiredBBClaim=BB_OLD,mappingRouteAuditCount=20,allBoundInputsExactBeforeAfter=True,boundInputCount=len(before),activeInputCount=len(inputs),activeFilesChangedByAuthor=[],nativeQSAndFingerprintRefreshPerformed=False,scienceAcceptance=False,allSourceCovered=False,releaseOrM7Claim=False,artifacts=artifacts))
print(json.dumps(dict(package=rel(BASE),receiptSha256=sha(BASE/'actual-SEALED-unreviewed-v2-operator-fidelity-and-retirement.receipt.json'),artifacts=len(artifacts),boundInputs=len(before)),ensure_ascii=False))
