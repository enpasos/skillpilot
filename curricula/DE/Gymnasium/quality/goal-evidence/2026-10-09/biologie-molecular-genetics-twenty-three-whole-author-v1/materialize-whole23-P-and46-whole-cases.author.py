"""Materialise bounded author bodies; ordinary TS helper later supplies genuine fingerprints."""
import copy
import hashlib
import json
import re
from datetime import datetime, timezone
from pathlib import Path

import jsonschema

from authored_molecular_cases import CASES
import authored_inheritance_cases  # registers its 22 additional cases
from author_whole_positive_profiles import FACETS

ROOT = Path.cwd()
OWN = Path(__file__).resolve().parent
REL = str(OWN.relative_to(ROOT))
PREP = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/biologie-next-molecular-genetics-twenty-three-preparation-a-v1'
REVIEW = 'biologie-molecular-genetics-twenty-three-whole-author-v1'
STAMP = datetime.now(timezone.utc).isoformat()

def bind(p):
    b=Path(p).read_bytes()
    return {'path':str(Path(p).relative_to(ROOT)), 'sha256':'sha256:'+hashlib.sha256(b).hexdigest(),'bytes':len(b)}

def write(name,obj):
    p=OWN/name;p.parent.mkdir(parents=True,exist_ok=True)
    p.write_text(json.dumps(obj,ensure_ascii=False,indent=2)+'\n');return p

def typography(s):
    # Only our new unsealed prose. Preserve actual historical bodies/sequence strings.
    for a,b in [('70S30S','70S 30S'),('80S40S','80S 40S'),('5′→3′Verlängerung','5′→3′-Verlängerung'),
                ('5′→3′extension','5′→3′ extension'),('Erklärtn/C','Erklärt n/C'),('Explainsn/C','Explains n/C'),
                ('23Chromosomen46Chromatiden','23 Chromosomen / 46 Chromatiden'),
                ('23chromosome46chromatid','23-chromosome / 46-chromatid'),('Berechnet64bzw32,4alsModellerwartung','Berechnet 64 bzw. 32,4 als Modellerwartung'),
                ('Calculates64or32.4asmodel','Calculates 64 or 32.4 as model'),('mit20undvierKopienjeTyp','mit 20 und vier Kopien je Typ'),
                ('with20andfour','with 20 and four')]: s=s.replace(a,b)
    s=re.sub(r'(?<=[,:;])(?=[A-Za-zÄÖÜäöüß])',' ',s)
    return s

assert not (OWN/'whole23-science-author.first.freeze.json').exists(), 'First seal immutable'
intake=json.loads((OWN/'input/whole-current23-source38-and-whole-partners44.exact-neutral-input.json').read_text())
goals=[r['wholeActiveGoal'] for r in intake['wholeCurrentGoalRows']]
canonpath=ROOT/'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json'
kindpath=ROOT/'curricula/DE/Gymnasium/quality/goal-book-publication/biologie.semantic-kinds.json'
canon=json.loads(canonpath.read_text());kinds=json.loads(kindpath.read_text());byid={g['id']:g for g in canon['goals']}
assert len(goals)==23 and len(FACETS)==23 and len(CASES)==21
assert sum(len(cs) for cs in CASES.values())==42
assert all(byid[g['id']]==g for g in goals)
assert len(canon['goals'])==479
assert sum(d['semanticKind']=='curricularAtomic' for d in kinds['decisions'])==394
canonc=OWN/'input/current-canonical479.original.snapshot.json';canonc.write_bytes(canonpath.read_bytes())
kindc=OWN/'input/current-kinds394.original.snapshot.json';kindc.write_bytes(kindpath.read_bytes())
kindcandidate=copy.deepcopy(kinds);kindcandidate['sourceLandscapePath']=str(canonc.relative_to(ROOT))
kindconfig=write('input/current-kinds394-landscape-path-only.candidate.json',kindcandidate)
assert kinds['decisions']==kindcandidate['decisions']
criteria=ROOT/'curricula/DE/Gymnasium/quality/goal-evidence/prompts/biology-positive-understanding-evidence-profile-criteria-v1.md'
criteriac=OWN/'input/profile-criteria.original.md';criteriac.write_bytes(criteria.read_bytes())
reuse=json.loads((PREP/'two-existing-genetic-code-and-protein-mechanism-candidates.exact-neutral-reuse.json').read_text())
deps=json.loads((PREP/'exact-historical-code-wheel-material-dependency.bindings.json').read_text())
for b in deps['files']:
    assert bind(ROOT/b['path'])==b
