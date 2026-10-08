# SPDX-License-Identifier: Apache-2.0
"""Seal own substantive four-profile science review, without active integration."""
from pathlib import Path
from datetime import datetime,timezone
import hashlib,json,subprocess

ROOT=Path.cwd();OWN=Path(__file__).resolve().parent
BASE=ROOT/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08'
AUTHOR=BASE/'biologie-he9-nineteen-targeted-alternatives-and-materials-author-root-v2'
BEFORE=BASE/'biologie-he9-nineteen-current391-science-author-root-v1'
ORDINALS=[1,2,4,7]
now=lambda:datetime.now(timezone.utc).isoformat()
read=lambda p:json.loads(p.read_text())
rel=lambda p:str(p.relative_to(ROOT))
hashfile=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
bind=lambda p:{'path':rel(p),'sha256':hashfile(p),'bytes':p.stat().st_size}
def write(p,obj):
    p.parent.mkdir(parents=True,exist_ok=True)
    with p.open('x') as f:f.write(json.dumps(obj,ensure_ascii=False,indent=2)+'\n')
def copy(p,name):
    dest=OWN/'exact-inputs'/name;dest.parent.mkdir(parents=True,exist_ok=True)
    with dest.open('xb') as f:f.write(p.read_bytes())
    return dest

seal_path=AUTHOR/'targeted-OR-materials-and-whole42-author-input.first.freeze.json'
assert hashfile(seal_path)=='acde2680025a779d3b1800f978c1430893ac92538d35233a8916d07d9d372d6d'
seal=read(seal_path);assert len(seal['frozenFiles'])==25
for r in seal['frozenFiles']:
    p=ROOT/r['path'];assert hashfile(p)==r['sha256'];assert p.stat().st_size==r['bytes']
entry_path=AUTHOR/'neutral-targeted-four-profile-and-materials-science-review.entry.json';entry=read(entry_path)
for field in ['current19GoalBodies','operativeCandidates','operativeConfig','operativeNativeP19','whole19cases42']:
    r=entry[field];p=ROOT/r['path'];assert hashfile(p)==r['sha256'] and p.stat().st_size==r['bytes']
entry_snapshot=copy(entry_path,'neutral-operative-entry.exact.json')
author_seal_snapshot=copy(seal_path,'author-input-first-freeze.exact.json')
whole_goals=read(ROOT/entry['current19GoalBodies']['path'])['goals']
new_profiles=read(ROOT/entry['operativeCandidates']['path'])['goals']
old_profiles=read(BEFORE/'P19.current-text-preimage.author.candidates.json')['goals']
new_cases=read(ROOT/entry['whole19cases42']['path'])['goals']
old_cases=read(BEFORE/'nineteen-whole-goals-thirty-eight-complete-DEEN-cases.author.json')['goals']
changed=[i+1 for i,(a,b) in enumerate(zip(old_profiles,new_profiles)) if a['profile']!=b['profile']]
assert changed==ORDINALS
old_by_case={c['id']:c for g in old_cases for c in g['cases']}
new_by_case={c['id']:c for g in new_cases for c in g['cases']}
assert [cid for cid in old_by_case if old_by_case[cid]!=new_by_case[cid]]==['he9-19-04-case-2','he9-19-07-case-2']
assert len(new_by_case)==42 and sum(old_by_case[cid]==new_by_case[cid] for cid in old_by_case)==36
current_path=ROOT/'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json'
current_snapshot=copy(current_path,'canonical-current-observation.exact.json')
current_by={g['id']:g for g in read(current_snapshot)['goals']}
assert all(g==current_by[g['id']] for g in whole_goals)
source_path=ROOT/'curricula/DE/Gymnasium/input/HE/lower-secondary/source-extraction/DE_HE_BIOLOGIE_SEKI_G9.source-extraction.json'
source_snapshot=copy(source_path,'HE-G9-source-extraction.exact.json')
source_by={g['id']:g for g in read(source_snapshot)['sourceGoals']}
target_ids=[whole_goals[i-1]['id'] for i in ORDINALS]
for i in ORDINALS:
    g=whole_goals[i-1];origin=source_by[g['extendedData']['provenance']['sourceGoalId']]
    assert g['description']==origin['description'] and g['sourceRef']==origin['sourceRef']
    for brief,case in zip(new_profiles[i-1]['profile']['applicationCaseBriefs'],new_cases[i-1]['cases']):
        assert brief['id']==case['id']
        for lang,suffix in [('de','De'),('en','En')]:
            assert brief['taskDemand'+suffix]==case['material'][lang]+' '+case['task'][lang]
            assert brief['expectedPerformance'+suffix]==case['modelAnswer'][lang]
