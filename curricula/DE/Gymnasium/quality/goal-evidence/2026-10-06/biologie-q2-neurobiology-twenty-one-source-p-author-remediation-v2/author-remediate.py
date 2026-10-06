# SPDX-License-Identifier: Apache-2.0
"""Inactive author successor. No active or historical writes."""
import copy, hashlib, json, pathlib, datetime, uuid
ROOT = pathlib.Path('/home/enpasos/projects/skillpilot')
HERE = pathlib.Path(__file__).resolve().parent
EVIDENCE = HERE.parent
V1 = EVIDENCE / 'biologie-q2-neurobiology-twenty-one-current-author-candidate-v1'
A = EVIDENCE / 'biologie-q2-neurobiology-twenty-one-current-independent-a-v1'
B = EVIDENCE / 'biologie-q2-neurobiology-twenty-one-current-independent-b-v1'
ISO = ROOT / 'tmp/biologie-q2-neurobiology-twenty-one-source-p-author-remediation-20261006-v2-native-scope'
STAMP = datetime.datetime.now(datetime.timezone.utc).isoformat()
def read(p): return json.loads(p.read_text())
def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()
def digest(x): return hashlib.sha256(json.dumps(x, ensure_ascii=False, sort_keys=True, separators=(',', ':')).encode()).hexdigest()
def write(p, x):
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(json.dumps(x, ensure_ascii=False, indent=2)+'\n')
def jdelta(a,b,path=''):
    if a==b:return []
    if isinstance(a,dict) and isinstance(b,dict):
        out=[]
        for k in sorted(a.keys()|b.keys()):
            if k not in a or k not in b:out.append({'path':path+'/'+k,'before':a.get(k),'after':b.get(k)})
            else:out+=jdelta(a[k],b[k],path+'/'+k)
        return out
    return [{'path':path,'before':a,'after':b}]

inputs=[]
for folder, name, expected in [(V1,'neurobiology-twenty-one-author-candidate.final.freeze.json','7b94d5170b1a200ad38c674214f1f18c2b0f85122cdd8334db7909dd674fe835'),(A,'independent-a.actual.final.freeze.json','e42e5992641f77cb7d98f12860c50c6d7dd6c82cee872979c6be595345471c5a'),(B,'independent-b.neurobiology-twenty-one.final.freeze.json','b34e59c5a70d268cf0c623e2341fe90768eb9d93e1d9f0da6cda20589a97c520')]:
    p=folder/name; assert sha(p)==expected
    inputs.append({'path':str(p.relative_to(ROOT)),'sha256':expected,'role':'sealed predecessor input; no mutation'})
write(HERE/'author-inputs.sealed-predecessors.actual.json',{'schemaVersion':1,'capturedAt':STAMP,'authorRoleTransition':'Independent A completed and sealed before accepting AUTHOR v2; B read only after actual whole-package freeze','inputs':inputs,'futureIndependentV2ApprovalByThisAuthorExcluded':True})

CP='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json'
base=read(ROOT/CP); candidate=copy.deepcopy(base)
snap=read(V1/'current-twenty-one.snapshot.json'); IDS=snap['goalIds']; selected=set(IDS)
old={g['id']:g for g in base['goals']}; new={g['id']:g for g in candidate['goals']}
for d in read(V1/'description-decisions.candidates.json')['goals']:
    g=new[d['goalId']]
    for k, key in [('title','proposedTitleDe'),('titleEn','proposedTitleEn'),('description','proposedDescriptionDe'),('descriptionEn','proposedDescriptionEn')]:g[k]=d[key]
G={g[:8]:g for g in IDS}
new[G['485ef1c3']]['description']='Die lernende Person kann an einem gegebenen Modell einer neuronalen Erkrankung, zum Beispiel Alzheimer, erklären, wie eine Störung neuronaler Strukturen oder Signalprozesse die Funktion des Systems verändert.'
new[G['485ef1c3']]['descriptionEn']="The learner can use a supplied model of a neuronal disorder, such as Alzheimer's, to explain how a disturbance of neuronal structures or signalling processes changes the function of the system."
for short in ['a46cafde','c05e217f']:
    g=new[G[short]]; g['tags']=[t for t in g['tags'] if t!='GK']
for short in ['485ef1c3','afde0001']:
    new[G[short]]['applicability']['jurisdiction']=['DE-HE']
# Bound inherited generic root evidence; direct reviewed component evidence remains.
for gid in IDS:
    new[gid].setdefault('extendedData',{})['applicabilityMappingInheritance']='boundary'
assert [g['id'] for g in candidate['goals']]==[g['id'] for g in base['goals']]
assert all(new[g]==old[g] for g in old if g not in selected)
assert all(new[g]['requires']==old[g]['requires'] for g in IDS)
write(HERE/'canonical.current464.baseline.snapshot.json',base)
write(HERE/'canonical.current464.author-v2.candidate.json',candidate)
write(ISO/CP,candidate)
write(HERE/'canonical21.actual.exact-deltas.json',{'schemaVersion':1,'all464IDsAndOrderPreserved':True,'all443Outside21WholeGoalsExact':True,'allRequiresAndContainsExact':True,'changedGoals':[{'goalId':gid,'beforeWholeGoalSha256':digest(old[gid]),'afterWholeGoalSha256':digest(new[gid]),'deltas':jdelta(old[gid],new[gid])} for gid in IDS if old[gid]!=new[gid]],'scienceTextChangedGoalIds':[gid for gid in IDS if any(old[gid].get(k)!=new[gid].get(k) for k in ['title','titleEn','description','descriptionEn'])],'sourceMetadataChangesNotScienceApproval':True})