entries=[];specs=[];matrix=[]
for i,g in enumerate(goals):
    facets=FACETS[i]
    expectations=[{'id':f'essential-{j+1}','essentialUnderstandingDe':typography(f[0]),'essentialUnderstandingEn':typography(f[1]),
        'observablePerformanceDe':typography(f[2]),'observablePerformanceEn':typography(f[3])} for j,f in enumerate(facets)]
    if i in (3,4):
        old=next(r for r in reuse['rows'] if r['goalId']==g['id'])
        cases=copy.deepcopy(old['wholeHistoricalCandidateMaterial']['tasks'])
        for c in cases:
            # Immutable whole case remains a named original object. New profile briefs do not rewrite it.
            assert c==next(t for t in old['wholeHistoricalCandidateMaterial']['tasks'] if t['caseId']==c['caseId'])
        material={'wholeHistoricalReuseBinding':old['binding'],'exactHistoricalWholeMaterial':old['wholeHistoricalCandidateMaterial'],
                  'exactHistoricalWholeCases':cases,'dependencyBindings':deps['files'] if i==3 else [],
                  'historicalApprovalReused':False}
        if i==3:
            demand=[('Gegeben sind die vollständige Standard-Code-Sonne und codierende intronfreie5′→3′DNA ATG GAA TTT TGA sowie ATG GAG TTT TAA. Leite/übersetze beide, zeige GAA von innen nach außen und begründe Mehrdeutigkeit/Funktionsgrenze.',
                     'Use the complete standard code wheel with intron-free coding5′→3′DNA ATG GAA TTT TGA and ATG GAG TTT TAA. Derive/translate both, trace GAA inside-out and explain nonuniqueness/function limits.'),
                    ('Nutze die vollständige Code-Sonne: Met–Lys–Cys und Stopp, gegebener Start/Leseraster, keine Originalmessung. Rekonstruiere zwei gültige codierendeDNA/mRNAs, traceUGC und prüfe Vorwärtsübersetzung.',
                     'Use the complete wheel: Met–Lys–Cys/stop, supplied start/frame, no original measurement. Reconstruct two valid codingDNA/mRNAs, traceUGC and verify forward translation.')]
        else:
            demand=[('Typische kernlose BakterienzelleP und kernhaltigeE, längeres Enzymgen in Kurzschrift ATG GAA … TTT TGA. Vollständige Originalfallkarte ist gebunden. Verfolge Informationsfluss/Auslassung, erklärtRNA/Ribosom/tRNA-AnticodonGAA/3′CUU5′ und Raum/Zeit; begründe gegebene Enzymerneuerung.',
                     'Typical bacteriumP/nucleatedE, longer enzyme gene abbreviated ATG GAA … TTT TGA. Bound whole original card supplies all conditions. Trace information/omission, RNA/ribosome/tRNA GAA/3′CUU5′ pairing and space/timing; justify supplied enzyme renewal.'),
                    ('Vollständige Originalfallkarte: X blockiert ausschließlich neuenmRNA-Kernexport;Y entfernt passende beladeneGAA-tRNAs. Altmoleküle bleiben erhalten, Neubildung getrennt gemessen. SageRNA-Lage/neuesProtein voraus, vergleicheP und erkläre anhaltenden Ersatzmangel.',
                     'Whole original card: X blocks only new maturemRNA nuclear export;Y removes matching chargedGAAtRNAs. Old molecules persist; only new synthesis measured. Predict RNA location/new protein, compareP and explain sustained replacement failure.')]
        briefs=[{'id':c['caseId'],'taskDemandDe':typography(demand[j][0]),'taskDemandEn':typography(demand[j][1]),
            'expectedPerformanceDe':c['solution'],'expectedPerformanceEn':c['solutionEn'],
            'understandingFocusDe':' '.join(e['essentialUnderstandingDe'] for e in expectations),
            'understandingFocusEn':' '.join(e['essentialUnderstandingEn'] for e in expectations)} for j,c in enumerate(cases)]
    else:
        cases=[]
        for raw in CASES[i]:
            c={k:typography(v) if isinstance(v,str) else v for k,v in raw.items()}
            c['rubric']=[{'expectationId':e['id'],'criterionDe':e['observablePerformanceDe'],'criterionEn':e['observablePerformanceEn'],
                         'evidenceLocations':['workedResponseDe','workedResponseEn','workedFreshTransferDe','workedFreshTransferEn']} for e in expectations]
            c['actualExperimentPerformed']=False;c['actualLearnerPerformance']=False
            cases.append(c)
        material={'newAuthoredWholeCases':cases,'historicalApprovalReused':False}
        briefs=[{'id':c['caseId'],'taskDemandDe':c['materialDe']+'\n\nAuftrag: '+c['taskDe']+'\n\nFrische Variation: '+c['freshTransferTaskDe'],
            'taskDemandEn':c['materialEn']+'\n\nTask: '+c['taskEn']+'\n\nFresh variation: '+c['freshTransferTaskEn'],
            'expectedPerformanceDe':c['workedResponseDe']+'\n\nTransfer: '+c['workedFreshTransferDe'],
            'expectedPerformanceEn':c['workedResponseEn']+'\n\nTransfer: '+c['workedFreshTransferEn'],
            'understandingFocusDe':' '.join(e['essentialUnderstandingDe'] for e in expectations),
            'understandingFocusEn':' '.join(e['essentialUnderstandingEn'] for e in expectations)} for c in cases]
    profile={'archetype':'data' if i in (15,16,17,22) else 'representation' if i in (0,2,3,12,13) else 'modeling' if i in (5,7,9,10,11,14,18,20,21) else 'concept',
        'expectations':expectations,'coverageExpectations':{'requiredExpectationIds':[e['id'] for e in expectations],
            'alternativeExpectationGroups':[],'minimumIndependentDemonstrations':2,'freshVariationRequired':True,'independentTransferRequired':True},
        'variationAxes':[{'id':'distinct-biological-evidence-contexts','textDe':'Zwei eigenständige unterschiedliche biologische Sach-/Belegkontexte: '+cases[0]['caseId']+' gegenüber '+cases[1]['caseId']+'.',
            'textEn':'Two distinct biological/evidence contexts: '+cases[0]['caseId']+' versus '+cases[1]['caseId']+'.'},
            {'id':'changed-mechanism-assumption-or-counterfinding','textDe':'Eine neue Bedingung, Funktionsstörung oder Gegenevidenz verlangt eine begründete angepasste Folgerung statt bloß anderer Zahlen.',
             'textEn':'A new condition, functional perturbation or counterfinding requires a justified adapted conclusion rather than merely changed numbers.'}],
        'applicationCaseBriefs':briefs}
    schema=json.loads((ROOT/'contracts/goal-evidence/v2/goal-evidence-profile.schema.json').read_text())
    validator=jsonschema.Draft202012Validator({'$ref':'#/$defs/profile','$defs':schema['$defs']})
    errors=list(validator.iter_errors(profile));assert not errors,[(i,list(e.path),e.message) for e in errors]
    specs.append({'goalId':g['id'],'profile':profile,'reason':'Whole unchanged current DE/EN goal and required operators. Two bounded heterogeneous bilingual constructed cases with worked answers and targeted evidence criteria. Author AI candidate, no independent/human approval; final actual raster/native and source/course reviews pending.',
                  'evidenceLevel':'E1','maximumClaimScope':'G1','dissent':[]})
    entries.append({'ordinal':i+1,'goalId':g['id'],'wholeCurrentGoal':g,'wholeProfile':profile,**material,
                    'currentOriginalSourceDutyRowIds':intake['wholeCurrentGoalRows'][i]['currentSourceDutyFrameRows'],
                    'reviewAuthority':'ai_candidate','status':'needs_human_review','evidenceLevel':'E1','maximumClaimScope':'G1',
                    'humanApproval':False,'humanTrial':False,'independentReviews':[]})
    matrix.append({'goalId':g['id'],'requiredExpectationIds':[e['id'] for e in expectations],
                   'caseIds':[c['caseId'] for c in cases], 'evidenceLocations':'Whole worked explanation plus targeted criterion; collective coverage author-proposed, independently pending',
                   'unmodifiedWholeDEEN':True,'sourceAndCourseHoldsPreserved':True})
