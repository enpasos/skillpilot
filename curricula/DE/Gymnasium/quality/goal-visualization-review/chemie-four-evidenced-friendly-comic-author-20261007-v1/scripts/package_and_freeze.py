"""Package only this inert author folder; never import or approve an asset."""
from pathlib import Path
import hashlib, json, shutil, subprocess, struct
from datetime import datetime, timezone

ROOT = Path('/home/enpasos/projects/skillpilot')
BASE = Path(__file__).resolve().parent.parent
V2 = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-07/chemie-next17-targeted-description-routing-context-author-v2-20261007'
C441 = ROOT / 'curricula/DE/Gymnasium/quality/goal-visualization-review/chemie-c441-gasfoermige-caption-targeted-author-20261007-v1'
CANON = ROOT / 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'
QA = ROOT / 'curricula/DE/Gymnasium/quality/goal-visualization-qa/chemie.qa.json'
SELECTED = {
 '0bf26276-2780-506c-ac34-35dd44a29409': ('candidates/0bf26276-2780-506c-ac34-35dd44a29409/0bf26276-2780-506c-ac34-35dd44a29409.png', 1),
 'a44af1fa-5988-5b7d-b206-691c6bbf7dd4': ('candidates/a44af1fa-5988-5b7d-b206-691c6bbf7dd4/attempt-2/a44af1fa-5988-5b7d-b206-691c6bbf7dd4.png', 2),
 '9751b6d8-cde3-527b-b37c-babb6cee79d2': ('candidates/9751b6d8-cde3-527b-b37c-babb6cee79d2/attempt-3/9751b6d8-cde3-527b-b37c-babb6cee79d2.png', 3),
 'c441d9e8-d9d9-5e55-a189-a37345541321': ('candidates/c441d9e8-d9d9-5e55-a189-a37345541321/attempt-4/c441d9e8-d9d9-5e55-a189-a37345541321.png', 4),
}
NOTES = {
 '0bf26276': {'provenFault': 'The old lemon pH2 callout points to scale3.', 'actualSelectedObservation': 'Scale0–14; lemon arrow terminates at2, water at7, soap at10. Acidic/neutral/alkaline cards and tooth/fish/gloves motifs are visible at360/680.', 'scopeLimit': 'Illustrative everyday values, not universal values for every product or a quantitative environmental model.'},
 'a44af1fa': {'provenFault': 'Old image places sodium/potassium flame colours on aqueous indicator-style beakers.', 'actualSelectedObservation': 'Na+/K+/Cu2+ flame-test colours are attached to burner flames. One large Cl−→whiteAgCl precipitation exemplar is labelled HNO3 dann AgNO3. ReinsalzNa+:Cl−=1:1→NaCl and Gemisch: Ionen≠Salzpaare preserve the inference boundary.', 'scopeLimit': 'Selected qualitative examples; the image is not a complete laboratory protocol or the entire performance material.', 'revisionBasis': 'Root supplied its own attempt1 V-A finding: central labels too small at360; only this column was simplified in attempt2. No current peer V-B judgments were read.'},
 '9751b6d8': {'provenFault': 'Old generic HA/B cartoon asserts that OH− increases A− although the shown conjugate species is HB+.', 'actualSelectedObservation': 'Uses the actual supplied ammonia/ammonium material pair. NH3+H2O⇌NH4++OH−; acid addition converts NH3+H3O+→NH4++H2O; base addition NH4++OH−→NH3+H2O. Selected nitrogen symbols left6NH4+/2NH3, right6NH3/2NH4. No central treatment-direction arrows.', 'scopeLimit': 'Selected nitrogen particles only, not complete solution/counterion inventory or measured equilibrium ratios. No exact end-pH is asserted. Uses the sealed v2 reversible-transfer goal, not the old active wording.'},
 'c441d9e8': {'provenFault': 'Old Gasuförmige typo and small required phase/energy labels at360; historical word-only f5af is not a current approved candidate.', 'actualSelectedObservation': 'Gasförmige correctly spelled; Na(s)+½Cl2(g), Na+(g)2|8 and Cl−(g)2|8|8, ionic NaCl(s) lattice. Gas-ion level highest; solid lowest with clear net drop. Preparation arrow rises from the initial level and lattice arrow drops to the final level. Required short labels are visible at360/680.', 'scopeLimit': 'A schematic thermodynamic cycle, not actual isolated laboratory intermediates, a kinetic activation barrier or an accurately scaled numerical energy chart. NaCl is the depicted example; unchanged profile retains separate MgO transfer material.'},
}

