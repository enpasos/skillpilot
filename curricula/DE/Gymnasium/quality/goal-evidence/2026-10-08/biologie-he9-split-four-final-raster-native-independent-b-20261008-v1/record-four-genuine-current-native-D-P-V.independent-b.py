import hashlib
import json
import pathlib
import re
import subprocess
from datetime import datetime, timezone

ROOT = pathlib.Path.cwd()
OWN = pathlib.Path(__file__).resolve().parent
AUTHOR = OWN.parent / 'biologie-he9-split-four-final-raster-native-author-technical-20261008-v1'
SCIENCE = OWN.parent / 'biologie-he9-contraception-parenthood-split-whole-science-independent-b-20261008-v1'
CHILD_AUTHOR = OWN.parent / 'biologie-he9-contraception-parenthood-scope-preserving-split-author-20261008-v1'
COMP_AUTHOR = OWN.parent / 'biologie-he9-nineteen-targeted-alternatives-and-materials-author-root-v2'
OLD_NATIVE = OWN.parent / 'biologie-he9-eighteen-final-raster-native-independent-b-20261008-v1'
OLD = '3ee4b55c-81c3-5826-9d26-1a8c22cbd0b8'
CHILDREN = ['9d3f71d7-5273-5e50-b1ba-4e291edbf114','dd923eeb-eef0-5796-b372-a5d4f5be21f7']
COMPANIONS = ['249f4c5d-fd23-57c7-ac62-773d62c33b49','4b7fdc2c-9dbe-5439-8d84-295abc240eec']
RUN_ID = OWN.name

def read(p): return json.loads(p.read_text())
def rows(p): return [json.loads(s) for s in p.read_text().splitlines() if s.strip()]
def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()
def rel(p): return str(p.relative_to(ROOT))
def bind(p): return {'path':rel(p),'sha256':sha(p),'bytes':p.stat().st_size}
def write(p,d):
    p.parent.mkdir(parents=True,exist_ok=True)
    with p.open('x') as f:f.write(json.dumps(d,ensure_ascii=False,indent=2)+'\n')
def no_image(g): return {k:v for k,v in g.items() if k!='resourceLinks'}
def norm(s): return re.sub(r'[\s\-\u00ad\u2010\u2011]+','',s)
def verify_seal(p,expected):
    assert sha(p)==expected
    for item in read(p)['frozenFiles']:
        assert bind(ROOT/item['path'])==item
    return len(read(p)['frozenFiles'])

