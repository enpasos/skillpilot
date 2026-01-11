#!/usr/bin/env python3
"""
Creates the MBA landscape JSON from the module list in input/DE_BAY_U_TUM_xyz.txt.
"""
import json
import re
import uuid
from pathlib import Path

SKILLPILOT_NAMESPACE = uuid.uuid5(uuid.NAMESPACE_DNS, "skillpilot.io")

def generate_deterministic_uuid(namespace_str: str, name: str) -> str:
    return str(uuid.uuid5(SKILLPILOT_NAMESPACE, f"{namespace_str}/{name}"))


def slugify(text: str) -> str:
    slug = text.lower()
    slug = re.sub(r"[^a-z0-9]+", "_", slug)
    return slug.strip('_') or "cluster"


def parse_cluster_name(name: str):
    if '|' in name:
        left, right = [part.strip() for part in name.split('|', 1)]
        return right, left

    lowered = name.lower()
    if lowered == 'auslandsaufenthalt':
        return name, 'International Experience'
    if lowered in ("master's thesis", 'masters thesis'):
        return 'Masterarbeit', "Master's Thesis"

    return name, name


def main():
    base_dir = Path('curricula/DE/BY/TUM/MBA')
    input_file = base_dir / 'input' / 'DE_BAY_U_TUM_xyz.txt'
    json_dir = base_dir / 'json'
    output_file = json_dir / 'DE_BAY_U_TUM_MBA.de.json'

    json_dir.mkdir(exist_ok=True, parents=True)

    lines = input_file.read_text(encoding='utf-8').splitlines()

    clusters = []
    current_cluster = None

    for line in lines:
        line_stripped = line.strip()
        if not line_stripped:
            continue
        if line_stripped.startswith('$m'):
            continue
        if 'http' in line_stripped:
            continue

        if line_stripped.startswith('#'):
            cluster_name = line_stripped.lstrip('#').strip()
            current_cluster = {'name': cluster_name, 'modules': []}
            clusters.append(current_cluster)
            continue

        parts = line_stripped.split('\t')
        if len(parts) >= 2:
            code = parts[0].strip()
            if not re.search(r'\d', code):
                continue
            current_cluster = current_cluster or {'name': 'Module', 'modules': []}
            if current_cluster not in clusters:
                clusters.append(current_cluster)
            current_cluster['modules'].append({'code': code})

    root_id = generate_deterministic_uuid('tum-landscape', 'mba')

    landscape = {
        'title': 'Executive Master of Business Administration (DE, BY, TU M\u00fcnchen)',
        'titleEn': 'Executive Master of Business Administration (DE, BY, TU Munich)',
        'description': 'Curriculum des Executive MBA an der TU M\u00fcnchen.',
        'descriptionEn': 'Curriculum of the Executive MBA at TU Munich.',
        'landscapeId': root_id,
        'locale': 'de-DE',
        'subject': 'Business Administration',
        'frameworkId': 'tum-mba',
        'filters': [
            {'id': 'MBA', 'label': 'Executive MBA'}
        ],
        'goals': []
    }

    root_goal = {
        'id': root_id,
        'shortKey': 'tum_mba',
        'title': 'Executive MBA',
        'titleEn': 'Executive MBA',
        'description': 'Gesamtkompetenz des Executive Master of Business Administration.',
        'descriptionEn': 'Overall competence of the Executive Master of Business Administration.',
        'core': True,
        'weight': 10,
        'phase': 'Curriculum',
        'area': 'Gesamtkompetenz',
        'tags': ['ects:130', 'level:master'],
        'contains': [],
        'requires': []
    }

    goals = [root_goal]

    for idx, cluster in enumerate(clusters):
        title_de, title_en = parse_cluster_name(cluster['name'])
        cluster_id = generate_deterministic_uuid('tum-cluster', f"mba_{slugify(cluster['name'])}")
        root_goal['contains'].append(cluster_id)

        lowered = cluster['name'].lower()
        is_elective = 'wahl' in lowered or 'elective' in lowered
        is_core = not is_elective

        cluster_goal = {
            'id': cluster_id,
            'shortKey': f"tum_mba_c{idx+1}",
            'title': title_de,
            'titleEn': title_en,
            'description': f"Bereich: {title_de}",
            'descriptionEn': f"Area: {title_en}",
            'core': is_core,
            'weight': 5 if is_core else 3,
            'phase': 'Bereich',
            'area': 'Struktur',
            'contains': [],
            'requires': []
        }

        for mod in cluster.get('modules', []):
            mod_id = generate_deterministic_uuid('tum-module', mod['code'])
            cluster_goal['contains'].append(mod_id)

        goals.append(cluster_goal)

    landscape['goals'] = goals

    output_file.write_text(json.dumps(landscape, ensure_ascii=False, indent=4) + '\n', encoding='utf-8')
    print(f"Created MBA landscape at {output_file}")


if __name__ == '__main__':
    main()
