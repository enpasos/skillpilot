# SPDX-License-Identifier: Apache-2.0
"""Finite author serialization only. No review votes, activation or Git writes."""
import copy
import hashlib
import json
from pathlib import Path
from uuid import UUID, uuid5

REPO = Path.cwd()
OWN = Path(__file__).resolve().parents[1]
E15 = REPO / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-15'
rel = lambda p: Path(p).resolve().relative_to(REPO).as_posix()
load = lambda p: json.loads(Path(p).read_text())
sha = lambda b: 'sha256:' + hashlib.sha256(b).hexdigest()
def ref(p):
    p = Path(p)
    return {'path': rel(p), 'sha256': sha(p.read_bytes()), 'bytes': p.stat().st_size}
def write(name, data):
    p = OWN / name
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n')
    return p

base = E15 / 'chemie-one-analgesic-rezeptfrei-terminology-author-20261015-v1/candidate/canonical560.current422.one-rezeptfrei-term.author.json'
sem = E15 / 'chemie-one-analgesic-rezeptfrei-terminology-author-20261015-v1/candidate/semantic560.one-rezeptfrei-term.source-identity.author.json'
assert sha(base.read_bytes()) == 'sha256:fccb633f60e264e48470aadf96c66f0aac9d8b4a8e0abbcc15d4ef671926c647'
assert sha(sem.read_bytes()) == 'sha256:3e8f562fc19f177f987d1168718ffb48be3d115c45be63dae59096d909f9f27d'
srcroot = E15 / 'chemie-lab-bcp-eleven-whole-source-and-scope-author-20261015-v1'
source_selector = load(srcroot / 'NEUTRAL.finite-eleven-whole-source-and-structural-author-inputs.json')
source_rows = load(REPO / source_selector['existingActualM3Cells']['path'])
contexts = load(REPO / source_selector['whole11CurrentContexts']['path'])
for item in [source_selector[k] for k in ['officialHtml', 'actualHttpReceipt', 'whole52LexicalComparison', 'whole11CurrentContexts', 'existingActualM3Cells']]:
    assert sha((REPO / item['path']).read_bytes()) == item['sha256'], item['path']

original_cases_path = E15 / 'chemie-laboratory-communication-fifteen-current419-whole-author-20261015-v1/materials/thirty-complete-DE-EN-cases.author.json'
corrected_cases_path = E15 / 'chemie-lab15-two-material-corrections-author-root-20261015-v1/materials/thirty-complete-DE-EN-cases.bounded-successor.author.json'
stim_path = E15 / 'chemie-lab335-one-stimulus-response-practical-design-author-20261015-v1/materials/one-complete-DE-EN-stimulus-response-case.author.json'
original_profiles_path = E15 / 'chemie-laboratory-communication-fifteen-current419-whole-author-20261015-v1/candidate/fifteen-profiles.raw-E0G0.author.jsonl'
original_cases = load(original_cases_path)['cases']
cases = {c['caseId']: c for c in load(corrected_cases_path)['cases']}
cases.update({c['caseId']: c for c in load(stim_path)['cases']})
old_profiles = {p['goalId']: p for p in map(json.loads, original_profiles_path.read_text().splitlines())}
old = load(base)
canonical = copy.deepcopy(old)
g = {a['id']: a for a in canonical['goals']}
by_short = {a['id'][:8]: a['id'] for a in canonical['goals']}
idof = lambda prefix: by_short[prefix]
old11 = [r['goal']['id'] for r in contexts['rows']]
source_by_goal = {row['goalId']: row for row in source_rows['rows']}
converted = [idof(s) for s in ['cf2631d9', 'fb41c82c', 'cfa5c1e4', '9ace7bd2', '3351fe47', 'ebe2f6db']]
stable = [idof(s) for s in ['e6dcd3a0', 'fec1563e', '7b443158', 'dc4a26c7', 'ffebca5e']]
def idnew(parent, key):
    return str(uuid5(UUID(parent), 'skillpilot:chemistry:bcp:' + key + ':v1'))
