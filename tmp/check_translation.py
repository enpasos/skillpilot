
import json
import sys

def check_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    nodes_to_translate = []
    
    # Check top level
    if data.get('title') == data.get('titleEn') or not data.get('titleEn'):
        nodes_to_translate.append({
            'id': 'ROOT',
            'title': data.get('title'),
            'description': data.get('description'),
            'current_titleEn': data.get('titleEn'),
            'current_descriptionEn': data.get('descriptionEn')
        })

    # Check goals
    for goal in data.get('goals', []):
        needs_trans = False
        if goal.get('title') == goal.get('titleEn') or not goal.get('titleEn'):
            needs_trans = True
        # Check if descriptionEn matches description or is empty (ignore if both are empty)
        if (goal.get('description') and (goal.get('description') == goal.get('descriptionEn') or not goal.get('descriptionEn'))):
            needs_trans = True
            
        if needs_trans:
             nodes_to_translate.append({
                'id': goal.get('id'),
                'shortKey': goal.get('shortKey'),
                'title': goal.get('title'),
                'description': goal.get('description'),
                'current_titleEn': goal.get('titleEn'),
                'current_descriptionEn': goal.get('descriptionEn')
            })
            
    print(json.dumps(nodes_to_translate, indent=2, ensure_ascii=False))

if __name__ == "__main__":
    check_file(sys.argv[1])
