# SPDX-License-Identifier: Apache-2.0
"""Summarize actual final report, exact net IDs, open findings and unchanged active inputs."""
import ast,hashlib,importlib.util,json,re,sys
from pathlib import Path
sys.dont_write_bytecode=True
ROOT=Path.cwd();OWN=Path(__file__).resolve().parents[1];REL=OWN.relative_to(ROOT).as_posix()
assert not (OWN/'FILES.finite-integration.seal.json').exists()
E='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-15/'
BASE=E+'chemie-acid10-current419-paired-native-inactive-integration-root-20261015-v1'
S9=E+'chemie-source9-paired-six-contexts-prospective422-technical-root-20261015-v1'
S5=E+'chemie-source5-current422-paired-native-integration-technical-20261015-v1'
LD=E+'chemie-lab15-current419-paired-one-basic-laboratory-context-root-20261015-v1'
def read(p):return json.loads((ROOT/p).read_text())
def get(p):return json.loads((OWN/p).read_text())
def bind(p):
 b=(ROOT/p).read_bytes();return {'path':p,'sha256':'sha256:'+hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def write(p,d):(OWN/p).write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n')
finalPath=REL+'/checks/CENTRAL.current422.final-P12.stock-report.actual.json'
before=read(BASE+'/checks/CENTRAL.current419-P10-A7-D3.stock-report.actual.json')['subjects'][0]
after=read(finalPath)['subjects'][0]
assert after['denominator']==422 and after['strictComplete']==319 and not after['issues']
assert len(after['requiredChecks'])==6 and all(r['status']=='pass' for r in after['requiredChecks'])
old=set(before['strictCompleteGoalIds']);new=set(after['strictCompleteGoalIds']);assert len(old)==315
added=sorted(new-old);lost=sorted(old-new);assert not lost and len(added)==4
source3=read(S5+'/native-five/resolution-index.json')['resolutions'];sourceIDs=[r['goalId'] for r in source3 if r['goalId'] not in old]
labIDs=[r['goalId'] for r in read(LD+'/native-fifteen/resolution-index.json')['resolutions']]
assert len(sourceIDs)==3 and len(labIDs)==1 and set(added)==set(sourceIDs+labIDs)
six=[r['goalId'] for r in read(S9+'/native-nine/resolution-index.json')['resolutions']]
two=[r['goalId'] for r in source3 if r['goalId'] in old]
assert len(six)==6 and len(two)==2 and set(six+two)<=old&new
cfa='cfa5c1e4-6714-5be7-9a57-a24b201b6231';assert cfa not in old and cfa not in new
net={'role':'Actual final strict IDs compared against exact measured315; no predicted counter',
 'baseline':bind(BASE+'/checks/CENTRAL.current419-P10-A7-D3.stock-report.actual.json'),'finalReport':bind(finalPath),
 'baselineDenominator':419,'finalDenominator':422,'oldStrictCount':315,'finalStrictCount':319,
 'old315GoalIds':sorted(old),'actualFinal319GoalIds':sorted(new),'old315RetainedIds':sorted(old&new),'old315LostIds':lost,
 'actualNetAddedGoalIds':added,'netAddedScientificClosures':4,'newSourceScientificClosures':sourceIDs,'newLabScientificClosure':labIDs,
 'source9SixPriorStrictContextRenewalIds':six,'source5TwoSequencingContextRestorationIds':two,
 'contextRenewalCountWithinRetainedBaseline':8,'netAddedStrictFromRestoringBaselineBindings':0,
 'interpretation':'Three genuinely new source-goal D/P/A/M/V closures plus one genuine laboratory D/P/A closure. The six prior Source9 and two sequencing-context restorations retain baseline IDs; neither is counted as additional net scientific closure. c441 renewed P/A/M and cfa V are not new strict IDs.',
 'cfaNotBaselineOrFinalStrict':True,'newIndependentScientificVotesByIntegrator':0,'gates':after['gates'],'requiredChecks':after['requiredChecks'],
 'remaining':after['remaining'],'strictCompletionReady':after['strictCompletionReady'],'activeIntegration':False,'M7':False}
write('checks/CENTRAL.exact315-to319-net-IDs-and-context-renewals.actual.json',net)

# Preserve every actual failed attempt and show why the final technical selection differs.
first=get('checks/CENTRAL.current422.stock-report.actual.json')['subjects'][0]
messages=[m for m in first['issues'] if 'memory-review production check failed' in m]
assert len(messages)==1
ids=sorted(set(re.findall(r'\[([0-9a-f-]{36})\]',messages[0])));assert len(ids)==8
canonical=get('candidate/canonical554.prospective422.sequencing-plus-reviewed-cfa-image.exact.json');G={g['id']:g for g in canonical['goals']}
mc=get('config/M422.exact-original-nine-aggregate-visibility-scopes.repair-v2.config.json')
mr={r['goalId']:r for r in [json.loads(l) for l in (ROOT/mc['reviewPath']).read_text().splitlines() if l]}
write('OPEN.eight-observed-BW-whole-course-memory-visibility-findings.json',{
 'role':'Unresolved observed whole-course/Layer-A integration findings, no waiver and no claim of repair',
 'actualFirstReport':bind(REL+'/checks/CENTRAL.current422.stock-report.actual.json'),'actualStockMessage':messages[0],
 'viewPath':'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-14/chemie-NAT9-current419-isolated-integration-technical-20261014-v1/candidate/views/de-bw-lk.view.json',
 'rows':[{'goalId':i,'title':G[i]['title'],'wholeCurrentMemoryRecord':mr[i],
  'status':'open_whole_course_layer_A_memory_visibility','finding':'Visible goal has none of its referenced memoryGoalIds visible in the tested whole BW route.'} for i in ids],
 'count':8,'scopeExplanation':'The original Source3 M review scoped only three no_memory_needed goals. Appending its two views as universal visibility obligations to the419 aggregate was a technical scope-composition error. Returning to the exact original nine aggregate scopes fixes that error; it does not fix or waive these eight actually observed older whole-course gaps.',
 'requiredBeforeActiveWholeCourseM7':'Review and resolve these real course/Layer-A findings through a separate bounded, authorized integration; no engine change or M6-floor exception is made here.',
 'source3LocalConfigUnchanged':bind(E+'chemie-source3-six-contexts-current422-native-fresh-independent-b-20261015-v1/MV3/memory-three.config.json'),
 'originalNineAggregateScopesRetained':True,'newVotes':0,'M7':False})

protected=get('checks/PROTECTED.active-inputs.before.json');changed=[]
for r in protected['files']:
 now=bind(r['path'])
 if now!=r:changed.append({'before':r,'after':now})
assert not changed,changed
status=read('docs/qa-ci/status/curriculum-quality-status.json');subjects={r['subject']:r for r in status['curricula']}
assert all(subjects[x]['maturity']=='M7' for x in ['Mathematik','Physik','Biologie'])
chem=subjects['Chemie'];cqr=next(r for r in chem['rules'] if r['id']=='CQR-303')
assert chem['maturity']=='M6' and cqr['metrics']['strictComplete']==231 and cqr['metrics']['expectedGoals']==402
write('checks/PROTECTED.active-inputs.before-after.actual.json',{
 'pass':True,'beforeSnapshot':bind(REL+'/checks/PROTECTED.active-inputs.before.json'),'checkedFiles':len(protected['files']),
 'changedFiles':changed,'protectedSubjectMaturity':{x:subjects[x]['maturity'] for x in ['Mathematik','Physik','Biologie']},
 'activeChemistryMaturity':chem['maturity'],'activeChemistryStrict':231,'activeChemistryDenominator':402,
 'activeCqr303WholeRule':cqr,'interpretation':'Exact before/after preservation of active input files and existing status, not a fresh independent whole-subject validation.'})

for stem in ['CENTRAL.current422','CENTRAL.current422.technical-repair-v2','CENTRAL.current422.final-P12']:
 (OWN/'checks'/Path(stem+'.stdout.actual.txt')).write_bytes((OWN/'checks'/Path(stem+'.stock-report.actual.json')).read_bytes())
finalCfg=REL+'/config/central.current422.source3-lab1.final-P12.inactive.config.json'
finalMap=REL+'/checks/REBUILD.current422-final-P12.alias50-selected431.physical-map.json'
holds={'sourceWholeInventory':'All original source-duty/course/full optional-inventory holds remain open; no six-check PASS converts partial/curated routes into whole source coverage.',
 'BWMemoryVisibility':'The eight actually observed whole-course memory visibility gaps remain open as detailed separately.',
 'practical':'Existing future observable practical-performance, safety, controls and uncertainty criteria are retained. No completed human/learner/lab trial or human approval is claimed; prior trials are not a machine-M7 prerequisite.',
 'LAB':'All three E0/G0 profiles62b/e7/cfa are explicitly unselected and open. Three non_atomic and one needs_developer_review/overlap A findings remain open. cfa V passes on new PNG only; cfa A remains non_atomic and its old E0/P binding is withheld.',
 'curriculum':'No semanticKind, prerequisiteOnly, runtime, whole-course scope-reduction, M6-floor waiver, split/retirement or active adoption occurs.'}
write('HOLDS.original-source-course-inventory-and-lab-open.json',{'role':'Retained scientific/integration boundaries, no waiver','holds':holds,
 'labE0Selection':bind(REL+'/checks/P12.explicit-original-E1-selection-three-E0-open.CAS.json'),
 'BWMemoryFindings':bind(REL+'/OPEN.eight-observed-BW-whole-course-memory-visibility-findings.json'),
 'originalSealedInputBindings':bind(REL+'/INPUTS.sealed-scientific-source-bindings.json'),'newScientificVotes':0,'M7':False})
selector={'schemaVersion':1,'role':'Finite exact inactive bundled current422 technical integration, no new scientific reviewer vote',
 'wholeCanonical':bind(REL+'/candidate/canonical554.prospective422.sequencing-plus-reviewed-cfa-image.exact.json'),
 'semanticCompanion':bind(REL+'/candidate/semantic554.same-classifications.normal-address.json'),
 'normalQa':bind(REL+'/candidate/QA438.stock-generated-exact-normal-current422.repair-v2.json'),
 'centralConfig':bind(finalCfg),'physicalMap':bind(finalMap),'centralReport':bind(finalPath),
 'centralCommand':bind(REL+'/checks/CENTRAL.final-P12.command.actual.json'),
 'centralStdout':bind(REL+'/checks/CENTRAL.current422.final-P12.stdout.actual.txt'),
 'centralStderr':bind(REL+'/checks/CENTRAL.current422.final-P12.stderr.actual.txt'),
 'netActualIds':bind(REL+'/checks/CENTRAL.exact315-to319-net-IDs-and-context-renewals.actual.json'),
 'M422':bind(mc['reviewPath']),'M1MetadataOnlyCAS':bind(REL+'/CAS.M1.single-reviewId-container-identity-transport.json'),
 'holds':bind(REL+'/HOLDS.original-source-course-inventory-and-lab-open.json'),
 'protectedBeforeAfter':bind(REL+'/checks/PROTECTED.active-inputs.before-after.actual.json'),
 'sealedOriginalInputs':get('INPUTS.sealed-scientific-source-bindings.json'),
 'immutableNativeIndexInputs':[bind(p) for p in [S9+'/native-nine/resolution-index.json',S5+'/native-five/resolution-index.json',LD+'/native-fifteen/resolution-index.json']],
 'firstTwoReportsRetained':[bind(REL+'/checks/CENTRAL.current422.stock-report.actual.json'),bind(REL+'/checks/CENTRAL.current422.technical-repair-v2.stock-report.actual.json')],
 'newScientificVotes':0,'activeIntegration':False,'M7':False}
write('INPUTS.final-current422.physical-exact-selector.json',selector)
write('NEUTRAL.final-current422-source3-lab1-bounded-inactive.json',{
 'schemaVersion':1,'role':'Finite informed technical integration, inactive, no new science',
 'selector':bind(REL+'/INPUTS.final-current422.physical-exact-selector.json'),'centralConfig':selector['centralConfig'],
 'centralReport':selector['centralReport'],'physicalReconstructionMap':selector['physicalMap'],'netActualIds':selector['netActualIds'],
 'actualStrict':319,'actualDenominator':422,'actualPercentage':after['percentage'],'actualGates':after['gates'],
 'requiredChecks':after['requiredChecks'],'issues':after['issues'],'old315Retained':315,'old315Lost':0,
 'actualNetNewScientificClosures':4,'actualNetNewSource3Ids':sourceIDs,'actualNetNewLab1Ids':labIDs,
 'sixPriorSourceContextRenewals':six,'twoSequencingContextRestorations':two,'noExtraNetGainFromRestorations':True,
 'M1Transport':'Only explicitly authorized fresh c441 record.reviewId metadata alias; all scientific fields and original row bytes separately bound.',
 'cfa':'New genuine f5077a24 PNG/V accepted, old images/human state retained, cfa non_atomic and E0/P held open; no strict image gain.',
 'holds':selector['holds'],'protectedActiveInputs':selector['protectedBeforeAfter'],'activeChemistry':'M6,231/402 unchanged',
 'attemptHistory':'First actual report preserved: erroneous global application of local M views and stale3 QA asset-address fields. Second report preserved: technical repairs passed6 checks but still selected2 extra E0 profiles. Final selects exactly12 original LAB E1 profiles, leaves all3 E0 open; no engine/schema/science modification.',
 'newScientificVotes':0,'restoredStrictNetAdditions':0,'activeIntegration':False,'CQR303Passed':False,'humanApproval':False,'humanTrial':False,'finiteSealPath':REL+'/FILES.finite-integration.seal.json'})
(OWN/'RESUME.md').write_text('''# Inaktive Chemie-Gesamtintegration: tatsächlicher Stand319/422

**319/422 (75,6%), alle6 erforderlichen Stockprüfungen PASS, issues=[]; M7 bleibt offen.** Die unveränderte zentrale Engine wurde nach rein technischen Korrekturen mit dem endgültigen P12-Selektor ausgeführt. D320/P341/A349/M422/V414. Der tatsächliche Rawreport, stdout, leeres stderr, exakte Konfiguration und physische Rekonstruktionsmap sind im finalen neutralen Selektor gebunden.

Alle bisherigen315 strikten IDs bleiben erhalten,0 verloren. Netto4 echte neue wissenschaftliche Abschlüsse:3 neue Quellenziele und1 Basislaborziel416dfd33. Die6 früheren Source9-Kontexte und2 Sequenzierungskontexte1286/c441 sind bereits in diesen315 enthalten: ihre erneuerten Bindungen erhöhen den Nettozähler nicht. c441 erhält seine echte frische P/A/M-Wissenschaft; nur das freigegebene M-reviewId-Metadatum wird transparent für den Aggregatcontainer transportiert. Die übrigen418 alten M-Zeilen und3 Original-Source-M-Zeilen bleiben bytegenau erhalten. Alle sonstigen Reviewer, Zeiten, Begründungen und wissenschaftlichen Felder bleiben exakt.

Source5/Source9/LAB-D1 bleiben ganze unveränderte native Indizes mit regulären terminalen Supersessions. P/A-Überschneidungen werden durch explizite Residualkonfigurationen mit exakten übrigen Zeilen ausgeschlossen. Aus LAB werden ausschließlich die12 originalen E1-Keep-Zeilen ausgewählt;62b/e7/cfa bleiben E0/G0 offen.3 non_atomic und1 needs_developer_review bleiben offen. Das neue cfa-PNG hat echte V-Evidenz; cfa bleibt nicht atomar und ohne aktuelles P, somit kein Bild-bedingter Strict-Gewinn. Historische JPGs/PNG-V1/Human-Felder bleiben getrennt erhalten.

Der erste Fehlversuch und der zweite technische Zwischenversuch bleiben vollständig erhalten. Die endgültige Konfiguration bewahrt die ursprünglichen9 M-Aggregatsichten. Die im ersten Lauf tatsächlich sichtbaren8 älteren BW-Memory-Sichtlücken bleiben ausdrücklich offene Gesamt-Kurs-/Layer-A-Befunde, keine gelösten Probleme oder Waiver. Die ursprünglichen Source3-M-Sichten gelten lokal nur für3 Ziele. Alle übrigen Source-/Kurs-/Originalinventar- und praktischen Leistungsgrenzen bleiben offen; sechs Stock-PASS erteilen keine Vollquellen- oder Gesamt-Kursfreigabe.

Neuer privater Sparsehost mit28 unveränderten physischen Stockmodulen,50 physischen Normalaliasen und431 ausgewählten Bildern;10 physische Public-Bilddateien, kein voller Public-/Backend-/Repositorybaum. Der eingefrorene315-QA-Discovery-Eingang wird ausdrücklich privat reproduziert; reale historische Reviews bleiben erhalten. Der normale QA-Generator ändert ausschließlich3 Quellbildpfad-Adressen sowie Sortierung/Serialisierung, keine wissenschaftlichen Recordwerte.

Geschützte aktive Mathematik/Physik/Biologie-M7-Eingänge und Statusdatei sind vor/nachher bytegleich. Aktive Chemie bleibt M6 mit231/402. Keine neuen Voten durch den Integrator, keine aktiven Änderungen, kein Git/Push/CI/Runtime- oder Fullbuild. Eigenes Review-/Handoffmaterial CC-BY-4.0, technische Skripte Apache-2.0. Nach dem endlichen Siegel STOP. Root übernimmt Inventur/Checkpoint und den getrennten weiteren Freigabeweg.
''')

# Normal finite serialization/Python syntax and repository portability before sealing.
jsons=[];jsonl=[];python=[]
for p in sorted(OWN.rglob('*')):
 if not p.is_file():continue
 if p.suffix=='.json':
  b=p.read_bytes();assert b.endswith(b'\n'),p;json.loads(b);jsons.append(p.relative_to(ROOT).as_posix())
 elif p.suffix=='.jsonl':
  b=p.read_bytes();assert not b or b.endswith(b'\n'),p
  for line in b.splitlines():json.loads(line)
  jsonl.append({'path':p.relative_to(ROOT).as_posix(),'rows':len(b.splitlines())})
 elif p.suffix=='.py':ast.parse(p.read_text(),filename=str(p));python.append(p.relative_to(ROOT).as_posix())
spec=importlib.util.spec_from_file_location('skillpilot_normal_validator',ROOT/'scripts/validate_schemas.py');mod=importlib.util.module_from_spec(spec);spec.loader.exec_module(mod)
links=mod.curriculum_symlink_errors(ROOT);assert not links,links
write('checks/FINAL.normal-JSON-JSONL-PythonAST-and-portability.actual.json',{
 'pass':True,'normalHelper':bind('scripts/validate_schemas.py'),'function':'curriculum_symlink_errors','symlinkErrors':links,
 'normalHelperInternallyUsesReadOnlyGitFileDiscovery':True,'wholeJsonFilesParsed':jsons,'wholeJsonlFilesParsed':jsonl,'pythonASTParsed':python,
 'actualTerminalNewlines':True,'newScientificVotes':0,'activeIntegration':False,'M7':False})
json.loads((OWN/'checks/FINAL.normal-JSON-JSONL-PythonAST-and-portability.actual.json').read_text())
print(json.dumps({'strict':319,'denominator':422,'old315Retained':315,'lost':0,'netScience4':added,'contextRenewals6plus2':True,'eightBWMemoryHoldsOpen':8,'protectedFilesUnchanged':len(protected['files']),'normalSymlinkErrors':len(links),'newVotes':0}))
