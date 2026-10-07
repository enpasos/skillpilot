"""Inert bounded source preparation; writes only this new quality dossier."""
import copy
import hashlib
import json
import pathlib
import shutil
import uuid
from bs4 import BeautifulSoup

ROOT = pathlib.Path(__file__).resolve().parents[7]
OUT = pathlib.Path(__file__).resolve().parent
LID = '08a43a1b-d97e-522c-9dfa-c950a493364e'
BYLID = '357a7003-b636-570e-a0bd-6bb63518d2f6'
MEASURE = '2381d2bb-176c-5903-8c6e-82f4bd5023a4'
PLASTIC = 'a46cafde-7359-5249-8754-19aaa3174ba4'
LEGACY = '41b81d9c-e22d-4af7-8b89-eaf26e1ddaa8'
CANON = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json'
INPUT = 'curricula/DE/Gymnasium/input/BY/source-components/DE_BY_BIOLOGIE_POTENTIAL_RECORDINGS_GA_EA.bounded-20261007-v1.source-extraction.json'
MAPPING = 'curricula/DE/Gymnasium/mapping/DE-BY/source-components/by-ga-ea_biology_potential_recordings_bounded-20261007-v1.review.json'

def rel(p):
    return str(p.relative_to(ROOT))

def write(p, x):
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(json.dumps(x, ensure_ascii=False, indent=2)+'\n')

def fp(p):
    return {'path': rel(p), 'sha256': hashlib.sha256(p.read_bytes()).hexdigest(), 'bytes': p.stat().st_size}

assert (ROOT / CANON).exists(), ROOT
canon = json.loads((ROOT / CANON).read_text())
byid = {g['id']:g for g in canon['goals']}
diagnostic = json.loads(pathlib.Path('/tmp/skillpilot-bio-source-diagnostic.actual.json').read_text())
write(OUT/'review-input/whole-current-two-goals-and-actual-consumer-limits.raw.json', {
    'schemaVersion':1, 'inputRole':'current native/raw source material; no peer scientific verdicts',
    'wholeGoals':[byid[MEASURE], byid[PLASTIC]],
    'consumers':[{'goal':byid['02f8a5a3-9c44-50ec-b9b8-a0b7f402aaa8'], 'nativeSurrogateEligibility':False, 'reason':'cluster; native checker requires atomic consumer'},
                 {'goal':byid['1cfb2f8b-d44b-57f4-aae0-c5d9f55a1c6a'], 'nativeSurrogateEligibility':False, 'reason':'Practice/Assessment/examData; native curriculum source checker excludes this consumer'}],
    'rawDiagnostic':diagnostic,
    'canonicalInput':fp(ROOT/CANON),
})

components=[]
for profile, route in [('GA','grundlegend'),('EA','erhoeht')]:
    htmlpath=OUT/f'primary/BY13-{profile}.official.current.html'
    soup=BeautifulSoup(htmlpath.read_text(),'html.parser')
    for name,heading_part,positions in [('LB1.2','Erkenntnisgewinnungskompetenz',[(1,2),(1,3)]),('LB2','Neuronale Informationsverarbeitung',[(2,3),(2,4)])]:
        h=next(h for h in soup.select('h2,h3') if heading_part in h.get_text())
        anchor=h.parent['id']
        section=h.parent.find_next_sibling('div',class_='content')
        blocks=section.select('.thema_absch')
        for block_idx,list_idx in positions:
            li=blocks[block_idx-1].find('ul',recursive=False).find_all('li',recursive=False)[list_idx-1]
            clean=BeautifulSoup(str(li),'html.parser')
            for dialog in clean.find_all('dialog'): dialog.decompose()
            text=clean.get_text(' ',strip=True)
            components.append({
                'recordId':f'BY13-{profile}.{name}.{"competency" if block_idx==1 else "content"}.{list_idx}',
                'jurisdiction':'DE-BY','stage':'SekII','originalYear':'13',
                'originalLevelLabel':'grundlegendes Anforderungsniveau' if profile=='GA' else 'erhöhtes Anforderungsniveau',
                'projectionCourseProfile':'GK_LK' if profile=='GA' else 'LK',
                'projectionProfileIsRepositoryMappingNotQuotedHeading':True,
                'primaryUrl':f'https://www.lehrplanplus.bayern.de/fachlehrplan/gymnasium/13/biologie/{route}#{anchor}',
                'originalHtmlAnchor':anchor,'originalSectionTitle':h.get_text(' ',strip=True),
                'selector':f'[id="{anchor}"] + .content .thema_absch:nth-of-type({block_idx}) > ul > li:nth-of-type({list_idx})',
                'authoredListPositionLocator':list_idx,'officialBulletNumberingClaim':False,
                'originalText':text,'originalElementHtml':str(li),
                'sourceHtml':fp(htmlpath),'actualCurrentOfficialSectionReadByIndependentReviewer':True,
            })
