from pathlib import Path
import json, hashlib, datetime, math, csv, subprocess
from bs4 import BeautifulSoup
ROOT=Path('/home/enpasos/projects/skillpilot')
OUT=Path(__file__).parent
SRC=ROOT/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/chemie-b008-current517-normal32-annotation-materialized-native-context-author-20261010-v1'
NOW=datetime.datetime.now(datetime.timezone.utc).isoformat()
def read(p):return json.loads(p.read_text())
def sha(p):return 'sha256:'+hashlib.sha256(p.read_bytes()).hexdigest()
def bind(p):return {'path':str(p.relative_to(ROOT)),'sha256':sha(p),'bytes':p.stat().st_size}
def write(p,a):p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(a,ensure_ascii=False,indent=2)+'\n');read(p)

source=read(SRC/'source/seven-original-primary-obligations-current-targets.author.json')
primary=read(ROOT/'curricula/DE/Gymnasium/input/BY/gymnasium/source-extraction/DE_BY_CHEMIE_GYMNASIUM_LEHRPLANPLUS.source-extraction.json')
source_by_id={g['id']:g for g in primary['sourceGoals']}
mapping_path=read(SRC/'author-normal-annotations-native-context.final.entry.json')['currentSourceReviewInputs']['SOURCE7MappingProposal']['path']
mapping=read(ROOT/mapping_path)
SOURCE_REASON=[
 ('Modellmerkmale und tatsächliche modellgestützte Erklärung von Materie und Reaktionen sind im unteren Leaf enthalten. Die zusätzlichen Hypothesen- und Kritikoperatoren des breiteren kanonischen Ziels werden nicht allein aus dieser Quelle abgeleitet.', 'C8.1.6 / C9-HG_SG_MUG_WWG_SWG.1.6', 'https://www.lehrplanplus.bayern.de/fachlehrplan/gymnasium/8/chemie'),
 ('Die Bewertung der Eignung, Aussagekraft und Grenzen sowie begründeter Entwicklungsbedarf sind im Vergleich von Modellen und Beobachtungen erkennbar. Entwicklung begründen bedeutet nicht, ein bereits neues Modell gebaut zu haben.', 'C8.1.7', 'https://www.lehrplanplus.bayern.de/fachlehrplan/gymnasium/8/chemie'),
 ('Vergleich mit Beobachtungen trägt die geforderte Beziehung zur stofflichen Wirklichkeit; der Leaf bewertet Modelle und ersetzt Beobachtung nicht durch ein Bildschirmbild. Originale Partner bleiben Bestandteil der Quellenroute.', 'C9-HG_SG_MUG_WWG_SWG.1.7', 'https://www.lehrplanplus.bayern.de/fachlehrplan/gymnasium/9/chemie/ch'),
 ('Alle ursprünglichen Materie-, Reaktions-, Bindungs- und Wechselwirkungsbeiträge sowie Modellkritik bleiben im unteren Leaf erhalten. Das analoge ODER digitale Verfahren ist für den allgemeinen Operator zulässig; besondere Softwarepflichten in weiteren Quellenkontexten bleiben davon unabhängig.', 'C9-NTG.1.6', 'https://www.lehrplanplus.bayern.de/fachlehrplan/gymnasium/9/chemie/ch-ntg'),
 ('Feinbau ist ein verbindlicher Inhaltsbezug dieser Quelle. Der allgemeine Modell-Leaf liefert Vergleich und Grenzenprüfung im beibehaltenen LB2-Kontext; Kern-Hülle-, Energiestufen- und PSE-Partner liefern die konkreten atomaren Gegenstände. Reines PSE-Ablesen schließt den Vergleichsoperator nicht. Die bisherigen Salz-/Wasser-P-Fälle allein sind kein Nachweis der vollständigen C9-NTG.2.4-Praxis; diese SOURCE-Entscheidung bindet die semantische Route und behauptet keinen Quellenkursabschluss.', 'C9-NTG.2.4', 'https://www.lehrplanplus.bayern.de/fachlehrplan/gymnasium/9/chemie/ch-ntg'),
 ('Reale Modellnutzung zu Stoffeigenschaften und Reaktionsverhalten ist im aktuellen Leaf vorhanden. Die im ganzen LB1 genannte Molekülmodellierungssoftware bleibt als eigene Quellenpflicht erhalten; analoge Ladungskarten werden nicht als absolvierte Softwarearbeit ausgegeben.', 'C10-HG_SG_MUG_WWG_SWG.1.6', 'https://www.lehrplanplus.bayern.de/fachlehrplan/gymnasium/10/chemie/ch'),
 ('Der obere Leaf enthält eine begründete Prüfung von Aussagekraft, Grenzen und Weiterentwicklung und repräsentiert damit den E9-Operator. Die im Gesamtziel zusätzlich verlangten komplexen Moleküle, analogen UND digitalen Produkte und eigenen Untersuchungen werden nicht aus diesem kurzen E9-Operator allein abgeleitet oder dadurch erfüllt.', 'C12-GA.1.13; retained C12-EA/C13-GA/C13-EA occurrences', 'https://www.lehrplanplus.bayern.de/fachlehrplan/gymnasium/12/chemie/grundlegend')
]
source_rows=[]
for x,(reason,span,url) in zip(source['rows'],SOURCE_REASON):
    old=source_by_id[x['sourceGoalId']]
    assert old['description']==x['sourceRecord']['description']
    assert x['afterMapping'] in mapping['mappings']
    partners=x['originalDecision']['canonicalGoalIds']
    actual=[m['canonicalGoalId'] for m in mapping['mappings'] if m.get('legacyGoalId')==x['sourceGoalId']]
    assert set(partners).issubset(actual)
    source_rows.append({'sourceGoalId':x['sourceGoalId'],'canonicalGoalId':x['afterMapping']['canonicalGoalId'],'decision':'approve_bounded_source_obligation_mapping','proposedMatchType':'exact','sourceSpan':span,'primaryOfficialURL':url,'fullOriginalOperatorsAndContextChecked':True,'allOriginalPartnerIDsRetained':partners,'reasonDe':reason,'wholeCanonicalTargetOrCourseCoverageClaim':False,'sourceMasteryClaim':False,'humanApproval':False})