heby=read(V1/'retained-he-by-binding-inputs.snapshot.json')['lanes']
regional=read(V1/'regional-claimed-contexts.snapshot.json')['lanes']
relations=read(B/'thirty-three.he-by-primary-binding-judgments.json')['relations']
lower=read(B/'lower-source-audit/regional-primary-component-audit.json')['relations']
allrels=relations+lower
assert len(allrels)==71
lanes={l['mappingPath']:l for l in heby+regional}
maps={p:read(ROOT/p) for p in lanes}
extracts={l.get('extractionPath',l.get('sourceExtractionPath')):read(ROOT/l.get('extractionPath',l.get('sourceExtractionPath'))) for l in lanes.values()}
source_before=copy.deepcopy(extracts); maps_before=copy.deepcopy(maps)

# Ten original HE p43 bullets, with local editorial keys explicitly distinct from official numbering.
bullets={
'GK1':'Bau und Funktion der Nervenzelle: Ruhepotenzial, Aktionspotenzial, Erregungsleitung',
'GK2':'Synapsen: Funktion der erregenden chemischen Synapse am Beispiel Acetylcholin-führender Synapsen, ligandenabhängige und spannungsabhängige Kanäle, Stoffeinwirkung an Acetylcholin-führenden Synapsen an einem Beispiel (zum Beispiel Medikamente, Gifte, Drogen, Alkohol), neuromuskuläre Synapse',
'GK3':'Potenzialmessungen',
'LK1':'Rezeptorpotenzial', 'LK2':'primäre und sekundäre Sinneszelle',
'LK3':'Hormone: Hormonwirkung, Verschränkung hormoneller und neuronaler Steuerung',
'LK4':'Verrechnung des Informationsflusses an Synapsen (EPSP, IPSP, räumliche und zeitliche Summation, Funktion einer hemmenden Synapse)',
'LK5':'zelluläre Prozesse des Lernens',
'LK6':'Störungen des neuronalen Systems (Prinzip: zum Beispiel Alzheimer oder Parkinson)',
'LK7':'neurophysiologische Verfahren (Prinzip: ein bildgebendes Verfahren der Hirnforschung)'}
keys={'ce19b80f':['GK1'],'ff1bf88f':['GK2'],'a46cafde':['LK5'],'78748ef2':['LK1','LK2'],'19758e09':['LK3'],'e1117126':['LK4'],'347110a1':['LK5'],'485ef1c3':['LK6'],'afde0001':['LK7'],'2381d2bb':['GK3'],'c9a06264':['LK5'],'4f631f78':['LK5'],'97b24279':['LK4'],'9b966664':['LK3'],'f6280154':['GK2'],'8b23f8fb':['Q2.4.GK1']}
special={'a46cafde','c9a06264','4f631f78','97b24279','9b966664','f6280154','8b23f8fb'}
whole_unproved={'ff1bf88f'}|special
hepath=next(p for p in maps if '/DE-HE/upper-secondary/' in p)
expath=lanes[hepath].get('extractionPath',lanes[hepath].get('sourceExtractionPath')); he=extracts[expath]
doc={'key':'KC2024_BIOLOGIE_SEKII','title':'Kerncurriculum Biologie gymnasiale Oberstufe Hessen 2024','path':'curricula/DE/Gymnasium/input/HE/upper-secondary/kerncurriculum_gymnasiale_oberstufe-biologie.pdf','role':'binding-core','official':True,'url':'https://kultus.hessen.de/sites/kultus.hessen.de/files/2025-10/kerncurriculum_gymnasiale_oberstufe-biologie.pdf'}
# Existing other-document references remain untouched; Q2.3 goals explicitly point to the actual PDF.
he['sourceDocument']=doc
docs=he.get('sourceDocuments',[])
for i,d in enumerate(docs):
    if d.get('key')==doc['key']:docs[i]=copy.deepcopy(doc)