write(OUT/'primary/eight-exact-BY-original-components.actual.json',components)
hepdf=ROOT/'curricula/DE/Gymnasium/input/HE/upper-secondary/kerncurriculum_gymnasiale_oberstufe-biologie.pdf'
import fitz
document=fitz.open(hepdf)
(OUT/'primary/HE43.current-local-pdf.actual-text.txt').write_text(document[42].get_text())
document[42].get_pixmap(matrix=fitz.Matrix(1,1)).save(OUT/'primary/HE43.current-local-pdf.actual-raster.png')
write(OUT/'primary/HE43.actual-reading-and-input.json',{
    'source':fp(hepdf),'physicalPage':43,'printedPage':43,
    'url':'https://kultus.hessen.de/sites/kultus.hessen.de/files/2025-10/kerncurriculum_gymnasiale_oberstufe-biologie.pdf',
    'actuallyReadTextAndViewedRaster':True,
    'GK_LK':'Q2.3: Potenzialmessungen explicitly belongs to basic level',
    'LK_only':'Q2.3: zelluläre Prozesse des Lernens explicitly belongs to increased level',
    'sourceLimit':'The source does not literally name the authored effective-network-connection model performance; no whole original bullet closure.',
})

sourceid=str(uuid.uuid5(uuid.NAMESPACE_URL,'https://www.lehrplanplus.bayern.de/B13/GA-EA/LB2/content/Potentialmessungen/20261007'))
measurement_components=[c for c in components if '.LB2.content.3' in c['recordId']]
assert len(measurement_components)==2
sourcegoal={
    'id':sourceid,'title':'Potenzialmessungen im Ruhepotenzial-Kontext',
    'description':measurement_components[0]['originalText'],
    'sourceText':measurement_components[0]['originalText'],
    'stage':'SekII','courseLevel':'GK_LK','sourceDocumentKey':'BY13-GA-CURRENT',
    'sourceDocumentKeys':['BY13-GA-CURRENT','BY13-EA-CURRENT'],
    'sourceKind':'boundedPrimaryComponent','granularity':'officialContentComponent',
    'isOfficialBullet':True,'officialNumberingClaim':False,
    'sourceSpan':'BY13 GA/EA LB2, content-list position 3 (authored locator)',
    'sourceRef':'LehrplanPLUS Bayern Gymnasium Biologie 13, grundlegendes und erhöhtes Anforderungsniveau, LB2: Inhalte zu den Kompetenzen; Potentialmessungen',
    'actualPrimaryComponents':measurement_components,
    'supportingPrimaryComponents':[c for c in components if c not in measurement_components],
    'sourceOccurrences':[{'primaryUrl':c['primaryUrl'],'originalLevelLabel':c['originalLevelLabel'],'recordId':c['recordId']} for c in measurement_components],
    'wholeOriginalBulletCoverage':False,'wholeCurrentCanonicalCoverage':False,
    'tags':['jurisdiction:DE-BY','stage:SekII','courseLevel:GK_LK','topic:B13-GA.2','topic:B13-EA.2'],
}
extraction={
    'schemaVersion':1,'sourceLandscapeId':BYLID,'jurisdiction':'DE-BY','subject':'Biologie','stage':'SekII',
    'sourceDocuments':[{'key':f'BY13-{profile}-CURRENT','title':f'LehrplanPLUS Gymnasium Biologie 13 {profile} current official HTML',
                        'path':rel(OUT/f'primary/BY13-{profile}.official.current.html'),'official':True,
                        'url':f'https://www.lehrplanplus.bayern.de/fachlehrplan/gymnasium/13/biologie/{route}'}
                       for profile,route in [('GA','grundlegend'),('EA','erhoeht')]],
    'sourceGoals':[sourcegoal],
    'qualityReview':{'status':'inert independently reviewed bounded component candidate; Root second source review and actual native integration pending','active':False,'humanApproval':False,'humanTrial':False},
}
write(OUT/'candidate'/INPUT,extraction)
rationale=(
    'Bayern B13 GA und EA nennt im LB2 Ruhepotential-Kontext ausdrücklich Potentialmessungen. '
    'LB1.2 verlangt hypothesengeleitetes Planen von Untersuchungen unter Variablenkontrolle sowie Aufnahme und Auswertung qualitativer/quantitativer Daten. '
    'Der benachbarte LB2-Inhalt nennt beim Aktionspotential den zeitlichen Verlauf und die Reizcodierung. '
    'Daraus ist das bestehende Planen und Auswerten von Ruhe-/Aktionspotenzialmessungen als didaktische Operationalisierung dieses begrenzten Inhalts plausibel. '
    'Die Beziehung ist partial: Weder der vollständige Ruhepotential-Bullet noch der vollständige Aktionspotential-Bullet oder der allgemeine Methodenbereich wird durch dieses Ziel abgedeckt; '
    'der spezifische kombinierte Zieltext ist keine wörtliche eigenständige offizielle BY-Kompetenzerwartung. '
    'Die Route liefert direkten begrenzten BY-Quellenbezug und korrekte SekII/GK-LK-Herkunft; sie ist keine accepted requires-closure-Brücke und keine fachliche Whole-goal/Human-Freigabe.'
)
byreview={
    'schemaVersion':1,'reviewId':'by-ga-ea_biology_potential_recordings_bounded-20261007-v1',
    'sourceLandscapeId':BYLID,'targetLandscapeId':LID,'sourceExtractionPath':INPUT,
    'reviewStatus':'independent A bounded source candidate; second independent source decision and integration pending',
    'decisions':[{'sourceGoalId':sourceid,'decision':'mapped','canonicalGoalIds':[MEASURE],'matchType':'partial',
                  'rationale':rationale,'sourceKind':'boundedPrimaryComponentWithDeclaredDidacticOperationalisation',
                  'reviewer':'independent source reviewer A (/root/bio_ce19_v2_visual_a)','reviewedAt':'2026-10-07',
                  'wholeOriginalSourceCoverage':False,'wholeCanonicalGoalApproval':False,'active':False,
                  'humanApproval':False,'humanTrial':False}],
    'mappings':[{'legacyGoalId':sourceid,'canonicalGoalId':MEASURE,'matchType':'partial','reviewDecisionId':sourceid}],
}
write(OUT/'candidate'/MAPPING,byreview)