started=datetime.now(timezone.utc).isoformat()
author_seal=AUTHOR/'current-four-raster-native-author-input.first.freeze.json'
provenance_seal=AUTHOR/'exact-original-raster-source-provenance.append-only.freeze.json'
assert verify_seal(author_seal,'eabe2f79c398c86a0c6ef3ff134e16009f9d2e82f251593295162cd2dfb710da')==203
assert verify_seal(provenance_seal,'586c8f02b8f00ce7288da5d6972e9aabb042e90ba95396918cd5b5893d3ff9bc')==14
own_science_seal=SCIENCE/'two-child-whole-science-source-class-AM.independent-b.first.freeze.json'
assert verify_seal(own_science_seal,'3c4ad7b90820d0998576b7515b108fd579f41d4ba344876529764a3e70fda744')==9
own_old_native_seal=OLD_NATIVE/'completed-HE18-D17-HOLD19-P18-V18.independent-b.first.freeze.json'
assert verify_seal(own_old_native_seal,'34985105403d009f29e4b9360c5ff135c064f01d22998724fec03d2d20caf579')==15
entry=read(AUTHOR/'neutral-current-four-raster-native-author-review.entry.json')
art=entry['operativeArtifacts']
candidate=read(ROOT/art['currentWholeCanonical'])
live_path=ROOT/entry['actualBaseline']['canonical']['path']
assert sha(live_path)=='d524850cf83cdb70b3b1105c1bac5b93b08e42272893320392f160f52a4e35d5'
before=read(AUTHOR/'before'/entry['actualBaseline']['canonical']['path'])
assert read(live_path)==before
before_map={g['id']:g for g in before['goals']}; after_map={g['id']:g for g in candidate['goals']}
assert len(before_map)==474 and len(after_map)==476
assert sorted(set(after_map)-set(before_map))==sorted(CHILDREN)
assert all(g==after_map[g['id']] for g in before['goals'] if g['id']!=OLD)
changed_parent=[k for k in sorted(set(before_map[OLD])|set(after_map[OLD])) if before_map[OLD].get(k)!=after_map[OLD].get(k)]
assert changed_parent==['contains','type','weight']
assert after_map[OLD]['contains']==CHILDREN and after_map[OLD]['type']=='cluster' and after_map[OLD]['weight']==2
original_children=read(CHILD_AUTHOR/'whole-stable-cluster-and-two-child-goals.author.json')['proposedTwoWholeAtomicChildren']
for goal in original_children:assert no_image(goal)==no_image(after_map[goal['id']])
for gid in COMPANIONS:assert before_map[gid]==after_map[gid]
whole_goals=read(ROOT/art['wholeFourDEENGoals'])['goals']
for g in whole_goals:assert g==after_map[g['id']]
cases=read(ROOT/art['wholeEightDEENCases'])['goals']
child_cases=read(CHILD_AUTHOR/'two-child-four-complete-DEEN-cases.author.json')['goals']
comp_cases=read(COMP_AUTHOR/'nineteen-whole-goals-forty-two-complete-DEEN-cases.author.json')['goals']
child_profiles=read(CHILD_AUTHOR/'P2.whole-child-scope.author.candidates.json')['goals']
comp_profiles=read(COMP_AUTHOR/'P19.targeted-or-and-materials-closed-contract.author.candidates.json')['goals']
positive=rows(ROOT/art['nativeP4ActualRasterBindings']); pmap={p['goalId']:p for p in positive}
assert len(positive)==4
for goal_cases in cases:
    gid=goal_cases['goalId']; originals=child_cases if gid in CHILDREN else comp_cases
    assert goal_cases==next(g for g in originals if g['goalId']==gid)
    original_profiles=child_profiles if gid in CHILDREN else comp_profiles
    assert pmap[gid]['profile']==next(p for p in original_profiles if p['goalId']==gid)['profile']
    assert len(goal_cases['cases'])==2
    for case in goal_cases['cases']:
        brief=next(c for c in pmap[gid]['profile']['applicationCaseBriefs'] if c['id']==case['id'])
        for lang,suffix in [('de','De'),('en','En')]:
            assert brief['taskDemand'+suffix]==case['material'][lang]+' '+case['task'][lang]
            assert brief['expectedPerformance'+suffix]==case['modelAnswer'][lang]

campaign_dir=ROOT/art['firstPassB']
input_=read(campaign_dir/'description-review-input.json')
campaign=read(campaign_dir/'description-review-campaign.json')
bundle=read(campaign_dir/'review-bundle-manifest.json')
assert input_['goalCount']==campaign['goalCount']==campaign['batchSize']==4
ids=[g['goalId'] for g in input_['goals']]
assert ids==[COMPANIONS[0],*CHILDREN,COMPANIONS[1]]
images=read(ROOT/art['actualPNGs'])['images']; imap={i['goalId']:i for i in images}
full_before=read(ROOT/art['actualFull391Before']); full_after=read(ROOT/art['actualFull392After'])
assert len(full_before['pages'])==391 and len(full_after['pages'])==392
fmap={p['goalId']:p for p in full_after['pages']}
parent_before_page=next(p for p in full_before['pages'] if p['goalId']==OLD)
for gid in CHILDREN:assert fmap[gid]['applicability']==parent_before_page['applicability']
impact=read(ROOT/art['nativeCurrentPageImpact'])
assert impact['currentStrictBefore']==202 and impact['retainedWholePages']==390
assert sorted(impact['trueChangedRelationContextGoalIds'])==sorted(COMPANIONS)
assert impact['positionOnly']==127 and impact['unchangedFingerprints']==261
position_proof=read(ROOT/art['originalPositionOnlyResolutionProof'])
assert position_proof['baselineStrict']==202 and position_proof['wholeCurrentBodiesExact']==81
assert position_proof['allCurrentSameNativeSubsetPageContextsBeforeVsAfterSplitExact'] is True
assert position_proof['actualSubsetContextChangedGoalIds']==[]
assert sorted(position_proof['originalHistoricalSubsetContextDifferencesNotClaimedAsNewSplitDefects'])==sorted(['0daa79f6-8f61-5506-98f9-65db83062ba8','e70d8a85-2dea-5165-919b-200fee9f4db4'])
for item in position_proof['exactOriginalDInputsAssetsAndResolutionDependencies']:assert bind(ROOT/item['path'])==item
for name in ['semantic-atomicity','memory-card-review']:
    old_config=read(AUTHOR/'before/curricula/DE/Gymnasium/quality'/name/'canonical-biology-full.config.json')
    old_rows={p['goalId']:p for p in rows(AUTHOR/'before'/old_config['reviewPath'])}
    new_name='A.current-full-reviewed.current-baseline.inactive.jsonl' if name=='semantic-atomicity' else 'M.current-full-reviewed.current-baseline.inactive.jsonl'
    new_rows={p['goalId']:p for p in rows(AUTHOR/'candidate'/new_name)}
    assert len(old_rows)==391 and len(new_rows)==392
    assert all(p==new_rows[gid] for gid,p in old_rows.items() if gid!=OLD)
    for gid in CHILDREN+COMPANIONS:
        assert new_rows[gid]['status']==('atomic' if name=='semantic-atomicity' else 'no_memory_needed')
