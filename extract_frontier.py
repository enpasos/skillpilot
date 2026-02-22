import json

with open('curricula/DE/HE/Kultusministerium/Gymnasiale_Oberstufe/json/DE_HES_S_GYM_2_PHYSIK.de.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

nodes = []
for g in data.get('goals', []):
    tags = g.get('dimensionTags', {})
    if tags.get('phase') == 'E' and not g.get('requires'):
        nodes.append(f"- [{g['id']}] {g['title']}")

with open('frontier.txt', 'w', encoding='utf-8') as f:
    f.write('\n'.join(nodes))
