# SPDX-License-Identifier: Apache-2.0
"""Build inactive source-component author candidates; never grants review approval."""
import copy, datetime, hashlib, json, pathlib, re

ROOT = pathlib.Path(__file__).resolve().parents[7]
OWN = pathlib.Path(__file__).resolve().parent
DAY = OWN.parent
BASE = DAY / 'biologie-q1-three-current383-author-continuation-v2'
A = DAY / 'biologie-q1-four-current383-independent-description-p-source-a-resumed-v2'
B = DAY / 'biologie-q1-four-current383-independent-description-p-source-b-resumed-v2'
NOW = datetime.datetime.now(datetime.timezone.utc).isoformat()
def read(p): return json.loads(pathlib.Path(p).read_text())
def sha(p): return 'sha256:' + hashlib.sha256(pathlib.Path(p).read_bytes()).hexdigest()
def rel(p): return str(pathlib.Path(p).relative_to(ROOT))
def write(p,v):
    p=pathlib.Path(p);p.parent.mkdir(parents=True,exist_ok=True)
    p.write_text(json.dumps(v,ensure_ascii=False,indent=2)+'\n')
def bound(p): return {'path':rel(p),'sha256':sha(p),'bytes':p.stat().st_size}

input_checks=[]
for folder,name,key in [(BASE,'author-current-four.final.freeze.json','files'),(A,'independent-current-four.final.freeze.json','files'),(B,'review-output-freeze.actual.json','outputs')]:
    f=folder/name; freeze=read(f)
    for row in freeze[key]:
        p=ROOT/row['path'];assert sha(p)==row['sha256'], str(p)
    input_checks.append({'freeze':bound(f),'actualFilesVerified':len(freeze[key])})
assert input_checks[0]['actualFilesVerified']==95

canonical=read(BASE/'prospective-canonical.snapshot.json')
goals={g['id']:g for g in canonical['goals']}
def gid(prefix): return next(k for k in goals if k.startswith(prefix))
DNA,PROT,MUT,REP=map(gid,['0daa79f6','475eebb4','ffef97e3','e70d8a85'])
TRAIT,CODE,MECHANISM,VAR,MITOSIS,MITOTIC=map(gid,['0263fb84','e349d8c4','1ec4e3c2','3417bb28','1d2b1038','36d3bf01'])
(OWN/'prospective-canonical.unchanged.snapshot.json').write_bytes((BASE/'prospective-canonical.snapshot.json').read_bytes())
for name in ['positive-four.native-candidate-records.json','visualization-final-candidate-inputs.v3.json','prospective-four.semantic-kinds.snapshot.json','prospective-qa.no-approval.snapshot.json']:
    (OWN/name).write_bytes((BASE/name).read_bytes())

snapshot=read(BASE/'current-source-binding-snapshot.json')
patches=[]; obligations=[]; replacements=[]; operative=[]
def open_duty(region,source_id,component,reason,partners=()):
    obligations.append({'jurisdiction':region,'sourceGoalId':source_id,'component':component,'status':'open_author_component_boundary','reason':reason,'existingPartnerCandidates':list(partners),'wholeSourceClosure':False})
def partial(m,sid,target,rationale):
    for row in m['mappings']:
        if row['legacyGoalId']==sid and row['canonicalGoalId']==target: row['matchType']='partial'
    d=next(x for x in m['decisions'] if x['sourceGoalId']==sid)
    d['matchType']='partial';d['rationale']=rationale
    d['notes']=list(d.get('notes',[]))+['2026-10-06 v3 author candidate: component only; independent review pending; no whole-source or M7 closure.']
    d['authorRemediation']={'at':NOW,'package':rel(OWN),'authority':'author_candidate','wholeSourceClosure':False}
def add(m,sid,target,rationale):
    if not any(x['legacyGoalId']==sid and x['canonicalGoalId']==target for x in m['mappings']):
        m['mappings'].append({'legacyGoalId':sid,'canonicalGoalId':target,'matchType':'partial','reviewDecisionId':sid})
    d=next(x for x in m['decisions'] if x['sourceGoalId']==sid)
    if target not in d['canonicalGoalIds']:d['canonicalGoalIds'].append(target)
    partial(m,sid,target,rationale)