source=read(ROOT/art['wholeOriginalPhysicalSourcePages'])
assert source['officialPDFSha256']=='93257f9be96e9bd288d187eb63e3e33ca28debdb2511dcd068e9abf82bc5b5f1'
assert [p['physicalPage'] for p in source['operativeCompletePhysicalPages']]==[25,26]
for page in source['operativeCompletePhysicalPages']:
    assert bind(ROOT/page['wholeOriginalPage']['path'])==page['wholeOriginalPage'] and page['exitCode']==0
for check in entry['actualAffectedTerminalChecks']:
    assert bind(ROOT/check['terminal']['path'])==check['terminal']
    assert read(ROOT/check['terminal']['path'])['exitCode']==check['actualExitCode']==0

pdf=ROOT/art['actualCommittableNativePDF']
argv=['pdftotext','-layout',str(pdf),'-']; actual=subprocess.run(argv,capture_output=True,text=True)
assert actual.returncode==0
with (OWN/'actual-whole-six-page-native-PDF.independent-b.txt').open('x') as f:f.write(actual.stdout)
assert len(actual.stdout.split('\f'))-1==6
science_reasons={
 CHILDREN[0]:'Die unveränderte eigene ganze Science-B-Prüfung beurteilt zwei echte synthetische Methodenfälle: korrekte Kondombarriere und kombinierte Pille mit hauptsächlich Ovulationshemmung, getrennte Schwangerschafts-/Infektionsschutzziele, angemessene Anwendung und belegte Informationsgrenzen. Keine persönliche Eignung, numerische Rangfolge, absolute Sicherheit oder tatsächliche Nutzung wird behauptet. Der kurze neue DE/EN-Text enthält exakt die bisherige Beurteilungsklausel; körperliche Hormongrundlagen bleiben dieselbe Voraussetzung.',
 CHILDREN[1]:'Die unveränderte eigene ganze Science-B-Prüfung erhält die Reflexionsklausel als eigenes Ziel. Ganze neue Fälle prüfen Kindeswohl, reale Planung, Gesundheit, Zeit, Zuwendung und Unterstützung: Wohlstand allein beweist keine Verantwortung, ungeplante Schwangerschaft schließt verantwortliche Fürsorge nicht aus, biologische Rollen bestimmen keine alleinige Betreuungszuständigkeit. Beide sprachgleichen Fälle erlauben unterschiedliche Familienformen, Selbstbestimmung, offene Fragen und Privatsphäre. Methodenauswahl wird nicht mehr als unabhängige Pflicht dieses Kindes versteckt.',
 COMPANIONS[0]:'Die gültige vorherige ganze D/P-Wissenschaft bleibt exakt erhalten: hormonale Signale wirken an passenden Zielgeweben, FSH/Follikel/Estradiol, LH/Ovulation und Gelbkörper/Progesteron bilden ein vereinfachtes Zusammenwirken; Pubertäts- und Zykluszeiten sind individuell verschieden, keine Diagnose oder sicherer persönlicher Kalender. Neu zu prüfen ist der wirkliche Nachfolgerkontext: beide klar getrennten Kinder benötigen dieselbe vorhandene Hormongrundlage; der erhaltene Parenttitel und übrige Vorgaben erweitern die Beschreibung nicht.',
 COMPANIONS[1]:'Die gültige vorherige ganze D/P-Wissenschaft bleibt exakt erhalten: freiwillige aktuelle Zustimmung, Grenzen, Würde, soziale Erwartungen, respektvolle Kommunikation, Privatheit und Verantwortung werden argumentativ getrennt; frühere Zustimmung ist keine dauerhafte Zusage und Biologie liefert keinen Verhaltenszwang. Die unveränderten zwei ganzen Fälle verlangen keine persönliche Offenlegung. Der neue tatsächliche Kontext bindet dieselbe stabile Parent-ID nun als Aggregat der zwei Kinder; die Voraussetzung und der soziale/ethische Diskussionsumfang bleiben unverändert.'}
