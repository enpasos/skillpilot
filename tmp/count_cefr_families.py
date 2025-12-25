import json
import re
import unicodedata
from pathlib import Path


def slugify(value):
    normalized = unicodedata.normalize('NFKD', value)
    ascii_text = normalized.encode('ascii', 'ignore').decode('ascii')
    ascii_text = ascii_text.lower()
    ascii_text = re.sub(r'[^a-z0-9]+', '_', ascii_text)
    return ascii_text.strip('_')


def extract_families(card):
    tags = card.get('tags') or []
    tagged = {t[len('family:'):] for t in tags if t.startswith('family:')}
    if tagged:
        return tagged
    family_raw = card.get('family', '')
    if family_raw:
        return {slugify(family_raw)}
    return set()


def count_deck(deck_path):
    data = json.loads(deck_path.read_text(encoding='utf-8'))
    cards = data.get('cards', [])
    families = set()
    missing_family = 0
    for card in cards:
        fams = extract_families(card)
        if fams:
            families.update(fams)
        else:
            missing_family += 1
    return len(cards), len(families), missing_family


def infer_language_key(deck_path):
    parts = set(deck_path.parts)
    if 'English_From_German' in parts:
        return 'English_From_German'
    if 'French_From_German' in parts:
        return 'French_From_German'
    return 'Unknown'


def infer_level(deck_path):
    name = deck_path.name.lower()
    match = re.search(r'cefr_([a-c][12])_', name)
    return match.group(1).upper() if match else None


def main():
    base = Path('curricula/EU/CEFR')
    deck_paths = sorted(base.glob('**/*_deck.json'))
    if not deck_paths:
        print('No decks found.')
        return

    targets_path = Path('curricula/EU/CEFR/targets.json')
    targets = {}
    if targets_path.exists():
        targets = json.loads(targets_path.read_text(encoding='utf-8')).get('targets', {})

    totals = {}
    for deck_path in deck_paths:
        cards, families, missing = count_deck(deck_path)
        language_key = infer_language_key(deck_path)
        level = infer_level(deck_path)
        stats = totals.setdefault(language_key, {'cards': 0, 'families': 0, 'missing': 0})
        stats['cards'] += cards
        stats['families'] += families
        stats['missing'] += missing
        rel = deck_path.as_posix()

        target_info = None
        if language_key in targets and level:
            target_info = targets[language_key].get('levels', {}).get(level)
        if target_info:
            target = target_info.get('incrementalFamilies')
            gap = target - families if isinstance(target, (int, float)) else None
            print(f'{rel}: cards={cards} families={families} missing_family={missing} target={target} gap={gap}')
        else:
            print(f'{rel}: cards={cards} families={families} missing_family={missing}')

    print('\nTotals:')
    for language_key, stats in totals.items():
        print(f'{language_key}: cards={stats["cards"]} families={stats["families"]} missing_family={stats["missing"]}')


if __name__ == '__main__':
    main()
