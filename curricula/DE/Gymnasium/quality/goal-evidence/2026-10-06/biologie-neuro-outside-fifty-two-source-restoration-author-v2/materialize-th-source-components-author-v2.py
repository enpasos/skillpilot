"""Primary-read TH source components; author candidates, never independent approvals."""
from pathlib import Path
from datetime import datetime, timezone
from uuid import NAMESPACE_URL, uuid5
import hashlib
import json
import re

root = Path(__file__).resolve().parents[7]
own = Path(__file__).resolve().parent
worklist = root / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/biologie-neuro-outside-fifty-two-source-restoration-worklist-v1'
assert not (own / 'th-largest-partial-author-v2.final.freeze.json').exists(), 'Frozen author package'
stamp = datetime.now(timezone.utc).isoformat()
def read(path): return json.loads(path.read_text())
def bind(path):
    raw = path.read_bytes()
    return {'path':str(path.relative_to(root)), 'sha256':'sha256:'+hashlib.sha256(raw).hexdigest(), 'bytes':len(raw)}
def write(name, payload):
    p = own / name; p.parent.mkdir(exist_ok=True, parents=True)
    p.write_text(json.dumps(payload, ensure_ascii=False, indent=2)+'\n')
def normalize(text): return re.sub(r'\s+', ' ', text).strip()
wl = read(worklist / 'outside52.actual-source-debt-and-view-worklist.json')
pairs = [r for r in wl['goalViewPairs'] if r['viewJurisdiction'] == 'DE-TH']
assert len(pairs) == 43
canonical_path = root / 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json'
canonical = read(canonical_path)
by_id = {g['id']:g for g in canonical['goals']}
original = next(r for r in wl['heldOriginalSourceRecords'] if r['jurisdiction']=='DE-TH')
original_source_path = root / original['extractionSourcePath']
original_source = read(original_source_path)
document = original_source['sourceDocument']
pdf = root / original['primaryDocument']['path']
page_text = {p:(own / 'sources' / f'TH-physical-page-{p:03}.actual.txt').read_text() for p in [15,16,19,20,22,23,24]}

# Each span is an actual contiguous raw layout span; no rewritten sentence is
# labelled original. Multiple original rows remain separate bound sources.
def span(p, start, end=None):
    text = page_text[p]
    begin = text.index(start)
    finish = text.index(end,begin+len(start)) if end else text.index('\n', begin)
    raw = text[begin:finish].rstrip()
    return {'physicalPage':p, 'printedPage':p-6, 'rawSourceText':raw, 'sourceText':normalize(raw), 'sourceDocumentKey':document['key'], 'localOriginalSpanKey':start}
spans = {
    'puberty':span(22,'- die Pubertät als Entwicklungsphase','- Grundzüge der vorgeburtlichen'),
    'sense':span(22,'- Bau und Funktion eines Sinnesorgans'),
    'chain':span(22,'- die Reiz-Reaktions-Kette beschreiben:', '- das zentrale und das periphere'),
    'food':span(22,'- die Zusammensetzung der Nahrung','- Verdauung als stufenweise'),
    'digestion':span(22,'- Verdauung als stufenweise','- Resorption in das Blut'),
    'resorption':span(22,'- Resorption in das Blut'),
    'bloodsugar':span(22,'- die Regulierung des Blutzuckerspiegels','\n\n'),
    'sti':span(22,'- Maßnahmen zur Prävention sexuell','                                       Nervensystem'),
    'nutrition':span(23,'- Maßnahmen zur Gesunderhaltung erläutern:', '                                    Atmungssystem'),
    'respiration':span(23,'- Bau und Funktion der Atmungsorgane','- die Wort- und Summengleichung'),
    'heart':span(23,'- Bau und Funktion des Herz-Kreislauf-Systems','- die Klassifikation der Blutgruppen'),
    'infection':span(23,'- Bakterien, Hefepilze und Viren als Krankheitserreger','- die Bedeutung weißer Blutzellen'),
    'whitecells':span(23,'- die Bedeutung weißer Blutzellen','\n\n'),
    'immunisation':span(24,'- Formen der Immunisierung'),
    'vaccination':span(24,'- Maßnahmen zur Prävention von Infektionskrankheiten','                            Zusammenwirken der Systeme'),
    'systems':span(24,'- das Zusammenwirken von Verdauungs-', '- den Zusammenhang zwischen Ernährung'),
    'nutritionrespiration':span(24,'- den Zusammenhang zwischen Ernährung'),
    'open':span(16,'                                Lebende Systeme sind offene Systeme,','Stoff- und Energieumwandlung'),
    'open-organism':span(16,'                                biologisches System als','                                Stoff- und'),
    'surface':span(15,'                            Oberflächenvergrößerung','\n\n'),
    'decisions':span(19,'B 2: Kriteriengeleitet Entscheidungen treffen','B 3: Entscheidungsprozesse'),
}