new_ids = {
    key: idnew(idof(parent), key) for parent, key in [
        ('cfa5c1e4', 'mixture-composition'), ('cfa5c1e4', 'unknown-pure-substance-identity'),
        ('9ace7bd2', 'biotechnological-preparation'), ('9ace7bd2', 'chemical-preparation'),
        ('3351fe47', 'organism-requirements-investigation'), ('3351fe47', 'enzyme-reaction-investigation'), ('3351fe47', 'organism-stimulus-response'),
        ('ebe2f6db', 'organism-identification'), ('ebe2f6db', 'community-site-field-investigation'), ('ebe2f6db', 'controlled-environment-habitat-investigation'),
    ]
}
safe = [idof(s) for s in ['e81a4aed', '9e656697', '7be6f951', 'ebaae4f5']]
doc = idof('9fc800d1')
data_limits = idof('4aa3a130')
scope_role = {
    'jurisdiction': 'DE-BY', 'sourceSubject': 'Biologisch-chemisches Praktikum', 'sourceYears': ['12', '13'],
    'courseRole': 'separate-selected-practical-course', 'ordinaryChemistryGKOrLKObligation': False,
    'selectionRule': 'At least three of areas2–7 in a school year, balanced biology/chemistry; area1 where appropriate. Source expectations and content are suggestions, not an obligation to teach all.',
    'authorProposalOnly': True, 'runtimeSelectionUXImplemented': False,
}
for gid in old11:
    a = g[gid]
    a['applicability'] = {'jurisdiction': ['DE-BY']}
    a['tags'] = [t for t in a['tags'] if t not in ['GK', 'LK']]
    a['core'] = False
    a['extendedData']['sourceCourseRoleProposal'] = copy.deepcopy(scope_role)
    a['extendedData']['applicabilityMappingInheritance'] = 'boundary'