if not any(d.get('key')==doc['key'] for d in docs):docs.append(copy.deepcopy(doc))
he['sourceDocuments']=docs
he['originalQ23Components']=[{'localEditorialKey':k,'officialOriginalBulletText':v,'printedPage':43,'physicalPage':43,'courseLevel':'GK_LK' if k.startswith('GK') else 'LK','numberIsNotOfficial':True} for k,v in bullets.items()]
hegoal={g['id']:g for g in he['sourceGoals']}
for r in relations:
    if r['mappingPath']!=hepath:continue
    s=hegoal[r['sourceGoalId']]; short=r['canonicalGoalId'][:8]; kk=keys[short]
    texts=[bullets[k] if k in bullets else 'ein Sinnesorgan: Aufbau und Signaltransduktion (von der Sinneswahrnehmung über die Erregungsleitung zur Reaktion)' for k in kk]
    course='LK' if all(k.startswith('LK') for k in kk) or short in special else 'GK_LK'
    s['description']=new[r['canonicalGoalId']]['description'];s['title']=new[r['canonicalGoalId']]['title']
    s['granularity']='authoredOperationalisation';s['sourceText']='\n'.join(texts);s['rawSourceText']='\n'.join(texts);s['parentBulletText']='\n'.join(texts);s['rawParentBulletText']='\n'.join(texts)
    s['sourceSpan']='; '.join('Q2.3.'+k if k in bullets else k for k in kk);s['rawSourceSpan']=s['sourceSpan']
    s['sourceRef']='Hessen KC Biologie 2024, gedruckte/physische Seite 43, '+s['sourceSpan']+' (lokale redaktionelle Komponentenschlüssel)'
    s['sourceDocumentKey']=doc['key'];s['courseLevel']=course
    s['tags']=[t for t in s.get('tags',[]) if not t.startswith('courseLevel:')]+['courseLevel:'+course]
    s['originalComponentKeys']=kk;s['operationalisationRole']='declaredDidacticSpecialisation' if short in special else 'boundedOriginalComponent'
    s['originalWholeBulletCoverage']='partial_or_contextual';s['isOfficialBullet']=False
    s['sourceOccurrences']=[{'sourceGoalId':s['id'],'passageId':s['passageId'],'topicCode':s['topicCode'],'sourceSpan':s['sourceSpan'],'sourceRef':s['sourceRef'],'courseLevel':course,'tags':s['tags']}]
    s['mergedSourceSpans']=[s['sourceSpan']];s['mergedSourceRefs']=[s['sourceRef']]
for p in he['passages']:
    if p.get('topicCode')=='Q2.3':
        p['text']=p['rawText']='\n'.join(bullets.values());p['sourcePath']=doc['path'];p['sourceUrl']=doc['url'];p['printedPage']=43;p['physicalPage']=43;p['editorialOriginalComponentCount']=10;p['authoredOperationalisationCount']=16