write('twenty-three-whole46-bilingual-cases-and-P.author-candidate.json', {'schemaVersion':1,'role':'Whole author materials with42newcases and4exact historical wholecases; no current native or scientific approval',
    'createdAt':STAMP,'license':'CC-BY-4.0','entries':entries,'newWholeBilingualCases':42,'exactHistoricalWholeCases':4,
    'activeWrites':[],'strictGain':0,'humanApproval':False,'humanTrial':False})
write('twenty-three-whole-positive-profile-candidate-set.author.json',{'schemaVersion':1,'authoringContract':'positive-understanding-evidence-candidates-v1',
    'reviewId':REVIEW,'reviewedAt':STAMP,'reviewer':'Codex biology_resume_candidate actual author; fresh independent whole/native reviews pending','goals':specs})
write('twenty-three-whole-positive.author-candidate.config.json',{'$schema':'https://skillpilot.com/schemas/goal-evidence/v2/goal-evidence-review-config.schema.json',
    'schemaVersion':2,'reviewId':REVIEW,'goalFingerprintRuleVersion':'goal-evidence-v1','profileRuleVersion':'positive-understanding-evidence-v2',
    'landscapeId':canon['landscapeId'],'landscapePath':str(canonc.relative_to(ROOT)),'semanticKindLedgerPath':str(kindconfig.relative_to(ROOT)),
    'reviewCriteriaPath':str(criteriac.relative_to(ROOT)),'reviewPath':REL+'/twenty-three-whole-positive.author-candidate.review.jsonl',
    'reviewRunManifestPaths':[],'reviewedResourceTypes':[],'requireApproved':False,
    'scope':{'label':'Current whole23 authors before actual PNG/native independent review, original479/394','goalIds':[g['id'] for g in goals]}})
