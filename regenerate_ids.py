import json
import uuid
import sys

def regenerate_ids(file_path, root_id_to_keep):
    print(f"Processing {file_path}...")
    with open(file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    goals = data.get('goals', [])
    
    # 1. Identify all internal IDs
    internal_ids = set()
    for g in goals:
        internal_ids.add(g['id'])
    
    print(f"Found {len(internal_ids)} goals.")

    # 2. Creating mapping
    id_map = {}
    for old_id in internal_ids:
        if old_id == root_id_to_keep:
            print(f"Keeping Root ID: {old_id}")
            continue
        new_id = str(uuid.uuid4())
        id_map[old_id] = new_id
    
    print(f"Generated {len(id_map)} new IDs.")

    # 3. Update IDs and References
    for g in goals:
        # Update self ID
        if g['id'] in id_map:
            g['id'] = id_map[g['id']]
        
        # Update references
        if 'contains' in g:
            g['contains'] = [id_map.get(ref, ref) for ref in g['contains']]
        
        if 'requires' in g:
            g['requires'] = [id_map.get(ref, ref) for ref in g['requires']]

    # 4. Save
    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=4, ensure_ascii=False)
    
    print("Done.")

if __name__ == "__main__":
    if len(sys.argv) > 1:
        FILE_PATH = sys.argv[1]
    else:
        # Fallback (Linux path)
        FILE_PATH = "/home/enpasos/projects/skillpilot/curricula/Hessisches_Kultusministerium/Gymnasiale_Oberstufe/json/DE_HES_S_GYM_2_MATHEMATIK.de.json"
    
    ROOT_ID = "ccf9569b-b0e4-4d76-98d5-65be461d4d76"
    regenerate_ids(FILE_PATH, ROOT_ID)