write(OUT/'SOURCE7.first.independent-b.json',{'schemaVersion':1,'createdAt':NOW,'reviewerRole':'genuine independent B','rows':source_rows,'decisionBoundary':'Source-to-target obligation coverage in retained stage/content context, not source exhaustion of the broader canonical goal, course completion, human approval or practical learner performance.','sourceMapping':bind(ROOT/mapping_path),'sourceExtraction':bind(ROOT/'curricula/DE/Gymnasium/input/BY/gymnasium/source-extraction/DE_BY_CHEMIE_GYMNASIUM_LEHRPLANPLUS.source-extraction.json'),'actualLivePrimaryPagesInspected':True,'unchangedHistoricalMappingsNotNewlyPrimaryReviewed':True,'C11GKOrLKAssignment':False,'atlas20OmissionsCleared':0,'atlas496UnresolvedCleared':0})

ann=read(SRC/'rationale/all37-deterministic-normal-annotation-source-contexts.author.json')
whole=read(SRC/'candidate/whole517.normal32-materialized.author-candidate.json')
goals={g['id']:g for g in whole['goals']}
annrows=[]
for x in ann['normalChanged37']:
    g=goals[x['goalId']]; e=x['wholeNormalCompilerGoalEvidence']; ev=e['evidence']
    assert g==x['wholeAfterGoal']
    assert (g.get('applicability') or {})==e['compiledApplicability']
    assert set((g.get('applicability') or {}).get('jurisdiction',[]))=={v['value'] for v in ev}
    before=dict(x['wholeBeforeGoal']);after=dict(g);before.pop('applicability',None);after.pop('applicability',None);assert before==after
    for v in ev:
        if v['kind']=='requires-closure':
            dependent=v['source'].removeprefix('required by ')
            # Compiler expands a required cluster into each child and records
            # that immediate parent as sourceGoalId (lines 1256-1257).
            assert x['goalId'] in goals[dependent]['requires'] or x['goalId'] in goals[dependent].get('contains',[])
            assert v['value'] in goals[dependent].get('applicability',{}).get('jurisdiction',[])
        if v['kind']=='assessment-requires':
            req=v['source'].removeprefix('requires ')
            assert g.get('extendedData',{}).get('applicabilityFromRequires') is True
            assert req in g['requires']
            assert v['value'] in goals[req].get('applicability',{}).get('jurisdiction',[])
        if v['kind']=='child-union':
            assert any(v['value'] in goals[c].get('applicability',{}).get('jurisdiction',[]) for c in g['contains'])
    kinds=sorted({v['kind'] for v in ev})
    if g['id'].startswith('eed5eda3'):
        reason='Die ungeklärte C11-Kurszuordnung bleibt offen; leere normal-kompilierte Applicability erzeugt keine GK/LK-Zuweisung, SOURCE- oder P-Freigabe.'
    elif 'assessment-requires' in kinds:
        reason='Das lokale Bewertungsterminal bleibt exakt von der Schnittmenge seiner Voraussetzungen sichtbar. Alle Rubriken und Prüfungsinhalte sind eigene unveränderte Artefakte; die Annotation ist ausschließlich Sichtbarkeit.'
    elif g.get('contains'):
        reason='Die sichtbaren Kinder bestimmen den Jurisdiktionssatz des Clusters. Entfernte alte breite Elternannotation wird nicht wieder als vollständiger Beleg für neue atomare Unterziele vererbt.'
    elif g['id'].startswith(('6c7ce93c','86d34f1f')):
        reason='Die aktuelle BY-Route ist durch direkte SOURCE7-Beiträge im begrenzten Kontext gestützt; die Boundary verhindert die alte nationale Vererbung. E9 bzw. allgemeine Modellnutzung beweisen nicht alle Inhalte oder Leistungen des breiteren Leafs.'
    elif g['id'].startswith(('f4d5a02d','2fdd759f')):
        reason='Der entfernte alte Jurisdiktionswert ist ohne aktuelle Mapping-/Provenienz-/Voraussetzungsevidenz. Die verbleibende Sichtbarkeit ändert weder den wissenschaftlichen Text noch dessen praktische und fachliche Leistungsgrenzen.'
    else:
        reason='Direkte Mapping-/Provenienzbeiträge und gerichteter Voraussetzungsschluss tragen genau die aktuelle Sichtbarkeit. Partial bleibt ein Teilbeitrag; Voraussetzungssichtbarkeit ist keine ganze Primärquellen- oder neue Kursfreigabe.'
    annrows.append({'goalId':g['id'],'title':g['title'],'before':x['before'],'after':x['after'],'kinds':kinds,'decision':'approve_scoped_normal_materialization','reasonDe':reason,'allOtherGoalFieldsExact':True,'sourceExhaustionClaim':False,'courseAssignmentClaim':False,'evidence':ev})
