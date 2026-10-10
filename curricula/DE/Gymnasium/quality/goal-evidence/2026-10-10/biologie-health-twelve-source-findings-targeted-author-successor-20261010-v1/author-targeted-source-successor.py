# SPDX-License-Identifier: Apache-2.0
"""Prepare an inactive, narrowly authored SOURCE successor; never approve it."""
import copy
import hashlib
import json
from pathlib import Path

ROOT = Path.cwd()
P = Path(__file__).resolve().parent.relative_to(ROOT)
H = Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/biologie-health-twelve-current353-source-raster-native-technical-preparation-20261010-v1')
V2 = Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/biologie-health-twelve-two-targeted-metadata-raster-native-technical-successor-20261010-v2')
def read(path):
    return json.loads(Path(path).read_text())
def ref(path):
    path = Path(path)
    data = path.read_bytes()
    return {'path': str(path), 'sha256': 'sha256:' + hashlib.sha256(data).hexdigest(), 'bytes': len(data)}
def put(path, data):
    path = P / path
    path.parent.mkdir(parents=True, exist_ok=True)
    assert not path.exists(), path
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n')
    return ref(path)

config = read(H / 'sources/after394-atlas.current-summary.normal.config.json')
changed = []
maps = []
by_sid = {}
removals = [
    ('hb-biology-seki-bp2006-2022-3-2-sexualitaet-verantwortung-057-a4155aaf', '3c0f5267-4837-5c99-aa6d-bfb41ff70980', 'Mitose/Meiose als genetische Informationsweitergabe belegt weder Pubertät als Entwicklungsprozess noch die Beurteilung von Pubertätsmedien. Die Zellteilungsbindung bleibt erhalten.'),
    ('hb-biology-seki-bp2006-2022-3-1-koerperleistungen-gesundheit-037-a47d64cd', '6de6ad3b-1099-5f51-848d-96de4119ed01', 'Ekel beim Umgang mit Naturobjekten ist eine prozessbezogene Reflexionsanforderung und kein direkter Nachweis einer begründeten Gesundheitsentscheidung. Die beiden übrigen Prozessziele bleiben erhalten.'),
    ('hb-biology-seki-bp2006-2022-3-2-sinne-wahrnehmung-052-5e403f85', '6de6ad3b-1099-5f51-848d-96de4119ed01', 'Schweineaugenpräparation und Umgang mit Ekel belegen Beobachtung/Präparation, nicht das Abwägen gesundheitlicher Handlungsfolgen. Die drei übrigen Prozess-/Sinneszielbindungen bleiben erhalten.'),
    ('sl-biology-seki-nw56-2012-pfl5-003-b5650cc6', 'a6f2bcaf-df2d-5144-aa8f-49396b12d31b', 'SL physisch 25/26 fordert pflanzliche Blüten-/Samenfortpflanzung. Gametenverschmelzung ist eine allgemeine Grundlage, aber weder menschlicher Befruchtungsort noch vorgeburtlicher Stoffaustausch sind damit curricular unmittelbar belegt. Die beiden Pflanzenbindungen bleiben erhalten.'),
]
removed = []
source_fidelity = []
hh_scopes = []
hh_sid = 'hh-biology-seki-bildungsplan-2011-m-07-biologie-des-menschen-gesundheit-sexualitat-immunsystem-und-nervensystem-erklaren'
hh_targets = {
    '0e1065b9-9d1d-5299-b900-32c74d352e56': 'Nur Kommunikation über Drogenwirkungen auf das Nervensystem; keine vollständige Lebenskompetenz, Persönlichkeitsentwicklung oder Präventionsstrategie.',
    '773a297d-49bf-5c8a-a62a-1bd2558e323c': 'Nur biologische Drogenwirkung; kein vollständiges biopsychosoziales Entstehungsmodell der Sucht und keine gesamte Präventionskompetenz.',
    'a6f57e17-9f0c-5327-91bc-c6f31ff375a2': 'Nur biologische Drogenwirkung; weder Genuss/Sucht-Abgrenzung noch vollständige Risiko-/Hilfsentscheidung sind durch diese einzelne Kommunikationserwartung belegt.',
}
for index, old_map in enumerate(config['mappingPaths']):
    before_m = read(old_map)
    old_ex = before_m['sourceExtractionPath']
    before_x = read(old_ex)
    if before_x['jurisdiction'] not in ('DE-HB', 'DE-HH', 'DE-SL'):
        maps.append(old_map)
        for g in before_x['sourceGoals']:
            by_sid[g['id']] = (old_map, before_m, before_x, g)
        continue
    m, x = copy.deepcopy(before_m), copy.deepcopy(before_x)
    selected_decisions = set()
    for sid, goal, reason in removals:
        if not any(g['id'] == sid for g in x['sourceGoals']):
            continue
        row = next(r for r in m['mappings'] if r['legacyGoalId'] == sid and r['canonicalGoalId'].split(':')[-1] == goal)
        m['mappings'].remove(row)
        dec = next(d for d in m['decisions'] if d['sourceGoalId'] == sid)
        before_dec = copy.deepcopy(dec)
        dec['canonicalGoalIds'] = [g for g in dec['canonicalGoalIds'] if g.split(':')[-1] != goal]
        assert dec['canonicalGoalIds'], sid
        dec.update(rationale=reason + ' Gezielter AUTHOR-Nachfolger; unabhängige SOURCE-Prüfung steht aus.', reviewer='codex-author-targeted-source', reviewedAt='2026-10-10')
        selected_decisions.add(sid)
        g = next(g for g in x['sourceGoals'] if g['id'] == sid)
        if 'canonicalTargets' in g.get('metadata', {}):
            g['metadata']['canonicalTargets'] = [i for i in g['metadata']['canonicalTargets'] if i != goal]
        removed.append({'sourceGoalId': sid, 'canonicalGoalId': goal, 'beforeMappingRecord': row, 'afterMappingRecord': None, 'beforeDecision': before_dec, 'afterDecision': copy.deepcopy(dec), 'rationale': reason, 'replacementSourceInvented': False})
    if x['jurisdiction'] == 'DE-HB':
        for suffix, official, operator, limit in [
            ('051-a74ab90c', 'Wirkungen von Alkohol und Drogen sowie Strategien zur Vermeidung von Suchtmittelmissbrauch nennen.', 'nennen', 'Die amtliche Nennanforderung belegt die genannten Wirkungen/Vermeidungsstrategien. Das stärkere Erklären/Ableiten der alten Extraktion ist eigene didaktische Operationalisierung, kein wörtlicher amtlicher Operator.'),
            ('057-a4155aaf', 'Mitose und Meiose als Prozesse der Weitergabe von genetischer Information beschreiben.', 'beschreiben', 'Die amtliche Beschreibung betrifft genetische Informationsweitergabe. Die stärkere Unterscheidung und Erklärung für Wachstum/Fortpflanzung der alten Extraktion ist eigene didaktische Operationalisierung. Pubertät und Medienbeurteilung werden damit nicht belegt.'),
        ]:
            g = next(g for g in x['sourceGoals'] if g['id'].endswith(suffix))
            before_g = copy.deepcopy(g)
            # Stronger authored title/description stay visibly authored; current raw
            # source fields identify the genuine normalized primary bullet.
            old_text_fields = {k: g.get(k) for k in ['sourceText', 'rawSourceText', 'parentBulletText', 'rawParentBulletText', 'sourceSpan', 'rawSourceSpan', 'sourceRef', 'granularity']}
            g.update(granularity='authoredOperationalization', sourceText=official, rawSourceText=official, parentBulletText=official, rawParentBulletText=official,
                     sourceSpan='Bremen 2006, physische und gedruckte S. 31; unter Einschränkung 2022, Jg. 5–9', rawSourceSpan='Bremen 2006, physische und gedruckte S. 31; unter Einschränkung 2022, Jg. 5–9',
                     sourceRef='Bremen Bildungsplan Naturwissenschaften/Biologie 2006, S. 31; eingeschränkte Gültigkeit ab 2022 für Jg. 5–9. Eigene didaktische Operationalisierung des angegebenen amtlichen Operators.')
            g['sourceFidelity'] = {'kind': 'authoredOperationalization', 'officialPrimaryBulletNormalized': official, 'officialOperator': operator, 'authorTitleDescriptionAreVerbatimOfficialBullet': False, 'historicalStrengthenedExtractionFields': old_text_fields, 'scopeLimitation': limit, 'normativeRestrictionPreserved': g['sourceDocumentKey'], 'year10ClearanceClaimed': False, 'independentApproval': False}
            source_fidelity.append({'sourceGoalId': g['id'], 'beforeWholeSourceGoal': before_g, 'afterWholeSourceGoal': copy.deepcopy(g), 'officialOperator': operator, 'rationale': limit})
            passage = next(p for p in x['passages'] if p['id'] == g['passageId'])
            annotations = passage.setdefault('selectedOperationalizationFidelity', [])
            annotations.append({'sourceGoalId': g['id'], 'historicalPassageTextIsVerbatimClaim': False, 'actualOfficialOperator': operator, 'actualOfficialPrimaryBulletNormalized': official, 'physicalPage': 31, 'printedPage': 31})
    if x['jurisdiction'] == 'DE-HH':
        g = next(g for g in x['sourceGoals'] if g['id'] == hh_sid)
        before_locator = copy.deepcopy(g['actualPrimaryLocator'])
        g['actualPrimaryLocator']['physicalPagesOneBased'] = [24, 27, 28]
        g['actualPrimaryLocator']['primaryReadRole'] = 'AUTHOR targeted actual full-page examination; independent source approval pending'
        g['actualPrimaryLocator']['wholeSelectedPageTextSha256'].insert(0, {'physicalPage': 24, 'sha256': ref(P / 'primary/HH.physical-024.txt')['sha256']})
        g['sourceContributionScopes'] = []
        for goal, limit in hh_targets.items():
            r = next(r for r in m['mappings'] if r['legacyGoalId'] == hh_sid and r['canonicalGoalId'] == goal)
            before_r = copy.deepcopy(r)
            locator = copy.deepcopy(g['actualPrimaryLocator'])
            locator.update(physicalPagesOneBased=[24], wholeSelectedPageTextSha256=[{'physicalPage': 24, 'sha256': ref(P / 'primary/HH.physical-024.txt')['sha256']}])
            scope = {'canonicalGoalId': goal, 'matchType': 'partial', 'actualPrimaryLocator': locator, 'communicationDomain': 'Biologie des Menschen', 'grade8Operator': 'beschreiben den Einfluss der verschiedenen Drogen auf das Nervensystem', 'transitionToStudienstufeOperator': 'erklären den Einfluss der verschiedenen Drogen auf das Nervensystem', 'scopeLimitation': limit, 'fullCanonicalCompetenceClaimed': False, 'independentApproval': False}
            r.update(actualPrimaryLocator=locator, sourceContributionScope=scope)
            g['sourceContributionScopes'].append(scope)
            hh_scopes.append({'sourceGoalId': hh_sid, 'canonicalGoalId': goal, 'beforeLocator': before_locator, 'afterLocator': locator, 'beforeMappingRecord': before_r, 'afterMappingRecord': copy.deepcopy(r), 'rationale': limit})
        dec = next(d for d in m['decisions'] if d['sourceGoalId'] == hh_sid)
        dec['targetedPartialContributionScopes'] = copy.deepcopy(g['sourceContributionScopes'])
        dec['targetedSourceResolution'] = 'Für die drei genannten Suchtziele ist physische S. 24, Kompetenzbereich Kommunikation maßgeblich. S. 27/28 bleiben für die unveränderten Fortpflanzungs-/Sexualitätsbindungen erhalten. Kein gesamter Kurs und keine vollständige Lebenskompetenz/Suchtentscheidung werden freigegeben.'
        selected_decisions.add(hh_sid)
    state = x['jurisdiction'][3:]
    ex_path = P / f'sources/extractions/{index:02d}-{state}.whole-targeted-source.inactive.json'
    map_path = P / f'sources/mappings/{index:02d}-{state}.whole-targeted-source.inactive.review.json'
    m['sourceExtractionPath'] = str(ex_path)
    put(ex_path.relative_to(P), x)
    put(map_path.relative_to(P), m)
    maps.append(str(map_path))
    assert all(d == next(q for q in m['decisions'] if q['sourceGoalId'] == d['sourceGoalId']) for d in before_m['decisions'] if d['sourceGoalId'] not in selected_decisions)
    changed.append({'index': index, 'jurisdiction': x['jurisdiction'], 'beforeMapping': ref(old_map), 'afterMapping': ref(map_path), 'beforeExtraction': ref(old_ex), 'afterExtraction': ref(ex_path), 'changedDecisionIds': sorted(selected_decisions), 'wholeSourceGoalCountBeforeAfterEqual': len(before_x['sourceGoals']) == len(x['sourceGoals']), 'unselectedMappingDecisionsExact': True})
    for g in x['sourceGoals']:
        by_sid[g['id']] = (str(map_path), m, x, g)