# canonical details are explicitly author operationalisations, not purported
# words of the original source. They remain for independent scope review.
specs = [
 ('1d8d64b6-b2d8-526a-8e24-23e8b6e9eb30',['sense'],'Bau eines Sinnesorgans beschreiben','Bau von Auge oder Ohr ist ein ausdrücklich begrenzter Aspekt des Originalanspruchs Bau und Funktion; Funktions- und Unterrichtsuntersuchungspflichten bleiben separat.',[]),
 ('249f4c5d-fd23-57c7-ac62-773d62c33b49',['puberty'],'Hormonbezogene Reifung und Menstruationszyklus beschreiben','Die Originalunterpunkte binden körperliche Veränderungen an Aktivitätsänderungen benannter Hormondrüsen und den Menstruationszyklus.',[]),
 ('33262175-0139-5d8a-a3f2-641191459f71',['chain'],'Informationsweiterleitung und Verarbeitung in der Reiz-Reaktions-Kette beschreiben','Nur die im Original expliziten sensorischen/motorischen Weiterleitungen und die zentrale Verarbeitung tragen dieses vorhandene Ziel. Aufnahme und Effektorhandlung bleiben weitere Originalaspekte.',[]),
 ('480146f6-4749-52e3-a5e5-d08629e0c38f',['heart'],'Blutbestandteile als Teil des Herz-Kreislauf-Systems beschreiben','Der Bauaspekt des ausdrücklich genannten Bluts ist eng abgegrenzt; vollständige Herz-/Kreislauf- und Funktionspflichten bleiben offen.',['Die Eigenschaften einzelner Bestandteile sind kanonische Operationalisierung des Bauaspekts, nicht eine wörtliche Unterliste der Quelle.']),
 ('9499943f-89b7-54e3-9fe2-e90404beaa4a',['sense'],'Bau und Funktion eines Sinnesorgans erläutern','Das Original erlaubt Auge oder Ohr; kein Pflichtanspruch auf beide Organe wird eingeführt.',[]),
 ('9ac89f04-4483-5aac-8636-65c9d967048a',['sense'],'Die Funktion von Auge oder Ohr am Reizaufnahmebeispiel erklären','Netzhautabbildung beziehungsweise Schallempfang ist ein begrenzter kanonischer Funktionsaspekt des ausdrücklich zulässigen Auge-oder-Ohr-Organs.',['Die konkrete Netzhaut-/Schallempfangsformulierung ist didaktische Operationalisierung; sie steht nicht wörtlich im Original.']),
 ('91f62a7b-3b6a-5918-94ca-3f345f1f6584',['puberty'],'Körperliche Veränderungen der Pubertät beschreiben','Die körperliche Entwicklung ist im Original ausdrücklich genannt; psychosoziale und mediale zusätzliche Kompetenzen werden hier nicht zugeordnet.',['Die Bezeichnung Geschlechtsmerkmale ist kanonische Operationalisierung der dort benannten Veränderung des Körperbaus.']),
 ('73624d0c-bc6f-5b5d-baf5-099ca62fab79',['food','nutrition'],'Bedarfsangepasste Ernährung aus Nahrungskomponenten ableiten','Nährstoffe, Ergänzungsstoffe und ausdrücklich alters-/aktivitätsbezogener Bedarf werden gemeinsam gebunden; Kennzeichnung und Essstörungsprävention bleiben zusätzliche Originalaspekte.',[]),
 ('bf2abe42-07bb-5c35-9118-d6141076c299',['digestion','systems'],'Stufenweise enzymatische Verdauung im zusammenwirkenden Organsystem erklären','Die explizite stufenweise enzymatische Nährstoffumwandlung ist mit dem expliziten Systemzusammenwirken gebunden.',['Nahrungsbreitransport und die Zuordnung der drei Makronährstoffklassen sind kanonische Modelloperationalisierungen; kein zusätzlicher Original-Mechanismenwortlaut wird behauptet.']),
 ('4b3b0cd7-47d2-5213-b1ce-4e829ccbb6a2',['food','digestion'],'Nahrungsaufnahme und Verdauung am menschlichen Säugetierbeispiel erklären','Nur das tatsächliche Menschenbeispiel trägt die Säugetierkompetenz; die Quelle fordert keinen Vergleich weiterer Säugetierarten.',[]),
 ('c25a1bc9-c664-53d7-b2d8-500741da773c',['food','digestion','nutrition'],'Grundlagen bedarfsgerechter Ernährung und Verdauung erläutern','Direkte drei Originalzeilen für Nahrungskomponenten, enzymatische Umwandlung und bedarfsangepasste Ernährung; keine globale Menschenbiologie-Freigabe.',[]),
 ('f7fd8d03-aea2-530a-a384-0f63d270f5f6',['bloodsugar'],'Einen hormonellen Regelkreis am Insulin-Glukagon-Modell anwenden','Der im Original ausdrücklich als Regelkreis benannte Insulin-Glukagon-Fall trägt die begrenzte einfache Modellroutine.',['Modellieren und Interpretieren sind kanonische Operationalisierung des ausdrücklich zu erläuternden Regelkreises; keine unabhängige allgemeine Hormontheorie wird als Originalpflicht ausgegeben.']),
 ('63856e48-8ed9-5942-8a1d-1d53ad29416d',['sti','infection'],'Sexuelle Übertragungswege und Infektionsprävention begründen','Sexuell übertragbare Krankheiten sind ausdrücklich genannt; Geschlechtsverkehr ist als originaler Beispiel-Übertragungsweg gebunden. Hepatitis-B/HPV bleiben Beispiele, keine erschöpfende Liste.',[]),
 ('c7e2d7e5-ce6b-53e0-806d-66ae4d7846dd',['immunisation','vaccination','decisions'],'Immunisierungsformen und begründete Präventionsentscheidungen erläutern','Aktive/passive Immunisierung und Impfprävention sind konkrete Originalzeilen. Kapitel2 fordert zusätzlich kriterielle Entscheidungskompetenz an konkreten Inhalten; der konkrete Impfentscheidungsfall ist explizite Autorenverknüpfung.',['Die Entscheidungsroutine B2 gilt allgemein; ihre Anwendung auf diesen ausdrücklich benannten Inhalt wird als authored combination gekennzeichnet, nicht als angebliche wörtliche Impfentscheidungszeile.']),
 ('3e913f00-c3d7-5bbe-a73e-36bdc0d4a6e8',['heart','whitecells'],'Funktionen von Blutbestandteilen erläutern','Das Original nennt Blutbestandteile/Funktionen und erläutert weiße Blutzellen gesondert. Die Abwehrfunktion wird direkt belegt.',['Transport, Gerinnung und Plasma sind kanonische Konkretisierungen des Funktionsanspruchs, keine ausgeschriebene Originalliste; ihr Anspruch ist durch unabhängige Reviewende gesondert zu beurteilen.']),
 ('498f082d-742c-5f21-9d09-16feeb4276a6',['heart','systems'],'Herz-Kreislauf-Funktion im Zusammenwirken menschlicher Organsysteme erläutern','Bau/Funktion des Kreislaufs und sein explizites Zusammenwirken mit Verdauung, Atmung und Ausscheidung tragen den begrenzten Transportbezug.',['Die Formulierung Transportsystem zwischen Umgebung und Körperzellen ist kanonische Operationalisierung des Funktions-/Zusammenwirkungsanspruchs.']),
 ('d773ac89-37ef-51cd-a6ee-a75a6b10c43b',['heart','respiration','systems'],'Kreislauf und Atmung im Organzusammenwirken beschreiben','Beide Organsysteme und ihr Zusammenwirken sind konkrete Originalzeilen.',['Gesundheitsbezüge des vorhandenen Zieles sind im Primärplan benannt, bleiben aber kein globaler Therapieanspruch.']),
 ('2c60c8ad-04d3-5395-8a27-400646eb1612',['open','open-organism','food','systems','nutritionrespiration'],'Den Menschen als offenes Stoff- und Energiesystem beschreiben','Der Original-Basiskonzepttext beschreibt Aufnahme/Umwandlung/Abgabe und benennt Organismus ausdrücklich für7/8; konkrete Menschenzeilen zu Nahrung/Systemzusammenwirken werden zusätzlich direkt gebunden.',['Energieträger und Baustoffe sind kanonische Operationalisierung der konkreten Nahrungskomponenten; nicht aus bloßer Clustervererbung abgeleitet.']),
 ('7e26c129-91f7-52de-8114-2361411c80f8',['surface','resorption'],'Resorption mit der Oberflächenvergrößerung im Dünndarm erläutern','Dünndarmfalten/-zotten sind in der tatsächlichen7/8-Spalte des Struktur-Funktions-Prinzips benannt; Resorption ins Blut und in die Lymphe ist eine konkrete Menschenzeile.',['Dünndarmwandaufbau ist kanonische Operationalisierung der konkret genannten Falten/Zotten, nicht ein behaupteter zusätzlicher Histologie-Originalbullet.']),
]
assert len(specs) == 19 and len({s[0] for s in specs}) == 19
hold_reasons = {
 '0e1065b9-9d1d-5299-b900-32c74d352e56':'Keine explizite Lebenskompetenz-/Persönlichkeitsentwicklungsroutine zur Suchtprävention in den geprüften7/8-Zeilen; allgemeine Sozialkompetenz ersetzt diese Quellenbindung nicht.',
 '17dc9671-3280-566c-b9ec-27437864e0ab':'Schwangerschaft/ungeborenes Kind sind belegt, vor Schwangerschaft gefordertes Bewerten möglicher Folgen ist in diesen Zeilen nicht vollständig belegt.',
 '1f3cdf59-05e0-5d45-ae74-3d2d1a2c31a5':'Insulin/Glukagon-Regelkreis belegt; kanonisch zusätzlich verlangte Diabetes-Veranlagung/Lebensgewohnheiten nicht in den geprüften7/8-Zeilen.',
 '1f65f78e-b528-5d88-ad00-8e8714a2303e':'Unspezifische/spezifische Abwehr belegt; die zusätzlich geforderte Allergiefehlreaktion ist hier nicht belegt.',
 '2706c28e-1c21-50de-8a63-c450f5fe8b07':'Zentrale Verarbeitung ist belegt; bestimmte Hirnareale und mögliche Störungen sind kein vollständig belegter7/8-Anspruch.',
 '30a1d736-77ca-5087-b640-b756c249bc40':'Enzymatische Verdauung belegt; Außenfaktoren/Enzymausstattung als Angepasstheit nicht in diesem7/8-Teil.',
 '3c0f5267-4837-5c99-aa6d-bfb41ff70980':'Körperliche Pubertät belegt; psychische Veränderungen sowie mediale Sexualitäts-/Schönheitsvorstellungen fehlen in den geprüften Zeilen.',
 '3ee4b55c-81c3-5826-9d26-1a8c22cbd0b8':'Verhütung beurteilen belegt; zusätzlicher Reflexionsanspruch verantwortlicher Elternschaft nicht aus diesem Bulletin abgeleitet.',
 '4b7fdc2c-9dbe-5439-8d84-295abc240eec':'Varianten von Geschlecht/Identität/Orientierung sind belegt; soziale/ethische Diskussion des Sexualverhaltens ist damit nicht vollständig gebunden.',
 '668c01c7-0887-5a54-84ff-648facd8e962':'Prävention der Lungen-/Kreislaufgesundheit belegt; geforderte medizinische Behandlungsmöglichkeiten in diesen7/8-Zeilen fehlen.',
 '6add2bde-b647-577d-a899-6fd62497656a':'Geschlecht/Identität/Orientierung belegt; mediale Rollen-/Körperbilder und vollständiger normativer Selbstbestimmungsanspruch nicht durch die konkrete7/8-Zeile gedeckt.',
 '773a297d-49bf-5c8a-a62a-1bd2558e323c':'Suchtmittelmissbrauch vermeiden belegt; modellgestützte Suchtentstehung und Folgen nicht in den geprüften7/8-Zeilen.',
 '7b09d025-8465-505e-b196-61e1811309db':'Allgemeine soziale Verantwortung genügt nicht als direkte konkrete Sexualschutz-/Missbrauchskompetenz dieses Zielkontexts.',
 '848334f3-c719-55d9-b5f4-42836e0d876a':'Vorgeburtliche Entwicklung/Schwangerenvorsorge belegt; Geburt und vollständiger Schwangerschaftsverlaufs-/Risikoanspruch hier nicht belegt.',
 '848fcbe0-dc25-53eb-a1a8-38313b65cf6d':'Gasaustausch/Lungenoberfläche belegt; der ausdrücklich kanonisch verlangte Diffusionsmechanismus ist in diesen7/8-Zeilen nicht explizit gebunden.',
 '967b666d-aed4-50d8-be73-70269cb306db':'Lärm/Licht und Vermeidung von Suchtmittelmissbrauch belegt; spezifische Drogenwirkung auf Sinnesorgane wird dadurch nicht fachlich belegt.',
 'a6f2bcaf-df2d-5144-aa8f-49396b12d31b':'Zygote/Embryo/Fetus belegt; Zeugung und Empfängnis als gesondert geforderte Erklärungen fehlen in der konkret gelesenen Zeile.',
 'a6f57e17-9f0c-5327-91bc-c6f31ff375a2':'Missbrauchsvermeidung belegt; Grenze Genuss/Sucht und Wahrnehmung persönlicher Suchtrisiken nicht aus diesem Originaltext abgeleitet.',
 'a7eee23c-a5d0-5101-937a-ca441764cabf':'Rückenmark/Gehirn als zentrale Verarbeitung genannt; wesentliche Hirnareale/Funktionen nicht vollständig in diesem7/8-Teil.',
 'ba96880f-d31e-54c2-8139-4a748fc9541a':'Prävention sexuell übertragbarer Krankheiten belegt; HIV-Infektion/Aids erklären ist hier kein ausdrücklich vollständig gebundener Anspruch.',
 'd6727804-a8d4-5438-9b98-4aea8e7f4f80':'Allgemeines respektvolles Kommunizieren belegt; sexualisierte Belästigung/Gewalt und deren spezifische Reaktionsroutine nicht durch den7/8-Sozialtext belegt.',
 'dcc9d2e5-16f4-5813-ab66-7095c8a165a6':'Infektionsabwehr belegt; kanonisch geforderte Transplantationsreaktion nicht in diesem7/8-Abwehrteil.',
 'ed84c759-62e5-537f-90b8-4e8c2dbfd9bb':'Enzymatische Nährstoffumwandlung belegt; Energiekonzept/Schlüssel-Schloss auf Verdauungsenzyme wird hier nicht vollständig verlangt.',
 'eee09949-587f-51d2-8f51-aa6c40c71bbf':'Auge oder Ohr im Menschenkapitel belegt; Wahrnehmungsunterschiede verschiedener Lebewesen/vergleichende Modelle bleiben ohne direkten Beleg.',
}
selected = {s[0] for s in specs}
assert {r['goalId'] for r in pairs} == selected | set(hold_reasons) and len(hold_reasons) == 24
source_goals, mappings, decisions, rows = [],[],[],[]
qualifier = span(20,'2.1      Klassenstufen 7/8','2.1.1    Sach- und Methodenkompetenz')
for target, source_keys, component_description, rationale, not_literal in specs:
    parents = [dict(spans[k], authorOriginalSpanKey=k) for k in source_keys]
    first = parents[0]
    source_id = str(uuid5(NAMESPACE_URL, 'https://skillpilot.com/source/th/biologie/lehrplan2024/outside52/author-v2/' + target))
    goal = by_id[target]
    component = {
      'id':source_id,'passageId':'th-outside52:'+target,'topicCode':'2.1.1.3','title':component_description,
      'description':'Die lernende Person kann '+component_description[0].lower()+component_description[1:]+'.',
      'sourceText':first['sourceText'],'rawSourceText':first['rawSourceText'],'parentBulletText':first['sourceText'],'rawParentBulletText':first['rawSourceText'],
      'sourceDocumentKey':document['key'],'sourceSpan':'authored-component:TH7-8:'+target,'rawSourceSpan':'actual separately bound original rows; physical/printed positions in officialParentBindings',
      'sourceRef':'TH Lehrplan Biologie AHR2024, 2.1.1.3 Klassen7/8, ausdrücklich authored bounded component; ergänzende konkrete Elternzeilen separat gebunden',
      'physicalPage':first['physicalPage'],'printedPage':first['printedPage'],'stage':'SekI','courseLevel':'unspecified',
      'granularity':'officialCompetencyAspect','isOfficialBullet':False,'officialNumberingClaim':False,'authorOperationalisation':True,
      'wholeOriginalBulletCoverage':False,'wholeOriginalSummaryCoverage':False,'originalSourceSummaryGoalId':original['originalSourceGoalId'],
      'officialParentBindings':parents,'originalGradeBandQualifier':qualifier,'originalPrintedClassRange':'7/8','sourceContextBoundary':{'explicitClassRange':['7','8'],'nativeProjectedStage':'SekI','noOriginalGKOrLKClaim':True,'noHigherStageBackfill':True},
      'canonicalDetailsNotLiteralOriginalWording':not_literal,
      'tags':['jurisdiction:DE-TH','stage:SekI','classBand:7-8','component-only'],
    }
    source_goals.append(component)
    mappings.append({'legacyGoalId':source_id,'canonicalGoalId':target,'matchType':'partial','reviewDecisionId':source_id})
    decisions.append({'sourceGoalId':source_id,'decision':'mapped','canonicalGoalIds':[target],'matchType':'partial','rationale':'AUTHOR CANDIDATE ONLY: '+rationale,'reviewer':'codex-outside52-TH-source-author-v2-not-independent-reviewer','reviewedAt':stamp,'wholeOriginalSourceCoverage':False,'independentReviewStatus':'pending_two_independent_source_scope_reviews'})
    rows.append({'goalId':target,'sourceComponentId':source_id,'currentWholeCanonicalGoal':goal,'lostViewKey':'DE-TH/SekI/','authorDecision':'PROPOSE_BOUNDED_COMPONENT','primaryOriginalParents':parents,'canonicalOperationalisationNotOriginal':not_literal,'rationale':rationale,'nativeVisibilityRestored':False,'scientificIndependentApproval':False})