def read(p): return json.loads(p.read_text())
def write(p, obj):
 p.parent.mkdir(parents=True, exist_ok=True)
 p.write_text(json.dumps(obj, ensure_ascii=False, indent=2)+'\n')
def pin(p):
 data=p.read_bytes()
 return {'path': str(p.relative_to(ROOT)), 'sha256': hashlib.sha256(data).hexdigest(), 'bytes': len(data)}

if (BASE/'final-own-files-and-reused-inputs.freeze.json').exists():
 raise SystemExit('This author package is sealed; create a fresh version for any edits.')

shutil.copy2(CANON, BASE/'inputs/current-canonical.whole.snapshot.json')
assert QA.read_bytes() == (BASE/'inputs/current-chemie.qa.snapshot.json').read_bytes()
active=read(CANON); goals={x['id']:x for x in active['goals']}
whole=read(BASE/'inputs/whole-four-current-and-science-candidate-goals.json')['goals']
for item in whole:
 assert item['wholeActiveGoal'] == goals[item['goalId']]
 assert not item['wholeActiveGoal'].get('resourceLinks')

profiles=read(V2/'candidate/positive-evidence17.author-candidate-set.json')['goals']
material=read(V2/'candidate/complete34-bilingual-material-cases.author.json')['cases']
old_record=read(C441/'current-c441-whole-positive-record.exact-original-line.jsonl')
shutil.copy2(C441/'current-c441-whole-positive-record.exact-original-line.jsonl', BASE/'inputs/c441-existing-positive-record.exact-original-line.jsonl')
raw=read(C441/'one-whole-current-goal-profile-context-caption-original-raster-inert-native-routing.author.raw.json')
items=[]; selected=[]
for item in whole:
 gid=item['goalId']; candidate=item['wholeScienceCandidateGoal']
 if gid.startswith('c441'):
  profile=old_record['profile']
  cases=[{'goalId':gid, 'caseId':c['id'], 'suppliedMaterialAndTaskDemand': {'de':c['taskDemandDe'],'en':c['taskDemandEn']}, 'expectedPerformance': {'de':c['expectedPerformanceDe'],'en':c['expectedPerformanceEn']}, 'specificBoundaryOrCounterexample': {'de':c['understandingFocusDe'],'en':c['understandingFocusEn']}, 'referenceResponseNature':'Existing supplied author model answer; no learner performance'} for c in profile['applicationCaseBriefs']]
  science_basis=pin(C441/'current-c441-whole-positive-record.exact-original-line.jsonl')
 else:
  spec=next(x for x in profiles if x['goalId']==gid)
  profile=spec['profile'];cases=[c for c in material if c['goalId']==gid]
  science_basis=pin(V2/'candidate/positive-evidence17.author-candidate-set.json')
 rel,attempt=SELECTED[gid]; asset=BASE/rel
 w,h=struct.unpack('>II',asset.read_bytes()[16:24]);assert(w,h)==(1672,941)
 stem=str(Path(rel).with_suffix('')).replace('/','-')
 route={'goalId':gid,'selectedAttempt':attempt,'asset':pin(asset),'pngDimensions':{'width':w,'height':h},'actualScreens': [pin(BASE/'browser'/f'{stem}.{width}.png') for width in (360,680)], 'actualDisplayReceipt':pin(BASE/'receipts'/f'{stem}.display.receipt.json'), 'prospectiveUrl':f'https://skillpilot.com/assets/goal-visualizations/chemie/{gid}/{gid}.png','provider':'OpenAI / ChatGPT-Codex built-in image_gen','actualModelVersion':None,'license':'CC-BY-4.0','approval':'candidate_pending_separate_independent_review','activeImport':False}
 selected.append(route)
 item={**item, 'wholeUnchangedScientificProfile':profile,'wholeUnchangedMaterialCases':cases,'profileReuseBasis':science_basis,'nativeDReuseBasis':pin(V2/'native-d-seventeen/bundle/review-input.json') if not gid.startswith('c441') else raw['wholeActualCurrentNativePageHistoricalForOldAsset'],'wholeDirectPrerequisites':[goals[x] for x in candidate.get('requires',[]) if x in goals],'wholeContainingGoals':[x for x in active['goals'] if gid in x.get('contains',[])],'wholeReversePrerequisites':[x for x in active['goals'] if gid in x.get('requires',[])],'selectedAsset':route,'authorObservation':NOTES[gid[:8]],'reviewAuthority':'ai_candidate','status':'needs_human_review','evidenceLevel':'E1','maximumClaimScope':'G1','humanApproval':False,'humanTrial':False,'independentApproval':False,'strictNetGain':0}
 items.append(item)