assert len(removed) == 4 and len(hh_scopes) == 3 and len(source_fidelity) == 2
put('sources/four-pair-removals-three-HH-partial-scopes-two-HB-fidelity.actual-author-deltas.json', {'schemaVersion': 1, 'role': 'AUTHOR targeted corrections, pending independent review', 'wholeChangedMappingPairs': changed, 'removedUnsupportedDirectPairs': removed, 'hhThreePartialLocatorAndScopeCorrections': hh_scopes, 'hbTwoActualOperatorAndAuthoredOperationalizationCorrections': source_fidelity, 'inventedSourceReplacement': False, 'humanApproved': 0, 'strictGain': 0})

current = read(H / 'sources/current186-whole-direct-witnesses-and-selected-actual-primaries.neutral.json')
before = copy.deepcopy(current)
for row in current['rows']:
    new = []
    for w in row['wholeDirectSourceWitnesses']:
        sid = w['wholeCurrentSourceGoal']['id']
        mpath, m, x, g = by_sid[sid]
        match = next((z for z in m['mappings'] if z['legacyGoalId'] == sid and z['canonicalGoalId'].split(':')[-1] == row['goalId']), None)
        if match is None:
            assert any(s == sid and goal == row['goalId'] for s, goal, _ in removals)
            continue
        passage = next((q for q in x.get('passages', []) if q['id'] == g.get('passageId')), {})
        w.update(wholeCurrentSourceGoal=g, wholeCurrentMappingRecord=match, wholeCurrentSourceDecisions=[q for q in m['decisions'] if q['sourceGoalId'] == sid], mapping=ref(mpath), extraction=ref(m['sourceExtractionPath']), actualCurrentPassage=passage)
        locator = match.get('actualPrimaryLocator', g['actualPrimaryLocator'])
        w['actualReadOperatorPrimaryBinding'] = ref(locator['actualPrimaryPath'])
        w['targetSpecificActualPrimaryLocator'] = copy.deepcopy(locator)
        new.append(w)
    row['wholeDirectSourceWitnesses'] = new
    row['directWitnessCount'] = len(new)
