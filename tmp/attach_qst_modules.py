import json
from pathlib import Path

BASE = Path('/home/enpasos/projects/skillpilot')
program_path = BASE / 'curricula/DE/BY/TUM/Quantum_Science_and_Technology/MSc_QST/json/DE_BAY_U_TUM_MSC_QST.de.json'
module_codes = ['MA3001', 'IN2381', 'IN2388', 'NAT5040m']
module_paths = [BASE / f'curricula/DE/BY/TUM/Quantum_Science_and_Technology/MSc_QST/json/DE_BAY_U_TUM_{code}.de.json' for code in module_codes]

program = json.loads(program_path.read_text(encoding='utf-8'))
old_goals = program.get('goals', [])

prefixes = (
    'tum_ma3001_',
    'tum_in2381_',
    'tum_in2388_',
    'tum_nat5040m_',
)

def is_target(goal):
    short_key = goal.get('shortKey', '')
    return any(short_key.startswith(prefix) for prefix in prefixes)

indices = [i for i, g in enumerate(old_goals) if is_target(g)]
filtered = [g for g in old_goals if not is_target(g)]

if indices:
    insert_at = min(indices)
    removed_before = sum(1 for i in indices if i < insert_at)
    insert_at = insert_at - removed_before
else:
    insert_at = len(filtered)

new_goals = []
for path in module_paths:
    data = json.loads(path.read_text(encoding='utf-8'))
    new_goals.extend(data.get('goals', []))

program['goals'] = filtered[:insert_at] + new_goals + filtered[insert_at:]

# Ensure containers include the module roots
container_map = {
    'tum_msc_qst_c2': ['MA3001', 'IN2381', 'IN2388'],
    'tum_msc_qst_c4': ['NAT5040m'],
}

root_ids = {}
for code in module_codes:
    data = json.loads((BASE / f'curricula/DE/BY/TUM/Quantum_Science_and_Technology/MSc_QST/json/DE_BAY_U_TUM_{code}.de.json').read_text(encoding='utf-8'))
    if data.get('goals'):
        root_ids[code] = data['goals'][0]['id']

for goal in program['goals']:
    short_key = goal.get('shortKey')
    if short_key in container_map:
        contains = list(goal.get('contains', []))
        for code in container_map[short_key]:
            root_id = root_ids.get(code)
            if root_id and root_id not in contains:
                contains.append(root_id)
        goal['contains'] = contains

program_path.write_text(json.dumps(program, ensure_ascii=False, indent=4) + '\n', encoding='utf-8')
print('Updated program with regenerated module graphs.')
