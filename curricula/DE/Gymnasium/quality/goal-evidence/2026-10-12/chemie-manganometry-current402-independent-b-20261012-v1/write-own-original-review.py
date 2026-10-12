from pathlib import Path
import json, hashlib, unicodedata
from datetime import datetime, timezone

OUT = Path(__file__).resolve().parent
ROOT = OUT.parents[6]
AUTHOR = OUT.parent / 'chemie-manganometry-current402-P-A-author-root-20261012-v1'
GID = '2fdd759f-8349-5f7e-b29a-6ac7fb0299f9'
RID = OUT.name
NOW = datetime.now(timezone.utc).isoformat()
def load(p): return json.loads(p.read_text())
def digest(p): return 'sha256:' + hashlib.sha256(p.read_bytes()).hexdigest()
def write(name, d):
    p = OUT / name
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(json.dumps(d, ensure_ascii=False, indent=2) + '\n')
def line(name, d):
    p = OUT / name
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(json.dumps(d, ensure_ascii=False, separators=(',', ':')) + '\n')
def rel(p): return p.relative_to(ROOT).as_posix()
def norm(s): return ' '.join(unicodedata.normalize('NFKC', s or '').split())

candidate = AUTHOR / 'candidate/canonical523.one-endpoint-image.inactive.json'
landscape = load(candidate)
goal = next(x for x in landscape['goals'] if x['id'] == GID)
landscape_id = landscape.get('landscapeId', landscape.get('id'))
campaign = load(OUT / 'description-round-b/description-review-campaign.json')
inp = load(OUT / 'description-round-b/description-review-input.json')
g = inp['goals'][0]
runid = RID + '-D1'
record = {
    '$schema': 'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-review-record.schema.json',
    'schemaVersion': 1, 'recordId': RID + '-D1-' + GID, 'runId': runid,
    'campaignId': campaign['campaignId'], 'roundId': campaign['roundId'],
    'bundleFingerprint': campaign['bundleFingerprint'], 'bookDigest': campaign['bookDigest'],
    **{k: g[k] for k in ['goalId','goalFingerprint','pageFingerprint','currentTitleDe','currentTitleEn','currentDescriptionDe','currentDescriptionEn']},
    'decision': 'keep',
    'understandingEvidence': {
        'essentialUnderstandingDe': 'Eine Redoxtitration bestimmt eine unbekannte Stoffmenge durch die Stoffmenge eines bekannten Reaktionspartners und das aus atom- und ladungsbilanzierten Redoxgleichungen begründete Verhältnis. Chemische Donator-/Akzeptorrolle, Maßlösung/Probe und bekannt/unbekannt sind verschiedene Zuordnungen. Der sichtbare Endpunkt ist ein methodenspezifisches Näherungszeichen für den Äquivalenzpunkt.',
        'essentialUnderstandingEn': 'A redox titration determines an unknown amount from a known reaction partner and the ratio derived from atom- and charge-balanced redox equations. Chemical donor/acceptor role, titrant/sample placement and known/unknown status are different assignments. The visible endpoint is a method-specific approximate indication of equivalence.',
        'observablePerformanceDe': 'Die lernende Person kann unter der genehmigten experimentellen Methode eine gültige Titration mit nachvollziehbaren Rohständen, passendem Blindwert und begründetem Endpunkt ausführen und auswerten. Sie leitet in saurer Manganometrie das Verhältnis 1:5 sowie in Iodat-Iod-Thiosulfat-Iodometrie 1:6 her und verwendet das ursprüngliche Probenvolumen, Liter und tatsächliche reagierende Spezies.',
        'observablePerformanceEn': 'Under the approved experimental method, the learner can perform and evaluate a valid titration using traceable raw burette readings, an appropriate blank and a justified endpoint. They derive the 1:5 ratio in acidic manganometry and the 1:6 ratio in iodate-iodine-thiosulfate iodometry, using the original sample volume, litres and the species that actually react.',
        'transferExpectationDe': 'Beim Wechsel von unbekanntem Fe(II)-Donator zur unbekannten Permanganat-Akzeptor-Maßlösung sowie zur Iodometrie bleibt die Stoffmengenbilanz tragfähig. Verdünnung, Fe(III)-Verunreinigung und Iodverlust werden nach ihrer Wirkung auf das Ergebnis begründet; Übereinstimmung wiederholter Zahlen ersetzt keinen Nachweis der Gültigkeit.',
        'transferExpectationEn': 'When changing from an unknown Fe(II) donor to an unknown permanganate acceptor titrant and then to iodometry, the amount balance remains applicable. Dilution, Fe(III) contamination and iodine loss are explained through their effect on the result; agreement among repeated numbers does not establish validity.'
    },
    'rationale': 'Ein zusammenhängendes analytisches Verfahren mit Durchführung, Reaktionsbegründung und quantitativer Auswertung; die Verben allein begründen keine Aufteilung. Alle drei vollständigen DE/EN-Fälle, Rohdaten, Rubriken, frischen Gegenbeispiele, Bildpixel bei Original/360/680 und tatsächliche native HTML-/PDF-Seite geprüft. Verfahren und synthetische Rechenfälle können ein E1/G1-Kandidatenprofil stützen, belegen aber keine bereits erfolgte menschliche Laborleistung. Quellenurteil getrennt: Die NI-Nernst-Beschreibungsroute wird korrekt entfernt, jedoch bleibt im aktuellen Mapping und normal erzeugten Quellenindex die fachlich unpassende NI-Halbzellenpotential-Berechnungsroute 020 erhalten; daher keine unqualifizierte Quellen-/Gesamtfreigabe.',
    'evidenceProfileContract': 'positive-understanding-evidence-v2',
    'evidenceProfileRecommendation': 'none', 'recordStatus': 'candidate', 'reviewAuthority': 'ai_candidate'
}
batch = campaign['batches'][0]
recordfile = 'description-round-b/results/' + batch['batchId'] + '.records.jsonl'
line(recordfile, record)
manifest = load(OUT / 'description-round-b/review-bundle-manifest.json')
artifacts = [{'role': x['role'], 'digest': x['digest']} for x in manifest['artifacts'] if x['role'] in ['book_model','book_pdf','book_html','review_input_json','review_prompt','review_criteria']]
artifacts += [{'role':'description_review_batch_input_jsonl','digest':digest(OUT/'description-round-b/batches'/ (batch['batchId']+'.input.jsonl'))}]
write('description-round-b/results/' + batch['batchId'] + '.run.json', {
    '$schema':'https://skillpilot.com/schemas/goal-evidence/v1/goal-evidence-ai-run-manifest.schema.json',
    'schemaVersion':1,'runId':runid,'campaignId':campaign['campaignId'],'roundId':campaign['roundId'],
    'batchId':batch['batchId'],'batchInputFingerprint':batch['batchInputFingerprint'],
    'bundleFingerprint':campaign['bundleFingerprint'],'bookDigest':campaign['bookDigest'],
    'provider':'OpenAI','model':'GPT-6 Codex inherited session model','role':'subject_reviewer',
    'promptFamilyId':'chemistry-goal-description-understanding-evidence-v2','promptFingerprint':campaign['promptFingerprint'],
    'criteriaFingerprint':campaign['criteriaFingerprint'],
    'generationParametersFingerprint':'sha256:'+hashlib.sha256(b'current inherited model; genuine independent reasoning; no peer scientific verdicts').hexdigest(),
    'independenceGroupId':campaign['independenceGroupId'],'blindToOtherRuns':True,'goalIds':[GID],
    'inputArtifacts':artifacts,'startedAt':load(OUT/'FIRST.author-input-CAS-and-independent-start.json')['checkedAtUTC'],
    'completedAt':NOW,'status':'completed','outputDigest':digest(OUT/recordfile),
    'toolchainVersion':'skillpilot-current-normal-chemistry-D1-independent-review'
})