specs = [
 ('cfa5c1e4','mixture-composition','Stoffgemische qualitativ und quantitativ analysieren','Analyse mixture composition qualitatively and quantitatively',
  'Die lernende Person kann geeignete Analyseverfahren auswählen, sicher durchführen und dokumentieren, um die Bestandteile eines Stoffgemisches und ihre Mengenanteile mit nachvollziehbarer Stoffbilanz und Aussagegrenzen zu bestimmen.',
  'The learner can select, safely perform and document suitable analyses to determine the components and quantities in a mixture, with a transparent material balance and limits of inference.', safe+[doc,data_limits]),
 ('cfa5c1e4','unknown-pure-substance-identity','Unbekannte Reinstoffproben analytisch identifizieren','Identify unknown pure-substance samples analytically',
  'Die lernende Person kann für einen begründeten Kandidatenraum unterscheidende Analyseverfahren auswählen, sicher durchführen und dokumentieren, um eine unbekannte Reinstoffprobe anhand von Referenzen zu identifizieren und verbleibende Mehrdeutigkeit offenzulegen.',
  'The learner can select, safely perform and document discriminating analyses for a justified candidate set, identify an unknown pure-substance sample against references and disclose remaining ambiguity.', safe+[doc,data_limits]),
 ('9ace7bd2','biotechnological-preparation','Stoffe mit biotechnologischen Verfahren herstellen','Produce substances using biotechnological procedures',
  'Die lernende Person kann einen biotechnologischen Herstellungsweg mit geeigneten biologischen Kontrollen planen, sicher durchführen, aufarbeiten und dokumentieren sowie die erhaltene Präparation und die Grenzen des Produktnachweises fachlich begründen.',
  'The learner can plan a biotechnological production route with suitable biological controls, perform it safely, work it up and document it, explaining the preparation obtained and the limits of product identification.',safe+[doc]),
 ('9ace7bd2','chemical-preparation','Stoffe chemisch präparieren und aufarbeiten','Prepare and work up substances chemically',
  'Die lernende Person kann eine chemische Präparation anhand von Reaktionsgleichung und Stoffmengen planen, sicher durchführen, aufarbeiten und dokumentieren sowie Produktmasse, Ausbeute und Reinheitsgrenzen begründet unterscheiden.',
  'The learner can plan a chemical preparation from its reaction equation and quantities, perform it safely, work it up and document it, distinguishing product mass, yield and limits of purity.',safe+[doc]),
 ('3351fe47','organism-requirements-investigation','Grundlegende Anforderungen von Lebewesen experimentell untersuchen','Investigate basic requirements of organisms experimentally',
  'Die lernende Person kann eine prüfbare Hypothese zu einer grundlegenden Anforderung von Lebewesen durch einen kontrollierten Versuch sicher, art- und naturschutzgerecht untersuchen, eigene Bedingungen und Beobachtungen dokumentieren und die Schlussfolgerung auf die geprüften Organismen und Bedingungen begrenzen.',
  'The learner can investigate a testable hypothesis about a basic requirement of organisms through a safe, species- and nature-respecting controlled experiment, document original conditions and observations and limit conclusions to the organisms and conditions tested.',safe+[doc]),
 ('3351fe47','enzyme-reaction-investigation','Einflüsse auf Enzymreaktionen experimentell untersuchen','Investigate factors affecting enzyme reactions experimentally',
  'Die lernende Person kann eine Hypothese zum Einfluss eines Außenfaktors auf eine Enzymreaktion durch einen kontrollierten Versuch sicher sowie art- und naturschutzgerecht prüfen, eigene Reaktionsbeobachtungen dokumentieren und Enzymwirkung, Störgrößen und Aussagegrenzen unterscheiden.',
  'The learner can test a hypothesis about an external factor affecting an enzyme reaction through a safe, species- and nature-respecting controlled experiment, document original reaction observations and distinguish enzyme action, confounders and limits of inference.',safe+[doc,idof('b4ca3af2')]),
 ('3351fe47','organism-stimulus-response','Reizantworten von Lebewesen kontrolliert untersuchen','Investigate organism stimulus responses with controls',
  'Die lernende Person kann eine Hypothese zu einer beobachtbaren Reizantwort von Lebewesen mit definiertem Reiz, geeigneter Scheinbehandlung und Messregel sicher, art- und naturschutzgerecht prüfen, eigene zeitbezogene Beobachtungen dokumentieren und die Aussage über die Reizantwort von einer nicht gemessenen zellulären Ursache unterscheiden.',
  'The learner can test a hypothesis about an observable organism stimulus response using a defined stimulus, suitable sham and scoring rule, safely and respecting species and nature protection, document original time-linked observations and distinguish the response claim from an unmeasured cellular cause.',safe+[doc]),
 ('ebe2f6db','organism-identification','Lebewesen mit Bestimmungsliteratur bestimmen','Identify organisms using identification literature',
  'Die lernende Person kann Lebewesen auch im Freiland anhand beobachteter Merkmale und geeigneter Bestimmungsliteratur bestimmen, den Bestimmungsweg dokumentieren und bei unzureichenden Merkmalen eine begründete Gruppen- oder Unsicherheitsangabe beibehalten.',
  'The learner can identify organisms, including in the field, from observed traits and suitable identification literature, document the identification route and retain a justified group-level or uncertain assignment where traits are insufficient.',safe+[doc]),
 ('ebe2f6db','community-site-field-investigation','Lebensgemeinschaften und Standortfaktoren im Freiland charakterisieren','Characterise communities and site factors in the field',
  'Die lernende Person kann eine hypothesengeleitete ökologische Freilanduntersuchung schonend planen und durchführen, Lebensgemeinschaften sowie abiotische Standortfaktoren qualitativ und quantitativ mit eigener Stichprobe dokumentieren und beobachtete Zusammenhänge von kausalen Aussagen unterscheiden.',
  'The learner can plan and carry out a careful hypothesis-driven ecological field investigation, document communities and abiotic site factors qualitatively and quantitatively using original sampling and distinguish observed associations from causal claims.',safe+[doc,new_ids['organism-identification']]),
 ('ebe2f6db','controlled-environment-habitat-investigation','Umweltwirkungen kontrolliert prüfen und Lebensraumeignung beurteilen','Test environmental effects with controls and assess habitat suitability',
  'Die lernende Person kann den Einfluss eines Umweltfaktors auf Lebewesen durch eine sichere, art- und naturschutzgerechte ökologische Laboruntersuchung oder manipulative Freilanduntersuchung mit eigenen Daten prüfen und daraus eine auf Art, Bedingungen und Messgröße begrenzte Beurteilung der Lebensraumeignung begründen.',
  'The learner can test an environmental factor affecting organisms through a safe, species- and nature-respecting ecological laboratory or manipulative field investigation using original data and justify a habitat-suitability judgement limited to the species, conditions and outcome measured.',safe+[doc,new_ids['organism-requirements-investigation']]),
]
for parent,key,title,en,description,description_en,requires in specs:
    a=copy.deepcopy(g[idof(parent)])
    a.update(id=new_ids[key], shortKey='canonical_chemistry_bcp_'+key.replace('-','_'), title=title,titleEn=en,description=description,descriptionEn=description_en,contains=[],requires=list(dict.fromkeys(requires)),type='atomic',weight=1,resourceLinks=[])
    a['dimensionTags']['topicCode']='CANONICAL.CHEMISTRY.BCP.'+key.upper().replace('-','_')
    a['extendedData']['provenance']['splitFromCanonicalGoalId']=idof(parent)
    a['extendedData']['provenance']['authorCandidatePackage']=rel(OWN)
    a['extendedData']['authorCandidateStatus']='unreviewed-E0-G0-no-D-P-A-M-V'
    canonical['goals'].append(a);g[a['id']]=a