write(OWN/'four-whole-DEEN-goals-profiles-and-twelve-cases.exact-input.json',{
    'artifactKind':'independent-A-exact-four-current-whole-goal-profile-case-input','goalRows':[whole_goals[i-1] for i in ORDINALS],
    'profileRows':[new_profiles[i-1] for i in ORDINALS],'completeCaseGroups':[new_cases[i-1] for i in ORDINALS],
    'sourceGoalRows':[source_by[whole_goals[i-1]['extendedData']['provenance']['sourceGoalId']] for i in ORDINALS],
    'sourceExtractionIsPrimaryVerbatimText':False,'originalWholePrimarySeparatelyActuallyRead':True,'humanApproval':False})
write(OWN/'actual-exact-operating-input-and-targeted-delta.binding.receipt.json',{
    'recordedAt':now(),'authorSeal':bind(author_seal_snapshot),'actual25AuthorBindingsVerified':25,'entry':bind(entry_snapshot),
    'currentGoalObservation':bind(current_snapshot),'whole19GoalBodiesExactCurrent':19,'changedProfileOrdinals':changed,
    'other15WholeProfilesExactRetained':15,'old36CaseBodiesExactRetained':36,'oldCasesChanged':['he9-19-04-case-2','he9-19-07-case-2'],
    'newConditionalEarWholeCases':4,'actualWholeCasesReadInThisReview':12,'noSciencePassInferredFromHash':True,
    'firstFailedNativeInputsPreservedAsHistory':True,'operativeSourcePaths':{k:entry[k] for k in ['operativeCandidates','operativeConfig','operativeNativeP19']},
    'peerBRead':False,'activeWrites':0,'strictGainClaimed':0,'humanApproval':False})

local=Path('/tmp/he9-independent-a-primary-angh7cme')
assert hashfile(local/'g9-biologie.pdf')=='93257f9be96e9bd288d187eb63e3e33ca28debdb2511dcd068e9abf82bc5b5f1'
assert hashfile(local/'full-local-only.txt')=='a5257875958dbe480de5f5a2864187142dd069c36a38e80b214f50f786a4a422'
write(OWN/'actual-whole-primary-and-support-reading.independent-a.receipt.json',{
    'schemaVersion':1,'artifactKind':'genuine-independent-A-targeted-whole-primary-reading','recordedAt':now(),
    'officialCurriculumUrl':'https://kultus.hessen.de/sites/kultus.hessen.de/files/2021-06/g9-biologie.pdf',
    'actualDownloadedPrimarySha256':hashfile(local/'g9-biologie.pdf'),'actualLayoutExtractionSha256':hashfile(local/'full-local-only.txt'),
    'wholeSectionsActuallyRead':['9.1 physical23–24 / printed22–23, including rationale, compulsory left column, recommended right column, optional content and methods','9.2 physical25 / printed24, entire section including function/cascade/immunity and model simplification methods'],
    'ownSourceScopeReading':'The HE sensory section explicitly chooses eye OR ear. Shared receptor/processing and model-method reasoning do not require both whole anatomy pathways. The blood section treats oxygen carriage, clotting and immune function as cooperating constituents, with simple cascade/model reasoning. Adjacent duties and facultative detailed models are not inferred as new universal obligations.',
    'normalizedFourSourceRowsActuallyRead':bind(source_snapshot),
    'supportPagesActuallyRead':[
        {'url':'https://www.nidcd.nih.gov/health/how-do-we-hear','authority':'NIH/NIDCD','ownReading':'Read the whole main six-step explanation. Mechanical air/eardrum/ossicle/cochlear-fluid transmission is distinguished from hair-cell transduction and nerve/brain processing; it supports the two conditional authored function models, not curriculum scope.'},
        {'url':'https://www.nhlbi.nih.gov/health/blood-tests','authority':'NIH/NHLBI','ownReading':'Read CBC functional explanations and clotting-test protein explanation. Hemoglobin-bearing red cells carry oxygen, white cells contribute immune defence and platelets/clotting proteins have distinct contributions. Clinical ranges are not reused in tasks.'},
        {'url':'https://www.nhlbi.nih.gov/health/clotting-disorders/how-blood-clots','authority':'NIH/NHLBI','ownReading':'Read the complete main clotting sequence. Platelet plugging and protein/fibrin mesh stabilization are distinct steps; selected qualitative removal models do not become clinical advice.'}],
    'supportLookupHistory':'One guessed NHLBI blood-clotting-disorders URL returned404; followed actual official link to clotting-disorders and then How Does Blood Clot, successfully read. No failed lookup used as evidence.',
    'rawPrimaryAndFullExtractionLocalOnly':True,'rawSourceTextsCopiedToOwnDossier':False,'thirdPartyRightsUnchanged':True,
    'sourceRefOrApplicabilityIsAllCountrySourceProof':False,'realLearnerEvidence':False,'humanApproval':False,'activeWrites':0})

