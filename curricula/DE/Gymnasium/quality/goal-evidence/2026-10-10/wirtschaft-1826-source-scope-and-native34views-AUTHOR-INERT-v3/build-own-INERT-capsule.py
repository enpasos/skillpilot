#!/usr/bin/env python3
"""Own inert author work only. Never writes through an input symlink."""
import copy, hashlib, json, pathlib, shutil, uuid

ROOT = pathlib.Path(__file__).resolve().parents[7]
OUT = pathlib.Path(__file__).resolve().parent
assert ROOT.name == 'skillpilot' and OUT.is_relative_to(ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10')
Q = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10'
V2 = Q / 'wirtschaft-1826-classical-source-operator-fidelity-and-BB-claim-retirement-AUTHOR-INERT-v2'
G3 = Q / 'wirtschaft-1826-three-atomic-competences-six-real-P-cases-AUTHOR-INERT-root-v1'
CAP = OUT / 'native-capsule'
MONO = '1826fe19-4d06-5183-9b41-9121ae1cc219'
INFO = 'a2fa1186-df35-5954-a9a9-e311a55e218f'
PUB = 'df17fd21-e9b7-598f-970e-8f541d059694'
EXT = 'bad728f2-e375-5f98-8f65-511a9e2e6751'
E2 = 'f14dcf9f-66c5-5907-9e06-08f59a9a0e13'
CAN = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json'
REG = 'curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json'
LAND = '605bdaf6-32d5-56fd-8d92-5a80c2fd2901'

def load(p): return json.loads(pathlib.Path(p).read_text())
def sha(p): return hashlib.sha256(pathlib.Path(p).read_bytes()).hexdigest()
def write(p, obj):
    p = pathlib.Path(p); assert p.is_relative_to(OUT)
    p.parent.mkdir(parents=True, exist_ok=True)
    if p.is_symlink(): p.unlink()
    p.write_text(json.dumps(obj, ensure_ascii=False, indent=2) + '\n')
def exactcopy(src, dst):
    dst = pathlib.Path(dst); assert dst.is_relative_to(OUT)
    dst.parent.mkdir(parents=True, exist_ok=True)
    if dst.is_symlink(): dst.unlink()
    shutil.copyfile(src, dst)
def relative(p): return str(pathlib.Path(p).relative_to(ROOT))

inputs = {}
def bind(p):
    p = pathlib.Path(p); inputs[relative(p)] = {'sha256': sha(p), 'bytes': p.stat().st_size}

# Real directories and read-only input symlinks reproduce the unmodified native
# path discovery. No source/runtime path is patched to accept a candidate root.
for p in sorted((ROOT / 'curricula').rglob('*.json')):
    rel = p.relative_to(ROOT)
    if 'quality' in rel.parts: continue
    bind(p)
    dst = CAP / rel; dst.parent.mkdir(parents=True, exist_ok=True)
    if not dst.exists(): dst.symlink_to(p)

# Actual native dependencies, byte-exact. Only copied script location changes.
native = ['app/scripts/applicabilityCompiler.ts', 'app/scripts/memoryCardReviewConfigDiscovery.ts',
          'app/src/landscapeTypes.ts', 'app/src/utils/jurisdictionMetadata.ts']
for n in native:
    p = ROOT / n; bind(p); exactcopy(p, CAP / n)
for p in (ROOT / 'app/src/utils/authoring').glob('*.ts'):
    bind(p); exactcopy(p, CAP / p.relative_to(ROOT))
(CAP / 'app/node_modules').symlink_to(ROOT / 'app/node_modules')

# Native applicability reads current memory origin routing. Preserve it exactly;
# this author packet does not presume the separate future memory-card work.
config_paths = list((ROOT / 'curricula/DE/Gymnasium/quality/memory-card-review').glob('*.config.json'))
registry = load(ROOT / REG); bind(ROOT / REG); exactcopy(ROOT / REG, CAP / REG)
config_paths += [ROOT / s['memoryReviewConfigPath'] for s in registry['subjects']]
for p in sorted(set(config_paths)):
    bind(p); exactcopy(p, CAP / p.relative_to(ROOT))
    cfg = load(p)
    if isinstance(cfg.get('reviewPath'), str):
        review = ROOT / cfg['reviewPath']; bind(review); exactcopy(review, CAP / cfg['reviewPath'])
for n in ['AGENTS.md', 'app/scripts/config/curriculum-maturity-floor-policy.json']:
    bind(ROOT / n)

# Preserve all source-v2 bytes as predecessor author history, without consuming
# root's independent source review or any A/B reviewer results.
idx = load(V2 / 'author-file-index.INERT.json'); bind(V2 / 'author-file-index.INERT.json')
file_index = {}
for original, row in idx['files'].items():
    if 'candidate' not in row: continue
    pred = ROOT / row['candidate']; bind(pred)
    history = OUT / 'history-predecessor-candidates' / pred.name
    exactcopy(pred, history)
    dest = OUT / ('source-candidates' if '/source-extraction/' in original else 'mapping-candidates') / pred.name
    exactcopy(pred, dest); exactcopy(dest, CAP / original)
    file_index[original] = {'predecessorHistory': relative(history), 'candidate': relative(dest)}
    active = ROOT / original; bind(active)
    exactcopy(active, OUT / 'history-active' / (original.replace('/', '__') + '.snapshot'))

# Bounded correction of precisely the affected BB parent and four siblings.
bbpath = next(k for k in file_index if '/source-extraction/DE_BB_' in k)
bb = load(CAP / bbpath)
pid = 'bb-wirtschaft-sekii:q-lk-markt-preis'
g1 = 'bb-wirtschaft-sekii-q-lk-markt-preis-g01-cf04cb5b'
g2 = 'bb-wirtschaft-sekii-q-lk-markt-preis-g02-f523769c'
g4 = 'bb-wirtschaft-sekii-q-lk-markt-preis-g04-4866b9b4'
g5 = 'bb-wirtschaft-sekii-q-lk-markt-preis-g05-627babfb'
before_goals = {g['id']: copy.deepcopy(g) for g in bb['sourceGoals'] if g['id'] in [g1,g2,g4,g5]}
before_parent = copy.deepcopy(next(p for p in bb['passages'] if p['id'] == pid))
texts = {
 g1: 'Die Funktionen von Preisen als Voraussetzung einer funktionsfähigen Marktwirtschaft erläutern.',
 g2: 'Kenntnisse zum vollkommenen und unvollkommenen Polypol in ein Preis-Mengen-Diagramm übertragen.',
 g4: 'Staatliche Eingriffe in Märkte analysieren, im Preis-Mengen-Diagramm darstellen und ihre Wirkungen bewerten.'}
optional_pid = 'bb-wirtschaft-sekii:q-lk-markt-preis-corrected-optional-intervention-p23'
for g in bb['sourceGoals']:
    if g['id'] not in texts: continue
    t = texts[g['id']]
    for field in ['sourceText','parentBulletText','rawSourceText','rawParentBulletText']: g[field] = t
    if g['id'] == g4:
        g['passageId'] = optional_pid; g['topicCode'] = 'Q-LK-MARKTSTEUERUNG'
        g['tags'] = [x for x in g['tags'] if not x.startswith('topic:')] + ['topic:Q-LK-MARKTSTEUERUNG']
        title = 'LK Mikroökonomie: Wahlobligatorisches Feld Marktsteuerung'
        span = 'Q-LK-MARKTSTEUERUNG: Eingriffsanalyse, Original S.23, Wahlalternative'
        role = 'Wahlobligatorisch: Marktsteuerung ODER Konzentration und Wettbewerb (S.22); keine allgemeine LK-Pflicht aller Lernenden.'
    else:
        title = 'LK Mikroökonomie: Pflichtfeld Markt und Preis'
        span = 'Q-LK-MARKT-PREIS: ' + ('Preisfunktionen' if g['id'] == g1 else 'Polypol im Preis-Mengen-Diagramm') + ', Original S.23'
        role = 'Pflichtfeld Markt und Preis, LK 2. Kurshalbjahr Mikroökonomie.'
    g['title'] = 'BB ' + title + ': ' + t
    g['description'] = 'Eigene Leistungsparaphrase aus ' + title + ': ' + t
    g['sourceSpan'] = span; g['rawSourceSpan'] = span
    g['sourceRef'] = 'Rahmenlehrplan GOST Wirtschaftswissenschaft Berlin-Brandenburg 2022, LK 2. Kurshalbjahr, S.22–23; konkrete Leistungsanforderung S.23. ' + role
bb['sourceGoals'] = [g for g in bb['sourceGoals'] if g['id'] != g5]
parent = next(p for p in bb['passages'] if p['id'] == pid)
parent.update(title='LK Mikroökonomie: Pflichtfeld Markt und Preis – zwei korrigierte Leistungsparaphrasen',
 page=23, text='(1) ' + texts[g1] + '\n(2) ' + texts[g2], rawText=texts[g1] + '\n' + texts[g2], sourceGoalIds=[g1,g2])
bb['passages'].append({'id':optional_pid, 'topicCode':'Q-LK-MARKTSTEUERUNG',
 'title':'LK Mikroökonomie: Wahlalternative Marktsteuerung, Eingriffsanalyse S.23',
 'text':'(4) ' + texts[g4], 'page':23, 'sourcePath':parent['sourcePath'], 'rawText':texts[g4], 'sourceGoalIds':[g4]})
bbdest = ROOT / file_index[bbpath]['candidate']; write(bbdest, bb); exactcopy(bbdest, CAP / bbpath)
bbmap = next(k for k in file_index if '/mapping/DE-BB/' in k)
mapping = load(CAP / bbmap)
mapping['mappings'] = [r for r in mapping['mappings'] if r['legacyGoalId'] != g5 and not (r['legacyGoalId'] == g4 and r['canonicalGoalId'] == '625b61ec-8561-5179-b59e-d3742b19c0e2')]
mapping['decisions'] = [r for r in mapping['decisions'] if r['sourceGoalId'] != g5]
remaining = {g1:'Keine Gesamtwohlfahrts-/Elastizitätsforderung aus diesem Source-Atom. Zielverträge sind breiter als die Preisfunktionsleistung.',
 g2:'Die Originalleistung umfasst ausdrücklich auch unvollkommenes Polypol; der vorhandene Zielvertrag nennt vollkommene Märkte. Keine vollständige Originalabdeckung behauptet.',
 g4:'Wahlalternative; vorhandener Zielvertrag zu Chancen und Grenzen staatlicher Eingriffe trägt eine verwandte Urteilsfacette. Analyse und grafische Darstellung sind damit nicht vollständig belegt; Umweltinstrumente werden vom Original an dieser Stelle nicht speziell verlangt.'}
for r in mapping['mappings']:
    if r['legacyGoalId'] in [g1,g2,g4]: r['matchType'] = 'partial'
for r in mapping['decisions']:
    if r['sourceGoalId'] not in [g1,g2,g4]: continue
    r['matchType'] = 'partial'; r['topicCode'] = 'Q-LK-MARKTSTEUERUNG' if r['sourceGoalId'] == g4 else 'Q-LK-MARKT-PREIS'
    r['sourceSpan'] = next(g['sourceSpan'] for g in bb['sourceGoals'] if g['id'] == r['sourceGoalId'])
    r['canonicalGoalIds'] = [m['canonicalGoalId'] for m in mapping['mappings'] if m['legacyGoalId'] == r['sourceGoalId']]
    r['rationale'] = 'INERT-Autorkandidat, related-partial ohne ganze Quellenfreigabe: ' + remaining[r['sourceGoalId']]
    r['reviewedAt'] = '2026-10-10'; r['reviewer'] = 'Codex author candidate, independent review pending'
bbmdest = ROOT / file_index[bbmap]['candidate']; write(bbmdest,mapping); exactcopy(bbmdest,CAP / bbmap)
write(OUT / 'actual-BB-one-parent-four-siblings-bounded-source-corrections.AUTHOR-INERT.json', {
 'status':'author_candidate_needs_independent_review', 'sourceDocument':bb['sourceDocument'],
 'actualWholePagesRead':[22,23,24], 'primaryRoles':{'22':'LK Pflichtfelder gegenüber zwei Wahlalternativen', '23':'tatsächliche Mikroökonomie-Leistungsanforderungen', '24':'anderes, makroökonomisches Kurshalbjahr'},
 'beforeWholeParent':before_parent, 'afterWholeParent':parent,
 'wholeSiblingDeltas':[{'id':gid,'beforeWhole':before_goals[gid],'afterWhole':next((g for g in bb['sourceGoals'] if g['id']==gid),None),'finding':remaining.get(gid,'Unbelegter Modellgrenzen-Claim an S.22–24; fachliche Stilllegung vorgeschlagen, Originalhistory erhalten. Kein erfundener normativer Pflichtverlust.')} for gid in [g1,g2,g4,g5]],
 'actualOriginalRequirementsStillOpenForExtractionAndWholeTargetCoverage':[
 'Pflicht: Markt anhand verschiedener Kriterien beschreiben, Marktformen charakterisieren und Anbieterhandeln daraus ableiten. In diesen vier alten Claims nicht ehrlich enthalten.',
 'Pflicht: Gewinnsteigerungsmöglichkeiten durch Preisdifferenzierung diskutieren. Weder diese vier alten Claims noch ein aktueller vollständiger kanonischer Zielvertrag belegen diese Leistung.',
 'Pflicht: vollkommenes und unvollkommenes Polypol ins Diagramm übertragen; unvollkommene Facette nicht als durch den vorhandenen Nur-vollkommen-Zielvertrag erledigt behauptet.',
 'Wahlalternative: Eingriffe analysieren, grafisch darstellen und bewerten; bloß allgemeines Abwägen staatlicher Chancen/Grenzen ist keine ganze Abdeckung.'],
 'noGlobalOtherBBParentApproval':True, 'wholeExistingCanonicalTargetContracts':[g for g in load(ROOT/CAN)['goals'] if g['id'] in {m['canonicalGoalId'] for m in mapping['mappings'] if m['legacyGoalId'] in [g1,g2,g4]} | {'b2419b68-8e21-5cee-8afc-34e3b07d2a87','625b61ec-8561-5179-b59e-d3742b19c0e2'}]})

# Additive metadata correction only; v2 report remains byte-exact history.
matrix_path = V2 / 'metadata-addendum/actual-seven-state-course-facet-matrix-current-v2-retirement-roles.AUTHOR-INERT.json'
bind(matrix_path); matrix = load(matrix_path)
def correct_prose(o):
    if isinstance(o,str): return o.replace('compares','analyses')
    if isinstance(o,list): return [correct_prose(x) for x in o]
    if isinstance(o,dict): return {k:correct_prose(v) for k,v in o.items()}
    return o
write(OUT / 'actual-seven-state-matrix-additive-NW-g03-analyses-prose.AUTHOR-INERT.json',correct_prose(matrix))

# Whole original goal envelopes from our sealed author packet; preserve all
# contracts, prerequisites, resource choices and statuses. Scope only is new.
bind(G3/'three-whole-goal-candidates.INERT.json')
three = load(G3/'three-whole-goal-candidates.INERT.json')['goals']
canonical = load(ROOT/CAN); active_goal_by_id={g['id']:g for g in canonical['goals']}
labels={g['id']:g['title'] for g in three}; labels[EXT]=active_goal_by_id[EXT]['title']
for g in three:
    g.setdefault('extendedData',{})['applicabilityMappingInheritance']='boundary'
    if g['id']==MONO:
        # Explicit author choice: retain the earlier BY/NI learning offer,
        # identified as pedagogical extension, never native source evidence.
        g['extendedData']['applicabilityOverrides']={'jurisdiction':['DE-BY','DE-NI']}
    g['applicability']={'jurisdiction': {'1826fe19-4d06-5183-9b41-9121ae1cc219':['DE-BB','DE-BW','DE-BY','DE-HE','DE-NI','DE-NW','DE-TH'], INFO:['DE-BW','DE-HE','DE-NW'],PUB:['DE-BW','DE-HE','DE-NI','DE-NW']}[g['id']]}
by3={g['id']:g for g in three}
canonical['goals']=[copy.deepcopy(by3[g['id']]) if g['id'] in by3 else g for g in canonical['goals']]
index=next(i for i,g in enumerate(canonical['goals']) if g['id']==MONO)
canonical['goals'][index+1:index+1]=[copy.deepcopy(by3[INFO]),copy.deepcopy(by3[PUB])]
e2=next(g for g in canonical['goals'] if g['id']==E2); n=e2['contains'].index(MONO)
e2['contains'][n+1:n+1]=[INFO,PUB]
ext=next(g for g in canonical['goals'] if g['id']==EXT)
ext['applicability']['jurisdiction']=sorted(set(ext['applicability']['jurisdiction'])|{'DE-NI'})
assert len(canonical['goals'])==681 and len({g['id'] for g in canonical['goals']})==681
write(OUT/'canonical-candidate/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json',canonical)
exactcopy(OUT/'canonical-candidate/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json',CAP/CAN)
exactcopy(ROOT/CAN,OUT/'history-active/canonical-current679.exact.json.snapshot')
write(OUT/'three-whole-scope-adjusted-goals.AUTHOR-INERT.json',{'role':'author_candidate_needs_independent_review','goals':three})

# Per-view actual authored target decisions. There is no wholesale country
# cloning, no inferred source obligations, and no automatic role inference.
roles=[]; viewdir=ROOT/'curricula/DE/Gymnasium/composition-views/wirtschaft'
for original in sorted(viewdir.glob('*.view.json')):
    bind(original); v=load(original); country=v['scope'].get('jurisdiction'); course=v['scope'].get('courseProfile')
    added=[]; changed=[]
    def walk(nodes):
        for node in list(nodes):
            if node.get('goalId')==MONO and node.get('kind')=='goalEntry':
                node['displayLabel']=labels[MONO]; changed.append(MONO)
                at=nodes.index(node)+1
                ids=([INFO] if country in ['DE-BW','DE-HE','DE-NW'] else [])+([PUB] if country in ['DE-BW','DE-HE','DE-NI','DE-NW'] else [])
                for gid in ids:
                    nodes.insert(at,{'kind':'goalEntry','goalId':gid,'displayLabel':labels[gid],'projectionRole':'target'}); at+=1; added.append(gid)
                if country=='DE-NI':
                    nodes.insert(at,{'kind':'goalEntry','goalId':EXT,'displayLabel':labels[EXT],'projectionRole':'target'}); added.append(EXT)
            if 'children' in node:walk(node['children'])
    walk(v['rootNodes'])
    dest=OUT/'view-candidates'/original.name; write(dest,v); exactcopy(original,OUT/'history-active/views'/original.name)
    exactcopy(dest,CAP/original.relative_to(ROOT))
    roles.append({'viewPath':relative(original),'candidate':relative(dest),'scope':v['scope'],'addedExplicitTargetIds':added,'relabeledWholeSurvivingContractIds':changed,
      'newInfoRoleReason':('HE E2.6 beyond compulsory1–4: deliberate optional-field learning extension; pre-contract selection partial only' if country=='DE-HE' else 'BW/NW explicit broader informational source, pre-contract selection related-partial only') if INFO in added else None,
      'newPublicRoleReason':({'DE-BW':'Game/free-rider source subset, not all game models','DE-HE':'E2.3 mandatory public/common goods environmental field, voluntary-provision causal subset','DE-NI':'Explicit environmental public-goods clause in both gA/eA source, causal subset','DE-NW':'QLK environment public-good/evaluation source; GK deliberate extension beyond direct LK clause'}[country]) if PUB in added else None,
      'monoExistingTargetRoleReason':('deliberate preserved didactic extension; no full source-duty claim' if country in ['DE-BY','DE-NI'] or (country in ['DE-BB','DE-TH'] and course=='GK') else 'related-partial source role; broader original performances remain open') if MONO in changed else None,
      'existingExtRoleReason':'NI environmental external-effects explicit gA/eA, whole identify/internalisation contract broader than describe-original clause' if EXT in added else 'existing target or prerequisite role preserved; this packet does not requalify untouched source strength',
      'nationwideRoleReason':'authored cross-jurisdiction canonical target pool includes new facets; neither a 16-state duty claim nor a course-equivalence assertion' if country is None else None})
write(OUT/'actual-35-view-authored-country-course-role-decisions.AUTHOR-INERT.json',roles)
write(OUT/'author-file-index.INERT.json',{'files':file_index,'canonicalCandidate':relative(OUT/'canonical-candidate/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json')})
write(OUT/'actual-bound-inputs.before.READONLY.json',inputs)
print(json.dumps({'status':'OWN INERT capsule prepared; no active writes','nativeInputFilesHashBound':len(inputs),'candidateGoals':len(canonical['goals']),'views':len(roles),'BBsourceGoals':len(bb['sourceGoals'])}))