write('twenty-three-whole-expectation-coverage.author-matrix.json',{'schemaVersion':1,'role':'Author evidence proposal, not completed learner evidence or scientific review','entries':matrix})
write('original-current-goal-kinds-source-and-history-preservation.actual.json',{'schemaVersion':1,
    'activeCanonBefore':bind(canonpath),'actualCanonicalSnapshot':bind(canonc),'activeKindsBefore':bind(kindpath),'actualKindsSnapshot':bind(kindc),
    'inactiveKindConfigPathOnly':bind(kindconfig),'all394KindDecisionsExact':True,'all23WholeGoalsExact':True,'originalCasesReuse':bind(PREP/'two-existing-genetic-code-and-protein-mechanism-candidates.exact-neutral-reuse.json'),
    'codeWheelDependencies':deps,'sourceDuties38AndPartners44':bind(OWN/'input/whole-current23-source38-and-whole-partners44.exact-neutral-input.json'),
    'existingAM394AndStrict276ReusedOnly':True,'newSourceApproval':False,'newCurrentImageOrNativeApproval':False,'activeWrites':[],'strictGain':0})
write('scientific-supplementary-reference-and-model-limits.author.json',{'schemaVersion':1,'role':'Research mechanism/context verification; not an official curricular duty or clinical recommendation',
    'references':[{'title':'Skinner2008: What is an epigenetic transgenerational phenotype? F3 or F2','url':'https://pubmed.ncbi.nlm.nih.gov/17949945/',
                  'scope':'Exposure-generation distinction only; constructed cases do not reproduce or claim clinical effects.'},
                 {'title':'Complementary oligodeoxynucleotide mediated inhibition of tobacco mosaic virus RNA translation in vitro','url':'https://pmc.ncbi.nlm.nih.gov/articles/PMC336649/',
                  'scope':'Complementary RNA analogues and translation inhibition as a bounded mechanistic precedent; no human efficacy claim.'}],
    'modelLimits':['No actual crosses, patient records, investigations or learning performances.',
                   'Required original practical operators and whole partner duties remain separately pending.',
                   'Selected GA and EA whole goals remain distinct; detail required on the EA goal does not become a universal GA requirement.'],
    'wholeSourceApproval':False,'humanApproval':False})
print(json.dumps({'wholeGoals':len(entries),'newWholeBilingualCases':42,'exactHistoricalWholeCases':4,'profileSchemaErrors':0,'activeWrites':[],'strictGain':0}))
