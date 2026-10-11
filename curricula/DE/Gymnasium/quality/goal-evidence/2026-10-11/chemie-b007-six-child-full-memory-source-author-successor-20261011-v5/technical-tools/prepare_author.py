#!/usr/bin/env python3
"""Create bounded inactive B007 v5 author inputs; never mint review decisions."""
import copy
import hashlib
import importlib.util
import json
import os
from pathlib import Path
import shutil
import subprocess
import sys
from datetime import datetime, timezone

ROOT = Path.cwd()
OUT = Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-11/chemie-b007-six-child-full-memory-source-author-successor-20261011-v5')
SCRATCH = Path('tmp/m7-resumption-20261011/b007-v5-author')
V1 = Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/chemie-b007-two-current206-targeted-author-successor-20261010-v1')
V3 = Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-11/chemie-b007-six-image-current-native-technical-author-successor-20261011-v3')
V4 = Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-11/chemie-b007-six-child-regional-source-projection-author-successor-20261011-v4')
MEMORY_CONFIG = Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/chemie-b008-current517-source7-normal37-D27-P2-reviewed-inactive-integration-j-technical-20261010-v1/future-active-configs/memory398.future-active.config.json')
BASICS = Path('curricula/DE/Gymnasium/memory-decks/de_gymnasium_chemistry_flashcards_basics_seki.de.json')
PARENTS = {'53fd1bfd-facb-54ae-b2dc-f667ed1414fc', '7be6f951-a614-52dc-94d3-2ce0d33765ff'}
PROTECTED = ['018bec90-445f-4a88-b8bc-228f8335dee6','5338b54c-68bc-5892-907c-e025351ffde6','5abc5961-6368-52bb-88b9-6a846c3c37a8','5dd180f1-f1c8-5f76-9c9a-ea3fc3d921bf','78109f6d-c415-52c4-8314-07c0dd888a80','988888bb-1f88-55f9-9a44-f3f60469a297','d2ccd1d5-56f7-583f-9724-e97441367f91','ebaae4f5-cc13-5493-98b1-10e1abeb638f']
STAMP = datetime.now(timezone.utc).isoformat()

def load(path):
    return json.loads(Path(path).read_text())

def write(path, obj):
    path = Path(path); path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(obj, ensure_ascii=False, indent=2) + '\n')
    assert load(path) == obj

def binding(path):
    path = Path(path); b = path.read_bytes()
    assert path.is_file() and not path.is_symlink()
    return {'path': path.as_posix(), 'bytes': len(b), 'sha256': hashlib.sha256(b).hexdigest()}

def exact(src, dest):
    src, dest = Path(src), Path(dest); dest.parent.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(src, dest)
    assert dest.read_bytes() == src.read_bytes()
    return binding(dest)

def rebase(obj, old, new):
    if isinstance(obj, dict): return {k: rebase(v, old, new) for k,v in obj.items()}
    if isinstance(obj, list): return [rebase(v, old, new) for v in obj]
    if isinstance(obj, str) and obj.startswith(old + '/'): return new + obj[len(old):]
    return obj

assert subprocess.check_output(['git','rev-parse','HEAD'],text=True).strip() == '5344554de0cb8243fbca26275978cb5396e1ded9'
assert not OUT.exists() or '--resume-unsealed' in sys.argv, 'Do not overwrite an existing successor.'
assert not (OUT/'FINAL.author-package.freeze.json').exists(), 'A sealed successor is immutable.'
OUT.mkdir(parents=True, exist_ok=True)
spec = importlib.util.spec_from_file_location('normal_curriculum_compiler', ROOT/'scripts/compile_curriculum_release_model.py')
compiler = importlib.util.module_from_spec(spec); sys.modules[spec.name] = compiler; spec.loader.exec_module(compiler)