visual_reasons={
 CHILDREN[0]:'Tatsächlich angesehenes Original-PNG und Chromium360/680 zeigen korrekt geschriebene große Überschriften Verhütung, Kondom und Pille, eine plausible Kondombarriere mit gerolltem Rand/Reservoir und einen generischen Tablettenblister. Fragezeichen und Gespräch zeigen Kriterienvergleich, keine pauschale Methodenüberlegenheit. Die gezeichnete Blisterzahl ist kein behaupteter Einnahmeplan. Es gibt keine Schutzquote oder Pille-als-Infektionsschutz-Behauptung. Bei360 sind beide Methoden und das Gespräch erkennbar; kleinere Hintergrundwörter sind dekorativ und keine Pflichtlektüre. Auf den Papieren stehen nur nicht richtungsgebundene Linien, kein falsch ausgerichteter lesepflichtiger Hefttext. Die Hände und Gesprächsperspektive sind plausibel.',
 CHILDREN[1]:'Tatsächlich angesehenes Original-PNG und Chromium360/680 zeigen zwei Erwachsene, die einem Kind auf Augenhöhe zugewandt sind, mit großen Symbolen für Zuwendung, Zeit und Unterstützung. Die helfende dritte Person ist als erreichbare Hilfe, nicht als vorgeschriebene Familienrolle, dargestellt. Das ist eine mögliche Familienszene; Bild und aktueller ganzer Vertrag behaupten weder verpflichtendes Geschlechterpaar noch Wohlstands-, Wohnungs- oder Einkommensregel. Verantwortung ist bei360 lesbar, Kind/Zuwendung und alle drei Symbole klar; bei680 auch kleine dekorative Worte. Keine fachlich falsche Leistungs- oder Diagnoseaussage, keine problematische Heft-/Messperspektive.',
 COMPANIONS[0]:'Das gute vorhandene identische PNG bleibt KEEP. Tatsächlich erneut gesehen am Original,360/680 und neuer ganzer Seite: klarer großer Follikel, LH-Signal zum Eisprung und nachfolgender Gelbkörper. Zeitfolgepfeile trennen Stadien; es wird weder eine in demselben Moment stattfindende neue zweite Ovulation noch eine universelle Tageszahl behauptet. Alle drei großen Beschriftungen sowie Ovulationsmotiv bleiben bei360 erkennbar und bei680 klar. Das Bild ist ein begrenztes Zyklus-Lehrbeispiel und kein Beweis für die vollständige hormonale körperliche Reifung; diese ist korrekt in den ganzen P-Fällen vorhanden.',
 COMPANIONS[1]:'Das gute vorhandene identische PNG bleibt KEEP. Tatsächlich erneut gesehen am Original,360/680 und neuer ganzer Seite: zwei bekleidete Personen, deutliches Nein/Stoppsignal und respektvoller Abstand, ohne Drohung oder Zwang. Der zentrale Titel Grenzen respektieren und das Nein sind bei360 gut lesbar; kleinere Seitenschilder sind ergänzend, bei680 lesbar, keine Voraussetzung der Hauptaussage. Das Lehrbeispiel trägt Grenzen/Freiwilligkeit ohne eine bestimmte Partnerschaftsform als einzig richtige festzulegen. Persönliche Bildweitergabe/Privatheit werden im ganzen P-Transfer behandelt; das Motiv verlangt keine persönliche Offenlegung.'}