remedies=[]; debts=[]; removed=[]
for r in allrels:
    mp=r['mappingPath']; sgid=r.get('sourceGoalId',r.get('legacyGoalId'));gid=r['canonicalGoalId']; m=maps[mp]
    matching=[z for z in m['mappings'] if z['legacyGoalId']==sgid and z['canonicalGoalId']==gid]
    assert len(matching)==1,(mp,sgid,gid)
    row=matching[0]; before=copy.deepcopy(row)
    regional_row=r in lower; verdict=r.get('verdict',r.get('boundedVerdict'))
    wrong_by='/DE-BY/' in mp and verdict=='BLOCK'
    unsupported_lower=regional_row and verdict=='BLOCK'
    weak_he=mp==hepath and gid[:8]=='9b966664'
    action='remove_false_positive_binding' if wrong_by or unsupported_lower or weak_he else 'retain_bounded_component_partial'
    if action.startswith('remove'):
        m['mappings'].remove(row);removed.append({'mappingPath':mp,'before':before})
    else:
        row['matchType']='partial';row['sourceComponentBinding']={'authorCandidate':True,'wholeGoalSupported':False if regional_row or mp==hepath else verdict=='KEEP','wholeSourceSupported':False,'independentV2ReviewPending':True,'basisFrozenReview':'B:'+verdict,'supportedComponent':r.get('supportedComponent',r.get('actualPrimaryBasis')),'preserveOriginalOperator':True}
    decision=next(d for d in m['decisions'] if d['sourceGoalId']==sgid)
    # Source decisions with missing full clauses are intentionally nonterminal. Retain old IDs as debt.
    terminal_component=mp==hepath and gid[:8] not in whole_unproved
    direct_by_keep='/DE-BY/' in mp and verdict=='KEEP'
    hold=not (terminal_component or direct_by_keep)
    if hold:
        decision['decision']='needs_canonical_goal'
        decision['originalCanonicalGoalIdsRetainedAsDebt']=copy.deepcopy(maps_before[mp]['decisions'][next(i for i,d in enumerate(maps_before[mp]['decisions']) if d['sourceGoalId']==sgid)]['canonicalGoalIds'])
        # Keep the previous canonical IDs for lossless remediation; native ignores non-mapped decisions.
        decision['rationale']='AUTHOR v2: current positive relation is incomplete or unsupported at its whole-goal/whole-source depth. Original obligations and prior target IDs are retained in source-debt register; no whole-source acceptance. '+r.get('rationale',r.get('explanation',''))
        decision['wholeSourceCoverage']=False;decision['sourceDebtStatus']='open_independent_review_and_suitable_route_required'
    else:
        decision['decision']='mapped';decision['wholeSourceCoverage']=False;decision['coverageUnit']='declared_bounded_component_not_whole_original_bullet' if mp==hepath else 'direct_original_competency'
        decision['rationale']='AUTHOR v2: mapped only to the explicitly bounded source component. Parent original bullet coverage remains separately audited; no global source acceptance.'
    decision['reviewedAt']=STAMP;decision['reviewer']='codex-neuro21-v2-author-not-independent-reviewer';decision['matchType']='partial'
    remedy={'mappingPath':mp,'sourceGoalId':sgid,'canonicalGoalId':gid,'previousRelation':before,'action':action,'candidateRelation':None if action.startswith('remove') else copy.deepcopy(row),'sourceDecision':decision['decision'],'independentPriorBVerdict':verdict,'actualPrimaryBasis':r.get('actualPrimaryBasis',r.get('supportedComponent')),'unsupportedComponent':r.get('unsupportedOrUnverifiedComponent',r.get('rationale')),'preservationObligations':r.get('preservationObligations',r.get('preserveActualSourceClause')),'originalPrimaryPrintedPages':r.get('primaryPrintedPages',[43] if mp==hepath else []),'originalPrimaryPhysicalPages':r.get('primaryPhysicalPages',[43] if mp==hepath else []),'wholeSourceAcceptance':False}
    remedies.append(remedy)
    if hold:debts.append({**remedy,'originalSourceGoalObject':r.get('currentSourceGoalObject'), 'originalFullDecisionCanonicalIdsPreserved':decision.get('originalCanonicalGoalIdsRetainedAsDebt',decision['canonicalGoalIds']),'nativeWholeSourceGate':'nonmapped_decision_excluded_from_target_projection','sourceObligationsNotDeleted':True})
    xp=lanes[mp].get('extractionPath',lanes[mp].get('sourceExtractionPath'))
    if '/DE-RP/' in mp:
        s=next(s for s in extracts[xp]['sourceGoals'] if s['id']==sgid)
        s['sourceRef']='Rheinland-Pfalz Lehrplan Biologie 2014, Themenfeld 7, gedruckte Seite 36, physische PDF-Seite 38'
        s['printedPage']=36;s['physicalPage']=38
        if gid[:8]=='ff1bf88f':
            s['preservedOriginalOperator']='anwenden auf verschiedene Problemstellungen, zum Beispiel Drogen und Gifte'
            s['description']='Die Schülerinnen und Schüler wenden das Schlüssel-Schloss-Prinzip zur Erklärung von Informationsübertragungen an Synapsen in verschiedenen Problemstellungen, zum Beispiel Drogen und Gifte, an.'
            s['sourceText']=s['rawSourceText']=s['description']
        decision['sourceRef']=s['sourceRef'];decision['preservedOriginalOperator']=s.get('preservedOriginalOperator','Modell/Modellexperiment: Bau und Funktion herleiten')
    if '/DE-SH/' in mp:
        cohort={'documentEdition':'2023','validity':'only_auslaufende_cohorts_after_2026_27','new2026EntryCohortApproved':False,'nativeCohortDimensionSupported':False,'officialTransitionUrl':'https://fachportal.lernnetz.de/sh/faecher/biologie/fachanforderungen.html'}
        decision['cohortBinding']=cohort
        if action.startswith('retain'):row['sourceComponentBinding']['cohortBinding']=cohort
        extracts[xp]['cohortBinding']=cohort
        remedy['cohortBinding']=cohort

# Replace false literal-competency enumeration with exactly ten original bullets.
# The old operationalisation IDs are losslessly retained as migration entries, not official bullets.
old_he_rows=[r for r in relations if r['mappingPath']==hepath]
old_he_ids={r['sourceGoalId'] for r in old_he_rows}
official_ids={k:str(uuid.uuid5(uuid.UUID(he['sourceLandscapeId']),'official-original:KC2024:Q2.3:p43:'+k)) for k in bullets}
he['retainedQ23AuthoredOperationalisations']=[{'oldSourceGoalId':r['sourceGoalId'],'canonicalGoalId':r['canonicalGoalId'],'previousSourceGoal':copy.deepcopy(next(s for s in source_before[expath]['sourceGoals'] if s['id']==r['sourceGoalId'])),'originalParentComponentKeys':keys[r['canonicalGoalId'][:8]],'originalSuccessorSourceGoalIds':[official_ids[k] for k in keys[r['canonicalGoalId'][:8]] if k in official_ids],'isOfficialBullet':False} for r in old_he_rows]
he['sourceGoals']=[s for s in he['sourceGoals'] if s['id'] not in old_he_ids]
for k,text in bullets.items():
    he['sourceGoals'].append({'id':official_ids[k],'passageId':'he-bio-sekii:q2.3','topicCode':'Q2.3','title':text,'description':text,'sourceText':text,'rawSourceText':text,'parentBulletText':text,'rawParentBulletText':text,'sourceSpan':'Q2.3.'+k,'rawSourceSpan':'Q2.3.'+k,'sourceRef':'Hessen KC Biologie 2024, gedruckte/physische Seite 43, Originalbullet '+k+' (lokaler redaktioneller Schlüssel)','courseLevel':'GK_LK' if k.startswith('GK') else 'LK','granularity':'officialOriginalBullet','isOfficialBullet':True,'localEditorialKey':k,'officialNumberingClaim':False,'sourceDocumentKey':doc['key'],'printedPage':43,'physicalPage':43,'tags':['jurisdiction:DE-HE','stage:SekII','courseLevel:'+('GK_LK' if k.startswith('GK') else 'LK'),'topic:Q2.3']})
