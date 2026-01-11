#!/usr/bin/env python3
import json
import re
import time
import uuid
from pathlib import Path
from urllib.parse import urlencode
from urllib.request import urlopen

BASE = Path(__file__).resolve().parents[1]
RAW_DIR = BASE / 'curricula/DE/BY/TUM/MBA/input/raw'
RAWGRAPH_DIR = BASE / 'curricula/DE/BY/TUM/MBA/input/rawgraph'
JSON_DIR = BASE / 'curricula/DE/BY/TUM/MBA/json'
CACHE_PATH = BASE / 'tmp/mba_translation_cache.json'

SKILLPILOT_NAMESPACE = uuid.uuid5(uuid.NAMESPACE_DNS, 'skillpilot.io')


def generate_deterministic_uuid(namespace_str: str, name: str) -> str:
    return str(uuid.uuid5(SKILLPILOT_NAMESPACE, f"{namespace_str}/{name}"))


def slugify(text: str) -> str:
    slug = text.lower()
    slug = slug.replace('&', 'and')
    slug = re.sub(r"[^a-z0-9]+", "_", slug)
    slug = slug.strip('_')
    return slug or 'node'


def parse_raw_meta(code: str):
    path = RAW_DIR / f'DE_BAY_U_TUM_{code}.txt'
    title = ''
    title_en = ''
    ects = ''
    for line in path.read_text(encoding='utf-8').splitlines():
        if line.startswith('title: '):
            title = line.replace('title: ', '', 1).strip()
        elif line.startswith('title_en: '):
            title_en = line.replace('title_en: ', '', 1).strip()
        elif line.startswith('ects: '):
            ects = line.replace('ects: ', '', 1).strip()
    if not title_en:
        title_en = title
    if not title:
        title = title_en
    return {
        'code': code,
        'title': title,
        'title_en': title_en,
        'ects': ects,
    }


def parse_rawgraph(code: str):
    path = RAWGRAPH_DIR / f'DE_BAY_U_TUM_{code}.txt'
    lines = path.read_text(encoding='utf-8').splitlines()
    nodes = []
    i = 0
    while i < len(lines):
        line = lines[i]
        stripped = line.strip()
        if not stripped or stripped.startswith('#'):
            i += 1
            continue
        if stripped.startswith('Node:'):
            indent = len(line) - len(line.lstrip(' '))
            level = indent // 2
            title = stripped[len('Node:'):].strip()
            desc = ''
            j = i + 1
            while j < len(lines):
                candidate = lines[j].strip()
                if not candidate:
                    j += 1
                    continue
                if candidate.startswith('Description:'):
                    desc = candidate[len('Description:'):].strip()
                    j += 1
                    break
                if candidate.startswith('Node:'):
                    break
                j += 1
            nodes.append({
                'title_en': title,
                'description_en': desc,
                'level': level,
                'children': [],
            })
            i = j
            continue
        i += 1

    # Build parent-child relationships
    stack = []
    for idx, node in enumerate(nodes):
        level = node['level']
        while stack and stack[-1][0] >= level:
            stack.pop()
        if stack:
            parent_idx = stack[-1][1]
            nodes[parent_idx]['children'].append(idx)
        stack.append((level, idx))

    return nodes