substantive={
1: 'Der gemeinsame Pflichtkern verlangt eine wirkliche räumliche Modell-/Organ-Zuordnung, keine triviale Wahläußerung. Die Alternative besteht aus genau einem ganzen Augen- oder Ohrweg, dessen Erwartung beide Fälle nennt; gemischte halbe Wege ersetzen keine volle Organleistung. Zwei Augenfälle bleiben exakt erhalten: räumlicher Aufbau und Korrektur der Iris/Netzhaut/Pupille-Misszuordnung. Zwei neue vollständige konditionale Ohrfälle unterscheiden Außenohr, Trommelfell-Grenze, Mittelohrknöchelchen, Innenohrschnecke/Hörnerv und Gleichgewichts-Bogengänge; der zweite Fall korrigiert reale räumliche Verwechslungen in gedrehter Darstellung. Beide Sprachen haben dieselben Aufträge/Antworten. Kein Pflichttest beider Organwege und kein extra Auswahltest.',
2: 'Der gemeinsame Pflichtkern unterscheidet Reizweg, Rezeptorumwandlung und neuronale Verarbeitung; er wird in zwei Fällen desselben vollständigen gewählten Wegs gezeigt. Augenfälle bleiben ganz erhalten: Brechung/umgekehrtes Netzhautbild, Iris-Lichteinfall, Rezeptoren, Akkommodation und Grenzen des inneren Schirmbilds. Neue komplette konditionale Ohrfälle erklären mechanische Übertragung versus elektrische Signale und übertragen das auf getrennte Ausfälle vor der Schnecke bzw. der Haarzellumwandlung. NIDCD-Kette tatsächlich geprüft. Das Funktionsmodell behauptet keine Diagnose; vorhandene Schwingung beweist allein kein vollständiges Hören. Quelle behält Auge ODER Ohr und Empfehlungen/Facultativa werden nicht zu zusätzlichen Universalpflichten.',
4: 'Beide ganzen Fälle und das ganze Profil passen zum organismenvergleichenden Modellziel. Das UV-Fenstermodell grenzt Bienenart, Modellwerte und künstliche menschliche Farbmarkierung von subjektivem Erleben ab. Im korrigierten Hörmaterial ist genau der äußere Schalldruckpegel gleich, ausdrücklich nicht subjektive Lautheit. Frequenzfenster liefern im vorgegebenen qualitativen Modell eine mögliche unterschiedliche Detektierbarkeit; keine beobachtete individuelle Hörleistung, Schwellenmessung oder allgemein bessere Wahrnehmung wird bewiesen. Beide DE/EN-Material-/Auftrags-/Antwortketten und operative Variation/Fokusfelder sind gleichbedeutend. Der Cross-Modal-Transfer mit vorgegebenen Fenstern verlangt keine vollständige Pflichtanatomie beider source-alternativer Sinnesorgane.',
7: 'Beide ganzen Fälle und das ganze Profil erklären zusammenwirkende Zell-/Plasmafunktionen. Der normale Modellfall trennt Hämoglobintransport, Thrombozytenverschluss/Fibrinnetz und Leukozyten/gelöste Immunfaktoren. Im zweiten Fall nennt A jetzt ausdrücklich fehlende Leukozyten sowie fehlende Thrombozyten/funktionsfähige Gerinnungsproteine; die Antwort zur unvollständigen zellulären Abwehr ist deshalb vom Material gedeckt. B fehlen Erythrozyten: gelöstes Plasma ersetzt deren Sauerstoffkapazität nicht, ohne absolut jede gelöste Sauerstoffmenge zu leugnen. Aussagen bleiben qualitativ, nicht experimentell oder klinisch. Gleiche DE/EN-Leistung, sachhaltiger Normal-/Komponentenentzug-Transfer; ganze Grundfunktionen des aktuellen Texts bleiben erhalten.'}
records=[]
for i in ORDINALS:
    g=whole_goals[i-1];p=new_profiles[i-1]
    records.append({'goalId':g['id'],'ordinal':i,'currentTitleDe':g['title'],'currentTitleEn':g['titleEn'],
        'wholeCurrentDescriptionDe':g['description'],'wholeCurrentDescriptionEn':g['descriptionEn'],
        'wholePProfileScienceVerdict':'PASS_scoped_E1_G1_candidate','sourceScopeVerdict':'PASS_bounded_HE_common_goal_scope',
        'substantiveActualReviewDe':substantive[i],'wholeCaseIdsActuallyRead':[c['id'] for c in new_cases[i-1]['cases']],
        'wholeBilingualProfileActuallyRead':True,'wholeBilingualMaterialTaskModelAnswerAndFocusActuallyRead':True,
        'openFindings':[],'PStatus':'needs_human_review','reviewAuthority':'ai_candidate','evidenceLevel':'E1','maximumClaimScope':'G1',
        'finalDescriptionAndActualImageNativePageReviewPending':True,'humanApproval':False})