cluster_specs = [
 ('cf2631d9','Labor- und Präparationsverfahren','Laboratory and preparation procedures',
  'Methodenfamilien für ausgewählte Untersuchungen und Präparationen im biologisch-chemischen Praktikum. Die referenzierten Kompetenzen bilden die jeweils gewählten Unterrichtsvorhaben ab; dieser Cluster ist kein zusätzliches umfassendes Beherrschungsziel.',
  'Method families for selected investigations and preparations in the biological-chemical practical course. The referenced competencies serve the selected projects; this cluster is not an additional comprehensive mastery goal.',
  [idof(s) for s in ['e7c3d20e','cfa5c1e4','9ace7bd2','fec1563e','3351fe47']]),
 ('fb41c82c','Darstellung von Praktikumsergebnissen','Representing practical-course results',
  'Praktikumskontext der bestehenden Kompetenz, chemische Informationen sach-, adressaten- und situationsgerecht darzustellen. Es gilt dieselbe stabile Kompetenz-ID; es entsteht keine zweite Beherrschungspflicht.',
  'Practical-course context of the existing competence for representing chemical information appropriately for content, audience and situation. The same stable competence ID applies; no second mastery obligation is created.',[idof('31781d00')]),
 ('cfa5c1e4','Analysen von Gemischen und unbekannten Reinstoffen','Analyses of mixtures and unknown pure substances',
  'Fachlicher Überblick über die getrennten Kompetenzen zur Zusammensetzung von Gemischen und zur Identifikation unbekannter Reinstoffproben.',
  'Overview of the separate competencies for mixture composition and identification of unknown pure-substance samples.',[new_ids[k] for k in ['mixture-composition','unknown-pure-substance-identity']]),
 ('9ace7bd2','Biotechnologische und chemische Präparationen','Biotechnological and chemical preparations',
  'Fachlicher Überblick über getrennte biotechnologische Herstellungswege und chemische Präparationen mit ihren jeweiligen Kontrollen und Aufarbeitungen.',
  'Overview of separate biotechnological production routes and chemical preparations with their respective controls and work-up.',[new_ids[k] for k in ['biotechnological-preparation','chemical-preparation']]),
 ('3351fe47','Experimente zu Anforderungen, Enzymwirkung und Reizantworten','Experiments on requirements, enzyme action and stimulus responses',
  'Fachlicher Überblick über getrennt untersuchbare Anforderungen von Lebewesen, Einflüsse auf Enzymreaktionen und Reizantworten. Hypothese, Durchführung, Dokumentation und Schutz bleiben Bestandteile jeder jeweiligen Untersuchung.',
  'Overview of separately investigable organism requirements, factors affecting enzyme reactions and stimulus responses. Hypothesis, performance, documentation and protection remain parts of each investigation.',[new_ids[k] for k in ['organism-requirements-investigation','enzyme-reaction-investigation','organism-stimulus-response']]),
 ('ebe2f6db','Ökologische Bestimmung, Bestandsaufnahme und Wirkungsprüfung','Ecological identification, survey and effect testing',
  'Fachlicher Überblick über Bestimmung von Lebewesen, Freilandcharakterisierung und kontrollierte ökologische Wirkungsprüfung mit begrenzter Beurteilung der Lebensraumeignung.',
  'Overview of organism identification, field characterisation and controlled ecological effect testing with bounded habitat-suitability judgement.',[new_ids[k] for k in ['organism-identification','community-site-field-investigation','controlled-environment-habitat-investigation']]),
]
for prefix,title,en,de,desc_en,children in cluster_specs:
    a=g[idof(prefix)];a.update(type='cluster',contains=children,requires=[],title=title,titleEn=en,description=de,descriptionEn=desc_en)
    a['extendedData']['provenance']['retainedFormerAtomicId']=True
    a['extendedData']['authorCandidateStatus']='unreviewed-structural-consolidation-not-A-clearance'