# Author intent is separate from the genuine existing operative ledger rows.
old_memory = load(MEMORY_CONFIG)
goal_lines = Path(old_memory['reviewPath']).read_bytes().splitlines(keepends=True)
card_bytes = Path(old_memory['cardReviewPath']).read_bytes()
assert len(goal_lines) == 398 and len(card_bytes.splitlines()) == 73
kept = [line for line in goal_lines if json.loads(line)['goalId'] not in PARENTS]
former = [line for line in goal_lines if json.loads(line)['goalId'] in PARENTS]
assert len(kept) == 396 and len(former) == 2
for name, b in [('current396-retained-reviewed.exact.jsonl', b''.join(kept)), ('former-two-now-clusters.historical.exact.jsonl', b''.join(former)), ('current73-retained-cards-reviewed.exact.jsonl', card_bytes)]:
    p = OUT/'memory'/name; p.parent.mkdir(parents=True, exist_ok=True); p.write_bytes(b)
    [json.loads(line) for line in p.read_text().splitlines()]

original_cards = load(V1/'materials/two-whole-primary-cards.de-en.unchanged.json')
cards = copy.deepcopy(original_cards)
cards['createdAtUTC'] = STAMP
cards['kind'] = 'Inactive bilingual author card material: bound IDs and common-pressure correction; scientific review pending'
cards['inputBindings'] = [binding(V1/'materials/two-whole-primary-cards.de-en.unchanged.json')]
old_volume = original_cards['cards'][1]['back']
assert 'bei gleicher Temperatur vor dem Mischen bestimmten' in cards['cards'][1]['back']['de']
assert 'before mixing at the same temperature.' in cards['cards'][1]['back']['en']
cards['cards'][1]['back']['de'] = old_volume['de'].replace('bei gleicher Temperatur vor dem Mischen bestimmten','bei gleicher Temperatur und gleichem Druck vor dem Mischen bestimmten')
cards['cards'][1]['back']['en'] = old_volume['en'].replace('before mixing at the same temperature.','before mixing at the same temperature and pressure.')
assert cards['cards'][0]['front'] == original_cards['cards'][0]['front'] and cards['cards'][0]['back'] == original_cards['cards'][0]['back']
old_intents = load(V1/'materials/six-individual-memory-decisions-and-two-card-bindings.author.json')
intents = copy.deepcopy(old_intents)
intents['createdAtUTC'] = STAMP
intents['role'] = 'Six individual AUTHOR INTENTS only; no reviewed Memory decision has been added'
intents['sourceAuthorIntent'] = binding(V1/'materials/six-individual-memory-decisions-and-two-card-bindings.author.json')
intents['independentReviewStatus'] = 'pending'
new_ids = [row['candidateGoalId'] for row in intents['routineDecisions']]
assert len(new_ids) == 6
for i, card in enumerate(cards['cards']):
    intent = intents['routineDecisions'][4+i]
    binder = intent['cardBindingIntents'][0]
    card.update(cardId=binder['candidateCardId'], originGoalId=intent['candidateGoalId'], deckId=binder['candidateDeckId'], memoryGoalIds=binder['candidateMemoryGoalIds'], actualGoalBindingRequired=False)
    card['verifiedPrimaryDefinitionFacts'] = (OUT/'primary/primary-definition-verification.actual.json').as_posix()
