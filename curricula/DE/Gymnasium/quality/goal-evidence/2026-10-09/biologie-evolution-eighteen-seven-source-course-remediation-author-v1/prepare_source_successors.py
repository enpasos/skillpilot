#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""Additive, inactive source/placement author successors; never writes active inputs."""
from pathlib import Path
from copy import deepcopy
import json, hashlib, uuid, subprocess, datetime

ROOT=Path(__file__).resolve().parents[7]
BASE=Path(__file__).resolve().parent
REL=BASE.relative_to(ROOT).as_posix()
AUTHOR=ROOT/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/biologie-evolution-systematics-behavior-eighteen-whole-author-v1'
C=ROOT/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/biologie-evolution-systematics-behavior-eighteen-whole-independent-c-v1'
CANON='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json'
KINDS='curricula/DE/Gymnasium/quality/goal-book-publication/biologie.semantic-kinds.json'
ATLAS='app/scripts/config/goal-books/de-gym-biology-national-atlas.inputs.json'
NOW=datetime.datetime.now(datetime.timezone.utc).isoformat()

def read(p): return json.loads((ROOT/p).read_text()) if not isinstance(p,Path) else json.loads(p.read_text())
def put(p,v):
    q=BASE/p;q.parent.mkdir(parents=True,exist_ok=True)
    q.write_text(json.dumps(v,ensure_ascii=False,indent=2)+'\n')
    return q.relative_to(ROOT).as_posix()