# cf263 is now an aggregate, so completing its descendants cannot be a prerequisite of those same descendants.
# Safety and supervised handling remain required atomically, before independent thematic work.
for prefix in ['e7c3d20e','e6dcd3a0','fec1563e']:
    a=g[idof(prefix)];a['requires']=list(dict.fromkeys(safe+[doc]+[r for r in a['requires'] if r!=idof('cf2631d9')]))
for prefix in ['7b443158','dc4a26c7']:
    # Emulsion/pflegestift and plaster/starch-film work do not require a complete fermentation course.
    a=g[idof(prefix)];a['requires']=list(dict.fromkeys(safe+[doc]+[r for r in a['requires'] if r!=idof('9ace7bd2')]))
parent=g[idof('5ecb52e6')]
covered=set(g[idof('cf2631d9')]['contains'])
parent['contains']=[cid for cid in parent['contains'] if cid not in covered]

# Unique atomic-descendant weights only on changed clusters. No old stable atomic scientific text changes.
def atoms(gid, stack=()):
    assert gid not in stack, ('contains-cycle',gid)
    return {gid} if not g[gid]['contains'] else set().union(*(atoms(c,stack+(gid,)) for c in g[gid]['contains']))
for gid in converted+[idof('5ecb52e6')]:g[gid]['weight']=len(atoms(gid))

out=write('candidate/canonical570.current426.bcp-eleven-six-boundaries.author.json',canonical)
write('candidate/new-ten-atoms.whole.author.json',{'role':'Unreviewed whole author goals','goals':[g[new_ids[k]] for k in new_ids]})
write('candidate/retained-six-ids.whole-clusters.author.json',{'role':'Stable old IDs retained as genuine clusters/context placement','goals':[g[i] for i in converted]})
write('candidate/ID-IDENTITY-and-no-deletion.author.json',{'base':ref(base),'candidate':ref(out),'oldGoalIdsRetained':all(x['id'] in g for x in old['goals']),'deletedIds':[],'newIds':new_ids,'baseCounts':{'canonical':560,'curricularAtomic':422},'candidateProposedCounts':{'canonical':570,'curricularAtomic':426},'netAtomicChange':4,'newStrict':0,'independentAtomicityDecisions':0})

# Full source extraction/mapping rows remain immutable references. Every existing source row is represented;
# split cells carry component edges and require review of the whole union, never fake full coverage per child.
mapping=load(REPO / source_rows['mapping']['path'])
new_by_parent={idof(p):[new_ids[k] for pp,k,*_ in specs if pp==p] for p in ['cfa5c1e4','9ace7bd2','3351fe47','ebe2f6db']}
source_cell_lookup={c['id']:c for c in load(REPO / source_rows['sourceExtraction']['path'])['sourceGoals']}
proposal=[]
for edge in mapping['mappings']:
    target=edge['canonicalGoalId'];cell=source_cell_lookup.get(edge['legacyGoalId'],{})
    span=cell.get('sourceSpan','')
    targets=[target];match=edge['matchType'];reason='Existing unchanged M3 allocation retained as historical input; not reapproved.'
    if target==idof('cf2631d9'):
        targets=sorted(atoms(target));match='partial';reason='Generic safe-method source component instantiated across selected thematic competencies; no individual child covers this entire broad cell. The course selection rule controls use.'
    elif target==idof('fb41c82c'):
        targets=[idof('31781d00')];match='partial';reason='Investigation-result context is covered within unchanged general representation competence; context wrapper retains former ID without second mastery.'
    elif target==idof('cfa5c1e4'):
        targets=([new_ids['mixture-composition']] if span.endswith('.3.1') else [new_ids['unknown-pure-substance-identity']] if span.endswith('.3.2') else new_by_parent[target]);match='partial' if len(targets)>1 else 'exact';reason='Content-specific analysis duties stay separate; safe execution and documentation apply to both complete practical competencies.'
    elif target==idof('9ace7bd2'):
        targets=new_by_parent[target];match='partial';reason='Biotechnological and chemical production are both retained; each full procedure includes safe work-up and original documentation. No either/or substitution.'
    elif target==idof('3351fe47'):
        targets=new_by_parent[target];match='partial';reason='One broad source cell includes requirements plus enzyme influence and stimulus response; all three phenomenon-specific competencies remain. Safety/species/nature protection is required in each.'
    elif target==idof('ebe2f6db'):
        n=int(span.rsplit('.',1)[-1]);targets=[new_by_parent[target][n-1]];match='exact';reason='Separate source duties 7.1 identification,7.2 field characterisation,7.3 controlled effect and habitat conclusion align to separate complete competencies.'
    proposal.append({'sourceGoalId':edge['legacyGoalId'],'wholeSourceCellReference':{'sourceExtraction':source_rows['sourceExtraction'],'sourceGoalId':edge['legacyGoalId'],'sourceSpan':span or None},'previousEdge':edge,'proposedEdges':[{'sourceGoalId':edge['legacyGoalId'],'canonicalGoalId':t,'matchType':match} for t in targets],'componentUnionRequiresWholeReview':len(targets)>1,'rationale':reason,'decision':'unreviewed-author-proposal'})