for passage in he['passages']:
    if passage.get('topicCode')=='Q2.3':passage['sourceGoalIds']=list(official_ids.values())
hem=maps[hepath];hem['mappings']=[m for m in hem['mappings'] if m['legacyGoalId'] not in old_he_ids];hem['decisions']=[d for d in hem['decisions'] if d['sourceGoalId'] not in old_he_ids]
mandatory={'GK1':['ce19b80f','e3fb5f1d','04d770b3','080b10c7'],'GK2':[],'GK3':['2381d2bb'],'LK1':['78748ef2'],'LK2':['78748ef2'],'LK3':['19758e09'],'LK4':['e1117126'],'LK5':['347110a1'],'LK6':['485ef1c3'],'LK7':['afde0001']}
context={'GK1':['1b38144f'],'GK2':['ff1bf88f','f6280154'],'LK3':['c05e217f'],'LK4':['97b24279'],'LK5':['a46cafde','c9a06264','4f631f78']}
he_successors=[]
for k in bullets:
    required=[G[s] for s in mandatory[k]]; supplementary=[G[s] for s in context.get(k,[])]
    for gid in required+supplementary:
        role='sourceComponentTarget' if gid in required else 'declaredContextOrSpecialisationNotOriginalCompulsoryGoal'
        hem['mappings'].append({'legacyGoalId':official_ids[k],'canonicalGoalId':gid,'matchType':'exact' if k in ['GK3','LK6','LK7'] and gid in required else 'partial','reviewDecisionId':official_ids[k],'sourceComponentBinding':{'authorCandidate':True,'role':role,'originalBulletKey':k,'wholeOriginalBulletSupportedByThisSingleGoal':k in ['GK3','LK6','LK7'] and gid in required,'wholeSourceApproval':False,'independentV2ReviewPending':True}})
    hold=k=='GK2'
    hem['decisions'].append({'sourceGoalId':official_ids[k],'topicCode':'Q2.3','sourceSpan':'Q2.3.'+k,'decision':'needs_canonical_goal' if hold else 'mapped','canonicalGoalIds':required or supplementary,'matchType':'partial' if k not in ['GK3','LK6','LK7'] else 'exact','rationale':'AUTHOR v2: original p43 bullet and declared bounded target union. '+('GK2 remains open: whole ff1 includes electrical synapses, while ACh/channel/NMJ/one-substance application duties need a suitable explicitly reviewed route.' if hold else 'Context/specialisation bindings are excluded from the compulsory native target list; whole-source and v2 independent acceptance remain pending.'),'reviewedAt':STAMP,'reviewer':'codex-neuro21-v2-author-not-independent-reviewer','wholeSourceApproval':False,'originalObligationsRetained':True,'sourceDebtStatus':'open_GK2_chemical_ACh_channels_NMJ_substance_example' if hold else 'independent_v2_original_component_union_review_pending','contextCanonicalGoalIds':supplementary})
    he_successors.append({'originalBulletKey':k,'sourceGoalId':official_ids[k],'originalText':bullets[k],'courseLevel':'GK_LK' if k.startswith('GK') else 'LK','requiredCanonicalGoalIds':required,'contextOnlyCanonicalGoalIds':supplementary,'sourceDebtOpen':hold,'independentV2ReviewPending':True})
for r in old_he_rows:
    gid=r['canonicalGoalId'];kk=keys[gid[:8]]
    if gid[:8]!='9b966664' and all(k in official_ids for k in kk):
        new[gid]['extendedData']['provenance']['sourceGoalId']=official_ids[kk[0]]
        new[gid]['extendedData']['provenance']['originalComponentKeys']=kk
        new[gid]['extendedData']['provenance']['retainedAuthoredOperationalisationSourceGoalId']=r['sourceGoalId']
    else:
        # No fictitious original-neuromodulator or three-code bullet is retained as provenance.
        new[gid]['extendedData']['provenance']['sourceEvidenceRole']='authoredSpecialisationWithNoExactOriginalQ23Bullet'
        new[gid]['extendedData']['provenance']['retainedAuthoredOperationalisationSourceGoalId']=r['sourceGoalId']
for remedy in remedies:
    if remedy['mappingPath']==hepath:
        kk=keys[remedy['canonicalGoalId'][:8]];remedy['oldAuthoredSourceGoalRetainedInMigrationOnly']=True;remedy['originalSuccessorSourceGoalIds']=[official_ids[k] for k in kk if k in official_ids];remedy['candidateRelation']='See migrated original-bullet relation union';remedy['sourceDecision']='original_bullet_successor_union_pending_independent_review';remedy['wholeSourceAcceptance']=False
for debt in debts:
    if debt['mappingPath']==hepath:
        debt['nativeWholeSourceGate']='old authored source decision removed; mandatory original-bullet successor excludes unmandated specialisation, GK2 held nonmapped'
        debt['debtType']='declared_specialisation_or_source_depth_review_not_invented_original Pflicht'