# Read only profile/material and binding metadata from the author P record; do not adopt its judgment fields.
author_p = load(AUTHOR/'positive/P1.final-image.author.records.jsonl')
p = {k: author_p[k] for k in ['$schema','schemaVersion','goalFingerprintRuleVersion','profileRuleVersion','reviewCriteriaFingerprint','landscapeId','goalId','goalFingerprint','reviewInputFingerprint','profileFingerprint','profile']}
p_runid=RID+'-P1'
p.update(reviewId=RID, status='needs_human_review', reviewAuthority='ai_candidate', reviewedAt=NOW,
    reviewer='GPT-6 Codex independent B; own complete chemistry review',
    reason='Eigene vollständige Prüfung aller drei Methoden und DE/EN-Fälle: atom-/ladungsrichtige Gleichungen, 1:5/1:6-Stöchiometrie, eigene Nachrechnung der Rohstände/Blindwerte/Probenvolumina und Gegenfälle. Fe(II)-Assay, inverse Permanganat-Standardisierung und BW-Iodometrie decken Durchführung, Donator-/Akzeptorrollen und quantitative Auswertung mit konkreten Methoden und überprüfbaren Rubriken ab. Frische Verdünnung, Fe(III)-falscher Standard und Iodverlust unterscheiden Transfer, Präzision und Gültigkeit. Die experimentelle Rubrik fordert wirkliche beobachtete Durchführung für einen späteren Lernenden, behauptet sie aber nicht für diese synthetischen Artefakte. Keine menschliche Freigabe/Trial-Bedingung für dieses E1/G1-M7-Kandidatenprofil. Separater Quellen-HOLD 020 bleibt bestehen.',
    evidenceLevel='E1', maximumClaimScope='G1', reviewRunIds=[p_runid], dissent=[])