write('source-mapping/all52-existing-cells.whole-duty-delta.author.json',{'role':'Whole unreviewed M3 successor proposal, not authoritative publication mappings','currentM3':source_rows['mapping'],'unchangedSourceExtraction':source_rows['sourceExtraction'],'officialWholeSource':source_selector['officialHtml'],'wholeLexicalComparison':source_selector['whole52LexicalComparison'],'rows':proposal,'sourceRowCount':len(proposal),'sourceTextAltered':False,'independentSourceMappingApproval':False,'courseRole':scope_role,'ordinaryHECompiledTargetLeakClaimed':False})

def subtree(gid):return {'kind':'canonicalSubtree','goalId':gid}
def entry(gid):return {'kind':'goalEntry','goalId':gid}
def struct(key,label,children):return {'kind':'structure','id':'author-bcp-'+key,'label':label,'children':children}
area_nodes={
    1:struct('area1','Allgemeine Arbeitsweisen: Ergebnisse darstellen',[entry(idof('31781d00'))]),
    2:struct('area2','Verfahren zur Isolierung von Stoffen',[entry(idof('e7c3d20e'))]),
    3:struct('area3','Analyseverfahren',[subtree(idof('cfa5c1e4'))]),
    4:struct('area4','Herstellung, Prüfung und Verwendung von Grund- und Werkstoffen',[subtree(idof('9ace7bd2'))]+[entry(idof(p)) for p in ['e6dcd3a0','7b443158','dc4a26c7','ffebca5e']]),
    5:struct('area5','Mikroskopieren',[entry(idof('fec1563e'))]),
    6:struct('area6','Untersuchungen zu Anforderungen an Lebewesen',[subtree(idof('3351fe47'))]),
    7:struct('area7','Ökologische Untersuchungen',[subtree(idof('ebe2f6db'))]),
}
for name,selected in [('whole-authoring-universe',list(range(1,8))),('example-selected-3-5-6',[1,3,5,6])]:
    write('composition/'+name+'.unpublished.author.view.json',{'viewId':'chemistry-bcp-'+name+'-author-20261015','landscapeId':canonical['landscapeId'],'scope':{'schoolForm':'Gymnasium','jurisdiction':'DE-BY','stage':'SekII','courseProfile':'BCP_AUTHOR_EXAMPLE' if name.startswith('example') else 'BCP_AUTHOR_UNIVERSE'},'rootNodes':[area_nodes[n] for n in selected],'authorOnly':True,'sourceCourse':scope_role,'mandatoryAllAreasClaimed':False,'activeRuntimeRoute':False})