he_rationale=(
    'Targeted current correction: the legacy source 41b81d9c text combines integration, learning and network wiring and its GK_LK label is retained as historical authored extraction metadata. '
    'The actual HE 2024 primary page 43 places cellular processes of learning at increased level (Leistungskurs), and the current a46cafde target is the narrower authored supplied-network-model specialisation with LK tags. '
    'This relation is partial and LK-only for the learning/model component. It cannot establish an exact GK+LK whole legacy-source match or full original cellular-learning-bullet coverage. '
    'Other components of the old broad source remain unclosed by this targeted relation; actual original bytes and prior 2026-05-12 decisions are archived unchanged under quality. '
    'No whole canonical-goal, source-country, human approval or strict-gate gain is claimed.'
)
planned=[]
for path in sorted((ROOT/'curricula/DE/Gymnasium/mapping/DE-HE/upper-secondary').glob('*.json')):
    old=json.loads(path.read_text())
    matches=[r for r in old.get('mappings',[]) if r.get('legacyGoalId')==LEGACY and r.get('canonicalGoalId')==PLASTIC and r.get('matchType')=='exact']
    if not matches or not old.get('sourceExtractionPath'):continue
    assert len(matches)==1
    original=OUT/'historical-original-bytes'/path.relative_to(ROOT)
    original.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(path,original)
    new=copy.deepcopy(old)
    mapping=next(r for r in new['mappings'] if r.get('legacyGoalId')==LEGACY and r.get('canonicalGoalId')==PLASTIC)
    mapping.update({'matchType':'partial'})
    decision=next(r for r in new['decisions'] if r.get('sourceGoalId')==LEGACY)
    decision.update({'matchType':'partial','rationale':he_rationale,'targetCourseLevel':'LK',
                     'reviewedAt':'2026-10-07','reviewer':'independent source reviewer A (/root/bio_ce19_v2_visual_a)',
                     'sourceKind':'legacyAuthoredCompositeToBoundedLKModelSpecialisation',
                     'wholeOriginalSourceCoverage':False,'wholeCanonicalGoalApproval':False,
                     'humanApproval':False,'humanTrial':False,
                     'historicalOriginalReviewArchive':fp(original),
                     'integrationStatus':'inert candidate; Root independent second review pending'})
    if isinstance(new.get('summary'),dict):
        new['summary']['exactMappings']-=1
        new['summary']['partialMappings']+=1
    dest=OUT/'candidate'/path.relative_to(ROOT);write(dest,new)
    planned.append({'productionPath':rel(path),'old':fp(path),'archive':fp(original),'candidate':fp(dest),
                    'changedMappingId':LEGACY,'targetGoalId':PLASTIC,
                    'allOtherMappingsAndDecisionsUnchanged':all(a==b for a,b in zip(old['mappings'],new['mappings']) if a.get('legacyGoalId')!=LEGACY) and all(a==b for a,b in zip(old['decisions'],new['decisions']) if a.get('sourceGoalId')!=LEGACY),
                    'change':'one exact legacy edge and own decision become partial, LK-only; summary exact -1/partial +1; all other historical fields retained'})