write(HERE/'he43.original-ten.actual.migration-and-preservation.json',{'schemaVersion':1,'originalCommonGKAndLKBullets':3,'originalAdditionalLKBullets':7,'officialSourceGoalCountAfterMigration':10,'retainedAuthoredOperationalisationIDs':16,'canonicalGoalIDsPreserved':21,'primaryDocument':doc,'physicalAndPrintedPage':43,'officialBulletNumberingClaim':False,'oldSixteenAuthoredSourceGoals':he['retainedQ23AuthoredOperationalisations'],'successors':he_successors,'GK2Closed':False,'BYOrOtherSourceWholeAcceptance':False})
write(HERE/'canonical.current464.author-v2.candidate.json',candidate);write(ISO/CP,candidate)
write(HERE/'canonical21.actual.exact-deltas.json',{'schemaVersion':1,'all464IDsAndOrderPreserved':True,'all443Outside21WholeGoalsExact':True,'allRequiresAndContainsExact':True,'changedGoals':[{'goalId':gid,'beforeWholeGoalSha256':digest(old[gid]),'afterWholeGoalSha256':digest(new[gid]),'deltas':jdelta(old[gid],new[gid])} for gid in IDS if old[gid]!=new[gid]],'scienceTextChangedGoalIds':[gid for gid in IDS if any(old[gid].get(k)!=new[gid].get(k) for k in ['title','titleEn','description','descriptionEn'])],'sourceMetadataChangesNotScienceApproval':True})

source_files=[]
for i,(p,m) in enumerate(maps.items()):
    if m==maps_before[p]:continue
    m['authorRemediation']={'package':'neuro21-source-p-v2','status':'ai_candidate','independentV2ReviewPending':True,'wholeSourceApproval':False,'cohortApproval':False,'licensing':'CC-BY-4.0 for own mapping rationale; primary source rights unchanged'}
    filename=f'mapping-{i+1:02d}.author-v2.candidate.json';write(HERE/'source-candidates'/filename,m);write(ISO/p,m)
    source_files.append({'originalPath':p,'candidatePath':str((HERE/'source-candidates'/filename).relative_to(ROOT)),'originalSha256':sha(ROOT/p),'candidateSha256':sha(HERE/'source-candidates'/filename),'deltas':jdelta(maps_before[p],m)})
for i,(p,x) in enumerate(extracts.items()):
    if x==source_before[p]:continue
    filename=f'extraction-{i+1:02d}.author-v2.candidate.json';write(HERE/'source-candidates'/filename,x);write(ISO/p,x)
    source_files.append({'originalPath':p,'candidatePath':str((HERE/'source-candidates'/filename).relative_to(ROOT)),'originalSha256':sha(ROOT/p),'candidateSha256':sha(HERE/'source-candidates'/filename),'deltas':jdelta(source_before[p],x)})
write(HERE/'source71.actual.author-remedies.json',{'schemaVersion':1,'role':'author_v2_not_independent_acceptance','relations':remedies,'relationCount':71,'regionalRelationCount':38,'removedFalsePositiveRelationCount':len(removed),'removedRelations':removed,'nativePartialDoesNotEnforceWholeScope':True,'wholeSourceApproval':False})
write(HERE/'source71.actual.open-debt.json',{'schemaVersion':1,'debts':debts,'debtRelationCount':len(debts),'uniqueHeldSourceDecisions':len({(d['mappingPath'],d['sourceGoalId']) for d in debts}),'allOriginalSourceGoalsAndClausesRetained':True,'originalPartnerGoalsAndTheirTextAndRequiresUnchanged':True,'BYClinicalAndENGEKGFullOrdinaryPartnerFound':False,'THLearningStrengtheningDeactivation':{'preserve':True,'wholeUpperA46Or347Approval':False,'needsBoundedLowerLearningRoute':True},'HHNWComparisonOperator':{'preserve':True,'joint197GoalNotEquivalentToComparison':True,'explicitComparisonRouteStillRequired':True},'lowerFullFF1Prerequisite':{'197And949RequiresExact':True,'validLowerFrontierClaim':False,'requiresSuitableBoundedSourceRouteBeforeActivation':True},'strictDClaimMustRemainNonterminalForUnresolvedScope':True,'noGlobalSourceClosureClaim':True})
write(HERE/'source-candidate-files.actual.exact-deltas.json',{'schemaVersion':1,'files':source_files,'HEOriginalQ23BulletCount':10,'HECommonGKAndLKOriginalBullets':3,'HEAdditionalLKOriginalBullets':7,'HEExisting16SourceIdsRemainInAuthoredOperationalisationMigration':True,'officialNumberingClaim':False})

