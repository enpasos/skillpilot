#!/usr/bin/env python3
import json
import re
import time
import uuid
from pathlib import Path
from urllib.parse import urlencode
from urllib.request import urlopen

BASE = Path(__file__).resolve().parents[1]
RAW_DIR = BASE / 'curricula/DE/BY/TUM/Informatics/BSc_Informatics/input/raw'
RAWGRAPH_DIR = BASE / 'curricula/DE/BY/TUM/Informatics/BSc_Informatics/input/rawgraph'
JSON_DIR = BASE / 'curricula/DE/BY/TUM/Informatics/BSc_Informatics/json'
CACHE_PATH = BASE / 'tmp/informatics_translation_cache.json'

SKILLPILOT_NAMESPACE = uuid.uuid5(uuid.NAMESPACE_DNS, 'skillpilot.io')


def generate_deterministic_uuid(namespace_str: str, name: str) -> str:
    return str(uuid.uuid5(SKILLPILOT_NAMESPACE, f"{namespace_str}/{name}"))


def slugify(text: str) -> str:
    slug = text.lower()
    slug = slug.replace('&', 'and')
    slug = re.sub(r"[^a-z0-9]+", "_", slug)
    slug = slug.strip('_')
    return slug


def parse_raw_meta(code: str):
    path = RAW_DIR / f'DE_BAY_U_TUM_{code}.txt'
    data = {
        'code': code,
        'title': '',
        'title_en': '',
        'ects': '',
    }
    for line in path.read_text(encoding='utf-8').splitlines():
        if line.startswith('title: '):
            data['title'] = line.replace('title: ', '', 1).strip()
        elif line.startswith('title_en: '):
            data['title_en'] = line.replace('title_en: ', '', 1).strip()
        elif line.startswith('ects: '):
            data['ects'] = line.replace('ects: ', '', 1).strip()
    if not data['title_en']:
        data['title_en'] = data['title']
    return data


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

    # Build parent-child relationships using a stack
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

        # Chunk by approximate URL length.
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
        # Fallback to single translation if missing.
        self.prefetch([text_norm])
        return self.cache.get(key, text_norm)

    def translate_description(self, text: str) -> str:
        translated = self.translate_en_to_de(text)
        for prefix in (
            'Der Lernende kann ',
            'Die Lernende kann ',
            'Der/die Lernende kann ',
            'Der oder die Lernende kann ',
            'Die Lernenden können ',
        ):
            if translated.startswith(prefix):
                remainder = translated[len(prefix):]
                return f"Die lernende Person kann {remainder}"
        return translated

    def persist(self):
        self.cache_path.write_text(json.dumps(self.cache, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')


REQUIRES_BY_TITLE = {
    'IN0001': {
        'Syntax and semantics of programs': ['Computing concepts and imperative programming'],
        'Elementary data structures and algorithms': ['Computing concepts and imperative programming'],
        'Recursion and search': ['Elementary data structures and algorithms'],
        'Object-oriented programming': ['Elementary data structures and algorithms'],
        'Programming in the large and concurrency': ['Object-oriented programming'],
    },
    'IN0002': {
        'Core data structures and recursion': ['Programming practice in Java'],
        'Object-oriented programming practice': ['Programming practice in Java'],
        'Concurrency in practice': ['Programming practice in Java'],
    },
    'IN0003': {
        'Higher-order and polymorphic programming': ['Functional programming foundations'],
        'Semantics and verification of functional programs': ['Functional programming foundations'],
    },
    'IN0004': {
        'Instruction set architecture and assembly': ['Computer system organization'],
        'Microprogramming and control': ['Instruction set architecture and assembly'],
        'Processor and system architectures': ['Computer system organization'],
    },
    'IN0005': {
        'Compiler and ABI considerations': ['Systems programming in C'],
        'Parallelism and SIMD': ['Systems programming in C'],
        'Hardware-aware optimization projects': ['Performance analysis and measurement'],
    },
    'IN0006': {
        'Requirements and architecture': ['Foundations and cloud context'],
        'System design and data management': ['Requirements and architecture'],
        'Performance, concurrency, scalability': ['System design and data management'],
        'Security, reliability, availability': ['System design and data management'],
        'Testing and analysis': ['System design and data management'],
        'DevOps and operations': ['Foundations and cloud context'],
        'Quality assurance and project management': ['Foundations and cloud context'],
    },
    'IN0007': {
        'Hashing': ['Sequence data structures'],
        'Sorting and selection': ['Sequence data structures'],
        'Priority queues and heaps': ['Sequence data structures'],
        'Search trees': ['Sequence data structures'],
        'Graph algorithms': ['Sequence data structures'],
    },
    'IN0008': {
        'Database design': ['Relational model and SQL'],
        'Physical storage and indexing': ['Database design'],
        'Query processing and optimization': ['Relational model and SQL'],
        'Transactions and recovery': ['Relational model and SQL'],
        'Security and authorization': ['Relational model and SQL'],
    },
    'IN0009': {
        'Processes and concurrency': ['Operating system fundamentals'],
        'Memory and resource management': ['Operating system fundamentals'],
        'System programming and I/O': ['Operating system fundamentals'],
        'System software toolchain': ['System programming and I/O'],
        'Formal models for concurrency': ['Processes and concurrency'],
    },
    'IN0010': {
        'Cross-layer concepts': ['Network overview and architecture'],
        'Application layer protocols': ['Network overview and architecture'],
        'Transport layer': ['Cross-layer concepts'],
        'Network layer and routing': ['Cross-layer concepts'],
        'Link and physical layers': ['Network overview and architecture'],
        'Distributed systems': ['Network overview and architecture'],
        'Network management and security': ['Network overview and architecture'],
        'Performance analysis and protocol implementation': ['Cross-layer concepts'],
    },
    'IN0011': {
        'Context-free languages': ['Regular languages and automata'],
        'Context-sensitive languages': ['Context-free languages'],
        'Computability theory': ['Regular languages and automata'],
        'Undecidability results': ['Computability theory'],
        'Complexity theory': ['Computability theory'],
    },
    'IN0012': {
        'Engineering methods and models': ['Project planning and teamwork'],
        'Implementation and evaluation': ['Engineering methods and models'],
        'Risk management': ['Project planning and teamwork'],
        'Documentation and presentation': ['Project planning and teamwork'],
        'Domain-specific application': ['Implementation and evaluation'],
    },
    'IN0014': {
        'Literature research and writing': ['Topic selection and scoping'],
        'Scientific methods and critical evaluation': ['Topic selection and scoping'],
        'Presentation and discussion': ['Literature research and writing'],
    },
    'IN0015': {
        'Propositional and first-order logic': ['Sets, relations, and functions'],
        'Combinatorics': ['Sets, relations, and functions'],
        'Graph theory': ['Sets, relations, and functions'],
        'Algebra and number theory': ['Sets, relations, and functions'],
    },
    'IN0018': {
        'Discrete random variables': ['Probability spaces and events'],
        'Inequalities and limit theorems': ['Discrete random variables'],
        'Generating functions': ['Discrete random variables'],
        'Continuous probability': ['Probability spaces and events'],
        'Multivariate distributions and CLT': ['Continuous probability'],
        'Inductive statistics': ['Discrete random variables'],
        'Stochastic processes': ['Probability spaces and events'],
    },
    'IN0019': {
        'Interpolation and approximation': ['Floating point and error analysis'],
        'Numerical integration': ['Interpolation and approximation'],
        'Linear systems and least squares': ['Floating point and error analysis'],
        'Ordinary differential equations': ['Numerical integration'],
        'Iterative methods and nonlinear equations': ['Linear systems and least squares'],
        'Eigenvalue problems': ['Linear systems and least squares'],
    },
    'IN0042': {
        'Applied cryptography': ['Security foundations'],
        'Authentication and access control': ['Security foundations'],
        'System security': ['Security foundations'],
        'Network security': ['Security foundations'],
        'Risk and security management': ['Security foundations'],
    },
    'MA0901': {
        'Linear systems': ['Complex numbers and matrices'],
        'Vector spaces and bases': ['Complex numbers and matrices'],
        'Linear transformations': ['Vector spaces and bases'],
        'Determinants and eigenvalues': ['Linear transformations'],
        'Inner products and symmetric matrices': ['Vector spaces and bases'],
    },
    'MA0902': {
        'Series': ['Real numbers and sequences'],
        'Continuity and functions': ['Real numbers and sequences'],
        'Differential calculus in one variable': ['Continuity and functions'],
        'Integral calculus in one variable': ['Differential calculus in one variable'],
        'Multivariable calculus': ['Differential calculus in one variable'],
        'Differential equations': ['Differential calculus in one variable'],
    },
}


def build_goals(code: str, module_meta, translator: Translator):
    nodes = parse_rawgraph(code)

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
            goal_id = generate_deterministic_uuid("tum-module", code)
        else:
            goal_id = generate_deterministic_uuid(f"tum-{code.lower()}", short_key)
        id_map[short_key] = goal_id

    title_to_short_key = {}
    for idx, node in enumerate(nodes):
        title = node['title_en']
        if title in title_to_short_key:
            raise SystemExit(f"Duplicate node title in {code}: {title}")
        title_to_short_key[title] = short_keys[idx]

    for idx, node in enumerate(nodes):
        short_key = short_keys[idx]
        contains = [id_map[short_keys[child_idx]] for child_idx in node['children']]
        if idx == 0:
            weight = float(module_meta['ects']) if module_meta['ects'] else 1.0
            area = 'Gesamtkompetenz'
            title_de = f"{module_meta['title']} ({code})"
            title_en = f"{module_meta['title_en']} ({code})"
            desc_en = node['description_en']
            desc_de = translator.translate_description(desc_en)
        else:
            weight = 2.0 if node['children'] else 1.0
            area = 'Kompetenz'
            title_en = node['title_en']
            desc_en = node['description_en']
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

    # Add ECTS tag + sourceRef to root
    if goals:
        root = goals[0]
        if module_meta['ects']:
            root['tags'].append(f"ects:{module_meta['ects']}")
        root['sourceRef'] = f"https://academics.nat.tum.de/org/mh/details/mod/{code}"

    # Apply requires
    requires_map = REQUIRES_BY_TITLE.get(code, {})
    short_key_to_index = {g['shortKey']: i for i, g in enumerate(goals)}
    for title, req_titles in requires_map.items():
        if title not in title_to_short_key:
            raise SystemExit(f"Missing title in requires map ({code}): {title}")
        short_key = title_to_short_key[title]
        if short_key not in short_key_to_index:
            raise SystemExit(f"Missing shortKey in requires map ({code}): {short_key}")
        goal = goals[short_key_to_index[short_key]]
        requires = []
        for req_title in req_titles:
            if req_title not in title_to_short_key:
                raise SystemExit(f"Missing required title in requires map ({code}): {req_title}")
            requires.append(id_map[title_to_short_key[req_title]])
        goal['requires'] = requires

    return goals


def collect_translation_texts(codes):
    title_texts = set()
    desc_texts = set()
    for code in codes:
        nodes = parse_rawgraph(code)
        for idx, node in enumerate(nodes):
            if idx != 0:
                title_texts.add(node['title_en'])
            desc_texts.add(node['description_en'])
    return title_texts, desc_texts


def main():
    JSON_DIR.mkdir(exist_ok=True, parents=True)

    raw_files = sorted(RAW_DIR.glob('DE_BAY_U_TUM_*.txt'))
    codes = [p.stem.replace('DE_BAY_U_TUM_', '') for p in raw_files]

    translator = Translator(CACHE_PATH)

    # Prefetch translations in batches for speed.
    title_texts, desc_texts = collect_translation_texts(codes)
    translator.prefetch(sorted(title_texts))
    translator.prefetch(sorted(desc_texts))

    for raw_file in raw_files:
        code = raw_file.stem.replace('DE_BAY_U_TUM_', '')
        module_meta = parse_raw_meta(code)

        goals = build_goals(code, module_meta, translator)

        root_desc_en = goals[0]['descriptionEn'] if goals else ''
        root_desc_de = goals[0]['description'] if goals else ''

        landscape = {
            'title': f"{module_meta['title']} (TUM, Modul {code})",
            'titleEn': f"{module_meta['title_en']} (TUM, Module {code})",
            'description': root_desc_de,
            'descriptionEn': root_desc_en,
            'locale': 'de-DE',
            'subject': 'TUM-Module',
            'frameworkId': f"tum-{code.lower()}",
            'goals': goals,
        }

        out_path = JSON_DIR / f'DE_BAY_U_TUM_{code}.de.json'
        out_path.write_text(json.dumps(landscape, ensure_ascii=False, indent=4) + '\n', encoding='utf-8')
        print(f"Wrote {out_path}")

    translator.persist()


if __name__ == '__main__':
    main()