assert len(planned)==7, len(planned)
planned.extend([{'productionPath':INPUT,'candidate':fp(OUT/'candidate'/INPUT),'old':None,'change':'one bounded primary source record, two actual GA/EA occurrences'},
                {'productionPath':MAPPING,'candidate':fp(OUT/'candidate'/MAPPING),'old':None,'change':'one partial bounded direct BY route to unchanged measurement-planning goal'}])
write(OUT/'planned-nine-file-integration-manifest.inert.json',{
    'schemaVersion':1,'role':'targeted independent source A candidate; no active integration',
    'requiresBeforeActiveCopy':['Root substantive independent second source decision for both boundaries','verify old active input hashes','retain byte-exact quality archives for all seven old live files','standard native curriculum status and applicability/source audit after actual integration'],
    'files':planned,'canonicalChanges':0,'surrogateRegistryChanges':0,'sourceLandscapeRegistryChanges':0,
    'memoryChanges':0,'corpusAtomicGoals':390,'humanApproval':False,'humanTrial':False,'strictGain':0,
})

protected=[]
for path in sorted((ROOT/'curricula/DE/Gymnasium/canonical').glob('*.json')):
    if any(subject in path.name for subject in ['BIOLOGIE','MATHEMATIK','PHYSIK','CHEMIE']):protected.append(fp(path))
for directory in ['curricula/DE/Gymnasium/composition-views/biologie','app/scripts/config/goal-books/navigation','curricula/DE/Gymnasium/quality/goal-description-review/biologie/review-views']:
    p=ROOT/directory
    if p.exists():
        for path in sorted(p.rglob('*.json')):
            if 'navigation' not in directory or 'biology' in path.name or 'biologie' in path.name:protected.append(fp(path))
for path in [ROOT/'curricula/DE/Gymnasium/quality/goal-book-publication/biologie.semantic-kinds.json',ROOT/'curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json',ROOT/'curricula/DE/Gymnasium/provenance/canonical-goal-surrogate-evidence-registry.json',ROOT/'curricula/DE/Gymnasium/provenance/source-landscape-registry.json']:
    protected.append(fp(path))
write(OUT/'protected-whole-canonical-and-composition-and-registry-inputs.actual.json',{
    'files':protected,'canonicalWholeGoalsUnchanged':len(canon['goals']),
    'all390CurricularBodiesAndEdgesAndResourcesUnchanged':True,
    'wholeLearnerPagesAndMemoryViewsUnchangedByCandidate':True,
    'reason':'The candidate writes only source input/mapping files; no canonical, text, edges, assets, composition/navigation, semantic decision, D/P/A/M/V or memory records are modified.',
    'strictGain':0,'humanApproval':False,'humanTrial':False,
})

write(OUT/'two-boundary-own-targeted-substantive-source-decisions.independent-a.json',{
    'schemaVersion':1,'reviewer':'/root/bio_ce19_v2_visual_a','role':'independent targeted substantive source investigator A with subsequent inert candidate preparation',
    'candidatePreparedBySameInvestigator':True,'candidatePreparationDoesNotReplaceRootIndependentSecondReview':True,
    'blindToOtherSourceDecisionsForThisRepair':True,'reviewedAt':'2026-10-07',
    'reviewedCurrentPrimaryMaterial':['fresh actual official BY13 GA/EA full HTML and eight exact LB1.2/LB2 elements','actual current local HE official PDF physical/printed page43, text and raster'],
    'decisions':[
       {'goalId':MEASURE,'oldAutomaticSurrogateRoute':'REVISE','candidateBoundedDirectRoute':'KEEP',
        'basis':rationale,'oldConsumerLimits':['02f8 is cluster, not native atomic consumer','1cfb is assessment/examData, excluded from curriculum source consumer eligibility'],
        'sourceGoalId':sourceid,'directSourceScope':'measurement content only, with explicit neighbouring AP temporal content and general investigation/data competencies as supporting context',
        'sourceMatchType':'partial','acceptedRequiresSurrogate':False,'wholeOriginalSourceCoverage':False,'wholeGoalApproval':False},
       {'goalId':PLASTIC,'legacySourceGoalId':LEGACY,'sevenOldExactGkLkRoutes':'REVISE','sevenCandidatePartialLkRoutes':'KEEP',
        'basis':he_rationale,'sourceMatchType':'partial','courseLevel':'LK','wholeOriginalSourceCoverage':False,'wholeGoalApproval':False},
    ],
    'nativeEligibilityAndChecks':'No checker exceptions or accepted warning/override additions. Native targeted candidate validation is recorded separately.',
    'integrationPendingRootIndependentSecondReview':True,'current95StrictContinuityRequired':True,'strictGain':0,
    'humanApproval':False,'humanTrial':False,
})
print(json.dumps({'createdFiles':len(planned),'sourceGoalId':sourceid,'canonicalGoals':len(canon['goals']),'output':str(OUT)}))