profiles=read(V1/'author-profiles.data.json'); origprofiles=copy.deepcopy(profiles); byshort={p['short']:p for p in profiles}
# All changes are bounded synthetic case material. No learner trial or task quota.
p=byshort['a46cafde']
p['understandingDe']='Die wirksamen Verbindungen bestimmen, wie gleiche Eingangssignale verarbeitet werden. Eine verstärkte erregende Verbindung kann den Ausgang erhöhen; eine gleichzeitig stärkere Hemmung kann diesen Effekt ausgleichen. Aus einem veränderten Ausgang allein lässt sich der zelluläre Mechanismus nicht eindeutig ableiten.'
p['understandingEn']='Effective connections determine how identical input signals are processed. A strengthened excitatory connection can increase the output; simultaneously stronger inhibition can offset this effect. A changed output alone does not uniquely identify the cellular mechanism.'
p=byshort['8b23f8fb']
p['case1De']='Ein gegebenes Modell einer mechanosensitiven Rezeptorzelle beschreibt: Ein Druckreiz öffnet mechanisch gesteuerte Kationenkanäle, der Einstrom erzeugt ein abgestuftes depolarisierendes Rezeptorpotenzial. Dieses beeinflusst die Aktionspotenzialfrequenz eines nachgeschalteten afferenten Neurons. In diesem Modell führen ein schwacher und ein stärkerer Reiz zu Rezeptorpotenzialen von 2 bzw. 6 relativen Einheiten und zu 5 bzw. 15 gleich hohen Aktionspotenzialen pro Sekunde. Erkläre die Folge Reiz → Kanalöffnung → Rezeptorpotenzial → neuronales Signal und die Frequenzcodierung. Die Werte sind Modelldaten und begründen keine universelle lineare Beziehung.'
p['case1En']='A supplied mechanosensory receptor-cell model specifies that pressure opens mechanically gated cation channels; influx generates a graded depolarising receptor potential. This influences action-potential frequency in a downstream afferent neuron. In this model a weak and a stronger stimulus produce receptor potentials of 2 and 6 relative units and 5 and 15 equal-height action potentials per second. Explain stimulus → channel opening → receptor potential → neural signal and frequency coding. These model data do not establish a universal linear relationship.'
p['answer1De']='Der physikalische Reiz verändert die Kanalöffnung und damit den Ionenstrom: dies ist Reiztransduktion. Das Rezeptorpotenzial ist abgestuft, die einzelnen Aktionspotenziale sind gleich hoch; in den gegebenen Daten trägt die höhere Frequenz die größere Reizstärke. Die Daten belegen weder höhere einzelne Aktionspotenziale noch eine für alle Rezeptoren gültige lineare Kennlinie.'
p['answer1En']='The physical stimulus changes channel opening and ion flow: this is transduction. The receptor potential is graded, whereas individual action potentials have equal height; in the supplied data the higher frequency represents the stronger stimulus. The data establish neither taller individual spikes nor a linear response valid for every receptor.'
p['case2De']='Frische Variation desselben Modells: Ein Stoff blockiert die mechanisch gesteuerten Kanäle vollständig; der Druckreiz und die übrigen Modellregeln bleiben gleich. Sage Rezeptorpotenzial und stimulusabhängige Aktionspotenziale voraus und begründe den betroffenen Schritt. Anschließend zeigen zwei intakte Rezeptorgruppen A und B bei gleicher Frequenz unterschiedliche Orte beziehungsweise Aktivitätsmuster. Erkläre, welche Information durch Ort und verteiltes Populationsmuster zusätzlich zur Frequenz dargestellt wird.'
p['case2En']='Fresh variation of the same model: a substance completely blocks the mechanically gated channels while pressure and the other model rules remain unchanged. Predict the receptor potential and stimulus-dependent action potentials and explain the affected step. Next, two intact receptor groups A and B have equal frequency but different locations or activity patterns. Explain what information location and a distributed population pattern represent in addition to frequency.'
p['answer2De']='Die Blockade verhindert im gegebenen Modell den reizabhängigen Einstrom, damit den reizabhängigen Anstieg des Rezeptorpotenzials und die daraus ausgelösten afferenten Signale; unveränderte mechanische Reizstärke umgeht die blockierte Transduktion nicht. Das sagt nichts über eine hier nicht gegebene spontane Grundaktivität. Ort bezeichnet die aktivierte Gruppe beziehungsweise Reizlokalisation; der Populationscode bezeichnet das gemeinsame Muster mehrerer aktiver Gruppen. Gleiche Frequenz erzwingt daher keine gleiche Reizlokalisation oder Reizqualität.'
p['answer2En']='In the supplied model the block prevents stimulus-dependent influx, the resulting rise in receptor potential and the afferent signals it triggers; unchanged pressure cannot bypass blocked transduction. This does not specify spontaneous baseline activity, which is not given. Place identifies the activated group or stimulus location; population coding represents the joint pattern across active groups. Equal frequency therefore does not imply identical stimulus location or quality.'
p=byshort['c05e217f']
p['case2De']='Ein gegebenes vereinfachtes Modell enthält zwei hormonelle Rückkopplungskreise. Cortisol hemmt seine übergeordneten stimulierenden Signale; ein anhaltender äußerer Stressreiz verstärkt diese Signale weiter. Erhöhtes Cortisol erhöht im Modell die Glucosebereitstellung. Im zweiten Kreis gilt: Blutglucose steigt → Insulinausschüttung steigt → Glucoseaufnahme in die Körperzellen steigt → Blutglucose sinkt → Insulinausschüttung sinkt. Erkläre die negative Rückkopplung dieses zweiten Kreises und wie anhaltend erhöhte Glucosebereitstellung ihn beeinflusst. Vergleiche den Wegfall des Stressreizes mit seinem Fortbestehen, ohne eine Krankheit zu diagnostizieren.'
p['case2En']='A supplied simplified model contains two hormonal feedback loops. Cortisol inhibits its upstream stimulating signals, while a sustained external stressor continues to increase these signals. Increased cortisol increases glucose availability in the model. The second loop is: blood glucose rises → insulin secretion rises → glucose uptake by body cells rises → blood glucose falls → insulin secretion falls. Explain the negative feedback in this second loop and how persistently increased glucose availability affects it. Compare removal and persistence of the stressor without diagnosing a disease.'
p['answer2De']='Im Insulinkreis wirkt die ausgelöste Glucoseaufnahme dem ursprünglichen Glucoseanstieg entgegen; der sinkende Wert vermindert danach die Insulinausschüttung. Cortisol koppelt die beiden Kreise über die Glucosebereitstellung. Bei fortbestehendem Stressreiz hält ein zusätzlicher Einfluss auf den zweiten Kreis an, obwohl negative Rückkopplung vorhanden ist. Entfällt der äußere Reiz, entfällt im Modell dieser anhaltende Zusatzantrieb und die Rückkopplungen können die Werte wieder vermindern. Das Modell erlaubt keine genaue Langzeitkonzentration, keine Glucocorticoid- oder Insulinresistenzannahme und keine klinische Diagnose.'
p['answer2En']='In the insulin loop, the induced glucose uptake counteracts the initial glucose rise; the falling level then reduces insulin secretion. Cortisol couples the two loops through glucose availability. A persistent stressor maintains an additional influence on the second loop despite negative feedback. Removing the external stimulus removes this sustained extra drive in the model, allowing feedback to reduce the levels. The model does not determine exact long-term concentrations, establish glucocorticoid or insulin resistance, or support a clinical diagnosis.'
write(HERE/'author-profiles.data.json',profiles)
write(HERE/'positive21.actual.profile-deltas.json',{'schemaVersion':1,'changedProfiles':[{'short':p['short'],'deltas':jdelta(o,p)} for o,p in zip(origprofiles,profiles) if o!=p],'unchanged18ProfilesExact':sum(o==p for o,p in zip(origprofiles,profiles))==18,'syntheticCaseCount':42,'actualLearnerDemonstrations':0,'fixedTaskQuotaClaim':False})
pset=read(V1/'positive-evidence.candidates.json');pset['reviewId']='biologie-q2-neurobiology-twenty-one-source-p-author-20261006-v2';pset['reviewedAt']=STAMP;pset['reviewer']='codex-neuro21-v2-author'
for g in pset['goals']:
    p=byshort[g['goalId'][:8]]; e=g['profile']['expectations'][0]
    for field,key in [('essentialUnderstandingDe','understandingDe'),('essentialUnderstandingEn','understandingEn'),('observablePerformanceDe','performanceDe'),('observablePerformanceEn','performanceEn')]:e[field]=p[key]
    for i,c in enumerate(g['profile']['applicationCaseBriefs'],1):
        for field,key in [('taskDemandDe',f'case{i}De'),('taskDemandEn',f'case{i}En'),('expectedPerformanceDe',f'answer{i}De'),('expectedPerformanceEn',f'answer{i}En')]:
            # Native field spelling is checked below, preserving its schema shape.
            if field in c:c[field]=p[key]
    g['reason']='AUTHOR v2 synthetic bounded model and fresh variation; source/P remedies based on separately sealed A+B v1 findings. Independent v2 review pending; no observed learner work or approval.'
    g['dissent']=['Independent current v2 D/P/A/M/V review and source-debt resolution remain required.','Whole-source, lower-depth and SH2026-entry-cohort claims are not approved.','No primary goal image exists; no V or strict M7 claim.']
    g['evidenceLevel']='E1';g['maximumClaimScope']='G1'
write(HERE/'positive-evidence.author-v2.candidates.json',pset)
config=read(V1/'positive-evidence.validation-only.config.json'); rel=str(HERE.relative_to(ROOT));config['reviewId']=pset['reviewId'];config['landscapePath']=rel+'/canonical.current464.author-v2.candidate.json';config['semanticKindLedgerPath']=rel+'/semantic-kinds.author-v2.candidate.json';config['reviewPath']=rel+'/positive-evidence.author-v2.actual.candidate.jsonl';config['scope']['label']='Inactive AUTHOR v2 21 synthetic profiles; no independent release or active M7';write(HERE/'positive-evidence.author-v2.config.json',config)
print(json.dumps({'candidatePath':str(HERE),'canonicalGoals':len(candidate['goals']),'selectedIDs':len(IDS),'scienceChangedGoals':5,'sourceRelations':len(remedies),'removedPositiveRelations':len(removed),'heldUniqueDecisions':len({(d['mappingPath'],d['sourceGoalId']) for d in debts}),'changedSourceFiles':len(source_files),'PChangedProfiles':3,'outside21WholeGoalsExact':True}))