holds = [{'goalId':id,'currentWholeCanonicalGoal':by_id[id],'lostViewKey':'DE-TH/SekI/','authorDecision':'HOLD_FULL_CURRENT_CANONICAL_CLAIM_NOT_BOUND_BY_THIS_PRIMARY_SUBPACKAGE','reason':hold_reasons[id],'nativeVisibilityRestored':False,'scientificIndependentApproval':False} for id in sorted(hold_reasons)]
extraction = {'schemaVersion':1,'sourceLandscapeId':original_source['sourceLandscapeId'],'extractionId':'th-biology-2024-outside52-nineteen-bounded-components-author-v2','title':'TH7/8 Menschenbiologie:19 bounded outside-neuro source component candidates',
 'jurisdiction':'DE-TH','subject':'Biologie','schoolType':'Gymnasium','stage':'SekI','sourceDocument':document,'sourceDocuments':[document],
 'passages':[{'id':g['passageId'],'stage':'SekI','sourceDocumentKey':document['key'],'sourceText':g['sourceText'],'rawSourceText':g['rawSourceText'],'physicalPage':g['physicalPage'],'printedPage':g['printedPage']} for g in source_goals],
 'sourceGoals':source_goals,'retainedOriginalSourceObligations':{'originalSummaryRecord':original['originalSourceGoalRecord'],'originalWholeHoldDecision':original['currentCandidateDecision'],'wholeOriginalSummaryCoverage':False,'residualHoldGoalIds':sorted(hold_reasons),'originalWholeDecisionsNotReopened':True},
 'qualityReview':{'status':'author_candidate_awaiting_two_independent_reviews','wholeNationalClearance':False,'humanApproval':False,'humanTrial':False},
 'method':'Actual unchanged original PDF table rows and grade qualifier personally read; no extraction description copied as an official bullet. Every component is a direct explicit source binding, not inherited cluster evidence. Additional operationalisation fields are declared, residual source and canonical scope holds remain.'}