assert len(annrows)==37
write(OUT/'normal37.first.independent-b.json',{'schemaVersion':1,'rows':annrows,'all37Reviewed':True,'onlyApplicabilityChanged':True,'normalCompilerSemanticsInspected':['boundary','child-union','partial-mapping','requires-closure','assessment-requires'],'originalCompilerCode':bind(ROOT/'app/scripts/applicabilityCompiler.ts'),'originalMaterializerCode':bind(ROOT/'app/scripts/applyApplicability.ts'),'softwareAndPracticalPartnerObligationsPreserved':True,'C11HOLDUnchanged':True,'humanApproval':False})

profiles=read(SRC/'positive/three-whole-scientific-profile-bodies-neutral.author.json')
native=read(SRC/'native/affected7-2/round-b/description-review-input.json')
native_by_id={g['goalId']:g for g in native['goals']}
full=read(SRC/'native/current398.full-normal-context-capture.author.json');full_by_id={g['goalId']:g for g in full['goals']}
orientation=profiles['orientationWholeCurrentGoal']
assert not orientation.get('contains') and orientation['id']=='a9c22adc-b543-5b0c-a2d8-3189facdff08'
rows=[]
for x in profiles['rows'][:2]:
    g=x['wholeCurrentGoal'];gid=g['id'];body=x['wholeOriginalScientificProfileBody']
    assert body==native_by_id[gid]['reviewContext']['evidenceProfile']['profile']
    assert body==full_by_id[gid]['reviewContext']['evidenceProfile']['profile']
    assert orientation['id'] in goals[gid]['requires']
    if gid.startswith('1f354a60'):
        reason='Der neue direkte Orientierungsweg motiviert die Teilnahme, verlangt aber keine fachliche Prüfung. Fachsprache bleibt vorausgesetzt. Beide vollständigen wissenschaftlichen Fälle unterscheiden Geschwindigkeit/Gleichgewicht und Temperatur/Ionenkonzentration, verlangen reale Partnerbeiträge und ausdrückliche eigene Standpunktprüfung. Synthetische Dialogkarten oder Musterantworten ersetzen den Austausch nicht; Kontrollbedingungen und Kalibriergrenzen bleiben erhalten.'
    else:
        reason='Der zusätzliche direkte Orientierungsweg ersetzt keine Modellkompetenz des unteren Leafs. Der vollständige obere P-Body fordert tatsächlich analoge UND digitale Produkte sowie Atombau/Periodizität, Gleichgewicht, Bindung/Geometrie, komplexe Molekülkontakte, Rezeptor und Enzym. Die finite 28-Atom-Anordnung und digitalen Tabellen sind durchführbare Modellarbeit, keine Laborleistung. Gleichgewichtslage ist keine Kinetik, Posekontakt kein Kd und Belegung keine Wirkung. Eigenes Produkt und begründete Grenzen bleiben zwingend.'
    rows.append({'goalId':gid,'decision':'approve_current_route_context_rebinding','wholeScientificBodyRead':True,'bodyExactToCurrentNativeAndWhole398Contexts':True,'contextChangedByDirectOrientationOnly':True,'nativeGoalFingerprint':native_by_id[gid]['goalFingerprint'],'nativePageFingerprint':native_by_id[gid]['pageFingerprint'],'whole398GoalFingerprint':full_by_id[gid]['goalFingerprint'],'whole398PageFingerprint':full_by_id[gid]['pageFingerprint'],'reasonDe':reason,'profileRemains':'needs_human_review','reviewAuthority':'ai_candidate','E1':True,'G1':True,'approved':0,'humanApproval':False,'actualLearnerPerformance':False,'wholeScientificProfileBody':body})
