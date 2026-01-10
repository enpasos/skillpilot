import json
from pathlib import Path

path = Path('/home/enpasos/projects/skillpilot/curricula/DE/BY/TUM/Quantum_Science_and_Technology/MSc_QST/json/DE_BAY_U_TUM_NAT7001.de.json')

data = json.loads(path.read_text(encoding='utf-8'))
root = data['goals'][0]
root['weight'] = 10.0

new_tags = []
found = False
for tag in root.get('tags', []):
    if isinstance(tag, str) and tag.startswith('ects:'):
        new_tags.append('ects:10')
        found = True
    else:
        new_tags.append(tag)
if not found:
    new_tags.append('ects:10')
root['tags'] = new_tags

path.write_text(json.dumps(data, ensure_ascii=False, indent=4) + '\n', encoding='utf-8')
