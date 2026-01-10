import json
from pathlib import Path

BASE = Path('/home/enpasos/projects/skillpilot')
program_path = BASE / 'curricula/DE/BY/TUM/Quantum_Science_and_Technology/MSc_QST/json/DE_BAY_U_TUM_MSC_QST.de.json'
module_codes = [
    'IN2381',
    'IN2388',
    'IN2400',
    'EI76471',
    'NAT3011',
    'NAT3013',
    'NAT5018m',
    'NAT5020m',
    'NAT7011',
    'NAT7030',
]

module_paths = [
    BASE / f'curricula/DE/BY/TUM/Quantum_Science_and_Technology/MSc_QST/json/DE_BAY_U_TUM_{code}.de.json'
    for code in module_codes
]

program = json.loads(program_path.read_text(encoding='utf-8'))
old_goals = program.get('goals', [])

prefixes = tuple(f'tum_{code.lower()}_' for code in module_codes)

def is_target(goal):
    short_key = goal.get('shortKey', '')
    return short_key.startswith(prefixes)

indices = [i for i, g in enumerate(old_goals) if is_target(g)]
filtered = [g for g in old_goals if not is_target(g)]

if indices:
    insert_at = min(indices)
    removed_before = sum(1 for i in indices if i < insert_at)
    insert_at = insert_at - removed_before
else:
    insert_at = len(filtered)

new_goals = []
root_ids = {}
for path in module_paths:
    data = json.loads(path.read_text(encoding='utf-8'))
    goals = data.get('goals', [])
    if goals:
        root_ids[data['frameworkId'].replace('tum-', '').upper()] = goals[0]['id']
    new_goals.extend(goals)

program['goals'] = filtered[:insert_at] + new_goals + filtered[insert_at:]

# Ensure container c2 includes all module roots
container_key = 'tum_msc_qst_c2'
container = None
for goal in program['goals']:
    if goal.get('shortKey') == container_key:
        container = goal
        break

if container is None:
    raise SystemExit('Container tum_msc_qst_c2 not found.')

contains = list(container.get('contains', []))
for code in module_codes:
    root_id = json.loads((BASE / f'curricula/DE/BY/TUM/Quantum_Science_and_Technology/MSc_QST/json/DE_BAY_U_TUM_{code}.de.json').read_text(encoding='utf-8'))['goals'][0]['id']
    if root_id not in contains:
        contains.append(root_id)
container['contains'] = contains

program_path.write_text(json.dumps(program, ensure_ascii=False, indent=4) + '\n', encoding='utf-8')
print('Updated program with regenerated module graphs.')