write(OUT/'P2.first.independent-b.json',{'schemaVersion':1,'createdAt':NOW,'rows':rows,'newScientificBodyEdits':0,'unchanged36PNotRepeated':True,'orientationIsMotivationNotContentMastery':True,'C11CourseHOLDPreserved':True,'finiteMaterialsActuallyRead':[bind(ROOT/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/chemie-b008-current-nineteen-whole-positive-author-v1/remediation-v2/FINITE-LIGAND-POSE-KIT.de-en.md'),bind(ROOT/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/chemie-b008-current-nineteen-whole-positive-author-v1/remediation-v2/finite-L2-extra-OH-transfer-layout.author-candidate.json')]})

inspection=[]
for group in ['affected20-1','affected7-2']:
    inp=read(SRC/'native'/group/'round-b/description-review-input.json')
    soup=BeautifulSoup((SRC/'native'/group/'bundle/book.html').read_text(),'html.parser')
    text=(OUT/'inspection'/group/'wholePDF.txt').read_text()
    for g in inp['goals']:
        node=soup.find(id='goal-'+g['goalId']);assert node
        assert g['currentDescriptionDe'] in node.get_text(' ',strip=True)
        assert g['goalId'] in text
        inspection.append({'goalId':g['goalId'],'group':group,'logicalGoalPage':g['reviewContext']['page']['pageNumber'],'physicalPDFPage':g['reviewContext']['page']['pageNumber']+2,'wholeHTMLRead':True,'wholePDFVisualInspected':True,'DEENCurrentTextRead':True,'directPrerequisitesAndSuccessorsRead':True,'visualUse':'context only; unchanged V approvals not repeated','clippingObserved':False})