write('scope/COURSE-ROLE-and-compiler-boundaries.author.json',{'sourceCourse':scope_role,'allElevenOldIds':old11,'newTenIds':list(new_ids.values()),'sourceSelection':{'minimumAreas':3,'eligibleAreas':[2,3,4,5,6,7],'balanceAcrossBiologyAndChemistry':True,'area1WhereAppropriate':True,'allExpectationsMandatory':False},'metadataDelta':{'applicability':'Only currently evidenced DE-BY retained on11 BcP-only nodes and10 new children; old unsupported state lists preserved in baseline. Other source states require separate evidence.','tags':'GK/LK removed only from11 BcP-only nodes and10 new children','core':'Explicit false; convertLearningGoal otherwise derives core from GK tag. This metadata change is not an optional-course UX.'},'stockSemantics':{'core':{'path':'app/src/goalTypes.ts','function':'convertLearningGoal','rule':'Explicit boolean core wins; otherwise GK tag determines core. courseLevel also injects GK/LK tags.'},'projection':{'path':'app/src/utils/authoring/compositionViewAuthoring.ts','function':'compileCompositionView','rule':'Only explicit target references appear; prerequisiteOnly does not create a visible target. Duplicate IDs and visible parents fail CPV005/006. No course-selection minimum/balance inferred from tags.'}},'actualExample':'The inactive example selects3,5,6 (one chemistry-focused and two biology-focused areas), plus area1 communication where appropriate. It demonstrates a finite projection, not a newly implemented or reviewed course enrolment flow.','unresolvedIntegration':['Existing ordinary-chemistry composition views and applicability-from-source paths require their own source-bound impact decision before integration.','Full-universe and selected-course example must not be installed together as duplicated targets.','Global navigation should retain31781 in exactly one visible chapter; context wrapper fb41 may be omitted there.'],'noAutomaticInferenceFromPhaseOrRequires':True,'noNewCourseUX':True,'noScopeRemovalToShrinkM7':True})

write('inputs/EXACT.physical-inputs.selector.json',{'role':'Finite informed author inputs, not new independent review input transport','canonical':ref(base),'semantic':ref(sem),'wholeSourceSelector':ref(srcroot/'NEUTRAL.finite-eleven-whole-source-and-structural-author-inputs.json'),'wholeSourceAndContexts':[source_selector[k] for k in ['officialHtml','actualHttpReceipt','whole52LexicalComparison','whole11CurrentContexts','existingActualM3Cells']],'originalHistoricalA':ref(E15/'chemie-lab15-current419-native-original-independent-a-20261015-v1/round-a/results/chemie-laboratory-communication-fifteen-current419-native-20261015-v1-first-pass-a.batch-001.records.jsonl'),'originalHistoricalB':ref(E15/'chemie-lab15-current419-native-original-independent-b-20261015-v1/normal/round-b/results/chemie-laboratory-communication-fifteen-current419-native-20261015-v1-first-pass-b.batch-001.records.jsonl'),'originalWholeCases':ref(original_cases_path),'correctedWholeCases':ref(corrected_cases_path),'additionalWholeStimulusCase':ref(stim_path),'originalWholeRawProfiles':ref(original_profiles_path),'newScientificVotes':0})

# All whole case bodies remain readable at their immutable source locations. Nothing is discarded;
# the child-specific use and the parts that no longer prove a child's competence are made explicit.
write('materials/WHOLE31.originals-and-corrected-selection.author.json',{'role':'Complete retained scientific case universe; no historical approval is retargeted','originalThirty':ref(original_cases_path),'correctedThirty':ref(corrected_cases_path),'supersededScienceDoNotUse':['lab15-05-b original misconception; use corrected successor','lab15-07-b original1.00g/20mL reference mismatch; use0.117g/20.0mL corrected successor'],'additionalStimulusCase':ref(stim_path),'wholeCaseIds':list(cases),'caseCount':31,'executionClaimed':False,'newApprovals':0})

# Prepared scientific case/profile specifications are written separately for transparent author review.
write('candidate/author-context.for-material-serialization.json',{'newIds':new_ids,'old11':old11,'converted':converted,'stable':stable,'safeAtomicPrerequisites':safe,'canonical':rel(out),'originalProfiles':rel(original_profiles_path),'correctedCases':rel(corrected_cases_path),'additionalStimulusCase':rel(stim_path)})
print(json.dumps({'canonical':rel(out),'canonicalGoals':len(canonical['goals']),'newAtoms':10,'proposedCurricularAtomic':426,'mappingSourceRows':len(proposal),'newVotes':0}))