d_records=[];v_records=[];per_goal=[]
for i,g in enumerate(input_['goals'],1):
    gid=g['goalId'];goal=after_map[gid];p=pmap[gid];img=imap[gid];page=g['reviewContext']['page'];physical=i+2
    for key,suffix in [('title','Title'),('description','Description')]:
        assert g['current'+suffix+'De']==goal[key] and g['current'+suffix+'En']==goal[key+'En']
    assert g['goalFingerprint']==p['goalFingerprint'] and page['goalFingerprint']==g['goalFingerprint']
    assert g['pageFingerprint']==page['pageFingerprint']
    for key in ['requires','contains','applicability','dimensionTags','type','weight','shortKey','sourceRef']:
        assert g['canonicalContext'][key]==goal.get(key)
    assert page['applicability']==fmap[gid]['applicability']
    assert sorted(x['goalId'] for x in page['requires']+page['externalPrerequisites'])==sorted(goal['requires'])
    assert sorted(x['goalId'] for x in page['reverseRequires']+page['externalReverseRequires'])==sorted(x['id'] for x in candidate['goals'] if gid in x.get('requires',[]))
    for reference in page['requires']+page['externalPrerequisites']+page['reverseRequires']+page['externalReverseRequires']:
        assert reference['title']==after_map[reference['goalId']]['title']
    png=ROOT/img['path'];selected=ROOT/img['selectedPath'];assert sha(png)==sha(selected)==img['sha256']
    assert page['visualization']['originalDigest']=='sha256:'+img['sha256']
    assert page['visualization']['altText']==goal['resourceLinks'][0]['altText']
    widths_path=AUTHOR/'width-captures'/gid/'chromium-captures.actual.json';widths=read(widths_path)
    assert widths['sourceSha256']==img['sha256'] and [x['width'] for x in widths['captures']]==[360,680]
    caps=[]
    for cap in widths['captures']:
        target=AUTHOR/'width-captures'/gid/('actual-selected-'+str(cap['width'])+'px.png')
        assert sha(target)==cap['sha256'];caps.append(bind(target))
    capture=AUTHOR/'native-raster-candidate-v2/four/actual-physical-pages'/('actual-physical-page-'+str(physical)+'.png')
    text=actual.stdout.split('\f')[physical-1]
    assert norm(goal['title']) in norm(text) and norm(goal['description']) in norm(text) and text.count('Lernziel-ID '+gid)==1
    visual=visual_reasons[gid]+' Tatsächliche ganze native Seite'+str(physical)+' zeigt richtige UUID, vollständige Beschreibung und zum neuen Aggregat passende Voraussetzungen/Nachfolger ohne Beschnitt oder Bild-/Textwiderspruch. Geltung des reellen Quellen-/Atlasmodells ist exakt erhalten; Rohjurisdiktionen erzeugen keine neue bundesweite Quellenfreigabe.'
    v_records.append({'goalId':gid,'decision':'KEEP','fachlich':'PASS','visual':'PASS','actualReasonDe':visual,
        'goalFingerprint':g['goalFingerprint'],'pageFingerprint':g['pageFingerprint'],'bookDigest':input_['bookDigest'],
        'newImage':img['newImage'],'actualOriginalPNG':bind(png),'exactSelectedPNG':bind(selected),'actualWidthReceipt':bind(widths_path),
        'actualWidths':caps,'actualPDF':bind(pdf),'actualNativePage':bind(capture),'physicalPage':physical,
        'actualOriginalPrompt':bind(ROOT/img['promptPath']) if 'promptPath' in img else bind(ROOT/'curricula/DE/Gymnasium/visualizations/biologie'/gid/'prompt.de.md'),
        'actualGenerationProvenance':bind(ROOT/img['toolProvenancePath']) if 'toolProvenancePath' in img else bind(ROOT/'curricula/DE/Gymnasium/visualizations/biologie'/gid/'generation.provenance.json'),
        'formatDecision':'KEEP friendly clear comic1672x941 PNG,approximately16:9; actual360/680 motifs/text readable; no evidenced replacement need',
        'fullPNGActuallyViewed':True,'actual360680AndWholeNativePageActuallyViewed':True,'generationOrHashMatchingIsApproval':False,
        'fullAppOrRealDeviceAcceptanceClaim':False,'humanApproval':False})
    goal_cases=next(x for x in cases if x['goalId']==gid);exp=p['profile']['expectations']
    understanding={'essentialUnderstandingDe':' '.join(x['essentialUnderstandingDe'] for x in exp),'essentialUnderstandingEn':' '.join(x['essentialUnderstandingEn'] for x in exp),
        'observablePerformanceDe':goal_cases['cases'][0]['task']['de'],'observablePerformanceEn':goal_cases['cases'][0]['task']['en'],
        'transferExpectationDe':goal_cases['cases'][1]['task']['de'],'transferExpectationEn':goal_cases['cases'][1]['task']['en']}
    d_records.append({'$schema':'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-review-record.schema.json',
        'schemaVersion':1,'recordId':RUN_ID+'.'+gid,'runId':RUN_ID,'campaignId':campaign['campaignId'],'roundId':campaign['roundId'],
        'bundleFingerprint':input_['bundleFingerprint'],'bookDigest':input_['bookDigest'],
        **{k:g[k] for k in ['goalId','goalFingerprint','pageFingerprint','currentTitleDe','currentTitleEn','currentDescriptionDe','currentDescriptionEn']},
        'decision':'keep','understandingEvidence':understanding,
        'rationale':science_reasons[gid]+' '+visual+' Originale gültige ganze wissenschaftliche Prüfungen werden erhalten. Aktueller eigener Erstentscheid prüft neue konkrete Seiten-/Kontext-/Bild-/Quellenbindungen wirklich; Hashgleichheit allein verleiht keine Wissenschafts- oder Visualfreigabe. Keine aktuellen Peer-A-Finalurteile gelesen, keine menschliche Freigabe oder echte Lernendenleistung behauptet.',
        'evidenceProfileContract':'positive-understanding-evidence-v2','evidenceProfileRecommendation':'none','recordStatus':'candidate','reviewAuthority':'ai_candidate'})
    per_goal.append({'goalId':gid,'sourceRef':goal['sourceRef'],'wholeProvenance':goal['extendedData']['provenance'],
        'genuineUnchangedWholeScienceRetained':True,'wholeDEENCasesAndProfilesExact':True,'currentNativeGoalPageImageBindingsChecked':True,
        'canonicalPrerequisitesAndConsumersExact':True,'retainedClass':'curricularAtomic','retainedA':'atomic','retainedM':'no_memory_needed','newScientificAMDecision':False})