write(OUT/'native27.actual-inspection.independent-b.json',{'schemaVersion':1,'rows':inspection,'total':27,'coverAndContentsAlsoRead':True,'individualPage11CheckedAtOriginalResolution':True,'bookBindings':[bind(SRC/'native'/g/'bundle'/n) for g in ['affected20-1','affected7-2'] for n in ['book.html','book.pdf']]})

freeze=read(SRC/'author-normal-annotations-native-context.final.freeze.json')
for sec in ['ownRegularArtifacts','stableNeutralInheritedBindings']:
    for x in freeze[sec]:assert sha(ROOT/x['path'])==x['sha256']
protected=read(SRC/'checks/protected180-annotation-deltas-zero-and-inherited-five-route-bindings.actual.json')
assert len(protected['protectedActiveStrictIDs'])==180
assert not set(protected['protectedActiveStrictIDs'])&{x['goalId'] for x in annrows}
write(OUT/'inputs-and-boundaries.actual.independent-b.json',{'schemaVersion':1,'entry':bind(SRC/'author-normal-annotations-native-context.final.entry.json'),'freeze':bind(SRC/'author-normal-annotations-native-context.final.freeze.json'),'frozenArtifactsVerified':sum(len(freeze[s]) for s in ['ownRegularArtifacts','stableNeutralInheritedBindings']),'allExact':True,'whole517Count':len(goals),'whole398Count':len(full['goals']),'protected180AnnotationIntersection':[],'unchanged13D36P38V':'Exact frozen history retained; no new scientific review claimed for unchanged history','exam23':'Frozen whole exam/rubric/release evidence retained; no new exam-science approval','atlas20And496':'Frozen omissions/unresolved source scope remain HOLD; no clearance created','Math807Phys478':'Protected and untouched by this namespace; active coverage not regenerated or increased','softwareOrPracticalShortcut':False,'activeWrites':[],'gitOrGithubWrites':[],'preciseRuntimeRevision':'not exposed','reviewerAgent':'/root/chemistry_current517_source7_d27_genuine_b','authorAndPeerFindingsReadBeforeFirstSeal':False})

# FIRST is immutable scientific output; later serialization/check receipts are additive.
products=['D27.first.independent-b.json','SOURCE7.first.independent-b.json','normal37.first.independent-b.json','P2.first.independent-b.json','native27.actual-inspection.independent-b.json','inputs-and-boundaries.actual.independent-b.json','normal-campaigns.independent-b.json']
entry={'schemaVersion':1,'createdAt':NOW,'role':'Genuine independent reviewer B FIRST, sealed before comparison','artifacts':[bind(OUT/n) for n in products],'normalRecordArtifacts':[x for c in read(OUT/'normal-campaigns.independent-b.json')['campaigns'] for x in [c['records'],c['run'],c['campaign'],c['input'],c['bundle']]],'D27':'27 keep candidates; six own bilingual fields per target','SOURCE7':'7 bounded directional source-obligation mappings reviewed; no whole-course or practical acceptance','normal37':'37 scoped materializations reviewed','P2':'2 full-body/current-route reviews; E1G1 needs_human_review ai_candidate approved0','humanApproval':False,'learnerPerformanceClaim':False,'noActiveM7Gain':True,'activeWrites':[],'gitOrGithubWrites':[],'firstSealedBeforePeerComparison':True}
write(OUT/'FIRST.independent-b.entry.json',entry)
write(OUT/'FIRST.independent-b.freeze.json',{'schemaVersion':1,'createdAt':NOW,'entry':bind(OUT/'FIRST.independent-b.entry.json'),'allScientificArtifacts':entry['artifacts']+entry['normalRecordArtifacts'],'appendOnlyAfterThisSeal':True,'blindBeforeSealing':True})
print(json.dumps({'FIRST':bind(OUT/'FIRST.independent-b.entry.json'),'freeze':bind(OUT/'FIRST.independent-b.freeze.json')},ensure_ascii=False))