def remove(m,sid,target,preservation):
    m['mappings']=[x for x in m['mappings'] if not(x['legacyGoalId']==sid and x['canonicalGoalId']==target)]
    d=next(x for x in m['decisions'] if x['sourceGoalId']==sid)
    d['canonicalGoalIds']=[x for x in d['canonicalGoalIds'] if x!=target]
    assert d['canonicalGoalIds'],'Removal would erase source row '+sid
    d['rationale']+=' v3: unsupported target relationship removed; '+preservation
    d['authorRemediation']={'at':NOW,'package':rel(OWN),'authority':'author_candidate','wholeSourceClosure':False}
def extraction_candidate(scope):
    old=ROOT/scope['extractionPath'];e=read(old);p=OWN/'proposed-inputs'/scope['extractionPath'];return old,e,p

for scope in snapshot['sourceScopes']:
    active=ROOT/scope['mappingPath'];region=scope['mappingPath'].split('/')[4]
    old=read(active);m=copy.deepcopy(old)
    if region=='DE-HE':m=read(BASE/'HE.current-three-and-replication.mapping.candidate.json')
    epath,e,ep=extraction_candidate(scope)
    if region=='DE-HE':e=read(BASE/'HE.current-three-original-bullets.extraction.candidate.json')
    source_by={x['id']:x for x in e['sourceGoals']}
    for binding in scope['bindings']:
        row=binding['mapping'];sid=row['legacyGoalId'];target=row['canonicalGoalId'];source=source_by[sid]
        action='retain_precise_partial_component';reason='Only the actual component of the official source is claimed; no complete target/source or strict approval.'
        if region in ['DE-BB','DE-BE']:
            if target==REP:
                remove(m,sid,target,'Chromosome/karyogram duty stays on existing 74740709; mitosis/meiosis stay on existing source rows and 1d2b1038. No semiconservative DNA requirement found in this source row.')
                action='remove_unsupported_replication_relation';reason='Classical DNA terminology does not establish semiconservative strand tracing.'
            else:
                partial(m,sid,target,'Only DNA as information-carrier term within classical genetics. Full nucleotide/complementarity model is not certified for this lower-stage source.')
                open_duty(region,sid,'DNA as carrier of genetic information at the classical-genetics terminology level','0daa full model is broader; retained relation is partial and its whole-target stage demand remains held.',[DNA])
        elif region=='DE-BW':
            partial(m,sid,target,'Partial simple-model structure/storage component, or a generic modelling/chromosome component only; exact official printed22 physical24 bound separately.')
            if 'gen-003' in sid:
                original='die Struktur der DNA anhand eines einfachen Modells beschreiben und daran Eigenschaften der DNA (Informationsspeicherung, Verdopplungsfähigkeit) erläutern'
                source.update(sourceText=original,parentBulletText=original,rawSourceText=original,description='Die lernende Person kann die Struktur der DNA anhand eines einfachen Modells beschreiben und daran Informationsspeicherung und Verdopplungsfähigkeit erläutern.',sourceRef='Bildungsplan BW Gymnasium Biologie V2 2022, 3.3.2(3), Klassen 9/10, gedruckte S.22, physische S.24.')
                source.setdefault('metadata',{}).update(sourcePrintedPage=22,sourcePhysicalPage=24,officialWholeBulletComponentClaim='partial')
                source['sourceSpan']={'passageId':source['passageId'],'label':'3.3.2(3): '+original}
                source['rawSourceSpan']=copy.deepcopy(source['sourceSpan'])
                add(m,sid,REP,'Existing e70 preserves DNA duplication capability at a simple complementary-strand model. 0daa supplies structure/storage. Semiconservative tracing is the bounded model used, not a quotation of an explicit BW terminology demand.')
                replacements.append({'jurisdiction':region,'sourceGoalId':sid,'addedGoalId':REP,'component':'DNA duplication capability','sourcePrintedPage':22,'sourcePhysicalPage':24})
        elif region=='DE-BY':
            partial(m,sid,target,'B9 simple-model component or B12 mutation component at actual stage; no whole-clause coverage inferred from the revised four-goal text/P cases.')
            if target==PROT:
                add(m,sid,TRAIT,'B9 basic protein synthesis remains a partial contribution on475; protein role in trait formation is retained through existing SekI0263 with protein-as-gene-product material. Existing NI goal/P/image remain byte exact.')
                replacements.append({'jurisdiction':region,'sourceGoalId':sid,'addedGoalId':TRAIT,'component':'Protein as gene product contributes to trait formation'})
                open_duty(region,sid,'Sequential genwirk chain and protein roles including enzyme example','0263 covers a simple gene-product-trait contribution; whole B9 genwirk chain has not received fresh independent component review.',[TRAIT])
            if target==MUT:
                source.setdefault('metadata',{})['historicalExtractionAlias']=source['sourceSpan']
                source['sourceRef']='LehrplanPLUS Bayern Gymnasium Biologie B12 2.4, grundlegendes und erhöhtes Anforderungsniveau, Genmutationen und Schutz vor mutagenen Einflüssen; historischer Extraktionsalias B12-EA.2.17.'
                source['sourceSpan']='B12 2.4 Genetische Vielfalt; Genmutationskompetenz in beiden tatsächlichen Anforderungsniveaus'
                source['rawSourceSpan']=source['sourceSpan']
                source['metadata']['officialOccurrences']=[{'courseProfile':'GK','url':'https://www.lehrplanplus.bayern.de/fachlehrplan/gymnasium/12/biologie/grundlegend'},{'courseProfile':'LK','url':'https://www.lehrplanplus.bayern.de/fachlehrplan/gymnasium/12/biologie/erhoeht'}]
                open_duty(region,sid,'Mutagen causes, measured/context-supported protein-function effects, protection against mutagenic influences','Four-event taxonomy plus bounded possible protein consequences does not itself assess causes or protective action. Both actual B12 basic and elevated occurrences are retained in primary component register.',[MUT])
        elif region=='DE-HE':
            if target==PROT:
                add(m,sid,CODE,'Partial HE Code-Sonne use component on existing e349; only forward codon decoding is literal HE duty. Reverse coding is goal extension, not invented HE requirement. Concrete author material accompanies this relation.')
                add(m,sid,MECHANISM,'Partial HE pro/euk protein-synthesis mechanism, mRNA/ribosome/tRNA component on existing GK/LK1ec4; concrete author task/solution provided. This is pending independent source/content/page review.')
                open_duty(region,sid,'Complete native reviewed coverage of pro/euk, mRNA, ribosome, tRNA and Code-Sonne','Concrete existing-goal components are supplied, but author material and affected bindings need independent review before whole-bullet closure.',[CODE,MECHANISM,PROT])
        elif region in ['DE-HH','DE-NW']:
            if target==REP:
                remove(m,sid,target,'General cell division remains on existing1d2b and other unchanged source relations. This source provides no required semiconservative copying component.')
                action='remove_unsupported_replication_relation';reason='No source duplication duty dropped; cell division/classical heredity preserved.'
            else:
                partial(m,sid,target,'Only source-faithful DNA/basic protein-synthesis contribution at lower-stage operator; whole detailed sequence mastery is not certified by this broad source.')
                if target==PROT:
                    add(m,sid,TRAIT,'NW functional protein variety and role in traits preserved as partial basic-model gene-product-trait contribution on existing0263; no upper-stage reverse sequence requirement invented.')
        elif region=='DE-RP':
            if target==REP:
                remove(m,sid,target,'The actual meiosis/fertilisation obligation remains on existing1d2b; replication must come from the distinct TF10 molecular functional component.')
                action='rebind_to_actual_molecular_component';reason='Wrong meiosis source row removed; replacement source component below.'
            elif target==MUT:
                remove(m,sid,target,'Individuality on multiple organisation levels stays on the unchanged18b3/797a/2a5b relations; this row does not explicitly require four DNA mutation events.')
                action='remove_wrong_individuality_relation';reason='No explicit molecular mutation duty belongs to this source row.'
            else:
                partial(m,sid,target,'TF10 gene-to-trait/simple complementary DNA functional component only; source printed42 physical44. Whole upper-stage code analysis is not asserted.')
                if target==PROT:add(m,sid,TRAIT,'Simple gene-protein-trait model preserved through existing0263, with concrete protein-as-product component.')
            if source['sourceRef'].endswith('41'):source['sourceRef']=source['sourceRef'][:-2]+'42'
            source.setdefault('metadata',{}).update(sourcePrintedPage=42,sourcePhysicalPage=44)
        elif region=='DE-SH':
            if target in [REP,PROT] or (target==DNA and ('-r-03-' in sid or '-va-08-' in sid)):
                remove(m,sid,target,'Actual lower-stage reproduction/mitosis duties stay on1d2b and unchanged source relations; schematic DNA remains partial onSF/IK. Later SekII molecular duties are not imported into SekI.')
                action='remove_unestablished_lower_stage_relation';reason='Precise lower-stage content preserved on its appropriate unchanged/basic-model partners.'
            elif target==MUT:
                add(m,sid,VAR,'SekI VA5 mutation/recombination as causes of variability retained through existing simple-model3417. Its prerequisites and existing NI WholeGoal remain exact; broader imported prerequisite scope must be measured separately.')
                remove(m,sid,target,'General mutation/recombination duty preserved on3417 partial; no four base-event protein-analysis compulsory demand established at SekI VA5.')
                action='replace_with_simple_variability_partner';reason='Preserve actual lower-stage mutation/recombination without certifying molecular event analysis.'
            else:partial(m,sid,target,'Schematic DNA structure is a partial SekI SF/IK contribution; whole detailed nucleotide information model is held pending exact operator review.')
        elif region in ['DE-MV','DE-SN','DE-ST','DE-TH']:
            if target==MUT:
                add(m,sid,VAR,'General mutation as change to genetic information/variability is preserved as partial on existing simple-model3417; current NI semantics are unchanged.')
                remove(m,sid,target,'The general lower-stage mutation component stays on3417 and existing genome/karyogram goals. Specific four DNA event analysis is not established by this broad source row.')
                action='replace_with_simple_variability_partner';reason='Stage-faithful general mutation preserved; remaining cause/category/function duties remain explicitly open.'
                open_duty(region,sid,'Mutagen causes; region-specific point/gen/chromosome/genome types and consequences','3417 supplies general variability, existing genome goals supply some category components; this does not close all named types, causes, body/germline effects or protection.',[VAR,gid('74740709')])
            else:
                partial(m,sid,target,'Only the actual grade10 or9/10 DNA/replication/protein overview component is claimed; detailed supplied sequence cases are operationalisation, not whole-source closure.')
                if target==PROT:add(m,sid,TRAIT,'Gene-to-protein-to-trait principle is retained as a partial lower-stage model on0263; exact NI goal and reviewed artefacts retained.')
            if region=='DE-TH' and target==REP:
                open_duty(region,sid,'Meaning of error control and DNA repair','e70 preserves semiconservative copying; existing76ad is LK upper-stage PCR/repair comparison and does not establish a compulsory9/10 full-target partner.',[gid('76ad2d40')])
        patches.append({'jurisdiction':region,'sourceGoalId':sid,'canonicalGoalId':target,'before':row,'action':action,'rationale':reason,'beforeSource':binding['sourceGoal'],'afterSource':source,'wholeSourceClosure':False})
    if region=='DE-RP':
        for g in e['sourceGoals']:
            if 'tf10-individualitat-und-entwicklung-' in g['id']:
                g['sourceRef']='RP-BIO-SEKI-2014 TF10, gedruckte S.42, physische S.44'
                g.setdefault('metadata',{}).update(sourcePrintedPage=42,sourcePhysicalPage=44)
        for passage in e.get('passages',[]):
            if 'tf10-individualitat-und-entwicklung' in passage['id']:
                passage.update(sourceRef='RP-BIO-SEKI-2014 TF10, gedruckte S.42, physische S.44',page=42)
        parent=next(z for z in e['sourceGoals'] if 'tf10-individualitat-und-entwicklung-001' in z['id'])
        component=copy.deepcopy(parent);sid='rp-bio-seki-tf10-printed42-complementary-dna-replication-component-v3'
        text='Komplementäre Basenpaare bilden die molekularen Funktionseinheiten, sowohl für die Replikationsfunktion als auch für die Übersetzungsfunktion (Transkription und Translation) der DNA.'
        component.update(id=sid,title='Komplementäre Basenpaare für Replikation und Übersetzung einordnen',description='Die lernende Person kann komplementäre Basenpaarung mit der Replikations- und Übersetzungsfunktion der DNA verknüpfen.',sourceText=text,rawSourceText=text,parentBulletText=text,rawParentBulletText=text,sourceSpan='TF10, Fachkonzepte, molekulare Ebene, gedruckte42/physische44',rawSourceSpan='TF10, Fachkonzepte, molekulare Ebene, gedruckte42/physische44',sourceRef='RP BCP2014 Biologie TF10, gedruckte S.42, physische S.44.',granularity='official-content-component')
        component.setdefault('metadata',{}).update(sourcePrintedPage=42,sourcePhysicalPage=44,wholeSourceClosure=False)
        e['sourceGoals'].append(component)
        m['decisions'].append({'id':sid,'sourceGoalId':sid,'topicCode':component['topicCode'],'sourceSpan':component['sourceSpan'],'status':'mapped','decision':'mapped','matchType':'partial','canonicalGoalIds':[REP],'rationale':'Actual TF10 molecular complementary-DNA replication component, not the meiosis row. e70 is a bounded simple model contribution; official semiconservative wording is not invented.','reviewer':'codex-author-candidate','reviewedAt':NOW,'authorRemediation':{'package':rel(OWN),'authority':'author_candidate','wholeSourceClosure':False}})
        m['mappings'].append({'legacyGoalId':sid,'canonicalGoalId':REP,'matchType':'partial','reviewDecisionId':sid})
        replacements.append({'jurisdiction':region,'sourceGoalId':sid,'addedGoalId':REP,'component':'Actual complementary-DNA replication function','sourcePrintedPage':42,'sourcePhysicalPage':44})
    if e!=read(epath) or region=='DE-HE':
        write(ep,e);m['sourceExtractionPath']=rel(ep)
    if isinstance(m.get('summary'),dict):
        m['summary'].update(exactMappings=sum(x.get('matchType')=='exact' for x in m['mappings']),partialMappings=sum(x.get('matchType')=='partial' for x in m['mappings']))
    m['authorRemediation']={'at':NOW,'package':rel(OWN),'authority':'author_candidate','independentReview':'pending','wholeSourceClosure':False,'humanApproval':False}
    out=OWN/'proposed-inputs'/scope['mappingPath'];write(out,m)
    operative.append({'replacesPath':scope['mappingPath'],'candidatePath':rel(out),'beforeSha256':sha(active),'candidateSha256':sha(out),'sourceExtractionPath':m['sourceExtractionPath']})