current.update(role='Neutral AUTHOR successor: 182 whole direct witnesses, four unsupported pairs removed; actual HH24 scope and HB actual operators; independent review pending', originalWitnessCount=186, currentDirectWitnessCount=sum(r['directWitnessCount'] for r in current['rows']), removedUnsupportedTargetedPairs=[{'sourceGoalId': sid, 'canonicalGoalId': goal} for sid, goal, _ in removals])
assert current['currentDirectWitnessCount'] == 182
current['whole31PairBindings'] = [{'mapping': ref(p), 'extraction': ref(read(p)['sourceExtractionPath']), 'jurisdiction': read(read(p)['sourceExtractionPath'])['jurisdiction']} for p in maps]
put('sources/current182-whole-direct-witnesses-and-actual-primaries.neutral.json', current)
cfg = copy.deepcopy(config)
cfg['mappingPaths'] = maps
base = 'app/scripts/config/goal-books/inactive/health-twelve-targeted-source-successor-20261010-v1'
cfg.update(outputDirectory=base+'/source-views', manifestPath=base+'/atlas.sources.json', navigationViewPath=base+'/navigation.view.json',
           landscapePath=read(V2/'native/current394-two-targeted.normal.config.json')['landscapePath'], semanticKindLedgerPath=read(V2/'native/current394-two-targeted.normal.config.json')['semanticKindLedgerPath'])
put('sources/after394-atlas.targeted-source.normal.config.json', cfg)
put('inputs/source-only-scope-and-carried-current-contexts.json', {'schemaVersion': 1, 'wholeCurrentCanonical': ref(cfg['landscapePath']), 'wholeCurrentKinds': ref(cfg['semanticKindLedgerPath']), 'wholeCurrentBeforeModel': ref(V2/'native/current394-two-targeted.actual-normal-model.json'), 'protected353Ids': ref(H/'inputs/current353-protected.ids.json'), 'descriptionsPrerequisitesProfilesCasesPngAndVisualMetadataChanged': False, 'sourceOnlyCorrection': True, 'activeWrites': [], 'strictGain': 0, 'humanApproved': 0})
print(json.dumps({'wholeMappingPairs': len(maps), 'wholeChangedPairs': len(changed), 'removedPairs': len(removed), 'HHPartialScopes': len(hh_scopes), 'HBActualOperatorAnnotations': len(source_fidelity), 'currentDirectWitnesses': 182, 'strictGain': 0, 'activeWrites': 0}))
