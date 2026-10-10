# SPDX-License-Identifier: Apache-2.0
from pathlib import Path
import json, hashlib, datetime, importlib.util
import jsonschema

ROOT=Path.cwd()
OWN=Path(__file__).resolve().parent.relative_to(ROOT)
AUTHOR=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/biologie-health-twelve-source-findings-targeted-author-successor-20261010-v1')
def read(p):return json.loads(Path(p).read_text())
def ref(p):
    p=Path(p);b=p.read_bytes();assert p.is_file() and not p.is_symlink()
    return {'path':p.as_posix(),'sha256':'sha256:'+hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def write(p,data):
    p=Path(p);p.parent.mkdir(parents=True,exist_ok=True);assert not p.exists(),p
    p.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n');assert read(p)==data

hh='hh-biology-seki-bildungsplan-2011-m-07-biologie-des-menschen-gesundheit-sexualitat-immunsystem-und-nervensystem-erklaren'
hb37='hb-biology-seki-bp2006-2022-3-1-koerperleistungen-gesundheit-037-a47d64cd'
hb51='hb-biology-seki-bp2006-2022-3-2-sinne-wahrnehmung-051-a74ab90c'
hb52='hb-biology-seki-bp2006-2022-3-2-sinne-wahrnehmung-052-5e403f85'
hb57='hb-biology-seki-bp2006-2022-3-2-sexualitaet-verantwortung-057-a4155aaf'
sl='sl-biology-seki-nw56-2012-pfl5-003-b5650cc6'
life='0e1065b9-9d1d-5299-b900-32c74d352e56'
boundary='a6f57e17-9f0c-5327-91bc-c6f31ff375a2'
consequences='773a297d-49bf-5c8a-a62a-1bd2558e323c'
methods='26aa47b7-e5cc-5131-8980-0ec3271758b6'
inquiry='6ae33a8e-874c-53ee-858f-c64f1848cfbc'
cluster='26a16d5d-f178-5018-b792-039737c66ce7'
animal='4e12ba43-a58c-5611-8c43-3cc0c8465e33'
inp=read(OWN/'inputs/whole-targeted-before-after-records-and-current-partners.actual.json')
goals={g['id']:g for g in inp['wholeCurrentPartners']}
primary=read(OWN/'primary/eight-whole-primary-pages-independent-a.actual.json')
def pages(key,nums):return [r for r in primary['records'] if r['sourceDocumentKey']==key and r['physicalPageOneBased'] in nums]
def whole_record(source):
    return next(r for p in inp['sourcePairs'] for r in p['selectedWholeRecords'] if r['sourceGoalId']==source)
def finding(identifier,source,targets,key,nums,reason,resolution,within):
    return {'findingId':identifier,'category':'SOURCE','severity':'blocking_source_binding','status':'open','sourceGoalId':source,'canonicalGoalIds':targets,'actualWholeSourceRecordReference':{'path':(OWN/'inputs/whole-targeted-before-after-records-and-current-partners.actual.json').as_posix(),'selector':{'sourceGoalId':source,'side':'afterWholeSourceGoal'}},'wholeCurrentCanonicalPartners':[goals[t] for t in targets],'wholeActualPrimaryPages':pages(key,nums),'evidenceReason':reason,'requiredTargetedResolution':resolution,'reviewScopeBoundary':within,'DPRenderImageFinding':False,'newHumanApproval':False}

findings=[
 finding('A-SOURCE-001',hh,[life],'DE-HH-BIOLOGIE-SEKI-BILDUNGSPLAN-2011',[24,27,28],
  'Der geänderte HH-Beitrag auf physischer S. 24 fordert Beschreiben (Jg. 8) beziehungsweise Erklären (Übergang) der Drogenwirkung auf das Nervensystem. Das ganze aktuelle Ziel fordert Bedeutung von Lebenskompetenzen für Alltagsbewältigung, Zufriedenheit und Prävention sowie Strategien eigener Persönlichkeitsentwicklung. Keines dieser konkreten Teilkönnen wird durch die einzelne Kommunikationsanforderung verlangt. Die Einschränkung benennt fehlende Vollabdeckung, schafft aber keinen echten Teilüberlapp. S. 27/28 enthalten hier keinen Ersatznachweis.',
  'HH→0e1065b9 als direkten Kompetenznachweis entfernen oder mit einem tatsächlichen passenden amtlichen Kompetenzbeitrag begründen. Reines Grundlagenwissen zu Drogenwirkungen darf nicht als Lebenskompetenznachweis zählen.',
  'Genau die geänderte HH-Teilbindung und ihr ganzer aktueller Partner; keine erneute Bewertung übriger Länder oder D/P/V.'),
 finding('A-SOURCE-002',hh,[boundary],'DE-HH-BIOLOGIE-SEKI-BILDUNGSPLAN-2011',[24,27,28],
  'Das ganze aktuelle Ziel fordert eine erläuterte Genuss/Sucht-Grenze und bewusstes Wahrnehmen eigener Suchtrisiken. Physiologische Drogenwirkungen zu beschreiben oder zu erklären ist eine Wissensgrundlage, verlangt aber weder diese Unterscheidung noch das Einschätzen der eigenen Abhängigkeitsrisiken. Die Zielbindung erhält nur das Label partial; ihr neuer ausdrücklich auf biologische Drogenwirkung begrenzter Umfang nennt kein tatsächlich überlappendes Teilkönnen. Akute physiologische Wirkung, Gesundheitsschaden und persönliche Abhängigkeitsgefährdung sind unterschiedliche Aussagen.',
  'Die HH-Bindung an dieses Ziel entfernen oder einen passenden konkreten Kompetenzbeitrag zum Genuss/Sucht-Vergleich oder zur eigenen Suchtrisikowahrnehmung nachweisen. Allgemeine Wirkungskenntnis nicht automatisch in persönliche Risikokompetenz umdeuten.',
  'Genau die geänderte HH-Teilbindung; das Modell und die übrigen Nachweise des Ziels bleiben fachlich unverändert.'),
 finding('A-SOURCE-003',hb37,[methods,inquiry],'HB_NW_GYM_2006',[30],
  'Der ganze im geänderten Mapping-Entscheid erhaltene HB037-SourceGoal enthält ausschließlich die Reflexion von Ekelreaktionen beim Umgang mit Naturobjekten. Untersuchungen durchführen/protokollieren und Bedeutung beziehungsweise Grenzen biologischer Erkenntniswege einschätzen sind damit nicht curricular verlangt. Die Quelle ist zwar als prozessbezogen überschrieben; diese Kategorie allein ersetzt keine konkrete Kompetenzüberschneidung. Die zwei unveränderten Restbindungen sind deshalb nicht als gültiger fachlicher Rest der gezielten Korrektur zu bestätigen.',
  'Die zwei Restbindungen gezielt aus HB037 entfernen oder jeweils durch tatsächlich passende amtliche SourceGoals begründen. Die korrekte Entfernung HB037→Gesundheitsentscheidung beibehalten.',
  'Nur die zwei Restpartner desselben bereits geänderten ganzen HB037-Entscheids, kein Neustart der historischen Methodenreviews.'),
 finding('A-SOURCE-004',sl,[animal],'SL-NW-GYM-5-6-2012-BIOLOGIE',[25,26],
  'Das nach Entfernung der menschlichen Bindung erhaltene Ziel 4e12ba43 ist laut ganzer kanonischer Beschreibung kein Pflanzenziel: Es verlangt den Vergleich von Fortpflanzungsstrategien bei Vögeln oder Fischen. Die ganzen SL-Seiten 25/26 sind auf Samenpflanzen, Blütenbestandteile, Bestäubung/Befruchtung, Früchte/Samen und ungeschlechtliche Pflanzenvermehrung begrenzt. Weder Vögel/Fische noch der geforderte Strategievergleich werden verlangt. Die Autorenbegründung „die beiden Pflanzenbindungen“ beschreibt diesen tatsächlichen Partner falsch.',
  'SL-PFL003→4e12ba43 als direkte Kompetenzbindung entfernen oder eine tatsächliche Quelle für den tierbezogenen Strategievergleich nachweisen. Die echte Blütenbindung be06115e und die korrekte Entfernung der menschlichen Bindung erhalten.',
  'Nur der Restpartner desselben geänderten ganzen SL-PFL003-Entscheids; keine neue Pflanzen- oder Tierkursfreigabe.'),
 finding('A-SOURCE-005',hb51,[cluster],'HB_NW_GYM_2006',[31],
  'Die jetzt korrekt ausgewiesene amtliche HB051-Anforderung ist Nennen von Alkohol-/Drogenwirkungen und Strategien gegen Suchtmittelmissbrauch. Der ganze bereits gebundene Cluster enthält Verhaltensbeobachtung/Auslöser, genetische versus erworbene Verhaltensanteile und Konditionierung; seine drei ganzen Seiten zeigen diese konkreten Kompetenzen. Der HB051-Bullet verlangt keines dieser Teilkönnen. Die normal erhaltenen geerbten Witness-Semantiken sind Sichtbarkeits- und Transportdaten, kein direkter Quellenbeleg für die drei Kinder. Die Operator-Korrektur darf diese bestehende unsachliche Clusterbindung nicht fachlich neu bestätigen.',
  'HB051→Verhalten-und-Lernen fachlich als unbelegt behandeln und getrennt gezielt auflösen. Keine automatisierte Quellenfreigabe der drei geschützten Nachfahren aus der geerbten Bindung ableiten; ihre unveränderten Seiten, Bilder, D/P-Nachweise und übrigen gültigen Quellen erhalten.',
  'Gezielter Quellenkontext des ausdrücklich betroffenen HB-Fidelity-Records plus seines ganzen Clusters und der drei gebundenen vollständigen Seiten; keine generelle Neubewertung protected353.')
]

deltas=read(AUTHOR/'sources/four-pair-removals-three-HH-partial-scopes-two-HB-fidelity.actual-author-deltas.json')
accepted_removals=[]
removal_reasons=[
 'Mitose/Meiose und genetische Informationsweitergabe belegen keine Pubertätscharakterisierung oder Medienvorstellungen. Die passende Zellteilungsbindung bleibt erhalten.',
 'Ekelreflexion verlangt kein Abwägen gesundheitlicher Folgen und keine begründete Gesundheitsentscheidung.',
 'Schweineaugenpräparation und Reflexion von Ekel verlangen kein gesundheitliches Folgenabwägen.',
 'Samenpflanzenfortpflanzung ist kein direkter Kompetenzbeleg für menschliche Zeugung/Empfängnis und pränatale Entwicklung. Allgemeine Gametenverschmelzung allein ersetzt die konkrete menschliche Kompetenz nicht.'
]
for r,reason in zip(deltas['removedUnsupportedDirectPairs'],removal_reasons):
    accepted_removals.append({'sourceGoalId':r['sourceGoalId'],'canonicalGoalId':r['canonicalGoalId'],'decision':'accept_targeted_removal','reason':reason,'replacementSourceInvented':False})
operators=[]
for r in deltas['hbTwoActualOperatorAndAuthoredOperationalizationCorrections']:
    operators.append({'sourceGoalId':r['sourceGoalId'],'decision':'accept_exact_source_fidelity_correction','actualOfficialOperator':r['officialOperator'],'actualOfficialBullet':r['afterWholeSourceGoal']['sourceText'],'actualPhysicalPage':31,'ownAuthoredStrongerTitleDescriptionHonestlySeparated':True,'wholeMappedCompetenceApproval':False,'grade10ClearanceClaimed':False,'normative2022RestrictionPreserved':True})

decision={'schemaVersion':1,'createdAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'reviewer':'genuine-independent-a-fresh-targeted','role':'Actual individual FIRST SOURCE decision, sealed before any current peer findings or reconciliation','overallDecision':'needs_targeted_source_binding_changes','findings':findings,'acceptedFourTargetedRemovals':accepted_removals,'acceptedTwoHBOperatorFidelityCorrections':operators,'HHThreeTargetedContributionDecisions':[{'canonicalGoalId':life,'decision':'unsupported_direct_competence_overlap','findingId':'A-SOURCE-001'},{'canonicalGoalId':boundary,'decision':'unsupported_direct_competence_overlap','findingId':'A-SOURCE-002'},{'canonicalGoalId':consequences,'decision':'accept_limited_partial_contribution_only','actualPartialCompetence':'Physiologische Folgen von Drogen für betroffene Menschen beschreiben beziehungsweise erklären. Das ist ein sachlich konkreter Teil des Folgenaspekts des ganzen Ziels.','unsupportedRemainder':'Modellhafte Entstehung von Suchtverhalten, psychische/soziale Folgen und die gesamte Präventionskompetenz werden damit nicht belegt. Die Einzelseite oder das partial-Label zertifizieren das ganze Ziel nicht.','actualPhysicalPage':24,'fullCanonicalCoverage':False}],
 'preservedValidAffectedSourceScience':[{'sourceGoalId':hb57,'canonicalGoalId':'1d2b1038-dcd5-529a-b085-9e14f1d58c76','scope':'Amtliches Beschreiben von Mitose/Meiose als genetische Informationsweitergabe überlappt das Beschreiben von Mitose/vereinfachter Meiose; kein neuer Ganzer-Ziel- oder Bildreview.'},{'sourceGoalId':hb52,'canonicalGoalIds':[methods,'0f1549f6-8341-53b0-8161-5eaeb2b37809','1d8d64b6-b2d8-526a-8e24-23e8b6e9eb30'],'scope':'Präparations-/Untersuchungshandlung und anatomische Beobachtung am Auge sind passende Teile; Protokollierung und vollständige Auswertung werden durch den einzelnen Bullet nicht insgesamt belegt.'},{'sourceGoalId':sl,'canonicalGoalId':'be06115e-96e8-537e-b18a-313056e6cbe8','scope':'Tatsächliche Blütenbestandteile und Funktionen auf S. 25/26 passen; kein tierischer Strategievergleich.'}],
 'sourceContextPrecisionAddendumAccepted':True,'completeTenNativeContextsRead':True,'wholeCurrentPartnerDescriptionsRead':46,'wholeEightPrimaryPagesReadAndRasterViewed':8,'wholeBeforeAfterSelectedSourceRecordsRead':6,'wholeChangedMappingPairsReadAndChecked':3,'wholeSourcePairsBound':31,'current182WholeWitnessIntegrityChecked':True,'all394WholePageObjectsExactByNormalApi':True,'protected353WitnessSemanticsExactByNormalApi':True,
 'unchangedHistoricalSciencePolicy':'Unselected source goals, unaffected D/P/native render/image reviews and valid unaffected source science are carried at their existing exact bindings; no historical whole-course reviews are restarted. Findings A-SOURCE-003 through 005 address actual residual bindings of the already targeted complete source records, not unrelated predecessor content.',
 'independenceDisclosure':{'currentBReviewNamespaceOpened':False,'currentPeerFindingsOrJudgmentsRead':False,'peerReconciliationBeforeFIRST':False,'authoringRole':False,'fullHistoricalBlindnessClaimed':False,'embeddedHistoricalMetadataSeen':['The neutral AUTHOR README identifies the predecessor historical B-FIRST origin; that predecessor review itself was not opened.','Whole required mapping records contain historical codex reviewer names, dates, match decisions and rationales.','Whole current native page objects contain existing evidence review IDs/status/fingerprints and QA status.','Author and normal build inputs include exact historical review bindings; their bytes were checked mechanically, not reopened as new scientific judgments.'],'memorySearch':'A brief generic MEMORY.md keyword search was performed under required memory instructions; no old biological source judgment was used as current review evidence.'},
 'newSourceApproval':False,'wholeCourseSourceApproval':False,'newDPRenderImageApproval':False,'humanApproved':0,'strictGain':0,'model394AndStrict353Active':False,'activeWrites':[]}
decision_path=OWN/'review/independent-a-FIRST.source-decision.json'
write(decision_path,decision)

# Proof files are ordinary JSON. Validate written complete values, not a text search.
base_schema={'type':'object','required':['schemaVersion'],'properties':{'schemaVersion':{'const':1}}}
normal_proof=read(OWN/'checks/normal-source-build-check-and-whole-model-independent-a.actual.json')
assert normal_proof['whole394PagesExact'] and normal_proof['protected353PagesExact']
assert read(OWN/'checks/current182-whole-witness-record-integrity.actual.json')['wholeDirectWitnessCount']==182
for p in OWN.rglob('*.json'):jsonschema.validate(read(p),base_schema)
spec=importlib.util.spec_from_file_location('validator','scripts/validate_schemas.py');v=importlib.util.module_from_spec(spec);spec.loader.exec_module(v);errors=v.curriculum_symlink_errors(ROOT);assert not errors
write(OWN/'checks/final-ordinary-json-schema-and-portability.actual.json',{'schemaVersion':1,'ordinaryParser':'json.loads of every complete file','schemaValidation':'jsonschema.validate ordinary complete objects; required schemaVersion=1; kind-specific counts and complete binding equality additionally asserted by review scripts','allWholeOwnJsonParsedAndValidated':True,'curriculumSymlinkErrors':errors,'regularOwnedFiles':True,'humanApproved':0,'strictGain':0,'activeWrites':[]})
inputs=[ref(AUTHOR/p) for p in ['neutral-source-findings-targeted-author-successor.entry.json','FINAL.targeted-source-neutral-author.freeze.json','FINAL.source-context-precision-addendum.freeze.json']]
entry={'schemaVersion':1,'role':'Neutral individual FIRST entry for genuine independent targeted SOURCE review A; findings remain sealed pending root request after both FIRST seals','reviewer':'genuine-independent-a-fresh-targeted','individualFIRSTDecision':ref(decision_path),'sealedAuthorInputs':inputs,'completedReviewScope':{'wholeChangedMappingPairs':3,'wholeSelectedBeforeAfterSourceRecords':6,'changedRemovedBindingsIndividuallyReviewed':True,'wholeCurrentBoundPartnerDescriptions':46,'wholeCurrentNativeContexts':10,'actualWholePrimaryPagesReadAndRasterViewed':8,'wholeSourcePairsBindingChecked':31,'currentWholeDirectWitnessesIntegrityChecked':182,'normalSourceAtlasBuildCheck':True,'normalSourceViews':24,'wholeBookModelApiComparison':True,'wholeUnchangedNativePages':394,'protected353PagesAndWitnessSemanticsExact':True},'independenceDisclosure':{'currentBReviewNamespaceOpened':False,'currentPeerFindingsRead':False,'peerReconciliationBeforeFIRST':False,'fullHistoricalBlindnessClaimed':False,'embeddedHistoricalMappingAndNativeEvidenceMetadataSeen':True},'reviewScopeOnly':'SOURCE correction of sealed inactive inputs, no D/P/image edits or human approval','humanApproved':0,'strictGain':0,'activeWrites':[]}
entry_path=OWN/'neutral-independent-a-FIRST.entry.json';write(entry_path,entry)
owned=[ref(p) for p in sorted(OWN.rglob('*')) if p.is_file()]
freeze_path=OWN/'FINAL.independent-a-FIRST.freeze.json'
freeze={'schemaVersion':1,'createdAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'role':'Actual individual FIRST source review A frozen before current peer findings or reconciliation','entry':ref(entry_path),'individualFIRSTDecision':ref(decision_path),'ownBindings':owned,'externalAuthorSeals':inputs,'regularPortableRepositoryRelativeArtifacts':True,'ordinaryWholeJsonParsingAndSchemaValidationCompleted':True,'currentPeerFindingsReceivedBeforeSeal':False,'humanApproved':0,'strictGain':0,'activeWrites':[]};write(freeze_path,freeze)
for b in freeze['ownBindings']+freeze['externalAuthorSeals']:assert ref(b['path'])==b
jsonschema.validate(read(freeze_path),base_schema)
print(json.dumps({'neutralEntry':ref(entry_path),'FIRSTFreeze':ref(freeze_path),'completedReviewScope':entry['completedReviewScope']},ensure_ascii=False))