write(OWN/'first-four-whole-profile-and-twelve-case-science.independent-a.verdicts.json',{
    'schemaVersion':1,'artifactKind':'independent-A-targeted-HE9-four-profile-first-science-verdict','recordedAt':now(),
    'operativeAuthorInputFreeze':bind(author_seal_snapshot),'records':records,'changedProfilesActuallyPassed':4,'wholeCasesActuallyRead':12,
    'unchanged15ProfilesNotRestartedOrNewlyApproved':True,'whole19CompletionClaim':False,
    'retainedOpenAtomicityHold':{'ordinal':12,'goalId':'3ee4b55c-81c3-5826-9d26-1a8c22cbd0b8','decision':'SPLIT_REVIEW','why':'Contraception assessment and responsible-parenthood reflection remain separately acquireable duties. No scope-removing split or whole goal completion is approved by this targeted four-profile review.'},
    'otherSourceWideDAndActualVPending':True,'peerBReadBeforeFirstVerdict':False,'noScientificPassFromHashesOrAuthorLabels':True,
    'newStrictCompletions':0,'activeWrites':0,'humanApproval':False})

config=read(ROOT/entry['operativeConfig']['path'])
semantic_snapshot=copy(ROOT/config['semanticKindLedgerPath'],'semantic-kinds-current-observation.exact.json')
source_lines=(ROOT/entry['operativeNativeP19']['path']).read_text().splitlines()
selected=[line for line in source_lines if json.loads(line)['goalId'] in target_ids]
assert len(selected)==4
native_input=OWN/'P4.exact-operative-input.independent-a.review.jsonl'
with native_input.open('x') as f:f.write('\n'.join(selected)+'\n')
config['landscapePath']=rel(current_snapshot);config['semanticKindLedgerPath']=rel(semantic_snapshot);config['reviewPath']=rel(native_input)
config['scope']={'label':'Independent A technical current four-profile check; genuine separate science verdict, final D/V still pending','goalIds':target_ids}
config_path=OWN/'P4.exact-operative-input.independent-a.config.json';write(config_path,config)
argv=['app/node_modules/.bin/tsx','app/scripts/positiveGoalEvidenceReview.ts','--mode=check','--config='+rel(config_path)]
result=subprocess.run(argv,cwd=ROOT,capture_output=True,text=True)
for name,content in [('P4-nativecheck.stdout.actual.txt',result.stdout),('P4-nativecheck.stderr.actual.txt',result.stderr)]:
    with (OWN/name).open('x') as f:f.write(content)