assert len(patches)==47
write(OWN/'47-source-relations.before-after.author-candidate.json',{'status':'author_candidate; exact partial and open obligations, no independent approval','sourceRelations':patches,'newExistingGoalComponentRelations':replacements,'mappingOverlays':operative,'openObligations':obligations,'activeWrites':0,'newCanonicalGoalIds':[],'humanApproval':False})
write(OWN/'retained-payload-and-input-boundary.actual.json',{'checkedAt':NOW,'inputFreezes':input_checks,'canonicalWholeGoalsChanged':0,'fourCurrentGoalTextsChanged':0,'currentFourPRecordsExact':sha(OWN/'positive-four.native-candidate-records.json')==sha(BASE/'positive-four.native-candidate-records.json'),'finalFourImageInputsExact':sha(OWN/'visualization-final-candidate-inputs.v3.json')==sha(BASE/'visualization-final-candidate-inputs.v3.json'),'protectedNI0263WholeGoalExact':True,'allOtherCanonicalGoalsExact':True,'canonicalSha256':sha(OWN/'prospective-canonical.unchanged.snapshot.json'),'activeWrites':0,'humanApproval':False})
print(json.dumps({'sourceRelations':47,'mappingLanes':len(operative),'openObligations':len(obligations),'canonicalWholeGoalsChanged':0,'activeWrites':0}))
