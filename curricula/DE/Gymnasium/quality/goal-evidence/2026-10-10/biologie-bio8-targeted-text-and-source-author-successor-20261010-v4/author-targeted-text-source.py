# SPDX-License-Identifier: Apache-2.0
"""Additive inactive author inputs; no independent judgments or active writes."""
import copy, datetime, hashlib, json, pathlib
R = pathlib.Path(__file__).resolve().parents[7]
B = pathlib.Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10')
OLD = B/'biologie-bio8-atomicity-source-visual-findings-targeted-author-successor-v3'
NEW = B/'biologie-bio8-targeted-text-and-source-author-successor-20261010-v4'
FOSSIL = '430b2b73-641a-5122-bb6d-162b0d1eaf2d'
EVO = '9b40dae5-6d89-5714-ac96-373e72a7045e'
CULTURE = '80235254-ca58-5ba0-9319-b842350d6eb2'
F53 = 'f53d0a0b-d9b8-5012-92b5-3a021ab6c30b'
RP4 = 'rp-bio-seki-rp-bio-seki-2014-tf11-biowissenschaften-und-gesellschaft-004-6f24a318'
RP3 = 'rp-bio-seki-rp-bio-seki-2014-tf11-biowissenschaften-und-gesellschaft-003-8927c877'
MV = 'mv-biology-seki-rahmenplan-2022-j10-evolution-12-entstehung-des-lebens-evolutionstheorien-evolutionsfaktoren-und-menschwerdung-erklaren'
def read(p): return json.loads((R/p).read_text())
def ref(p):
    b=(R/p).read_bytes(); return {'path':str(p),'sha256':'sha256:'+hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def put(p,o):
    p=NEW/p; f=R/p; f.parent.mkdir(parents=True,exist_ok=True)
    f.write_text(json.dumps(o,ensure_ascii=False,indent=2)+'\n',encoding='utf-8'); json.loads(f.read_text()); return ref(p)
now=datetime.datetime.now(datetime.timezone.utc).isoformat()
land=read(OLD/'candidate/whole483-final-fossil-image-substantive-successor.inactive.json')
gm={g['id']:g for g in land['goals']}
old_en=gm[EVO]['descriptionEn']; assert old_en=='The learner can classify developmental genetics (Hox genes, gene regulation) for evolutionary processes.'
gm[EVO]['descriptionEn']='The learner can relate developmental genetics (Hox genes, gene regulation) to evolutionary processes.'
assert 'DE-MV' not in gm[CULTURE]['applicability']['jurisdiction']
gm[CULTURE]['applicability']['jurisdiction'].append('DE-MV')
put('candidate/whole483-text-source.inactive.json',land)
materials=read(OLD/'materials'/f'{FOSSIL}.whole-two-cases.json')
profile=read(OLD/'final/profiles'/f'{FOSSIL}.whole-current-profile.json')
obsolete=' Modern card: socially/written transmitted practices alter diet/settlement with resource use.'
assert materials[0]['materialEn'].count(obsolete)==1
assert profile['applicationCaseBriefs'][0]['taskDemandEn'].count(obsolete)==1
materials[0]['materialEn']=materials[0]['materialEn'].replace(obsolete,'')
profile['applicationCaseBriefs'][0]['taskDemandEn']=profile['applicationCaseBriefs'][0]['taskDemandEn'].replace(obsolete,'')
put('materials/'+FOSSIL+'.whole-two-cases.json',materials)
put('final/profiles/'+FOSSIL+'.whole-current-profile.json',profile)
ps=read(OLD/'positive/ten-whole-author-candidates.normal-minimum-successor.json')
next(g for g in ps['goals'] if g['goalId']==FOSSIL)['profile']=profile
put('positive/ten-whole-author-candidates.current.json',ps)
rpmap=read(OLD/'sources/RP-final-explicit-theory-prerequisite-role.successor.json')
rp_source_path=pathlib.Path(rpmap['sourceExtractionPath']); rp=read(rp_source_path)
g=next(g for g in rp['sourceGoals'] if g['id']==RP4)
assert g['sourceRef']=='RP-BIO-SEKI-2014 S. 43'
g['sourceRef']='RP-BIO-SEKI-2014 S. 44 (physische PDF-Seite 46)'
put('sources/RP-TF11-printed44.whole-extraction.successor.json',rp)
rpmap['sourceExtractionPath']=str(NEW/'sources/RP-TF11-printed44.whole-extraction.successor.json')
put('sources/RP-whole-locator-successor.review.json',rpmap)
source=read(OLD/'sources/final31-pairs-and34-whole-direct-operators.regular-primary.author.json')
mvrow=next(r for r in source['records'] if r['wholeLiteralSourceGoal']['id']==MV)
mvpath=pathlib.Path(mvrow['wholeMapping']['path']); mvmap=read(mvpath)
decision=next(d for d in mvmap['decisions'] if d['sourceGoalId']==MV)
assert CULTURE not in decision['canonicalGoalIds']; previous=copy.deepcopy(decision)
decision['canonicalGoalIds'].append(CULTURE)
decision.update(matchType='partial',reviewedAt=now,reviewer='Bio8 v4 targeted text/source AUTHOR; independent SOURCE pending')
decision['rationale']=('Der vollständige amtliche Operator und alle bestehenden Partner bleiben erhalten. '
    'Auf gedruckter Seite 28, physischer PDF-Seite 32 steht Kulturelle Evolution als verbindlicher Inhalt; '
    '80235254 liefert dazu nur eine begrenzte materialanalytische Teilkompetenz zu sozialer Weitergabe '
    'und heutigen Wirkungen. Das getrennte Beurteilen von Grenzen und Chancen kultureller Evolution '
    'für die Zukunft sowie Fossilformen, aufrechter Gang, Out-of-Africa und alle weiteren ganzen '
    'Quellpflichten bleiben eigenständige offene Partnerpflichten. Kein Gesamtquellenapproval und '
    'keine ausgeführte Lernenden- oder Versuchsleistung. Unabhängige SOURCE-/Sichtprüfung steht aus.')
decision['authorQualification']={**decision.get('authorQualification',{}),
    'priorWholeDecision':previous,'boundedAdditionalCanonicalGoalId':CULTURE,
    'primaryLocator':'printed 28 / physical PDF page 32',
    'boundedSourceAspect':'cultural transmission and present effects; prerequisite analytic contribution',
    'unsupportedByThisAtom':['judge future opportunities and limits of cultural evolution','Out-of-Africa theory','origin of bipedalism','all other whole source clauses'],
    'wholeSourceApproval':False,'independentSourceReview':'PENDING'}
mvmap['mappings'].append({'legacyGoalId':MV,'canonicalGoalId':CULTURE,'matchType':'partial','reviewDecisionId':decision['sourceGoalId']})
put('sources/MV-culture-partial.whole-mapping.successor.review.json',mvmap)
at=read(OLD/'sources/final-explicit-operators-book-local-atlas.normal.config.json')
at['landscapePath']=str(NEW/'candidate/whole483-text-source.inactive.json')
at['semanticKindLedgerPath']=str(NEW/'candidate/kinds396.author-classification-only.json')
at['mappingPaths']=[str(NEW/'sources/RP-whole-locator-successor.review.json') if p==str(OLD/'sources/RP-final-explicit-theory-prerequisite-role.successor.json') else str(NEW/'sources/MV-culture-partial.whole-mapping.successor.review.json') if p==str(mvpath) else p for p in at['mappingPaths']]
at.update(outputDirectory='app/scripts/config/goal-books/author-bio8-text-source396-20261010-v4/source-views',manifestPath='app/scripts/config/goal-books/author-bio8-text-source396-20261010-v4/atlas.sources.json',navigationViewPath='app/scripts/config/goal-books/author-bio8-text-source396-20261010-v4/navigation.view.json')
at.pop('receiptPath',None); put('sources/normal-atlas.config.json',at)
put('checks/targeted-author-text-source.decisions.json',{
    'role':'author_not_independent_reviewer','createdAt':now,'inputs':{
        'operativeV3Entry':ref(OLD/'author-substantive-four.portable-final.entry.json'),
        'operativeV3Freeze':ref(OLD/'author-substantive-four.portable-final.freeze.json'),
        'genuineA':ref(B/'biologie-bio8-v3-current353-genuine-independent-a-fresh-20261010-v1/scientific-FIRST.json'),
        'genuineBFindings':ref(B/'biologie-bio8-v3-current353-genuine-independent-b-fresh-20261010-v1/FIRST.findings.json'),
        'genuineBEntry':ref(B/'biologie-bio8-v3-current353-genuine-independent-b-fresh-20261010-v1/FIRST.entry.json')},
    'corrections':[{'goalId':FOSSIL,'field':'materialEn and matching taskDemandEn','removedLiteral':obsolete,'allOtherCaseAndProfileFieldsExact':True},
        {'goalId':EVO,'field':'descriptionEn','before':old_en,'after':gm[EVO]['descriptionEn'],'GermanAndIDExact':True,'wholePBodyExact':True},
        {'sourceGoalId':RP4,'field':'sourceRef','before':'RP-BIO-SEKI-2014 S. 43','after':g['sourceRef'],'sourceOperatorTextExact':True},
        {'goalId':CULTURE,'sourceGoalId':MV,'mappingMatchType':'partial','primary':mvrow['actualPrimaryBytes'],'primaryLocator':'printed28/physical32','wholeDutyApproved':False}],
    'RPArgumentation':{'goalId':F53,'sourceGoalId':RP3,'existingProtectedMappingPreserved':True,
        'coverageDirectMeaning':'goalId===mappedTargetGoalId; does not mean whole source coverage or prerequisiteOnly projectionRole',
        'observedCanonicalPerformance':'Describe CRISPR/Cas mode of action and application; no argumentation demand in this goal',
        'sourceArgumentProductGoalIds':['0f9318ec-90eb-5381-b670-8fb2f2789c3d','5ee0f660-66f1-5aa6-a01d-e3b010db01ff','9540a95d-5ca5-527c-918f-d702e99be07a'],
        'F53ArgumentPerformanceCredit':False,'authorSourceRoleIsCompilerEffective':False,
        'claimCorrection':'Treat F53 as an explicitly documented theory contribution, without asserting runtime prerequisiteOnly. Argumentation coverage by the whole partners remains open for targeted independent review.',
        'remaining':'OPEN_SOURCE_OPERATOR_CREDIT; no fabricated qualification or protected scope removal'},
    'HEOptionalBoundary':{'primary':ref(OLD/'primary/52c278d6f5a7/bundle/book.pdf'),'pagesRead':['printed33/physical33','printed38/physical38'],
        'compulsoryTopicFields':['Q1.1','Q1.2','Q1.3'],'optionalTopicFields':['Q1.4','Q1.5'],
        'localBookScopeIsOptionalInclusive':True,'ordinaryPersonalCurriculumUniversalLKTargetClaim':False,
        'goalIds':['27b22c33-908c-5fa8-9d9f-a08aff8da143','374e6de5-0747-57cb-99e3-e50ccb371124',EVO],
        'existingHEMappingsPreserved':True,'medicineV2IndependentProofsRetained':True,'remaining':'No current optional-module runtime UX requested. Independent review must retain the book-local optional qualification.'},
    'machineHumanSeparation':{'machineM7RequiresExecutedHumanTrial':False,'machineProfiles':'ai_candidate/needs_human_review/E1/G1',
        'syntheticCasesAreAllowedMachineContracts':True,'actualLearnerPerformance':False,'actualLaboratoryExecution':False,
        'wholePracticalClausesNeedExplicitContractCoverage':True,'blanketHumanPerformanceHoldCreated':False},
    'strictGainClaimed':0,'humanApproval':0,'activeWrites':[],'GitOrGitHubWrites':[]})
print(json.dumps({'wholeGoals':len(gm),'P430EnglishResidueRemoved':True,'D9BEnglishRelational':True,'RP4Locator':'44/46','MV802AdditionalPartial':True,'strictGain':0}))