extraction_relative = str((own/'TH.nineteen-source-components.author-v2.candidate.json').relative_to(root))
mapping = {'schemaVersion':1,'sourceLandscapeId':original_source['sourceLandscapeId'],'targetLandscapeId':canonical['landscapeId'],'jurisdiction':'DE-TH','subject':'Biologie','sourceExtractionPath':extraction_relative,'reviewStatus':'author_candidate_awaiting_two_independent_reviews','mappings':mappings,'decisions':decisions,'wholeOriginalSourceCoverage':False,'originalWholeSourceHoldRetained':True,'humanApproval':False,'humanTrial':False}
write('TH.nineteen-source-components.author-v2.candidate.json',extraction)
write('TH.nineteen-component-mappings.author-v2.candidate.json',mapping)
write('TH.forty-three-current-goal-primary-scope.decisions.author-v2.json',{'schemaVersion':1,'createdAtUTC':stamp,'role':'source AUTHOR, not independent reviewer','primaryDocument':bind(pdf),'sourceOriginalsPersonallyRead':True,'actualNativeAndRenderedPagesRead':[22,23,24],'additionalOriginalQualifierAndConceptPagesRead':[15,16,19,20],'componentCandidates':rows,'openCurrentGoalScopeHolds':holds,'counts':{'THLostPairs':43,'proposedBoundedComponentPairs':19,'remainingTHPairsHeld':24,'remainingOtherJurisdictionPairsUnprocessed':144,'allHistoricalPairs':187,'allHistoricalDistinctOutsideIDs':52},'originalSummaryAndAllOtherSourceObligationsRemainHeld':True,'activeWrites':False,'newScientificCompletions':0,'restoredActiveBindings':0,'strictNetGain':0,'humanApproval':False,'humanTrial':False})
write('current-canon-and-source-author-input-preservation.json',{'schemaVersion':1,'createdAtUTC':stamp,'currentCanonical':bind(canonical_path),'currentCanonicalWholeGoalSnapshot':canonical,'canonicalNodeCount':len(canonical['goals']),'currentKindLedger':bind(root/'curricula/DE/Gymnasium/quality/goal-book-publication/biologie.semantic-kinds.json'),'worklist':bind(worklist/'outside52.actual-source-debt-and-view-worklist.json'),'originalSource':bind(original_source_path),'primaryDocument':bind(pdf),'historicalWorklist383IsNotCurrent390':True,'actualPrimaryExternalFetch':'official portal URL fetch returned restricted; actual existing exact local official PDF personally read','activeWrites':False,'independentApprovalsCreated':0})
print(json.dumps({'authorTHComponentCandidates':19,'THIndividuallyExplainedHolds':24,'currentCanonicalNodes':len(canonical['goals']),'fullSourceCoverage':False,'activeWrites':False}))