def bind(p):
    p=ROOT/p if not isinstance(p,Path) else p;b=p.read_bytes()
    return {'path':p.relative_to(ROOT).as_posix(),'sha256':'sha256:'+hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def copy_exact(p,out):
    p=ROOT/p if not isinstance(p,Path) else p;q=BASE/out;q.parent.mkdir(parents=True,exist_ok=True);q.write_bytes(p.read_bytes());return q.relative_to(ROOT).as_posix()
def diff(a,b,p=''):
    if a==b:return []
    if isinstance(a,dict) and isinstance(b,dict):
        out=[]
        for k in sorted(a.keys()|b.keys()):
            path=p+'/'+k.replace('~','~0').replace('/','~1')
            if k not in a or k not in b:out.append({'jsonPointer':path,'beforePresent':k in a,'afterPresent':k in b,'before':a.get(k),'after':b.get(k)})
            else:out.extend(diff(a[k],b[k],path))
        return out
    if isinstance(a,list) and isinstance(b,list) and len(a)==len(b):
        return [x for i,(aa,bb) in enumerate(zip(a,b)) for x in diff(aa,bb,p+'/'+str(i))]
    return [{'jsonPointer':p or '/','beforePresent':True,'afterPresent':True,'before':a,'after':b}]

frame=read(AUTHOR/'input/whole-current18-source35-and-whole-partners30.exact-neutral-input.json')
rows=frame['wholeOriginalSourceDutyRows'];assert len(rows)==35
partners=frame['wholeOriginalAndCurrentPartnerGoals'];assert len(partners)==30
canon=read(CANON);assert len(canon['goals'])==479
kinds=read(KINDS);assert sum(d['semanticKind']=='curricularAtomic' for d in kinds['decisions'])==394
atlas=read(ATLAS)
first=read(C/'whole18-source35-partners30-P18-cases36.independent-c.scientific-FIRST.verdict.json')
holds=read(C/'seven-source-holds.current-operative-vs-material-scope-and-closure-evidence.actual.json');assert len(holds['findings'])==7
central_path='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/chemie-biologie-current-commit-checkpoint-root-v1/central.stdout.actual.txt'
central=read(central_path);bio=next(s for s in central['subjects'] if s['subject']=='biologie')
protected=set(bio['strictCompleteGoalIds']);assert len(protected)==299
byrow={r['rowId']:r for r in rows}
selected=set(frame['selectedGoalIds']);assert len(selected)==18 and not selected&protected
goals={g['id']:g for g in canon['goals']}
active=[CANON,KINDS,ATLAS,'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json','curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json','docs/qa-ci/status/curriculum-quality-status.json']
inputs=[bind(p) for p in active]+[bind(central_path),bind(C/'whole18-source35-partners30-P18-cases36.independent-c.scientific-FIRST.verdict.json'),bind(C/'seven-source-holds.current-operative-vs-material-scope-and-closure-evidence.actual.json'),bind(AUTHOR/'input/whole-current18-source35-and-whole-partners30.exact-neutral-input.json')]
seen={b['path'] for b in inputs}
for r in rows:
    for binding_key in ['mappingBinding','extractionBinding']:
        path=r[binding_key]['path']
        if path not in seen:inputs.append(bind(path));seen.add(path)
for jur in ['mv','sn','st','th']:
    path=f'curricula/DE/Gymnasium/composition-views/biologie/de-{jur}-gym-seki-biology.view.json'
    inputs.append(bind(path));seen.add(path)
inputs.append(bind('app/scripts/config/goal-books/source-views/de-gym-biology-national-atlas/source-projection.receipt.json'))
copy_exact(CANON,'input/current-canonical479.exact.json')
copy_exact(KINDS,'input/current-kinds394.exact.json')
copy_exact(AUTHOR/'input/whole-current18-source35-and-whole-partners30.exact-neutral-input.json','input/whole35-duty30-partner-original-frame.exact.json')
put('source-remediation.input-FIRST.freeze.json',{'schemaVersion':1,'role':'author-input-before-source-successor-mutations','createdAt':NOW,'inputBindings':inputs,'sourceDutyCount':35,'originalPartnerCount':30,'currentCanonicalNodes':479,'currentCurricularAtomicGoals':394,'protectedStrictGoalIds':sorted(protected),'activeWrites':False,'independentApproval':False,'humanApproval':False})

# Reuse already read, byte-bound primary passages. They are audit input, not new endorsements.
primary_bindings=[]
for name in ['HE-current2025.actual-official.txt','RP-original-full-affected-topic-pages.txt','MV-original-full-affected-topic-pages.txt','SH-original-full-affected-topic-pages.txt','SN-original-full-affected-topic-pages.txt','ST-original-full-affected-topic-pages.txt','TH-original-full-affected-topic-pages.txt']:
    p=AUTHOR/'primary'/name
    primary_bindings.append(bind(p))
# Only bounded selected pages are emitted from the SH official PDF; not a complete PDF export.
sh_pdf='curricula/DE/Gymnasium/input/SH/Fachanforderungen_Biologie_Sekundarstufe_2023_barrierearm.pdf'
sh_pages=subprocess.check_output(['pdftotext','-layout',str(ROOT/sh_pdf),'-'],stderr=subprocess.DEVNULL).decode().split('\f')
sh_excerpt='\n\n'.join('ACTUAL PHYSICAL PDF PAGE '+str(n)+'\n'+sh_pages[n-1] for n in [44,53,59,60,70])
(BASE/'primary').mkdir(exist_ok=True)
(BASE/'primary/SH2023-SekII-E13-E15-and-course-legends.actual.txt').write_text(sh_excerpt)
put('primary-reading-and-current-version.actual.json',{'schemaVersion':1,'role':'bounded-actual-primary-reading','reusedPrimaryBindings':primary_bindings,'SHOriginalPdf':bind(sh_pdf),'SHSelectedPhysicalPages':[44,53,59,60,70],'SHPrintedPages':[42,51,57,58,68],'SHSelectedText':bind(BASE/'primary/SH2023-SekII-E13-E15-and-course-legends.actual.txt'),'SHCurrentOfficialPortal':'https://fachportal.lernnetz.de/sh/faecher/biologie/fachanforderungen.html','SHPortalActuallyReadAt':NOW,'SHCurrentVersionDisclosure':'Official portal: SekI 2026 applies progressively from the grade in which Biology starts; SekI2023 expires grade by grade. SekII was taken over unchanged from2023. Basiskonzept table3.2 also includes supplementary/concretizing contents; Migration/Genfluss must not be advertised as a separately universal compulsory bullet.','sourceRights':'Official sources retain their original rights; owned operationalisations CC-BY-4.0.','humanApproval':False})

# Whole extraction/mapping successors: all unrelated rows and original partner/frame values retained.
changed=[];map_replacements={};qualification=[]
def load_pair(row_id,label):
    r=byrow['source-duty-'+row_id]
    mp=r['mappingBinding']['path'];ep=r['extractionBinding']['path']
    m=read(mp);e=read(ep)
    return r,mp,ep,m,e,deepcopy(m),deepcopy(e),label
def save_pair(pair,mm,ee):
    r,mp,ep,m,e,_,_,label=pair
    ex=put('candidate/source-extractions/'+label+'.whole-successor.json',ee)
    mm['sourceExtractionPath']=ex
    out=put('candidate/mappings/'+label+'.whole-successor.review.json',mm)
    map_replacements[mp]=out
    changed.extend([{'kind':'source-extraction','original':bind(ep),'successor':bind(ex),'exactSemanticDiffs':diff(e,ee),'originalRows':len(e['sourceGoals']),'successorRows':len(ee['sourceGoals'])},{'kind':'mapping','original':bind(mp),'successor':bind(out),'exactSemanticDiffs':diff(m,mm),'originalDecisions':len(m['decisions']),'successorDecisions':len(mm['decisions'])}])
    return ex,out
he=load_pair('0182','HE144-four-source-and-course');_,mp,ep,m,e,mm,ee,_=he
he_current_key='KC2024_BIOLOGIE_SEKII_STAND_20250801'
he_source_goals={g['id']:g for g in ee['sourceGoals']}
he_whole=(AUTHOR/'primary/HE-current2025.actual-official.txt').read_text().split('\f')
he_specs=[
 ('0182','Q2.1',42,'GK_LK','Evolutionsmechanismen / populationsgenetischer Artbegriff','ergänzende eigene Operationalisierung Genfluss; keine ausdrückliche amtliche Migration/Genfluss-Einzelklausel','needs_current_primary_clause_review'),
 ('0210','Q2.1',42,'LK','Evolution des Menschen: Ursprung, Fossilgeschichte, Stammbäume','eigener Datierungstransfer als Teilrolle zu amtlicher Fossilgeschichte; amtlicher Text nennt keine einzelne Datierungsmethoden-Kompetenz','mapped'),
 ('0211','Q2.1',42,'GK_LK','Synthetische Evolutionstheorie und Abgrenzung nicht-naturwissenschaftlicher Vorstellungen','Teilrolle des eigenen historischen Theorievergleichs; Q2.2 ist nicht die amtliche Evolutionstheorien-Klausel','mapped'),
 ('0213','Q1.5',40,'LK','Homöobox-Gene und Steuerung der Genaktivität in verschiedenen Entwicklungsphasen','Teilrolle zu Entwicklungsgenetik; Q1.5 ist ein Wahlthemenfeld, nicht obligatorisch für jeden LK. mapped ist ausschließlich ein buchlokaler optionaler Quellen-Witness, keine Standard-Lernenden-Pflicht','mapped'),
]
for row_id,topic,page,course,title,limit,state in he_specs:
    r=byrow['source-duty-'+row_id];idx=int(r['decisionJsonPointer'].split('/')[-1]);g=he_source_goals[r['wholeOriginalDecision']['sourceGoalId']];old=deepcopy(g)
    pid='he-current2025-evo18-source-successor:'+row_id
    # Bounded literal raw extract keeps the complete actual current topic page, including its placement header.
    raw_page=he_whole[page-1]
    if row_id=='0182':
        literal=raw_page[raw_page.index('–   weitere grundlegende Prinzipien'):raw_page.index('–   Synthetische Evolutionstheorie')].strip()
    elif row_id=='0210':
        literal=raw_page[raw_page.index('–   Evolution des Menschen:'):raw_page.index('–   kulturelle Evolution:')].strip()
    elif row_id=='0211':
        literal=raw_page[raw_page.index('–   Synthetische Evolutionstheorie'):raw_page.index('–   Stammbäume:')].strip()
    else:
        literal=raw_page[raw_page.index('–   Steuerung der Genaktivität'):raw_page.index('–   Homöobox-Gene')+len('–   Homöobox-Gene')].strip()
    ee['passages'].append({'id':pid,'topicCode':topic,'title':title,'text':raw_page,'rawText':raw_page,'sourceDocumentKey':he_current_key,'sourceRef':f'Kerncurriculum Biologie Hessen, Stand01.08.2025, Druckseite{page}, {topic}','sourceSpan':topic+'; tatsächlicher Themenfeldtext ohne erfundene eigene Unterpunktnummer','stage':'SekII','courseLevel':course,'sourceGoalIds':[g['id']]})
    g.update({'passageId':pid,'topicCode':topic,'bulletIndex':None,'sourceDocumentKey':he_current_key,'sourceText':literal,'parentBulletText':literal,'rawSourceText':literal,'rawParentBulletText':literal,'sourceSpan':topic+' / '+title,'rawSourceSpan':topic+' / '+title,'sourceRef':f'Kerncurriculum Biologie Hessen, Stand01.08.2025, Druckseite{page}, {topic}','courseLevel':course,'granularity':'authored-operationalisation-with-primary-partial-role','tags':['jurisdiction:DE-HE','stage:SekII','phase:'+topic.split('.')[0],'courseLevel:'+course,'topic:'+topic]})
    g['authorSourceQualification']={'originalWholeSourceGoal':old,'currentPrimaryPage':page,'optionBoundaryPrimaryPage':38 if row_id=='0213' else None,'literalOwnDescriptionIsOfficialQuote':False,'ownDescriptionRetained':old['description'],'sourceRole':'complementary-transfer' if row_id=='0182' else 'partial','wholeCanonicalCompetenceOfficiallyRequired':False,'placement':'selected-Q1.5-LK-only' if row_id=='0213' else 'current-Q2.1-course-role','limit':limit,'independentSourceReview':'pending','humanApproval':False}
    d=mm['decisions'][idx]
    d.update({'topicCode':topic,'sourceSpan':g['sourceSpan'],'decision':state,'matchType':'partial','rationale':limit+'; Autor-Nachfolger, unabhängige Quellen-/Kursprüfung offen. Alte ganze eigene Kompetenz, ursprüngliche Partner und Quellpflicht bleiben im Originalrahmen erhalten.','reviewedAt':'2026-10-09','reviewer':'evo18-seven-source-author'})
    d['authorQualification']={'originalDecisionRetainedInFrame':r['rowId'],'sourceApproval':False,'defaultWholeCourseApproval':False,'independentReviews':'pending','mandatoryWholeSourceClaim':False,'bookCatalogOptionalSourceWitness':row_id=='0213','autoRegisterOptionalLearnerView':False}
    if state!='mapped':
        mm['mappings']=[edge for edge in mm.get('mappings',[]) if edge.get('legacyGoalId',edge.get('sourceGoalId'))!=g['id']]
    qualification.append({'findingIds':['EVO18-C-SOURCE-001' if row_id=='0182' else 'EVO18-C-SOURCE-002' if row_id=='0213' else 'EVO18-C-SOURCE-003'],'originalDutyRow':r['rowId'],'originalWholePartnerIds':r['wholeCanonicalPartnerGoalIds'],'newRole':state,'limit':limit,'wholeSourceApproval':False})
he_ex,he_map=save_pair(he,mm,ee)

# RP locator successor: page changes only in extraction; five old competencies and edges unchanged.
rp=load_pair('0276','RP48-five-locators-and-behaviour-gap');r,mp,ep,m,e,mm,ee,_=rp
rp_five=['0259','0260','0275','0276','0277']
rp_goal_map={g['id']:g for g in ee['sourceGoals']}
for num in rp_five:
    row=byrow['source-duty-'+num];g=rp_goal_map[row['wholeOriginalDecision']['sourceGoalId']]
    printed=26 if num in ['0259','0260'] else 46;physical=printed+2
    old_ref=g['sourceRef'];g['sourceRef']=f'RP-BIO-SEKI-2014 S. {printed} (physische PDF-Seite {physical})'
    qualification.append({'findingIds':['EVO18-C-SOURCE-006'],'originalDutyRow':row['rowId'],'correctionOnly':'sourceRef printed/physical page; every own competency/edge/partner remains exact','oldRef':old_ref,'newRef':g['sourceRef'],'originalWholePartnerIds':row['wholeCanonicalPartnerGoalIds'],'wholeSourceApproval':False})

# A genuine missing bounded competence; no upper LK-primate substitution.
behaviour_id=str(uuid.uuid5(uuid.UUID(canon['landscapeId']),'canonical-biology-seki-ancestry-selected-human-behaviour'))
behaviour_goal={
 'id':behaviour_id,'shortKey':'canonical_biology_seki_ancestry_selected_human_behaviour',
 'title':'Menschliches Verhalten aus Abstammung erklären','titleEn':'Explain human behaviour using ancestry',
 'description':'Die lernende Person kann bei einer ausgewählten menschlichen Verhaltensweise Kenntnisse zur Abstammung des Menschen nutzen, um eine evolutionäre Funktionserklärung mit dem unmittelbaren Auslöser zu verknüpfen, und erläutern, warum eine plausible Funktionserklärung allein kein Nachweis einer konkreten Anpassung ist.',
 'descriptionEn':'The learner can use knowledge of human ancestry to connect an evolutionary functional explanation of a selected human behaviour with its immediate trigger, and explain why a plausible functional account alone does not prove a particular adaptation.',
 'type':'atomic','contains':[],'requires':['632b6042-0c0e-5bb6-a879-f03ad4be6eee'],'weight':1,
 'tags':['GK','LK','canonical','SekI'],
 'dimensionTags':{'framework':'canonical-gymnasium-biology','demandLevel':'AB2','processCompetencies':[],'guidingIdeas':['BIO_ENTWICKLUNG'],'phase':'GLOBAL','area':'Evolution und menschliches Verhalten','topicCode':'CANONICAL.BIOLOGY.SEK1.ANCESTRY_SELECTED_HUMAN_BEHAVIOUR'},
 'applicability':{'jurisdiction':['DE-RP']},
 'sourceRef':'RP Rahmenlehrplan Biologie2014, TF12, Druckseite46 / phys48, Wissen über Abstammung zur Erklärung ausgewählter menschlicher Verhaltensweisen',
 'extendedData':{'provenance':{'sourceLandscapeId':e['sourceLandscapeId'],'sourceGoalIds':[byrow['source-duty-0276']['wholeOriginalDecision']['sourceGoalId']]},'authorCandidate':{'package':REL,'candidateKey':'ancestry_selected_human_behaviour','independentReviews':'pending','semanticAtomicityReview':'pending','humanApproval':False}}
}
assert behaviour_id not in goals
expanded=deepcopy(canon);expanded['goals'].append(behaviour_goal)
expanded_path=put('candidate/current479-plus-one-assessable-behaviour-companion.canonical.json',expanded)
put('candidate/one-bounded-behaviour-companion.goal.json',behaviour_goal)
rp_d=mm['decisions'][45];assert rp_d['sourceGoalId']==byrow['source-duty-0276']['wholeOriginalDecision']['sourceGoalId']
rp_d['rationale']='430b liefert nur die ursprüngliche Fossil-/Kultur-Teilrolle. Die geforderte Abstammung→Verhaltens-Erklärung verlangt den gesonderten begrenzten companion-Kandidaten; dessen Atomarität, zwei unabhängige Beschreibungsreviews und D/P/M/V sind noch offen. Keine Vollabdeckung und kein LK-Primate-Ersatz.'
rp_d['reviewedAt']='2026-10-09';rp_d['reviewer']='evo18-seven-source-author'
rp_d['authorQualification']={'retainedOriginalWholePartners':deepcopy(rp_d['canonicalGoalIds']),'missingAssessablePartnerCandidate':behaviour_id,'wholeDutyComplete':False,'sourceApproval':False}
rp_ex,rp_map=save_pair(rp,mm,ee)
rp_expanded=deepcopy(mm);rp_expanded['decisions'][45]['canonicalGoalIds'].append(behaviour_id)
rp_expanded['decisions'][45]['matchType']='partial'
rp_expanded['mappings'].append({'legacyGoalId':rp_d['sourceGoalId'],'canonicalGoalId':behaviour_id,'matchType':'partial','reviewDecisionId':'evo18-rp-ancestry-behaviour-author-candidate','rationale':'Bounded actual ancestry→behaviour obligation, conditional on independent companion gates.'})
rp_expanded_path=put('candidate/conditional/RP48-original-partner-plus-assessable-behaviour-companion.review.json',rp_expanded)
qualification.append({'findingIds':['EVO18-C-SOURCE-005'],'originalDutyRow':'source-duty-0276','originalWholePartnerIds':['430b2b73-641a-5122-bb6d-162b0d1eaf2d'],'newAssessableCompanionId':behaviour_id,'baseWhole479MappingKeepsGapOpen':True,'expandedConditionalMapping':rp_expanded_path,'lowerStage':True,'LKPrimateSubstitution':False,'sourceApproval':False})

# Honest current lower-stage roles: advanced complete EA targets no longer receive these broad source witnesses.
advanced={'1e78d6eb-1f49-59c1-9617-6ea445d3fe65','c2f8c542-9386-5a18-bf7e-52698b932242','9dff0360-c2e9-5e43-af8b-87e264281cf7'}
classification='2ae2da43-73d5-578f-84f4-be0585a7d8f9'
observation='0f1549f6-8341-53b0-8161-5eaeb2b37809';microscope='91df35c7-e384-50d6-bb3a-37e74a6086f1';models='713e062d-2bb9-5fbc-8040-129387c7d3ca';investigate='82acfbde-9ce8-5658-892e-4dcfb1c3a1f1'
for num,jur in [('0237','MV'),('0284','SH'),('0311','SN'),('0321','ST'),('0329','TH')]:
    pair=load_pair(num,jur+'-whole-evolution-lower-roles');r,mp,ep,m,e,mm,ee,_=pair
    idx=int(r['decisionJsonPointer'].split('/')[-1]);d=mm['decisions'][idx];old_targets=deepcopy(d['canonicalGoalIds'])
    remove=advanced&set(old_targets)
    d['canonicalGoalIds']=[x for x in old_targets if x not in remove]
    additions=[classification] if jur in ['SH','SN','ST'] else []
    if jur=='SN':additions += [microscope,observation]
    if jur=='ST':additions += [observation,models,investigate]
    for g in additions:
        if g not in d['canonicalGoalIds']:d['canonicalGoalIds'].append(g)
    d['matchType']='partial'
    d['reviewedAt']='2026-10-09';d['reviewer']='evo18-seven-source-author'
    d['rationale']='Amtlicher Sek-I-Originalpunkt bleibt vollständig erhalten. Ganze fortgeschrittene EA-Primaten-/Kulturanpassungs- sowie historische-und-aktuelle-Systematikziele sind durch diese Quelle nicht vollständig verlangt; ihre alten Partnerwerte bleiben im unveränderten35/30-Rahmen. Quelle unterstützt nur konkret dokumentierte unterstufige Teilrollen und passende Basisziele. Methodenoperationen erfordern tatsächliche Durchführung, nicht bloß Erklärung synthetischer Daten. Autor-Kandidat; unabhängige Quellen-/Sichtprüfung offen.'
    d['authorQualification']={'retainedOriginalWholePartnerIds':old_targets,'removedUnsupportedWholeSourceTargets':sorted(remove),'explicitLowerStageBasisTargetsAdded':additions,'partialDoesNotMeanWholeSourceApproved':True,'sourceApproval':False,'wholePartnerDutyFramePath':REL+'/input/whole35-duty30-partner-original-frame.exact.json','wholeAdvancedGoalDescriptionsPreserved':True,'remainingOtherPartnerScopeReview':'pending','SH2023Scope':'outgoing applicable grades; SekI2026 progressively replaces starting grades' if jur=='SH' else None}
    if jur in ['SN','ST']:
        actual_source_goal=next(g for g in ee['sourceGoals'] if g['id']==d['sourceGoalId'])
        actual_source_goal['authorWholeOperationScope']={'wholePrimaryPageBinding':bind(AUTHOR/'primary'/f'{jur}-original-full-affected-topic-pages.txt'),'fullOriginalCompetenceRetainedInFrame':True,'originalOwnDescriptionOmitsOperations':True,'additionalActualOperations':['conduct microscopic comparison of moss/fern/seed-plant axis cross-sections'] if jur=='SN' else ['observe/document natural variation','construct fossil model','conduct/evaluate selection model experiment','use computer simulation variation/selection for selective breeding'],'boundedOwnerRoute':{'microscopy':microscope,'observation':observation,'modelInterpretation':models,'conductedControlledInvestigation':investigate},'textOnlySubstituteAccepted':False,'performedHumanOperation':False,'independentScientificMethodReview':'pending'}
    # Legacy edges also must not continue to assert unsupported current source routes.
    old_edges=deepcopy(mm.get('mappings',[]))
    sgid=d['sourceGoalId']
    def cid(edge):return str(edge.get('canonicalGoalId',edge.get('targetGoalId',''))).replace(canon['landscapeId']+':','')
    mm['mappings']=[edge for edge in old_edges if not (edge.get('legacyGoalId',edge.get('sourceGoalId'))==sgid and cid(edge) in remove)]
    for gid in additions:
        if not any(edge.get('legacyGoalId',edge.get('sourceGoalId'))==sgid and cid(edge)==gid for edge in mm['mappings']):
            mm['mappings'].append({'legacyGoalId':sgid,'canonicalGoalId':gid,'matchType':'partial','reviewDecisionId':'evo18-'+jur.lower()+'-basis-'+gid,'rationale':'Current primary-bound lower-stage component; independent author candidate, not whole source approval.'})
    ex,out=save_pair(pair,mm,ee)
    qualification.append({'findingIds':['EVO18-C-SOURCE-007']+(['EVO18-C-SOURCE-004'] if jur in ['SN','ST'] else []),'originalDutyRow':r['rowId'],'originalWholePartnerIds':old_targets,'sourceApproved':False,'removedUnsupportedWholeCurrentTargets':sorted(remove),'basisTargetsAdded':additions,'unchangedRemainingPartnersNotAutomaticallyApproved':True,'successorMapping':out})

# Actual supplementary SH-SekII Gene-flow component, not an invented HE numbered official bullet.
sh_original=next(s for s in atlas['sourceDocumentSnapshots'] if s['path']==sh_pdf)
sh_id=str(uuid.uuid5(uuid.UUID(canon['landscapeId']),'source-SH2023-SekII-E13-E15-gene-flow'))
sh_sg='sh-biology-sekii-fa2023-e13-e15-migration-genfluss-source-component'
sh_doc_key='DE-SH-BIOLOGIE-SEKII-FACHANFORDERUNGEN-2023-UNCHANGED2026'
sh_description='Beschreiben und erklären des Einflusses von Evolutionsfaktoren auf die genetische Variabilität eines Genpools sowie der Entstehung von Arten mit der synthetischen Evolutionstheorie; konkrete Inhalte Migration und Genfluss in E13/E15.'
sh_extract={'schemaVersion':1,'extractionId':'sh-biology-evo18-gene-flow-source-component-author-v1','sourceLandscapeId':sh_id,'title':'Aktueller SH-SekII E13/E15 Genfluss-Quellenkomponent','jurisdiction':'DE-SH','subject':'Biologie','stage':'SekII','sourceDocuments':[{'key':sh_doc_key,'title':'Fachanforderungen Biologie2023, SekII unverändert übernommen in2026','path':sh_pdf,'url':sh_original['url'],'sha256':sh_original['sha256'],'official':True}],
 'passages':[{'id':'SH2023-SEKII-E13-E15','title':'E13/E15','text':sh_pages[69],'sourceDocumentKey':sh_doc_key,'sourceRef':'Druck68/phys70; Verbindlichkeits- und Ergänzungsgrenzen Druck51/57/58','stage':'SekII','courseLevel':'GK_LK'}],
 'sourceGoals':[{'id':sh_sg,'passageId':'SH2023-SEKII-E13-E15','topicCode':'E13-E15','title':'Migration und Genfluss','description':sh_description,'sourceText':'Migration; Genfluss','parentBulletText':'E13 Evolutionsfaktoren beeinflussen die Variabilität des Genpools einer Population; E15 Entstehung von Arten beruht auf Isolation von Teilpopulationen','rawSourceText':'Migration; Genfluss','sourceSpan':'TabelleIII3.2 Evolution E13/E15; Druck68/phys70','sourceRef':'SH Fachanforderungen Biologie2023, Druck68/phys70, SekII E13/E15','sourceDocumentKey':sh_doc_key,'courseLevel':'GK_LK','granularity':'authored-component-of-current-official-basiskonzept-table','tags':['jurisdiction:DE-SH','stage:SekII','courseLevel:GK_LK'],
 'authorSourceQualification':{'explicitCurrentNamedContents':True,'mandatoryStandaloneMigrationBulletClaimed':False,'basiskonzeptTableIncludesAdditionalContents':True,'complementaryWithinEvolutionScope':True,'primaryCourseLevels':'grundlegend und erhöht; Fachkonferenz sets implementation','independentReview':'pending','humanApproval':False}}]}
sh_ex_path=put('candidate/source-extractions/SH-SekII-E13-E15-gene-flow.additional-source.json',sh_extract)
sh_mapping={'version':1,'reviewId':'sh-gene-flow-actual-E13-E15-author-candidate','sourceLandscapeId':sh_id,'targetLandscapeId':canon['landscapeId'],'sourceExtractionPath':sh_ex_path,'status':{'sourceApproval':False,'authorCandidate':True,'wholeMandatoryCourseClaim':False},'mappings':[{'legacyGoalId':sh_sg,'canonicalGoalId':'e5f97788-c2ac-5f42-b5a5-55605b563a79','matchType':'partial','reviewDecisionId':'evo18-sh-sekii-gene-flow-primary','rationale':'Actual named supplementary Migration/Genfluss contents, current unchanged SekII2023→2026; not HEQ1.1.9.'}], 'decisions':[{'sourceGoalId':sh_sg,'decision':'mapped','canonicalGoalIds':['e5f97788-c2ac-5f42-b5a5-55605b563a79'],'matchType':'partial','rationale':'Author-reviewed current official E13/E15 supports the own gene-flow competence as a supplementary component in SekII. Not a mandatory standalone content bullet for every course; independent source and placement approval pending.','reviewer':'evo18-seven-source-author','reviewedAt':'2026-10-09'}]}
sh_map_path=put('candidate/mappings/SH-SekII-E13-E15-gene-flow.additional.review.json',sh_mapping)

# Four ordinary authored views plus SH basis roles: whole current goals stay exact.
view_changes=[]
for jur in ['mv','sn','st','th','sh']:
    orig=f'curricula/DE/Gymnasium/composition-views/biologie/de-{jur}-gym-seki-biology.view.json'
    if not (ROOT/orig).exists():continue
    v=read(orig);vv=deepcopy(v)
    vv['$schema']='https://skillpilot.com/schemas/curriculum-package/v1/composition-view.schema.json'
    to_remove=advanced if jur!='sh' else {'9dff0360-c2e9-5e43-af8b-87e264281cf7'}
    def trim(nodes):
        kept=[]
        for node in nodes:
            if node.get('kind') in ['goalEntry','canonicalSubtree'] and node.get('goalId') in to_remove:continue
            x=deepcopy(node)
            if 'children' in x:x['children']=trim(x['children'])
            kept.append(x)
        return kept
    vv['rootNodes']=trim(vv['rootNodes'])
    existing=set()
    def walk(nodes):
        for n in nodes:
            if 'goalId' in n:existing.add(n['goalId'])
            walk(n.get('children',[]))
    walk(v['rootNodes']);original_goal_refs=existing.copy();existing.clear();walk(vv['rootNodes'])
    if jur in ['sn','st','sh'] and classification not in existing:vv['rootNodes'][0]['children'].append({'kind':'goalEntry','goalId':classification,'projectionRole':'target'})
    out=put('candidate/composition-views/'+Path(orig).name,vv)
    view_changes.append({'original':bind(orig),'successor':bind(out),'exactSemanticDiffs':diff(v,vv),'unsupportedWholeTargetsRemoved':sorted(to_remove&original_goal_refs),'noAutomaticPrerequisiteOnlyInference':True,'whole479GoalsPreserved':True})

# Explicit selected-elective view; it is NOT substituted for the default HE LK path.
optional={'$schema':'https://skillpilot.com/schemas/curriculum-package/v1/composition-view.schema.json','viewFormatVersion':'1.0','viewId':'de-he-gym-sekii-biology-lk-Q1-5-explicitly-selected-author-candidate','landscapeId':canon['landscapeId'],'language':'de-DE','title':'Biologie HE LK: Q1.5 Genaktivität ausdrücklich gewählt (Autorenkandidat)','scope':{'schoolForm':'Gymnasium','jurisdiction':'DE-HE','stage':'SekII','courseProfile':'LK'},'rootNodes':[{'kind':'structure','id':'HE-Q1-5-selected-only','label':'Nur bei ausdrücklich gewähltem Themenfeld Q1.5','children':[{'kind':'goalEntry','goalId':'9b40dae5-6d89-5714-ac96-373e72a7045e','projectionRole':'target'}]}]}
put('candidate/composition-views/HE-Q1-5-LK-explicitly-selected.view.json',optional)

# RP whole source route plus actual new bounded partner is conditional; explicit target, never tag-derived.
rp_orig='app/scripts/config/goal-books/source-views/de-gym-biology-national-atlas/de-gym-biologie-bundesweit-source-de-rp-seki.view.json'
rp_view=read(rp_orig);rp_new=deepcopy(rp_view);rp_new['$schema']='https://skillpilot.com/schemas/curriculum-package/v1/composition-view.schema.json';rp_new['rootNodes'][0]['children'].append({'kind':'goalEntry','goalId':behaviour_id,'projectionRole':'target'})
put('candidate/conditional/RP-SekI-plus-ancestry-behaviour-companion.view.json',rp_new)

candidate_atlas=deepcopy(atlas)
candidate_atlas['mappingPaths']=[map_replacements.get(p,p) for p in atlas['mappingPaths']]+[sh_map_path]
candidate_atlas['landscapePath']=REL+'/input/current-canonical479.exact.json'
candidate_atlas['semanticKindLedgerPath']=REL+'/input/current-kinds394.exact.json'
put('candidate/source-atlas.whole479-book-catalog-with-optional-witness.inputs.json',candidate_atlas)
# Book-local catalog and committed learner scope are different bindings. Omission
# from a mandatory-only diagnostic is not a reason to remove a valid elective
# from the complete national book catalog or lower its expected denominator.
he_mandatory=read(he_map);he_mandatory['decisions'][81]['decision']='needs_optional_view_placement_review'
he_mandatory['mappings']=[edge for edge in he_mandatory['mappings'] if edge.get('legacyGoalId',edge.get('sourceGoalId'))!=he_mandatory['decisions'][81]['sourceGoalId']]
he_mandatory_path=put('candidate/conditional/HE144-mandatory-only-hox-omitted.diagnostic.review.json',he_mandatory)
mandatory_atlas=deepcopy(candidate_atlas);mandatory_atlas['mappingPaths']=[he_mandatory_path if p==he_map else p for p in candidate_atlas['mappingPaths']]
put('candidate/conditional/source-atlas.whole479-mandatory-only-diagnostic.inputs.json',mandatory_atlas)
# A separate diagnostic includes the optional Hox source only for explicit selected-Q1.5 examination.
he_selected=read(he_map);he_selected['decisions'][81]['decision']='mapped'
he_selected['decisions'][81]['rationale']+=' Dieses Mapping ist ausschließlich für die diagnostische explizit gewählte Q1.5-Sicht; nicht als Standard-LK-Route integrieren.'
he_selected_path=put('candidate/conditional/HE144-Q1-5-explicitly-selected-only.review.json',he_selected)
selected_atlas=deepcopy(candidate_atlas);selected_atlas['mappingPaths']=[he_selected_path if p==he_map else p for p in candidate_atlas['mappingPaths']]
put('candidate/conditional/source-atlas.whole479-explicit-Q1-5-selection-only.inputs.json',selected_atlas)

# Existing goal duty owners are reused based on their actual texts; no new quota for selected18.
put('existing-method-owner-search-and-companion-needs.actual.json',{'schemaVersion':1,'current479SearchBinding':bind(CANON),'sourceFindings':['EVO18-C-SOURCE-004','EVO18-C-SOURCE-005','EVO18-C-SOURCE-007'],'actualWholeExistingGoalRows':[goals[x] for x in [classification,observation,microscope,models,investigate]],'existingMethodOwnerRoute':{'SNMicroscopy':[microscope,observation],'STNaturalVariation':[observation],'STFossilModel':[models,investigate],'STSelectionModelAndSimulation':[models,investigate]},'wholeMethodsAlreadyApprovedForNewContext':False,'performedHumanOrClassOperationClaimed':False,'RPExistingRelevantWholeGoalRows':[g for g in canon['goals'] if g['id'] in ['430b2b73-641a-5122-bb6d-162b0d1eaf2d','c05e217f-33fc-5a11-ba75-1397fad3ae0a','89b099ab-b0e5-598d-a8d5-f3e80d1a58ff']],'RPBoundedCompanion':behaviour_goal,'RPWhyExistingWholeGoalDoesNotDischargeDuty':'430b requires fossil/cultural reconstruction, not ancestry→selected human behaviour. Stress hormone regulation and upper LK primate analysis are not substituted. Entire479 was searched; bounded explaining human behaviour is the only added semantic competence.','newCompanionNeeds':{'D':'two independent whole DE/EN description reviews, resolve actual findings','A':'independent semantic atomarity decision, no automatic authoritative semantic kind','P':'two complete bounded bilingual material cases plus normal v2 profiles/records after kind review','M':'explicit memory decision; no card facts invented or visibility asserted','V':'actual PNG + independent science/visual decisions later; no new image generated here','source':'RP TF12 physical48/printed46, exact whole original duty/partner retained','humanApproval':False},'expandedCanonicalPath':expanded_path,'currentDenominatorUnchanged':394,'conditionalFutureDenominatorIfCompanionAccepted':395,'strictGain':0})

put('source-and-view.exact-semantic-diffs.actual.json',{'schemaVersion':1,'role':'author-successor-value-diffs-not-hash-only-science','sourceSuccessors':changed,'viewSuccessors':view_changes,'allWholeOriginal35DutiesRetainedExact':True,'allWholeOriginal30PartnersRetainedExact':True,'allCurrent479GoalObjectsRetainedExactInExpandedCandidate':expanded['goals'][:479]==canon['goals'],'all394CurrentAtomicGoalIdsRetained':True,'newCompanionIds':[behaviour_id],'wholeSourceApproval':False,'humanApproval':False})
put('seven-source-author-qualification-and-remaining-fields.actual.json',{'schemaVersion':1,'role':'author-genuine-partial-source-and-placement-remediation','wholeOriginalFrame':REL+'/input/whole35-duty30-partner-original-frame.exact.json','qualificationRows':qualification,'originalSevenWholeClosureConditions':[{'findingId':f.get('findingId'), 'necessaryClosureEvidence':f['necessaryClosureEvidence']} for f in holds['findings']],'allSevenFindingsIndependentlyClosed':False,'remainingFields':['two independent actual source/text/course/view reviews','book SourceAtlas expected394 remains strict; catalog optional witness never proves a universal HE-LK learner duty','actual HE-LK standard learner view/source choice binding needs independent approval; no existing HE-SekII learner view is present in the current8 author views','RP companion semantic-kind/atomarity/D/P/M/V decisions and conditional expanded source/view route','SN/ST actual material/method-owner scope independent review; no performed-human claim','430b material atomarity finding remains independently open','whole other30partner scientific/assessment closure not inferred from partial roles'],'currentStrictBio':{'strict':299,'denominator':394},'strictGain':0,'activeWrites':False,'humanApproval':False,'humanTrial':False})

# Context intersections are exact current protected IDs, not a global re-review trigger.
affected=set()
for q in qualification:
    affected.update(q.get('originalWholePartnerIds',[]));affected.update(q.get('basisTargetsAdded',[]))
affected.update([classification,observation,microscope,models,investigate,'e5f97788-c2ac-5f42-b5a5-55605b563a79','9b40dae5-6d89-5714-ac96-373e72a7045e'])
put('affected-current-protected299.source-page-context-list.actual.json',{'schemaVersion':1,'protectedCurrent299Binding':bind(central_path),'protectedCurrent299GoalIds':sorted(protected),'affectedSourceContextGoalIds':sorted(affected),'affectedProtected299GoalIds':sorted(affected&protected),'unaffectedProtected299GoalIds':sorted(protected-affected),'wholeProtectedGoalObjectsUnchanged':True,'activeProtectedEvidenceBindingsUntouched':True,'requiredReviewOnlyIfCandidateIntegrated':'Review actual changed source/page/course/view contexts for listed IDs; unchanged descriptions/material/image bytes retain valid independent evidence. No historical reruns.','allActiveBindingsBefore':inputs[:len(active)],'strictGain':0,'activeWrites':False})
print(json.dumps({'package':REL,'sourceAndMappingSuccessors':len(changed),'authoredViewSuccessors':len(view_changes),'newCompanionIds':[behaviour_id],'affectedProtected299':len(affected&protected),'whole35Retained':True,'whole30Retained':True,'current479Retained':True,'strictGain':0},ensure_ascii=False))