results=OWN/'round-b/results';results.mkdir(parents=True,exist_ok=True);batch=campaign['batches'][0];assert batch['goalIds']==ids
record_path=results/(batch['batchId']+'.records.jsonl')
with record_path.open('x') as f:
    for d in d_records:f.write(json.dumps(d,ensure_ascii=False,separators=(',',':'))+'\n')
write(results/(batch['batchId']+'.run.json'),{
    '$schema':'https://skillpilot.com/schemas/goal-evidence/v1/goal-evidence-ai-run-manifest.schema.json','schemaVersion':1,
    'runId':RUN_ID,'campaignId':campaign['campaignId'],'roundId':campaign['roundId'],'batchId':batch['batchId'],
    'batchInputFingerprint':batch['batchInputFingerprint'],'bundleFingerprint':input_['bundleFingerprint'],'bookDigest':input_['bookDigest'],
    'provider':'OpenAI','model':'Codex actual independent B; exact serving revision not exposed','role':'subject_reviewer',
    'promptFamilyId':'goal-description-understanding-evidence-v2','promptFingerprint':campaign['promptFingerprint'],'criteriaFingerprint':campaign['criteriaFingerprint'],
    'generationParametersFingerprint':'sha256:'+hashlib.sha256(b'Actual independent B HE12four wholeDEEN, retained originalScience, actual originalPNG360680nativePDF source/context; serving sampling unavailable').hexdigest(),
    'independenceGroupId':campaign['independenceGroupId'],'blindToOtherRuns':True,'goalIds':ids,
    'inputArtifacts':[{'role':x['role'],'digest':x['digest']} for x in bundle['artifacts'] if x['role'] in ['book_model','book_pdf','book_pdf_render_manifest','review_input_json','review_prompt','review_criteria']]+[{'role':'description_review_batch_input_jsonl','digest':batch['batchInputFingerprint']}],
    'startedAt':started,'completedAt':datetime.now(timezone.utc).isoformat(),'outputDigest':'sha256:'+sha(record_path),'status':'completed','toolchainVersion':'skillpilot-goal-description-review-v1'})
write(OWN/'four-actual-PNG-widths-native-pages-V.independent-b.first.verdicts.json',{
    'schemaVersion':1,'artifactKind':'independent-B-actual-four-current-PNG-width-native-page-first-V','recordedAt':started,
    'actualReviewer':'/root/flora_fauna_independent_a','assignedIndependentRole':'B','records':v_records,'KEEP':4,'newBlockingFindings':[],
    'newImagesGeneratedByReviewer':0,'peerAFinalOutputsRead':False,'status':'needs_human_review','reviewAuthority':'ai_candidate',
    'activeWrites':0,'strictGainClaimed':0,'humanApproval':False,'humanTrial':False})