write(BASE/'candidate-four-whole-goals-profiles-material-context-and-assets.author.json', {'role':'AUTHOR asset correction and exact science reuse; no independent judgment','strictNetGain':0,'goals':items})
write(BASE/'selected-four-assets-and-prospective-routing.author.json', {'role':'AUTHOR inert routing proposal','selectedAssets':selected,'activeCanonWrites':False,'activeQARegistryWrites':False,'sourceHoldsPreserved':read(BASE/'inputs/preserved-holds.author.json'),'historicalProofsDoNotBindNewPNGs':True,'currentNativeDAndPRebinding':'Separate subsequent native technical package required; no claim that old pages already bind these new images.'})
external=[CANON,QA,V2/'final-own-files.freeze.json',V2/'candidate/positive-evidence17.author-candidate-set.json',V2/'candidate/complete34-bilingual-material-cases.author.json',V2/'candidate/canonical.whole-current-plus-targeted-corrections.json',V2/'candidate/full378-context.view.json',V2/'native-d-seventeen/bundle/review-input.json',V2/'native-d-seventeen/bundle/book-model.json',V2/'native-d-seventeen/bundle/book.pdf',C441/'current-c441-whole-positive-record.exact-original-line.jsonl',C441/'one-whole-current-goal-profile-context-caption-original-raster-inert-native-routing.author.raw.json']
guards=[pin(x) for x in external]
diff=subprocess.check_output(['git','diff','--name-only','--',str(CANON.relative_to(ROOT)),str(QA.relative_to(ROOT))],cwd=ROOT,text=True)
assert not diff.strip()
write(BASE/'receipts/author-asset-and-preserved-input-integrity.check.json',{'role':'Bounded author integrity/layout checks only','selectedCount':4,'dimensionsAll1672x941':True,'unchangedScientificProfiles':True,'currentFourGoalObjectsExact':True,'activeChemistryCanonicalAndQAComparedToHEADHaveNoDiff':True,'activeFourResourceLinksStillEmpty':True,'humanApproval':False,'strictNetGain':0,'externalInputs':guards})
rows=['# Vier belegte Chemie-Bildfehler – Autorenkandidaten','', '**AUTHOR; inert; ai_candidate / needs_human_review; E1/G1; strict gain0.**','', 'Die vier ausgewählten PNGs korrigieren nur die belegten Bildfehler. Ganze aktuelle Ziele, die versiegelte975-v2-Fassung, unveränderte Fachprofile, vollständige DE/EN-Aufgaben, Modellantworten, Grenzen und Kontext stehen in `candidate-four-whole-goals-profiles-material-context-and-assets.author.json`. Die Beobachtungen darin stammen vom Autor und sind keine unabhängige V/D/P-Freigabe.','', '| Ziel | Ausgewählte PNG-Route | SHA256 |','| --- | --- | --- |']
for row in selected: rows.append(f"| {row['goalId'][:8]} | [{row['asset']['path'].split(str(BASE.relative_to(ROOT))+'/')[1]}]({row['asset']['path'].split(str(BASE.relative_to(ROOT))+'/')[1]}) | `{row['asset']['sha256']}` |")
rows += ['', '## Tatsächliche Erzeugung und Ansicht','', 'OpenAI/ChatGPT-Codex `image_gen` erzeugte bzw. änderte die Raster direkt aus den eingefrorenen Vorlagen. Prompts und tatsächliche Toolzeiten/Referenzrouten liegen in `prompts/` und `receipts/`. Der Toolaufruf nennt keine konkrete Modellversion; sie bleibt ausdrücklich unbekannt. Opaque PNGs sind1672×941, nahe16:9. Keine programmgesteuerte Bildbearbeitung wurde verwendet. Browseransichten verwenden die bestehende GoalCard-Bildbegrenzung448px mit object-fit:contain, DPR1, tatsächliche Breiten360/680. Alle vier ausgewählten Vollbilder und beide Breiten wurden angesehen; Originals/Archivbilder und Fehlversuche bleiben erhalten.','', 'Alle10 neuen Erzeugungsversuche sind archiviert. Ausgewählt sind pH1, Ionen2, Protonentransfer3, Gitterenergie4. Die nicht ausgewählten Versuche schließen keine Gates. Der historische c441-Wortkandidat f5af wird ausdrücklich nicht als freigegeben übernommen. Das ursprüngliche Gemisch-/Salzpaar-Limit bleibt erhalten. Die Ammoniak-Teilchen sind nur eine Auswahl relevanter Spezies; das Energiediagramm ist ein thermodynamischer Modellweg, keine Kinetik.','', '## Native Vorbereitung und Grenzen','', 'Die unveränderten Produktionsskripte `prepare_goal_visualization.mjs`/`goal_visualization_common.mjs` liefen für4 Ziele nur in `native-root/` auf dem vollständigen inert479-Ziele-Input; Metadaten und stdout/stderr sind archiviert. Ein aktiver Import wurde nicht ausgeführt. Native D/P-Nachweise für neue PNGs werden anschließend separat neu vorbereitet. Alte Bild-, PDF- und QA-Urteile gelten nur für ihre damaligen Bytes und werden nicht als aktuelle Bindung übernommen.','', 'Die drei früheren V-HOLDs und das zusätzliche c441-HOLD sind durch diesen Autorenordner nicht geschlossen. Die ausgeschlossenen Quellen-HOLDs466bd2e9,6d3a2bad,8edee6b6 bleiben erhalten. Die zwei direkten Quellenrouten aus v2 bleiben begrenzte Kandidatenvorschläge. Ungebrochene andere Bilder bleiben bytegleich. Keine aktive Canon/QA/Registry, keine Veröffentlichung, Runtime-Änderung, menschliche Freigabe oder Human Trial.','', '## Freeze und Rechte','', '`final-own-files-and-reused-inputs.freeze.json` bindet die eigenen Dateien sowie genau wiederverwendete Eingaben. Nach dem Seal wird dieser Ordner nicht weiter beschrieben. Eigene didaktische PNGs/Texte: CC-BY-4.0 nach LICENSING.md; technische Skripte/Verfahrensdokumentation: Apache-2.0. Offizielle Fremdquellen behalten ihre Rechte und Herkunft.','']
(BASE/'README.md').write_text('\n'.join(rows))
own=[pin(p) for p in sorted(BASE.rglob('*')) if p.is_file()]
freeze={'documentType':'Four evidenced Chemistry image author package immutable freeze','frozenAt':datetime.now(timezone.utc).isoformat(),'role':'AUTHOR','reviewAuthority':'ai_candidate','status':'needs_human_review','strictNetGain':0,'humanApproval':False,'humanTrial':False,'ownFiles':own,'ownFileCount':len(own),'ownBytes':sum(x['bytes'] for x in own),'reusedInputPins':guards,'freezeExcludesOnlyItself':True}
write(BASE/'final-own-files-and-reused-inputs.freeze.json',freeze)
print(json.dumps({'files':len(own),'bytes':freeze['ownBytes'],'freeze':pin(BASE/'final-own-files-and-reused-inputs.freeze.json')},indent=2))