write(OWN/'P4-nativecheck.terminal.independent-a.actual.json',{'argv':argv,'exitCode':result.returncode,'recordedAt':now(),
    'schemaAndFingerprintCheckIsScientificOrVisualApproval':False,'actualFourWholeProfileScienceReceipt':'first-four-whole-profile-and-twelve-case-science.independent-a.verdicts.json',
    'finalDAndActualVPending':True,'needsHumanReview':4,'approved':0,'humanApproval':False,'activeWrites':0})
assert result.returncode==0,result.stdout+result.stderr
with (OWN/'FIRST-TARGETED-SCIENCE-REVIEW.md').open('x') as f:
    f.write('# HE9 V2: unabhängiger gezielter Science-Review A\n\nVier ganze aktuelle Profile Ord1/2/4/7 und zwölf vollständige DE/EN-Fälle wurden tatsächlich gelesen; begrenzte fachliche Kandidatenprüfung PASS. Die Originalquelle HE9.1/9.2 wurde vollständig gelesen, Hör- und Blutfunktionskerne zusätzlich an NIH/NIDCD/NHLBI geprüft. Profile und konkrete Antworten wurden inhaltlich beurteilt, nicht aus Hashgleichheit oder Autorenetiketten freigegeben.\n\nEigener nativer P4-Check: Exit0, vier needs_human_review, null approved. Die vier alten Augenfälle sind unverändert; vier neue Ohrfälle sind ausdrücklich alternative Wege, kein gemeinsamer Pflichtumfang. Schalldruck/Lautheit und fehlende Leukozyten sind fachlich passend korrigiert.\n\nUnveränderte15 Profile werden nicht erneut fachlich geprüft. Ziel12 Verhütung/Elternschaft bleibt SPLIT_REVIEW. Finale D-/Bild-/360-/680-/native Seitenprüfungen fehlen noch; keine ganze19-Abschlussbehauptung, keine aktive Integration, kein strenger Nettozuwachs und keine menschliche Freigabe oder Erprobung. Kein Peer-B-Review vor diesem eigenen Ersturteil gelesen.\n')
files=[p for p in sorted(OWN.rglob('*')) if p.is_file()]
final=OWN/'first-four-science-and-native-P4.independent-a.exact.freeze.json'
write(final,{'schemaVersion':1,'artifactKind':'independent-A-HE9-targeted-four-whole-science-first-exact-input-output-freeze','recordedAt':now(),
    'authorInputFreeze':bind(author_seal_snapshot),'verifiedActualAuthorFiles':25,'frozenFiles':[bind(p) for p in files],
    'fourWholeProfileScopedSciencePASS':4,'wholeCasesActuallyRead':12,'actualNativeP4ExitCode':result.returncode,
    'openFindingsInFourChangedProfiles':[],'retainedGoal12SplitReviewOpen':True,'unchanged15ProfilesNotReReviewed':True,
    'peerBReadBeforeFirstSeal':False,'finalDAndActualVPending':True,'whole19StrictCompletionClaim':False,'strictGainClaimed':0,'activeWrites':0,'humanApproval':False})
for r in read(final)['frozenFiles']:
    p=ROOT/r['path'];assert hashfile(p)==r['sha256'] and p.stat().st_size==r['bytes']
print(json.dumps({'firstSeal':bind(final),'files':len(files),'nativeP4ExitCode':result.returncode,'scopedFourScience':'PASS','strictGain':0},indent=2))