class Translator:
    def __init__(self, cache_path: Path):
        self.cache_path = cache_path
        if cache_path.exists():
            self.cache = json.loads(cache_path.read_text(encoding='utf-8'))
        else:
            self.cache = {}

    def _translate_batch(self, texts, source: str, target: str):
        if not texts:
            return {}
        sep = "\n|||\n"
        joined = sep.join(texts)
        params = {
            'client': 'gtx',
            'sl': source,
            'tl': target,
            'dt': 't',
            'q': joined,
        }
        url = f"https://translate.googleapis.com/translate_a/single?{urlencode(params)}"
        with urlopen(url, timeout=30) as resp:
            data = json.loads(resp.read().decode('utf-8'))
        translated = ''.join(chunk[0] for chunk in data[0] if chunk[0])
        parts = translated.split(sep)
        if len(parts) != len(texts):
            parts = translated.split('|||')
        if len(parts) != len(texts):
            raise RuntimeError('Batch translation split mismatch')
        return dict(zip(texts, parts))

    def prefetch(self, texts, source: str = 'en', target: str = 'de'):
        missing = []
        for text in texts:
            text_norm = re.sub(r"\s+", " ", text).strip()
            if not text_norm:
                continue
            key = f"{source}:{target}:{text_norm}"
            if key not in self.cache:
                missing.append(text_norm)

        if not missing:
            return

        batch = []
        batch_len = 0
        for text in missing:
            candidate_len = batch_len + len(text) + 5
            if batch and candidate_len > 3500:
                translations = self._translate_batch(batch, source, target)
                for original, translated in translations.items():
                    key = f"{source}:{target}:{original}"
                    self.cache[key] = translated
                batch = []
                batch_len = 0
                time.sleep(0.2)
            batch.append(text)
            batch_len += len(text) + 5
        if batch:
            translations = self._translate_batch(batch, source, target)
            for original, translated in translations.items():
                key = f"{source}:{target}:{original}"
                self.cache[key] = translated

    def translate_en_to_de(self, text: str) -> str:
        text_norm = re.sub(r"\s+", " ", text).strip()
        key = f"en:de:{text_norm}"
        if key in self.cache:
            return self.cache[key]
        self.prefetch([text_norm])
        return self.cache.get(key, text_norm)

    def translate_description(self, text: str) -> str:
        translated = self.translate_en_to_de(text)
        for prefix in (
            'Der Lernende kann ',
            'Die Lernende kann ',
            'Der/die Lernende kann ',
            'Der oder die Lernende kann ',
            'Die Lernenden konnen ',
            'Die Lernenden koennen ',
            'Die Lernenden k\u00f6nnen ',
        ):
            if translated.startswith(prefix):
                remainder = translated[len(prefix):]
                return f"Die lernende Person kann {remainder}"
        return translated

    def persist(self):
        self.cache_path.write_text(json.dumps(self.cache, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')


def build_goals(code: str, module_meta, translator: Translator):
    nodes = parse_rawgraph(code)
    if not nodes:
        raise SystemExit(f"No nodes parsed from rawgraph for {code}.")

    # Assign shortKeys deterministically
    used_keys = set()
    short_keys = []
    for idx, node in enumerate(nodes):
        if idx == 0:
            short_key = f"tum_{code.lower()}_module"
        else:
            base = slugify(node['title_en'])
            short_key = f"tum_{code.lower()}_{base}"
            if short_key in used_keys:
                suffix = 2
                while f"{short_key}_{suffix}" in used_keys:
                    suffix += 1
                short_key = f"{short_key}_{suffix}"
        used_keys.add(short_key)
        short_keys.append(short_key)

    goals = []
    id_map = {}
    for idx, node in enumerate(nodes):
        short_key = short_keys[idx]
        if idx == 0:
            goal_id = generate_deterministic_uuid('tum-module', code)
        else:
            goal_id = generate_deterministic_uuid(f"tum-{code.lower()}", short_key)
        id_map[short_key] = goal_id

    for idx, node in enumerate(nodes):
        short_key = short_keys[idx]
        contains = [id_map[short_keys[child_idx]] for child_idx in node['children']]
        desc_en = node['description_en']
        if not desc_en:
            desc_en = f"The learner can explain {node['title_en']}."

        if idx == 0:
            weight = float(module_meta['ects']) if module_meta['ects'] else 1.0
            area = 'Gesamtkompetenz'
            title_en = f"{module_meta['title_en']} (Module {code})"
            title_de = f"{translator.translate_en_to_de(module_meta['title_en'])} (Modul {code})"
            desc_de = translator.translate_description(desc_en)
        else:
            weight = 2.0 if node['children'] else 1.0
            area = 'Kompetenz'
            title_en = node['title_en']
            title_de = translator.translate_en_to_de(title_en)
            desc_de = translator.translate_description(desc_en)

        goals.append({
            'id': id_map[short_key],
            'shortKey': short_key,
            'title': title_de,
            'titleEn': title_en,
            'description': desc_de,
            'descriptionEn': desc_en,
            'core': True,
            'weight': weight,
            'phase': 'Modul',
            'area': area,
            'tags': [f"module:{code}"],
            'contains': contains,
            'requires': [],
        })

    if goals:
        root = goals[0]
        if module_meta['ects']:
            root['tags'].append(f"ects:{module_meta['ects']}")
        root['sourceRef'] = f"https://academics.nat.tum.de/org/mh/details/mod/{code}"

    # Minimal requires: learning outcomes depend on core topics.
    title_index = {g.get('titleEn', '').strip().lower(): g for g in goals}
    core_topics = title_index.get('core topics')
    learning_outcomes = title_index.get('learning outcomes')
    if core_topics and learning_outcomes:
        requires = learning_outcomes.get('requires', [])
        if core_topics['id'] not in requires:
            learning_outcomes['requires'] = requires + [core_topics['id']]

    return goals


def main():
    if not RAWGRAPH_DIR.exists():
        raise SystemExit(f"Missing rawgraph dir: {RAWGRAPH_DIR}")

    JSON_DIR.mkdir(parents=True, exist_ok=True)

    translator = Translator(CACHE_PATH)

    codes = [path.stem.replace('DE_BAY_U_TUM_', '') for path in RAWGRAPH_DIR.glob('DE_BAY_U_TUM_*.txt')]
    codes.sort()

    # Prefetch translations in batches to reduce API calls.
    texts = []
    for code in codes:
        meta = parse_raw_meta(code)
        nodes = parse_rawgraph(code)
        texts.append(meta['title_en'])
        for node in nodes:
            if node['title_en']:
                texts.append(node['title_en'])
            if node['description_en']:
                texts.append(node['description_en'])
    translator.prefetch(texts)

    for code in codes:
        meta = parse_raw_meta(code)
        goals = build_goals(code, meta, translator)

        module_desc_en = goals[0]['descriptionEn'] if goals else ''
        module_desc_de = goals[0]['description'] if goals else ''

        module_json = {
            'title': f"{translator.translate_en_to_de(meta['title_en'])} (TUM, Modul {code})",
            'titleEn': f"{meta['title_en']} (TUM, Module {code})",
            'description': module_desc_de,
            'descriptionEn': module_desc_en,
            'locale': 'de-DE',
            'subject': 'TUM-Module',
            'frameworkId': f"tum-{code.lower()}",
            'goals': goals,
        }

        output_path = JSON_DIR / f"DE_BAY_U_TUM_{code}.de.json"
        output_path.write_text(json.dumps(module_json, ensure_ascii=False, indent=4) + '\n', encoding='utf-8')
        print(f"[OK] {code}: {len(goals)} goals")

    translator.persist()


if __name__ == '__main__':
    main()