write(OWN/'four-whole-D-P-source-AM-current-context.independent-b.first.verdict.json',{
    'schemaVersion':1,'artifactKind':'independent-B-four-current-whole-D-P-source-AM-context-first','recordedAt':started,
    'D4':'KEEP','P4Science':'PASS_SCOPED_E1_G1 with genuine unchanged whole child and companion science retained',
    'ownGenuineChildScienceFirstSeal':bind(own_science_seal),'ownOriginalCompanionNativeFirstSeal':bind(own_old_native_seal),
    'wholeOriginalPrimaryPhysicalPagesActuallyRead':[25,26],'sourceScope':'Exact original two HE9.3 clauses; original whole source/oldstable mappings and all other duties retained. No new all-country approval from copied raw applicability.',
    'goalSpecificBindings':per_goal,'wholeEightDEENCasePairsActuallyRead':8,'newScientificAMDecisions':0,'newCards':0,'retainedMemoryVisibilityScopeObligationsUnchanged':True,
    'nativeTechnicalChecks':'pending separately actual recorded runs','peerAFinalOutputsRead':False,'status':'needs_human_review','reviewAuthority':'ai_candidate','evidenceLevel':'E1','maximumClaimScope':'G1',
    'activeWrites':0,'strictGainClaimed':0,'realLearnerEvidence':False,'humanApproval':False,'humanTrial':False})
write(OWN/'exact-author203-provenance14-current202-science-scope-protection.independent-b.actual.json',{
    'schemaVersion':1,'artifactKind':'independent-B-exact-neutral-and-genuine-reviewed-science-scope-current-binding','recordedAt':started,
    'authorSeal':bind(author_seal),'authorExactFiles':203,'appendProvenanceSeal':bind(provenance_seal),'appendExactFiles':14,
    'actualCurrentCanonical':bind(live_path),'baselineStrict':202,'baselineCurrentAtomic':391,'inactiveCandidateAtomic':392,
    'wholeOtherGoalsExact':473,'parentStableChangedOnly':changed_parent,'existingCompanionBodiesAndImagesExact':True,
    'oldWholeSourceMappingClauseUnionPreserved':True,'eachChildWholeBodyExactToOwnPriorScience':True,
    'wholeEightCasesAndFourNormativeProfilesExactToPreviousGenuineReviewedInputs':True,
    'oldOtherAAndMRowsExact':390,'newCards':0,'existingLegacyProgressGate':bind(ROOT/art['conditionedExistingLegacyProgressGate']),
    'legacyNoRuntimeOrPrivateDataWrite':True,'currentPositionOnlyProof':bind(ROOT/art['originalPositionOnlyResolutionProof']),
    'currentStrictAffectedPositions':81,'sameCurrentOriginalSubsetContexts':81,'oldHistoricalDifferentContextsUnchanged':['0daa79f6-8f61-5506-98f9-65db83062ba8','e70d8a85-2dea-5165-919b-200fee9f4db4'],
    'historicalScientificRecordsRunsResolutionsIndicesChanged':0,'newIndependentReviewsForPositionOnly':0,
    'wholeOriginalSourceReceipt':bind(ROOT/art['wholeOriginalPhysicalSourcePages']),'actualNativePDF':bind(pdf),'actualPdfTextExtractionArgv':argv,'actualPdfTextExtractionExit':0,
    'nativeFourSubsetCampaignPath':art['firstPassB'],'actualBatchSize':4,'peerAFinalOutputsRead':False,'activeWrites':0,'strictGainClaimed':0,'newScientificClosures':0,'restoredBindingsClaimed':0,'humanApproval':False})
config=read(AUTHOR/'candidate/P4.actual-raster-author.inactive-v2.config.json')
config['scope']={'label':'Independent B actual inactive four current PNGs and genuine unchanged whole source/P review','goalIds':config['scope']['goalIds']}
write(OWN/'P4.exact-inactive-native.independent-b.config.json',config)
print('Own independent B actual D4 KEEP/P4 whole science scoped E1G1 PASS/V4 KEEP.203+14 exact inputs;473 other goals and390 A/M rows exact,81 same-subset position proofs preserved. Actual native checks follow; no active write, peer-A final read or human claim.')