line('positive/P1.independent-b.review.jsonl',p)
prun=load(OUT/('description-round-b/results/' + batch['batchId'] + '.run.json'))
for k in ['campaignId','roundId','batchId','batchInputFingerprint']:prun.pop(k,None)
prun.update(runId=p_runid,bookDigest=next(x['digest'] for x in manifest['artifacts'] if x['role']=='book_model'),promptFamilyId='chemistry-positive-understanding-evidence-v2',outputDigest=digest(OUT/'positive/P1.independent-b.review.jsonl'),toolchainVersion='skillpilot-current-normal-P1-whole-method-independent-review')
write('positive/P1.independent-b.run.json',prun)
pc = load(AUTHOR/'positive/P1.final-image.author.inactive.config.json')
pc.update(reviewId=RID,reviewPath=rel(OUT/'positive/P1.independent-b.review.jsonl'),reviewCriteriaPath=rel(OUT/'description-round-b/criteria.md'),reviewRunManifestPaths=[rel(OUT/'positive/P1.independent-b.run.json')])
write('positive/P1.independent-b.inactive.config.json',pc)

def fingerprint(rule):
    payload={'ruleVersion':rule,'goalId':GID,'shortKey':goal.get('shortKey',''),
        **{k:norm(goal.get(k)) for k in ['title','titleEn','description','descriptionEn','nodeKind']},
        **{k:norm(goal.get('dimensionTags',{}).get(k)) for k in ['phase','area','topicCode']}}
    return 'sha256:'+hashlib.sha256(json.dumps(payload,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode()).hexdigest()
for sub,rule,status,extra,reason in [
    ('atomicity','semantic-atomicity-v1','atomic',{'semanticAtomic':True},'Ein analytischer Verfahrenskern: anhand stöchiometrischer Redoxreaktion eine unbekannte Konzentration durch korrekt ausgeführte Titration bestimmen. Durchführung, Begründung und Auswertung sind integrierte Bestandteile dieses einen Verfahrens; Manganometrie, inverse Rollen und Iodometrie variieren denselben Kern. Kein Urteil aus einer Verbliste.'),
    ('memory','memory-card-review-v1','no_memory_needed',{'memoryUseful':False},'Das Ziel prüft verstanden ausgeführte und ausgewertete Redoxtitration mit wechselnden Reaktionspartnern, Mengen und Endpunkten. Reaktionsverhältnisse werden aus Elektronen-/Atom-/Ladungsbilanzen begründet, nicht isoliert auswendig gelernt. Allgemeine Redox- und Bilanzierungsgrundlagen liegen in den tatsächlichen prerequisites; kein zusätzlicher isolierter Abrufdeck ist für dieses Verfahren zwingend erforderlich.')]:
    reviewid=RID+'-'+sub
    line(sub+'/M1.independent-b.review.jsonl' if sub=='memory' else sub+'/A1.independent-b.review.jsonl',{
        'schemaVersion':1,'reviewId':reviewid,'ruleVersion':rule,'landscapeId':landscape_id,
        'goalId':GID,'fingerprint':fingerprint(rule),'status':status,**extra,'reviewedAt':NOW,
        'reviewer':'GPT-6 Codex independent B','reason':reason})
    config={'schemaVersion':1,'reviewId':reviewid,'ruleVersion':rule,'landscapeId':landscape_id,
        'landscapePath':rel(candidate),'reviewPath':rel(OUT/(sub+('/M1.independent-b.review.jsonl' if sub=='memory' else '/A1.independent-b.review.jsonl'))),
        'scope':{'label':'Fresh whole-goal chemistry independent B; manganometry only','leafGoalIds':[GID]}}
    if sub=='memory':
        old=load(OUT.parent/'chemie-q2-naturstoffe-current402-independent-b-20261012-v1/memory/M402.independent-b.inactive.config.json')
        (OUT/'memory/M1.no-primary-cards.review.jsonl').write_text('')
        config.update(cardReviewPath=rel(OUT/'memory/M1.no-primary-cards.review.jsonl'),visibilityScopes=old['visibilityScopes'],visibilityScopeCoverageRequired=True,reportPath=rel(OUT/'checks/M1.normal.report.md'))
    write(sub+('/M1.independent-b.inactive.config.json' if sub=='memory' else '/A1.independent-b.inactive.config.json'),config)

neutral=load(AUTHOR/'sources/current-four-state-six-source-clauses.neutral.json')
ni_path=ROOT/'curricula/DE/Gymnasium/input/NI/upper-secondary/source-extraction/DE_NI_CHEMIE_SEKII_KC2022.source-extraction.json'
ni=load(ni_path)
newmap=load(AUTHOR/'sources/NI-Nernst-one-incorrect-target-removed.author.inactive.review.json')
oldmap_path=ROOT/'curricula/DE/Gymnasium/mapping/DE-NI/upper-secondary/ni_chemistry_upper_secondary_source_extraction_to_canonical_chemistry.review.json'
oldmap=load(oldmap_path)
edges=[x for x in newmap['mappings'] if x['canonicalGoalId']==GID]
ids={x['legacyGoalId'] for x in edges}
source_rows=[x for x in ni['sourceGoals'] if x['id'] in ids or x['id']=='ni-chemistry-sekii-kc2022-q-redox-2-kompetenz-019-dfffd221']
write('sources/actual-current-NI-vector-literal-additional-input.json',{'schemaVersion':1,'sourcePath':rel(ni_path),'sourceDigest':digest(ni_path),'inactiveMapPath':rel(AUTHOR/'sources/NI-Nernst-one-incorrect-target-removed.author.inactive.review.json'),'inactiveMapDigest':digest(AUTHOR/'sources/NI-Nernst-one-incorrect-target-removed.author.inactive.review.json'),'activeMapDigest':digest(oldmap_path),'currentTargetEdges':edges,'actualLiteralRows':source_rows,'actualCompletePassages':[x for x in ni['passages'] if x['id'] in {x['passageId'] for x in source_rows}]})
key=lambda x:json.dumps(x,sort_keys=True,ensure_ascii=False)
olde={key(x) for x in oldmap['mappings']};newe={key(x) for x in newmap['mappings']}
normal=load(AUTHOR/'sources/source382-one-route-removed.original-sources.normal.json')
normalids={x for row in normal['goals'][GID] for x in row['evidenceIds']}
normalrows=[x for x in normal['evidence'] if x['id'] in normalids]
bindings=[]
for b in neutral['committableInputBindings']:
    f=ROOT/b['path']; bindings.append({'path':b['path'],'expected':b['sha256'],'actual':digest(f),'matches':b['sha256']==digest(f)})
write('sources/ORIGINAL.source-route-scientific-review.json',{
    'goalId':GID,'reviewAuthority':'ai_candidate','overallSourceVerdict':'HOLD',
    'bindings':bindings,'removedEdges':[json.loads(x) for x in olde-newe],'addedEdges':[json.loads(x) for x in newe-olde],
    'correctRemoval':{'sourceGoalId':'ni-chemistry-sekii-kc2022-q-redox-2-kompetenz-019-dfffd221','judgment':'PASS removal only this target','reason':'Potential dependence via the Nernst equation is not a redox-titration concentration/experimental competence.'},
    'currentNormalEvidence':normalrows,
    'neutralInputGap':'The old six-clause neutral list ends at removed NI 019. Actual current generated evidence e8614 is now NI 020, and the inactive current NI mapping also retains 011 and 012. These literal clauses were independently read from the actual source extraction, not inferred from evidence IDs.',
    'perClause':[
        {'sourceGoalId':'bw-chem-sekii-3-4-7-b04-a01-f01f7432','verdict':'PASS bounded LK clause','reason':'Concrete iodate/iodine/thiosulfate method, observed-method rubric, raw readings, 1:6 balance and endpoint justify actual iodometry and its redox-titration principle. Synthetic artefacts are no actual learner experiment.'},
        {'sourceGoalId':'f351c9a3-888f-5114-992d-5de84e3de59c','verdict':'PASS bounded redox-titration contribution','reason':'A safety-conscious titration method supports the redox-titration contribution to the broader C11 analytical-method clause. Does not approve TLC, acid-base analysis, the whole process clause or unspecified course/duration dimensions.'},
        {'sourceGoalId':'cc523009-d57b-533e-a7c6-e0c7a9299414','verdict':'PASS EA/LK redox-titration clause','reason':'Fe(II) donor assay and permanganate acceptor standardization genuinely vary unknown chemical roles and determine concentrations using explicit execution and evaluation methods.'},
        {'sourceGoalId':'he-chem-sekii-q3-3-b11-a01-b9f47868','verdict':'PASS LK clause','reason':'Acidic permanganate/Fe(II) example explains the redox-titration principle, endpoint and 1:5 stoichiometry.'},
        {'sourceGoalId':'ni-chemistry-sekii-kc2022-q-redox-1-kompetenz-010-4d13a3b1','verdict':'PASS eA concentration clause','reason':'Raw titration data, measured original aliquot, unit conversion, justified stoichiometry and changed unknown correctly determine concentration.'},
        {'sourceGoalId':'ni-chemistry-sekii-kc2022-q-redox-1-kompetenz-011-1c943674','verdict':'PASS eA procedure clause','reason':'Explicit teacher-approved experimental methods and observable practical rubric support conducting redox titration as later assessment design; no already-performed human trial is claimed.'},
        {'sourceGoalId':'ni-chemistry-sekii-kc2022-q-redox-1-kompetenz-012-899923a9','verdict':'HOLD whole occupational-significance claim','reason':'The goal and three rubrics do not ask the learner to recognize significance of volumetric analysis in professional work. A concentration assay alone does not evidence this operator/context. Titration technique is only a bounded thematic contribution.'},
        {'sourceGoalId':'ni-chemistry-sekii-kc2022-q-redox-2-kompetenz-020-501ae6e3','verdict':'HOLD wrong current route','reason':'Literal clause calculates half-cell potentials at different concentrations (excluding pH/temperature). Neither goal nor profile/cases require a half-cell potential or Nernst calculation. This wrong route remains in both the inactive current map and the rebuilt normal source index; removing 019 alone does not resolve it.'}
    ],
    'scopeBoundary':'No whole source corpus, source382 denominator, all GK routes, or human performance is approved.'
})

write('ORIGINAL.complete-cases-and-pixels-scientific-review.json',{
    'goalId':GID,'reviewedAt':NOW,'D':'keep','P':'PASS scientific E1/G1 candidate','A':'atomic','M':'no_memory_needed','V':'PASS scientific AI candidate',
    'caseCalculations':[
        {'case':'FeII donor','rawVolumes_mL':[18.58,18.62,18.60],'mean_mL':18.60,'blank_mL':.04,'corrected_mL':18.56,'nMnO4_mol':.0003712,'nFeII_mol':.001856,'originalSample_L':.02000,'cFeII_mol_L':.09280,'freshDilutionStock_mol_L':.09280,'invalidBrownRun':'MnO2-compatible observation, not unique cause; five-electron ratio not blindly retained; verify method and repeat.'},
        {'case':'Unknown permanganate acceptor','rawVolumes_mL':[10.02,10.00,9.98],'mean_mL':10.00,'blank_mL':0,'blankConvention':'Below 0.02 mL reading resolution; do not import case-1 blank','nFeII_mol':.001000,'nMnO4_mol':.0002000,'cMnO4_mol_L':.02000,'freshContaminatedStandard':{'trueFeII_mol_L':.04000,'FeIII_mol_L':.01000,'trueVolume_mL':8.000,'misassignedConcentration_mol_L':.02500,'relativeOverestimate':.25}},
        {'case':'BW iodometry iodate acceptor','rawVolumes_mL':[12.10,12.12,12.14],'mean_mL':12.12,'blank_mL':.12,'corrected_mL':12.00,'nThiosulfate_mol':.0001200,'nIodate_mol':.00002000,'originalSample_L':.01000,'cIodate_mol_L':.002000,'ratioIO3ToThiosulfate':'1:6','iodineLoss':'Less titrant and concentration underestimate; reagent blank cannot repair sample-specific iodine loss.'}
    ],
    'balancedEquations':[
        {'equation':'MnO4- + 5 Fe2+ + 8 H+ -> Mn2+ + 5 Fe3+ + 4 H2O','bothCharges':17},
        {'equation':'IO3- + 5 I- + 6 H+ -> 3 I2 + 3 H2O','bothCharges':0},
        {'equation':'I2 + 2 S2O3^2- -> 2 I- + S4O6^2-','bothCharges':-4},
        {'equation':'IO3- + 6 H+ + 6 S2O3^2- -> I- + 3 S4O6^2- + 3 H2O','bothCharges':-7}
    ],
    'rubricReview':'All three full bilingual cases independently reviewed; each 13-point rubric allocates 4 actual-procedure, 3 chemistry/role/ratio, 3 valid raw-data quantification and 3 fresh-transfer/validity points. Synthetic calculations do not satisfy practical execution; later learner performance must actually be observed under the named approved method.',
    'pixels':{'paths':[rel(AUTHOR/'assets'/GID/(GID+'.png')),rel(AUTHOR/'assets'/GID/'actual-display-360.png'),rel(AUTHOR/'assets'/GID/'actual-display-680.png')], 'imageDigest':digest(AUTHOR/'assets'/GID/(GID+'.png')),'observed':'Actual purple permanganate burette, colorless initial Fe(II) solution, faint pink final flask matching Endpunkt: schwach rosa, correct acidic half-equations and combined 1:5 equation. Original and 680 labels/equations readable; at 360 main apparatus/color/endpoint motif clear. Generic notebook c=n/V is valid; full case explicitly uses original aliquot volume.'},
    'nativePages':{'paths':[rel(AUTHOR/'native/goal-page-001.final-image.html.actual.png'),rel(AUTHOR/'native/goal-page-001.final-image.pdf.actual.png')],'observed':'Both actual normal HTML and PDF pages fully inspected. Full public ID, German description, actual same PNG, three correctly titled external prerequisites and final-exam successor are legible and complete, with no clipping.'},
    'source':'HOLD current wrong NI 020 and unsupported whole occupational 012 claim; see exact per-clause source review.',
    'overallUnqualifiedPass':False,'strictM7Gain':0,'humanApproval':False,'humanTrial':False
})
write('ORIGINAL.independence-exposure-receipt.json',{
    'reviewer':'GPT-6 Codex independent B','authorScientificReasonDissentReviewerRead':False,
    'otherCurrentIndependentAndRootScientificVerdictsReadBeforeSeal':False,
    'authorRecordFieldsObserved':'P profile and binding identifiers plus schema/status metadata: status needs_human_review, reviewAuthority ai_candidate, evidenceLevel E1 and maximumClaimScope G1; these observed fields are disclosed and no author reason, dissent, reviewer or scientific pass/HOLD was used.',
    'neutralManifestMetadataObserved':['previous147OriginalFilesExact','initialGenericCampaignsNotUsedForChemistryCurrentReview','scientificInputDelta=0','independentVotes=0','strictM7Gain=0'],
    'normalValidatorIncidentalExposure':'An initial scoped M1 validation used the inherited 75-card global ledger and printed its obsolete out-of-scope historical card reasons. No manganometry-specific or current peer/root scientific verdict was printed. The scoped configuration now uses its genuinely empty primary-card ledger because this goal has no primary cards; visibility checks remain enabled.',
    'originalOwnB4AndWhole31Preserved':True,'noHumanPerformanceOrApprovalClaim':True
})
write('ORIGINAL.per-goal-overall-pass-and-exact-holds.json',{'schemaVersion':1,'goals':[{'goalId':GID,'D':'PASS','P':'PASS_E1_G1_ai_candidate_needs_human_review','A':'PASS_atomic','M':'PASS_no_memory_needed','V':'PASS_AI_candidate','source':'HOLD','overallPass':False,'holds':[{'gate':'source','sourceGoalId':'ni-chemistry-sekii-kc2022-q-redox-2-kompetenz-020-501ae6e3','reason':'Wrong current half-cell-potential calculation route remains in inactive current mapping and actual generated source index.'},{'gate':'source','sourceGoalId':'ni-chemistry-sekii-kc2022-q-redox-1-kompetenz-012-899923a9','reason':'Whole occupational-significance operator/context not evidenced; only bounded titration-technique contribution.'}]}],'overallPassGoalIds':[],'strictM7Gain':0,'humanApproval':False,'humanTrial':False})
print('Wrote own genuine D/P/A/M/V and exact current-source scientific judgments; original not sealed yet.')