write(OUT/'materials/two-whole-primary-cards.de-en.author-v5.json', cards)
for row in intents['routineDecisions']:
    for binder in row['cardBindingIntents']:
        card = next(c for c in cards['cards'] if c['cardLocalKey'] == binder['cardLocalKey'])
        binder['materialFileBinding'] = binding(OUT/'materials/two-whole-primary-cards.de-en.author-v5.json')
        binder['originalCardBodyUnchanged'] = binder['cardLocalKey'] == 'mass_fraction_definition'
        binder['wholeCardValueSha256'] = hashlib.sha256(json.dumps(card,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode()).hexdigest()
        binder['nativeMemoryCardApproval'] = False
write(OUT/'memory/six-individual-memory-decisions-and-two-card-bindings.AUTHOR-INTENT.json', intents)

base_deck = load(BASICS)
deck = copy.deepcopy(base_deck)
assert len(deck['cards']) == 13
for card in cards['cards']:
    deck['cards'].append({'id': card['cardId'], 'front': card['front']['de'], 'back': card['back']['de'], 'category': 'Chemie Sek I - Sicherheit, Symbole und Stoffmenge', 'tags': ['GK','LK', 'goal:' + card['originGoalId']]})
assert deck['cards'][:13] == base_deck['cards'] and len(deck['cards']) == 15
assert list(deck) == list(base_deck)
deck_path = OUT/'memory/de_gymnasium_chemistry_flashcards_basics_seki.de.json'
write(deck_path, deck)
write(OUT/'memory/two-card-decisions.AUTHOR-INTENT.json', {'schemaVersion':1,'createdAtUTC':STAMP,'role':'two proposed card decisions; pending genuine scientific/card/visibility review, not operative ledger records','independentReviewStatus':'pending','humanApproval':False,'cards':[{'deckId':deck['deckId'],'cardId':c['cardId'],'originGoalIds':[c['originGoalId']],'memoryGoalIds':c['memoryGoalIds'],'proposedStatus':'kept','proposedNecessary':True,'recordStatus':'ai_candidate','validationStatus':'needs_human_review','scientificApproval':False,'visibilityReviewStatus':'pending','front':c['front'],'back':c['back'],'narrowRecallRationale':c['narrowRecallRationale']} for c in cards['cards']]})

whole_src = V3/'candidate/whole523-with-six-child-images.exact.inactive.json'
whole = load(whole_src)
whole_by_id = {g['id']:g for g in whole['goals']}
memory_node = whole_by_id['1e372b97-6f1c-596c-8a8b-fc03193d784a']
assert memory_node['extendedData']['vocabularySource'] == '/data/de_gymnasium_chemistry_flashcards_basics_seki.de.json'
memory_node['extendedData']['vocabularySource'] = deck_path.as_posix()
assert 'vocabularySourceEn' not in memory_node['extendedData']
whole_path = OUT/'candidate/whole523-six-child-DE15-deck.inactive.json'
write(whole_path, whole)
kind_src = V3/'candidate/semantic-kinds.current523.native-path.inactive.json'
kinds = load(kind_src)
assert kinds['sourceLandscapePath'] == whole_src.as_posix()
kinds['sourceLandscapePath'] = whole_path.as_posix()
kind_path = OUT/'candidate/semantic-kinds.current523.DE15-deck.inactive.json'
write(kind_path,kinds)
cfg = copy.deepcopy(old_memory)
cfg.update(landscapePath=whole_path.as_posix(),reviewPath=(OUT/'memory/current396-retained-reviewed.exact.jsonl').as_posix(),cardReviewPath=(OUT/'memory/current73-retained-cards-reviewed.exact.jsonl').as_posix(),reportPath=(OUT/'checks/full-memory-review.actual-pending.report.md').as_posix())
write(OUT/'candidate/full-memory-review.actual-pending.config.json',cfg)

# Compile the 48 regular carriers with the existing compiler's normal adapter.
source_manifest = load(V4/'candidate/source-atlas.portable-authored.sources.json')
rows=[]; replacements={}
for source_path in source_manifest['sourcePaths']:
    val = load(source_path); compiled = copy.deepcopy(val)
    compiled['$schema']=compiler.SCHEMA_IDS['composition-view']
    compiled['viewFormatVersion']='1.0'; compiled['language']='de-DE'
    compiler.validate_schema(compiled,'composition-view',source_path)
    dest=OUT/'candidate/source-views'/Path(source_path).name
    write(dest,compiled); replacements[source_path]=dest.as_posix()
    changed=[k for k in set(val)|set(compiled) if val.get(k)!=compiled.get(k)]
    assert changed in [[],['$schema']], changed
    rows.append({'source':binding(source_path),'carrier':binding(dest),'changedFields':changed,'schemaStatus':'PASS','sourceScienceApproval':False})
assert len(rows)==48 and sum(bool(x['changedFields']) for x in rows)==47
exact(V4/'candidate/navigation.current-source-union.view.json',OUT/'candidate/navigation.current-source-union.view.json')
source_manifest['manifestId']='b007-v5-inactive-source-atlas'
source_manifest['sourcePaths']=[replacements[x] for x in source_manifest['sourcePaths']]
source_manifest['navigationViewPath']=(OUT/'candidate/navigation.current-source-union.view.json').as_posix()
write(OUT/'candidate/source-atlas.closed-carriers.sources.json',source_manifest)
write(OUT/'checks/48-closed-carriers.normal-compiler-adapter.actual.json',{'role':'technical carrier export only; source judgments remain pending','adapter':'scripts/compile_curriculum_release_model.py:3081-3086','rows':rows,'total':48,'schemaOnlyChanges':47,'unchanged':1,'scientificApprovalsAdded':0})

# Preserve bounded source recipe and debt; point only new candidate recipes at v5.
inputs=load(V4/'candidate/source-atlas.normal-helper.inactive.inputs.json')
inputs.update(landscapePath=whole_path.as_posix(),semanticKindLedgerPath=kind_path.as_posix(),outputDirectory=(OUT/'candidate/normal-derived-source-views').as_posix(),manifestPath=(OUT/'candidate/normal-derived.sources.json').as_posix(),navigationViewPath=(OUT/'candidate/normal-derived-navigation.view.json').as_posix(),navigationViewId='b007-v5-inactive-source-atlas')
write(OUT/'candidate/source-atlas.normal-helper.inactive.inputs.json',inputs)
for srcname,destname in [('native-current-source-atlas382.inactive.config.json','native-current-source-atlas382.closed-carriers.inactive.config.json'),('native-current-whole402-protected.inactive.config.json','native-current-whole402.inactive.config.json')]:
    c=load(V4/'candidate'/srcname)
    c['landscapePath']=whole_path.as_posix();c['semanticKindLedgerPath']=kind_path.as_posix()
    if c.get('compositionViewManifestPath'):c['compositionViewManifestPath']=(OUT/'candidate/source-atlas.closed-carriers.sources.json').as_posix()
    c['outputPath']=(OUT/'native'/('source382.normal.book-model.json' if 'source-atlas382' in srcname else 'whole402.normal.book-model.json')).as_posix()
    write(OUT/'candidate'/destname,c)

exact(V3/'materials/twelve-whole-cases.de-en.exact.json',OUT/'review-inputs/twelve-whole-cases.de-en.exact.json')
exact(V3/'materials/six-positive-evidence-v2.current-images.author.jsonl',OUT/'review-inputs/six-P.author.exact.jsonl')
exact(V3/'materials/six-positive-evidence-v2.current-images.candidates.author.json',OUT/'review-inputs/six-P.candidates.author.exact.json')
exact(SCRATCH.parent/'b007-formula-primary-readonly/primary-definition-verification.json',OUT/'primary/primary-definition-verification.actual.json')
exact(SCRATCH.parent/'b007-formula-primary-readonly/primary-definition-verification.md',OUT/'primary/primary-definition-verification.actual.md')
exact(SCRATCH.parent/'b007-formula-primary-readonly/route-proof/normal-full-scope-implementation-route-proof.json',OUT/'checks/prior-normal-full-route-proof.exact.json')
assessment=load(SCRATCH.parent/'chem-b007-memory-source-nextstep-readonly/actual-technical-memory-visibility-and-closed-carrier-route.json')
write(OUT/'review-inputs/source-debt.current-and-v4.exact-facts.json',{'role':'existing unchanged source debt; not source science acceptance','sourceAssessment':binding(SCRATCH.parent/'chem-b007-memory-source-nextstep-readonly/actual-technical-memory-visibility-and-closed-carrier-route.json'),'sourceAtlasComparison':assessment['sourceAtlasComparison'],'independentSourceReviewStatus':'pending'})

# Raw reviewer input contains whole objects/cases, not peer or author verdicts.
context=load(V3/'native/current-whole-normal-selected-pages-and-protected-contexts.author.json')
write(OUT/'review-inputs/raw-whole-six-and-eight-protected-goals.neutral.json', {'schemaVersion':1,'role':'whole exact current candidate goals and actual active counterparts; neutral input only','sourceWhole':binding(whole_path),'selectedGoalIds':new_ids,'protectedGoalIds':PROTECTED,'selectedGoals':[whole_by_id[x] for x in new_ids],'protectedCandidateGoals':[whole_by_id[x] for x in PROTECTED],'protectedActiveGoals':[g for g in load('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json')['goals'] if g['id'] in PROTECTED],'parents':[whole_by_id[x] for x in sorted(PARENTS)],'memorySupportGoal':memory_node})
write(OUT/'review-inputs/raw-fourteen-native-whole-pages.neutral.json',{'schemaVersion':1,'role':'exact normal native page objects selected from sealed v3 full402 rebuild; no review verdict','source':binding(V3/'native/current-whole-normal-selected-pages-and-protected-contexts.author.json'),'selectedPages':context['sixCurrentImagePages'],'protectedPages':[{'goalId':x['goalId'],'currentWholeNormalNativePage':x['currentWholeNormalNativePage']} for x in context['eightProtectedContexts']]})
for name in ['raw-HE-8.1-source-goals.neutral.json','raw-current-parent-source-goals-and-mapping-rows.neutral.json','raw-current-whole-goals-selected.neutral.json','raw-forty-original-affected-source-views.neutral.json','RAW.primary-documents.neutral.annex.json']:
    exact(V4/'review-inputs'/name, OUT/'review-inputs'/name)

# Scratch execution overlay: real byte-exact public images, no active publication writes.
capsule=SCRATCH/'capsule'
capsule.mkdir(exist_ok=True)
for name in ['curricula','contracts','docs']:
    if not (capsule/name).exists(): os.symlink(os.path.relpath(ROOT/name,ROOT/capsule),capsule/name)
image_root=capsule/'app/public/assets/goal-visualizations'
image_root.mkdir(parents=True,exist_ok=True)
qa=load(V3/'candidate/visualization-qa-current-whole-plus-six-unapproved.inactive.json')
def find_asset_paths(obj):
    if isinstance(obj,dict):
        for k,v in obj.items():
            if k in ['assetPath','path'] and isinstance(v,str) and v.startswith('app/public/assets/goal-visualizations/'):yield v
            yield from find_asset_paths(v)
    elif isinstance(obj,list):
        for v in obj:yield from find_asset_paths(v)
paths=sorted({row['publicAssetPath'] for row in qa['records'] if row['visualizationState']=='available'})
assert len(paths)>350, len(paths)
for p in paths:
    src=ROOT/p
    if not src.exists():
        gid=Path(p).parent.name
        src=ROOT/'curricula/DE/Gymnasium/quality/goal-visualization-review/chemie-b007-six-child-images-targeted-author-20261010-v1/images'/gid/Path(p).name
    assert src.exists(),str(src)
    dest=ROOT/capsule/p;dest.parent.mkdir(parents=True,exist_ok=True)
    if not dest.exists(): os.link(src,dest)

write(OUT/'neutral-v5-author.entry.json',{'schemaVersion':1,'createdAtUTC':STAMP,'role':'inactive B007 full-memory/source author successor, current402; independent judgments pending','wholeCandidate':binding(whole_path),'newGoalIds':new_ids,'protectedContextGoalIds':PROTECTED,'wholeGoals':523,'curricularAtomicIntent':402,'sourceAtlasAtoms':382,'omittedSourceAtoms':20,'unresolvedSourceRows':496,'retainedReviewedMemoryLines':396,'retainedReviewedCardLines':73,'newMemoryJudgments':0,'newCardJudgments':0,'basicsDeckCards':15,'authorIntentOnly':True,'independentScienceReviewStatus':'pending','humanApproval':False,'humanTrial':False,'activeWrites':False,'strictGain':0,'nextReviewBoundary':'Fresh independent current six-goal D/P/A/M/source/card and eight protected-context judgments; reuse exact six prior genuine V tuples separately.'})
write(SCRATCH/'preparation-completed.actual.json',{'output':OUT.as_posix(),'capsule':capsule.as_posix(),'assetBindings':len(paths),'retainedMemoryLines':396,'retainedCards':73,'normalCheckPending':True,'activeWrites':False})
print(json.dumps({'output':OUT.as_posix(),'regularClosedCarriers':48,'retainedM':396,'retainedCardLines':73,'basicsDE15':15,'newReviewedJudgments':0,'assetBindings':len(paths)},ensure_ascii=False))
