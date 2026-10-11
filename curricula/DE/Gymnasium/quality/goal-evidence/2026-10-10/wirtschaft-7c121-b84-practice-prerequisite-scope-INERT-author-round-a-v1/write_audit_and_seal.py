#!/usr/bin/env python3
"""Preserve actual source/contract boundaries and own immutable author handoff."""
import copy, datetime, hashlib, importlib.util, json, pathlib, shutil
import jsonschema
ROOT=pathlib.Path(__file__).resolve().parents[7]
OUT=pathlib.Path(__file__).resolve().parent
SNAP=OUT/'input-snapshots'
def read(p):return json.loads(pathlib.Path(p).read_text())
def write(name,data):
 p=OUT/name;p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
def bind(p,kind='actual-input'):
 p=pathlib.Path(p);b=p.read_bytes();return {'path':str(p.relative_to(ROOT)),'kind':kind,'digest':'sha256:'+hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def rows(p):return [json.loads(x) for x in pathlib.Path(p).read_text().splitlines() if x.strip()]
before=read(SNAP/'seven-current-whole-goals.BEFORE.json')['goals'];proposed=read(OUT/'seven-whole-proposed-goals.INERT.json')['goals']
old={g['id']:g for g in before};new={g['id']:g for g in proposed};ids={g['id'][:3]:g['id'] for g in before}
G7=ids['7c7'];G121=ids['121'];B84=ids['b84'];F93=ids['f93'];DA1=ids['da1'];P28=ids['28a'];P81=ids['81f']
EEE='eee7217a-c2fb-58b6-ba84-2a8d5235edb5'
canonical=ROOT/'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json';whole=read(canonical);graph={g['id']:g for g in whole['goals']}
native=read(OUT/'native-four-view-role-and-target-preservation.json')
nativeScope=read(OUT/'native-whole-economics-applicability-delta-and-warning-disclosure.json')

# Entire dependent practice object; only the compiler-derived applicability
# field is proposed. This is a technical follower, not a new course target.
dependentId='072278ce-e91a-5b55-a5ad-fbfb484a8986'
dep=graph[dependentId];write('input-snapshots/072-current-whole-dependent-practice.BEFORE.json',dep)
depAfter=copy.deepcopy(dep);delta=next(d for d in nativeScope['applicabilityDeltas'] if d['goalId']==dependentId)
depAfter['applicability']=delta['after']
write('072-whole-only-native-derived-applicability.INERT-follower-candidate.json',depAfter)
write('072-technical-follower.exact-disclosure.json',{
 'goalId':dependentId,'role':'TECHNICAL_DERIVED_FIELD_CANDIDATE_NOT_SCIENCE_APPROVAL',
 'exactChangedField':'/applicability','before':dep['applicability'],'after':depAfter['applicability'],
 'basis':'Native assessment-requires intersection after the independently unqualified authored 121 visibility decision.',
 'ordinaryTaskSolutionRubricRequiresCoveredGoalIdsExactUnchanged':True,
 'noNewHbThTargetRole':True,'sourceCoverageClaim':False,'independentQualificationPending':True,
 'warningBeforeFollowerBinding':'APV-203; root must decide/apply the exact separate field follower only after independent scope/material review.',
})

parentGoals=read(SNAP/'all-current-whole-contains-ancestors.json')['goals']
parentEdgeAudit=[{'goalId':g['id'],'title':g['title'],'requires':g.get('requires',[])} for g in parentGoals]
assert all(not g['requires'] for g in parentEdgeAudit)
prereqGoals=read(SNAP/'all-current-whole-prerequisite-goals.json')['goals']
write('whole-prerequisite-and-practice-scope.AUTHOR-audit.json',{
 'role':'OWN_AUTHOR_ANALYSIS_NOT_INDEPENDENT_REVIEW','wholeCurrentSevenGoalsRead':True,
 'wholeCurrentDirectTransitivePrerequisiteGoalsRead':[g['id'] for g in prereqGoals],
 'wholeContainsAncestorDirectRequires':parentEdgeAudit,'actualInheritedClusterPrerequisites':[],
 'currentSourceAndPContractRead':'Full DE/EN goals; whole active P contracts via registry route; whole supplied practice dossiers, solutions, rubrics and existing linked material objects. Root Science content-only receipt and sealed six-case author contracts read, not self-qualified.',
 'edgeDecisions':[
  {'goalId':G7,'requiresAfter':new[G7]['requires'],'decision':'retain_orientation_only','reasonDe':'Ein bereitgestelltes AB2-Modell verlangt Schwellen-/Einheitendeutung und bedingte Rechnung, keine vorherige Tarifkonflikt- oder AB3-Instrumentenbewertung. Orientierung wird nicht in einen Fachtest umgedeutet.','reasonEn':'A supplied AB2 model needs interpretation of threshold/units and conditional calculation, not prior bargaining-dispute or AB3 instrument assessment. Orientation remains non-assessive.'},
  {'goalId':G121,'requiresAfter':new[G121]['requires'],'decision':'retain_orientation_only','reasonDe':'Der ganze vorhandene Tarifvertrag bleibt semantisch gleich; Kosten-, Einkommens-, Interessen-/Macht- und bedingte Modellwirkungen verlangen keine NAIRU-Rechnung. HB/TH-Sichtbarkeit ist ausdrücklich authored prerequisiteOnly, nicht neue Source-Targetpflicht.','reasonEn':'The whole existing bargaining contract is semantically unchanged; costs, income, parties/power and conditional model responses require no NAIRU calculation. HB/TH visibility is expressly authored prerequisiteOnly, not a new source target obligation.'},
  {'goalId':B84,'beforeRequires':old[B84]['requires'],'requiresAfter':new[B84]['requires'],'decision':'replace_false_nairu_gate_with_whole_eee_case_analysis','reasonDe':'Die beiden ganzen b84-Fälle bewerten Qualifizierung anhand Teilnahme/Abschluss/beruflicher Nutzung, Matching/Zugang, Mitnahme/Verdrängung, Zeit/Kosten und Vergleich. Keiner benötigt u* oder Inflation. Die aktuelle ganze eee-Kompetenz analysiert belegte Engpässe, Maßnahmenpassung und begrenzte Wirkungsschlüsse als passende AB2-Vorstufe zur AB3-Bewertung. Dies ist eine didaktische Autorentscheidung; eine logische Unentbehrlichkeit jedes Statistikbeispiels des eee-Profils wird nicht behauptet.','reasonEn':'Both whole b84 cases assess training through participation/completion/use, matching/access, deadweight/displacement, time/cost and comparison. Neither needs u* or inflation. Whole current eee analyses evidenced bottlenecks, policy fit and bounded effect inferences as a relevant AB2 predecessor to AB3 evaluation. This is an authored sequencing decision, not a claim that every statistical example in eee is logically indispensable.','counterexampleDe':'Eine Person kann den 10-Prozentpunkte-Vergleich mit Selektionsgrenze, Qualifikationsnutzung und Zeithorizont begründen, ohne die NAIRU zu kennen; das alte Gate blockiert sie fachfremd. Reines NAIRU-Rechnen zeigt umgekehrt keinen Qualifizierungserfolg.','counterexampleEn':'A learner can justify the ten-percentage-point comparison with selection limits, skill use and horizon without knowing NAIRU; the old gate blocks them for unrelated content. NAIRU arithmetic alone demonstrates no training outcome.'},
  {'goalId':F93,'beforeRequires':old[F93]['requires'],'requiresAfter':new[F93]['requires'],'beforeCovered':old[F93]['examData']['coveredGoalIds'],'afterCovered':new[F93]['examData']['coveredGoalIds'],'decision':'explicit_two_atomic_contracts_and_supplied_tariff_transfer','reasonDe':'A/Tasks1 und3 sowie B/Task5/6 prüfen tatsächlich die Modellschwelle. Tasks2/4/5/6 prüfen Tarifkosten, Kaufkraft, Nachfrage und Koordination; deshalb ist 121 eine ganze didaktische Voraussetzung und eine tatsächlich bearbeitete Kompetenz. Der INERT-Fall ergänzt konkrete Parteien und vorgegebene Marktformen in den vorhandenen Tasks2/3; weder Schlagwort noch alte unsplit-7c-ID ersetzt diese Leistung.','reasonEn':'A/tasks1/3 and B/tasks5/6 assess the actual model threshold. Tasks2/4/5/6 assess bargaining costs, purchasing power, demand and coordination; thus 121 is a didactic prerequisite and an actually exercised competence. The inert case adds concrete parties and supplied market forms within existing tasks2/3; neither terminology nor the old unsplit 7c ID substitutes for that performance.'},
  {'goalId':DA1,'requiresAfter':new[DA1]['requires'],'coveredAfter':new[DA1]['examData']['coveredGoalIds'],'decision':'retain_existing_five_goal_set_but_separate_task1_two_atom_performance','reasonDe':'Der Dossiervertrag enthält schon beide IDs. Task1 benötigte zusätzlich zur bisherigen Rechnung die tatsächlich neue geschätzte/revidierte NAIRU-Deutung. Die ganze Fassung liefert deshalb die alternative Schätzung7 bei unverändertem u7, verlangt Rechnung und Deutungsgrenze, und schreibt die2 NAIRU-Punkte getrennt von4 Lohnmodell-/2 Informationspunkten aus. Die Tarifleistung der Tasks1/2 wird vollständig 121 zugeordnet. Tasks3–5 bleiben exakt.','reasonEn':'The dossier already names both IDs. Besides its old calculation, task1 needs the actual new estimated/revised NAIRU interpretation. The whole candidate supplies alternative estimate7 at unchanged observed7, demands calculation and inference limits, and separates the two NAIRU marks from four wage-model/two evidence marks. Bargaining performance in tasks1/2 is attributed to 121. Tasks3–5 are exact.'},
  {'goalId':P28,'requiresAfter':new[P28]['requires'],'coveredAfter':new[P28]['examData']['coveredGoalIds'],'decision':'retain_whole_training_practice_contract_remove_only_transitive_false_nairu_via_b84','reasonDe':'Beide ganzen Fälle und sechs Tasks prüfen Bildungsstufen, Lock-in, Vergleich/Selektion, Matching, Mitnahme/Verdrängung und Kosten/Horizont. Keine NAIRU-/Tarifrechnung wird benötigt. Direkte b84-Voraussetzung und Abdeckung sowie alle Materialien/Rubriken bleiben exakt; nur die b84-Vorstufe entfällt als False-NAIRU-Gate.','reasonEn':'Both whole cases/six tasks assess training stages, lock-in, comparison/selection, matching, deadweight/displacement and cost/horizon. No NAIRU or bargaining calculation is needed. Direct b84 prerequisite/coverage and all material/rubrics remain exact; only the b84 predecessor removes the false transitive NAIRU gate.'},
  {'goalId':P81,'requiresAfter':new[P81]['requires'],'coveredAfter':new[P81]['examData']['coveredGoalIds'],'decision':'retain_clinic_material_and_five_goal_set_rebind_b84_contract','reasonDe':'Task1 Fachkräftestrategie/8f; Task2 Qualifizierung/b84; Task3 Stunden/VZÄ/Dauer/Einkommen/dd38; Task4 Demografie mit bedingtem Tarifengpass/b727; Task5 Statistik/Fallanalyse/eee. Über b84 war NAIRU unpassend verlangt, über b727 ist 121 für die tatsächliche bedingte Tarifwirkung sachlich relevant. Keine volle 121-Alleinabdeckung wird aus dem knappen Task4-Anteil behauptet. Beteiligungsbegriffe allein beweisen weder776 noch a500. Kein neuer coveredGoalId oder dd38-P.','reasonEn':'Task1 skills strategy/8f; task2 training/b84; task3 hours/FTE/duration/income/dd38; task4 demography with conditional bargaining shortage/b727; task5 statistics/case analysis/eee. NAIRU through b84 is inappropriate, while 121 through b727 is relevant to the actual conditional bargaining mechanism. The short task4 component does not establish standalone whole121 coverage. Voice terms alone prove neither776 nor a500. No additional coveredGoalId or dd38 profile.'},
 ],
 'fullOld7cPracticeBindings':[
  {'goalId':B84,'bindingType':'direct_requires','newNairuActuallyAssessed':False,'tariffActuallyRequiredByWholeGoalOrCases':False},
  {'goalId':F93,'bindingType':'direct_requires_and_covered','newNairuActuallyAssessed':True,'tariffActuallyRequiredByWholeGoalOrCases':True},
  {'goalId':DA1,'bindingType':'direct_requires_and_covered','newNairuActuallyAssessed':True,'tariffActuallyRequiredByWholeGoalOrCases':True},
  {'goalId':P28,'bindingType':'transitive_via_b84','newNairuActuallyAssessed':False,'tariffActuallyRequiredByWholeGoalOrCases':False},
  {'goalId':P81,'bindingType':'transitive_via_b84','newNairuActuallyAssessed':False,'tariffActuallyRequiredByWholeGoalOrCases':'limited_actual_b727_task4_mechanism_not_whole121_mastery'},
 ],
 'twoAtomPracticePerformanceMatrix':{
  'NAIRU_threshold_parameter_inflation_units_and_level':'f93 task1 plus task3 model boundary',
  'NAIRU_revised_estimate_same_observation':'f93 task5/6; new supplied da1 task1',
  'tariff_parties_interests_power':'new explicit f93 task2 parties; whole da1 task2 dispute/strike/power',
  'tariff_real_income_unit_costs_conditional_channels':'f93 tasks2/4/6; da1 task2',
  'tariff_coordination_expectations':'f93 task5 plus B-case planning limits',
  'tariff_explicit_market_forms_and_changed_order_limit':'new supplied f93 A/task3, separate fictional K/E assumptions',
  'tariff_nonpay_rosters_security_strike_spillovers':'whole da1 M3/task2; unchanged original121 case2 preserved in separate P content candidate',
  'interpretation':'Assess whole demonstrated aspects; neither this matrix nor six existing task labels introduces a new completion quota or implies child/mastery writes.'},
 'nativeRoleEvidence':{'fourHbThTargetSetsExactPreserved':all(r['targetSetExactPreserved'] for r in native['views']),
  'tariffGlobalIdRetainedOnlyForPrerequisiteChecks':all(r['tariffRetainedInProjectedPrerequisiteData'] and r['tariffPrerequisiteOnly'] and not r['tariffTarget'] and not r['tariffNativeExposed'] for r in native['views']),
  'tariffExcludedByActualNativeBookChapterMembership':all(r['tariffIncludedByNativeBookChapterProjection'] is False for r in native['views']),
  'nairuNotPromotedToBeBbNiTarget':native['protectedNairuScopes']},
 'assessmentsCounters':[{ 'goalId':g['id'],'maxPoints':g['examData']['scoring']['maxPoints'],'passingPoints':g['examData']['scoring']['passingPoints'],'scoringSteps':len(g['examData']['scoring']['steps']),
  'equalBefore':g['examData']['scoring']['maxPoints']==old[g['id']]['examData']['scoring']['maxPoints'] and g['examData']['scoring']['passingPoints']==old[g['id']]['examData']['scoring']['passingPoints'] and len(g['examData']['scoring']['steps'])==len(old[g['id']]['examData']['scoring']['steps'])}
  for g in proposed if 'examData' in g],
 'AIOnly':True,'humanApproval':False,'activation':False,
})

sourceRows=[];sourceInputs=[]
for c,filename,mappingfile in [
 ('HB','DE_HB_WIRTSCHAFTSLEHRE_SEKII_GYO_2008.source-extraction.json','hb_wirtschaftslehre_upper_secondary_source_extraction_to_canonical_wirtschaft.review.json'),
 ('TH','DE_TH_WIRTSCHAFT_RECHT_SEKII_LEHRPLAN_GYMNASIUM_2012.source-extraction.json','th_wirtschaft_recht_upper_secondary_source_extraction_to_canonical_wirtschaft.review.json')]:
 ep=ROOT/f'curricula/DE/Gymnasium/input/{c}/upper-secondary/source-extraction/{filename}';mp=ROOT/f'curricula/DE/Gymnasium/mapping/DE-{c}/upper-secondary/{mappingfile}'
 extracted=read(ep);mapping=read(mp);shutil.copyfile(ep,SNAP/f'{c}-whole-current-source-extraction.json');shutil.copyfile(mp,SNAP/f'{c}-whole-current-source-mapping.json')
 sourceInputs.extend([bind(ep,'actual-current-source-extraction'),bind(mp,'actual-current-mapping')])
 goalIds={m['legacyGoalId'] for m in mapping['mappings'] if m.get('canonicalGoalId')==G7}
 sourceRows.append({'jurisdiction':'DE-'+c,'sourceDocument':extracted['sourceDocument'],
  'wholeCurrent7cMappedSourceGoals':[g for g in extracted['sourceGoals'] if g['id'] in goalIds],
  'wholeCurrent7cMappingRows':[m for m in mapping['mappings'] if m.get('canonicalGoalId')==G7],
  'actualCurrentDirect121MappingRows':[m for m in mapping['mappings'] if m.get('canonicalGoalId')==G121],
  'readerJudgment':'Existing broad mapping rows do not independently prove the newly narrowed whole NAIRU contract or the entire121 contract. No mapping is invented or activated.',
  'normative121FullSourceClaim':False})
hbPdf=ROOT/'curricula/DE/Gymnasium/input/HB/GyO_Wirtschaftslehre_2008.pdf';thPdf=ROOT/'curricula/DE/Gymnasium/input/TH/LP_GY_Wirtschaft_und_Recht_2012.pdf'
write('HB-TH-current-source-and-explicit-prerequisite-role.AUTHOR-evidence.json',{
 'sourceRows':sourceRows,
 'actualPrimaryReadBoundary':[
  {'jurisdiction':'DE-HB','officialUrl':sourceRows[0]['sourceDocument']['url'],'currentOfficialIndexUrl':'https://www.transparenz.bremen.de/metainformationen/bildungsplan-wirtschaftslehre-gyo-bremen-279853',
   'localWorkingCacheObservation':bind(hbPdf,'optional-local-PDF-cache-not-a-required-committable-link'),'pages':14,
   'read':'Actual full fourteen-page PDF text, including whole Q1–Q4 passages, standards and GK/LK role statements. Official live index opened; live direct PDF could not be retrieved by browser tool.',
   'courseRoleDe':'Der Plan setzt grundlegende Standards; LK verfolgt dieselben Ziele bei höherem Umfang/Komplexität/Selbstständigkeit. Q3 analysiert Konjunktur-/Beschäftigungskonzepte; der Text nennt keine konkrete Tarif-/Lohnkompetenz oder ausdrücklich NAIRU. Allgemeine Methoden und schuleigene Schwerpunktfreiheit belegen keine volle normative121-Pflicht.',
   'courseRoleEn':'The plan supplies basic standards; advanced courses pursue the same goals at greater breadth/complexity/autonomy. Q3 analyses cycle/employment concepts; the text supplies no concrete bargaining/wage competence or explicit NAIRU. General methods and school discretion do not prove a complete normative121 obligation.'},
  {'jurisdiction':'DE-TH','officialUrl':sourceRows[1]['sourceDocument']['url'],
   'localWorkingCacheObservation':bind(thPdf,'optional-local-PDF-cache-not-a-required-committable-link'),'pages':38,
   'read':'Actual relevant whole PDF pages and prefaces: physical4–6,18–19,22–25; full-text term search across38 pages. No claim to have independently read all unrelated pages. Physical23 has printed24; physical22 has printed23.',
   'currentLiveUrlStatus':'Official current endpoint returns an HTML restricted-access page rather than the cached PDF. No access restriction bypassed; the archived actual PDF is the bounded textual witness, not proof of a fresh successful PDF fetch.',
   'courseRoleDe':'Das grundlegende Niveau gehört zum erhöhten Niveau. Die Vorbemerkung zur Qualifikationsphase verlangt für gemeinsame Begriffe/Methoden schulinterne Zuordnung. Die ganze Seite Soziale Marktwirtschaft nennt Tarifautonomie, Mindestlohn und Investivlohn als Begriffe; erhöhtes Niveau behandelt Einkommens-/Vermögenspolitik. Das trägt einen echten Tarifbezug, aber nicht ohne weitere Begründung sämtliche Parteien-, Konflikt-, Koordinations- und Marktformleistungen des ganzen121-P-Vertrags.',
   'courseRoleEn':'Basic level is included in advanced level. The qualification preface requires school-specific allocation of shared terminology/methods. The whole social-market-economy page names bargaining autonomy, minimum wages and employee investment remuneration; advanced level covers income/wealth policy. This establishes a genuine bargaining facet, but does not alone justify every parties/dispute/coordination/market-form demand in the whole121 profile.'},
 ],
 'proposedDirectNormativeSourceMappings':[],
 'explicitAuthoredAlternative':'Exact native-supported121 applicabilityOverrides HB/TH for prerequisite visibility plus explicit prerequisiteOnly entries in all four country/course views; existing targets preserved. Override evidence remains labelled override, not mapping/provenance.',
 'normativeCountrySourceGate':'OPEN_NOT_REPLACED_BY_DIDACTIC_SCOPE_AUTHORING',
 'sourceNoNewCopyrightGrantOrRelicensing':True,'sourceScientificOrHumanApproval':False,
})

registry=ROOT/'curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json'
subject=next(s for s in read(registry)['subjects'] if s['subject']=='wirtschaftswissenschaften')
memcfg=read(ROOT/subject['memoryReviewConfigPath']);memrows=rows(ROOT/memcfg['reviewPath']);cardrows=rows(ROOT/memcfg['cardReviewPath'])
selectedMem=[{k:v for k,v in r.items() if k in ['goalId','reviewId','fingerprint','memoryGoalIds','deckIds']} for r in memrows if r.get('goalId') in [G7,G121,B84]]
selectedCards=[{k:v for k,v in r.items() if k in ['deckId','cardId','originGoalIds','fingerprint']} for r in cardrows if G7 in r.get('originGoalIds',[])]
deckfile=ROOT/'app/public/data/de_gymnasium_economics_flashcards_macro_money_policy.de.json';card=next(c for c in read(deckfile)['cards'] if c['id']=='economics-macro-labor-market')
write('current-A-M-P-D-native-binding-followers-and-precise-open-gates.json',{
 'actualCurrentMemoryConfig':bind(ROOT/subject['memoryReviewConfigPath']),
 'actualCurrentMemoryOriginFile':bind(ROOT/memcfg['reviewPath']),
 'actualCurrentCardOriginFile':bind(ROOT/memcfg['cardReviewPath']),
 'currentOriginBindingsWithoutPriorScientificJudgments':selectedMem,
 'currentCardBindingsWithoutPriorScientificJudgments':selectedCards,
 'wholeActualCurrent7cOriginCard':card,'actualCurrentDeckInput':bind(deckfile),
 'preciseMemoryFindingDe':'Die einzige an7c gebundene Karte fragt nach Typen arbeitsmarktpolitischer Instrumente und antwortet mit Tarif, Qualifizierung, Vermittlung, Arbeitszeit, Sicherung und Nachfrage/Angebot. Sie prüft keine geschätzte NAIRU-Schwelle. Nach der 7c-Konzentrierung ist der alte Origin falsch. Ein pauschaler Transfer der ganzen Karte auf121 wäre ebenfalls zu breit, weil nur ihr Tarifanteil passt. Keine Karte, kein Origin und keine M-Entscheidung wird hier verändert; gezielte eigenständige A/M-/Origin-/Decksichtbarkeitsprüfung ist erforderlich.',
 'preciseMemoryFindingEn':'The sole card bound to7c asks for labour-policy instrument types and lists bargaining, training, matching, hours, security and demand/supply. It assesses no estimated NAIRU threshold. After narrowing7c, the old origin is wrong. Moving the entire card to121 would also overstate its scope because only the bargaining facet fits. No card, origin or M decision is changed here; separate targeted A/M/origin/deck-visibility review is required.',
 'wholePProfiles':{'candidateFile':'three-whole-P-current-scope-fingerprints.INERT-author-records.jsonl','count':3,'nativeSchemaAndFingerprints':'pass','bodiesPreservedExact':True,'E1_G1_AI_needsHumanReview':True,'qualification':'author_input_binding_only_not_science_or_source_approval'},
 'exactRemainingGates':[
  {'gate':'independent_science_scope_material','inputs':['seven-whole-proposed-goals.INERT.json','whole-prerequisite-and-practice-scope.AUTHOR-audit.json','views/','da1-whole-material-and-two-atom-performance-map.INERT.json','072-whole-only-native-derived-applicability.INERT-follower-candidate.json'],'reason':'New authored prerequisites, override/roles, f93 case/task2/task3 transfer and da1 task1 have not been independently qualified. Whole unchanged121 and six prior P cases have separate Root Science content KEEP only.'},
  {'gate':'normative_source_country_course','goalIds':[G7,G121],'reason':'HB/TH whole normative121 target coverage is not established; no source mapping invented. Other current broad7c mappings must be checked against the narrowed NAIRU contract. BE/BB/NI stay prerequisiteOnly rather than new NAIRU targets.'},
  {'gate':'A_M_SEM','goalIds':[G7,G121,B84],'reason':'Current fingerprints/context and whole scope must be independently requalified.7c origin card mismatch is concrete;121 visibility override and b84 requires change are new. Stable semantic kinds remain three curricularAtomic/four practiceAssessment; no checker or canonical kind change.'},
  {'gate':'D','goalIds':[G7,G121,B84],'reason':'Two fresh native independent current D rounds are required after the whole source/context/bindings are stable; none is supplied or replaced here.'},
  {'gate':'V_book_bundle','goalIds':[G7,G121,B84],'reason':'No new image/card/page/bundle generation. Native book chapter membership excludes prerequisite-only121 in HB/TH, but changed book publication/source/SEM/P/V digests are not rebound or qualified.'},
  {'gate':'technical_follower072','goalIds':[dependentId],'reason':'Exact native App follower16 is supplied; no new HB/TH target role. Its prior whole task/solution/rubric stays exact. Root needs scope/fingerprint binding decision rather than suppressing APV-203.'},
  {'gate':'human','reason':'All output remains AI author candidates; no human approval or observed learning/trial.'},
 ],
 'noActiveRegistryLedgerCanonicalCardsOrVoteChanges':True,
})

# Direct runtime/schema checks are scoped to the in-memory candidate graph.
schema=read(ROOT/'docs/landscape-runtime.schema.json');jsonschema.validate(whole,schema)
overlay=copy.deepcopy(whole);overlay['goals']=[new.get(g['id'],g) for g in overlay['goals']];jsonschema.validate(overlay,schema)
depOverlay=copy.deepcopy(overlay);depOverlay['goals']=[depAfter if g['id']==dependentId else g for g in depOverlay['goals']];jsonschema.validate(depOverlay,schema)
assert new[P28]==old[P28]
for field in ['taskContent','taskContentEn','solutionContent','solutionContentEn','scoring','coveredGoalIds']:
 assert new[P81]['examData'][field]==old[P81]['examData'][field],field
assert new[P81]['requires']==old[P81]['requires']
assert all(r['equalBefore'] for r in read(OUT/'whole-prerequisite-and-practice-scope.AUTHOR-audit.json')['assessmentsCounters'])
write('scoped-runtime-schemas-and-whole-preservation-checks.json',{'runtimeCurrentWhole':True,'runtimeSevenCandidateOverlay':True,'runtimeWith072FieldOnlyFollower':True,'whole28Exact':True,'whole81ScientificMaterialRequiresAndCoverageExact':True,'fourAssessmentTaskPointPassCountersExact':True,'newIndependentScienceApproval':False})

# Extra observed input bindings, including every affected/current country view,
# and the exact compiler/dependency/model/schema bytes used in scoped checks.
inputs=read(OUT/'input-bindings.json')['inputArtifacts']
extraPaths=[ROOT/'AGENTS.md',ROOT/'docs/landscape-runtime.schema.json',ROOT/'contracts/curriculum-package/v1/composition-view.schema.json',ROOT/'contracts/goal-evidence/v2/goal-evidence-profile.schema.json',ROOT/'app/scripts/applicabilityCompiler.ts',ROOT/'app/scripts/memoryCardReviewConfigDiscovery.ts',ROOT/'app/scripts/positiveGoalEvidenceProfileModel.ts',ROOT/'app/src/utils/authoring/compositionViewAuthoring.ts',ROOT/'app/src/utils/authoring/canonicalAuthoring.ts',ROOT/'app/src/utils/compositionViewRuntime.ts',ROOT/'app/src/utils/goalFilters.ts',ROOT/'app/src/utils/goalBookChapterProjection.ts',ROOT/'backend/src/main/java/com/skillpilot/backend/service/LearnerService.java',ROOT/'app/scripts/config/goal-books/de-gym-economics-current-canonical.json',ROOT/'app/public/lernzielbuch/de-gym-wirtschaftswissenschaften-bundesweit.book-model.json',ROOT/subject['semanticKindLedgerPath'],ROOT/subject['semanticAtomicityConfigPath'],ROOT/subject['memoryReviewConfigPath'],ROOT/memcfg['reviewPath'],ROOT/memcfg['cardReviewPath'],deckfile]
extraPaths.extend(ROOT/g['examData']['sourceArtifactPath'] for g in before if g.get('examData',{}).get('sourceArtifactPath'))
extraPaths.extend(sorted((ROOT/'curricula/DE/Gymnasium/composition-views/wirtschaft').glob('*.view.json')))
extraPaths.extend([ROOT/'curricula/DE/Gymnasium/provenance/source-landscape-registry.json',ROOT/'curricula/DE/Gymnasium/provenance/canonical-goal-provenance-registry.json',ROOT/'curricula/DE/Gymnasium/provenance/canonical-goal-applicability-override-registry.json'])
inputs.extend(sourceInputs);inputs.extend(bind(p,'additional-observed-current-input') for p in extraPaths)
previousSevenSeal=ROOT/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/wirtschaft-final56-seven-description-remedies-whole-independent-a-v1/independent-review.seal.receipt.json'
assert bind(previousSevenSeal)['digest']=='sha256:4177abec8434b0177090b8f137f26360562554c1c9f413785e19a7365c071479'
inputs.append(bind(previousSevenSeal,'earlier-own-seven-review-seal'))
for i in read(previousSevenSeal)['unchangedInputEndguards']:
 if '/round-a/results/' in i['path'] or i['path'].endswith('independent-review.seal.receipt.json') or i['path'].endswith('author-seal.json'):
  inputs.append(i)
unique={i['path']:i for i in inputs}
end=[]
for i in unique.values():
 actual=bind(ROOT/i['path']);end.append({**i,'endDigest':actual['digest'],'endBytes':actual['bytes'],'unchanged':actual['digest']==i['digest'] and actual['bytes']==i['bytes']})
assert all(r['unchanged'] for r in end),'Active or sealed source input changed'
write('all-actual-input-artifacts.end-guards.json',{'closedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'allUnchanged':True,'inputArtifacts':end})

spec=importlib.util.spec_from_file_location('schema_checks',ROOT/'scripts/validate_schemas.py');module=importlib.util.module_from_spec(spec);spec.loader.exec_module(module)
linkErrors=module.curriculum_symlink_errors(ROOT)
assert not linkErrors,linkErrors
write('committable-curriculum-symlink-check.json',{'validator':'scripts/validate_schemas.py::curriculum_symlink_errors','errors':linkErrors,'noRequiredAbsoluteOrIgnoredScratchLinkAdded':True})

handoff='''Eigener INERT-Autorabschluss, keine unabhängige Freigabe

Die sieben ganzen aktuellen BEFORE-Ziele und ihre vollständigen DE/EN/P-/Praxisverträge sind gebunden. `seven-whole-proposed-goals.INERT.json` enthält die ausdrücklich getrennte NAIRU-Kompetenz unter der unveränderten curricularAtomic-ID7c, das ganze semantisch unveränderte121 mit begründeter HB/TH-Voraussetzungssichtbarkeit, den b84→eee-Vorschlag und die ganzen vier Praxisziele. Es gibt kein neues curricularAtomic und keine Clusterkonvertierung.

f93 verlangt und erfasst jetzt beide atomaren Verträge. Sein bestehender A-Fall liefert in den vorhandenen Tasks2/3 ausdrücklich Parteien sowie zwei gegebene Marktformen: K110→108; E80→90 unter den angegebenen Angebots-/Profit-/Einstellungsannahmen; Auftragsvariation höchstens85. Das ersetzt die bisher nur genannte fehlende Marktforminformation durch tatsächliche Leistung. B behält Stückkosten1,96%, Reallohn0,97%, NAIRU+0,4→0 und den Koordinationskanal. Zwei Fälle/sechs Aufgaben/24P/bestanden15 bleiben. Keine neue Aufgaben- oder Fallquote. Alte ganze wissenschaftliche Freigabe behauptet keine Qualifikation dieser geänderten Fassung.

da1 liefert für Task1 die Schätzrevision u*5→7 bei konstantem beobachtetem u7: −0,8→0 Prozentpunkte. Die Rubrik unterscheidet zwei NAIRU-Punkte von vier Lohnmodell-/zwei Informationspunkten. Die vollständigen übrigen vier Aufgaben bleiben. 44P/bestanden27 und die fünf coveredGoalIds/requires bleiben. `da1-whole-material-and-two-atom-performance-map.INERT.json` ordnet Tarif-/Lohnmodelle ausdrücklich121 zu; keine Aktualitätsbehauptung aus alten unsplit-Profilen. 28a ist als ganzes Ziel byteinhaltlich gleich.81 behält alle ganzen wissenschaftlichen Aufgaben, Lösungen, Rubriken und die fünf requires/coveredGoalIds; nur sein separater Materialbeleg bindet das neue b84-Vertragsobjekt. Task3 prüft Stunden/Dauer, nicht die ganzen776/a500-Verträge; kein dd38-P-Autorprofil.

Native Applicability/Composition/Filter/Runtime-Projektion und tatsächliche BookModel-Kapitelprojektion bestätigen: Alle vier HB/TH-GK/LK-Targetmengen einschließlich f93 bleiben exakt.121 bleibt im Datensatz für die globale Voraussetzungsprüfung, wird dort kein Target/Treechild/Buchkapitelziel. HB bekommt eine Einzelreferenz prerequisiteOnly; TH hatte sie bereits und bleibt exakt. Die ausdrücklich authored121-Sichtbarkeit wird vom bytegleichen nativen Compiler als override dokumentiert, nicht als normative Source-Abdeckung. Ohne diese Sichtbarkeit ergäbe die prerequisite-Intersection nur11 Länder. BE/BB/NI behalten ihre vorhandene NAIRU-prerequisiteOnly-Rolle.

Der ganze native App-Follower072 wird separat geliefert: nur abgeleitetes App14→16, keine neue HB/TH-Targetrolle, alle Materialien unverändert. Der Basislauf meldet nach der121-Änderung APV-201 (expliziterOverride) und APV-203 (noch alte072-App); sie werden nicht versteckt. Die follower-Datei macht den benötigten technischen Folgeentscheid konkret.

Die tatsächlichen HB/TH-Primärseiten und Rollen sind in `HB-TH-current-source-and-explicit-prerequisite-role.AUTHOR-evidence.json` begrenzt dokumentiert. HB liefert keine vollständige konkrete Tarifquelle; TH nennt echte Tarifbegriffe, aber keine komplette121-Zielpflicht. Keine neue direkte Quellmappingbehauptung wird erzeugt. Die besondere didaktische Voraussetzungssichtbarkeit ersetzt den normativen Source-/Kursgate nicht. Offizielle URLs und beobachtete Cachehashes sind erhalten; keine verpflichtenden Links auf ignorierte PDF-/tmp-Caches.

Drei whole-P-Bodies bleiben exakt: die bereits separat von Root wissenschaftlich geprüften zwei Profile/six cases sowie das aktive b84-Profil. `three-whole-P-current-scope-fingerprints.INERT-author-records.jsonl` bindet sie nativ an die eigenen aktuellen Kandidaten als reine Autorenbelege: E1/G1/ai_candidate/needs_human_review. Das ist keine neue Wissenschafts-, Source-, A/M/D-/Humanqualifikation.

Konkreter M-Folgefehler: Die aktuelle Karte economics-macro-labor-market mit Origin7c fragt nach Typen arbeitsmarktpolitischer Instrumente und liefert eine gemischte Liste. Sie prüft keine NAIRU-Schwelle; pauschales Origin-Verschieben auf121 wäre ebenfalls zu breit. Keine Karte, kein Bild, keine Registry, kein Ledger, keine Stimme und keine aktive Canondatei wurde geschrieben. Aktuelle A/M/SEM/P/D-/Bild-/Buch-/Bundlebindungen und unabhängige Material-/Scopeprüfung müssen nach dem neuen ganzen Scope erfolgen; menschliche Freigabe/Erprobung bleiben offen.

Exakte Diffs, Input-Endguards, ganze native Berichte sowie scoped Runtime-/P-/View-Schemachecks liegen bei. Requires/contains sind im ganzen überlagerten Graphen zyklusfrei. Native technische Passes sind keine fachliche Selbstfreigabe. Frühere eigene drei Siegel und die ganze originale RundeA bleiben unverändert.
'''
(OUT/'AUTHOR-HANDOFF.md').write_text(handoff)

# Seal last, never overwritten. The seal excludes only itself.
seal=OUT/'author-seal.json'
assert not seal.exists(),'Do not overwrite a stable author seal'
for p in OUT.rglob('*.json'):read(p)
for p in OUT.rglob('*.jsonl'):rows(p)
outputs=[bind(p,'own-finished-author-artifact') for p in sorted(OUT.rglob('*')) if p.is_file() and p!=seal]
write('author-seal.json',{'sealedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'role':'OWN_INERT_AUTHOR_COMPLETED_PENDING_INDEPENDENT_REVIEW','outputArtifacts':outputs,'inputEndGuards':'all-actual-input-artifacts.end-guards.json','nativeScopedChecks':'pass','runtimeSchemas':'pass','committableSymlinks':'pass','humanApproval':False,'activeWrites':0,'independentScienceScopeApproval':False,'earlierSealsUnchanged':True,'noNewCardsOrImages':True})
print(json.dumps({'seal':bind(seal),'ownFiles':len(outputs),'inputGuards':len(end),'nativeScopeChecks':'pass','runtimeSchemas':'pass','sourceCountryGates':'open','independentReview':'pending'},ensure_ascii=False))
