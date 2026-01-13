import json
import os
import sys
import uuid

# Configuration
CURRICULA_DIR = "curricula"
FIELDS_TO_REMOVE = ['shortKey', 'examples', 'core', 'area', 'topicCode', 'type'] # Added type
DIMENSION_FIELDS_TO_REMOVE = ['area', 'topicCode']

def clean_file(file_path):
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
    except Exception as e:
        print(f"Skipping {file_path}: {e}")
        return 0

    if not isinstance(data, dict):
        print(f"Skipping {file_path}: Root is not a dictionary.")
        return 0

    modified = False

    # 1. Ensure landscapeId exists
    if 'landscapeId' not in data:
        # Generate consistent UUID based on file path/name
        # Use filename as seed
        seed = os.path.basename(file_path)
        generated_id = str(uuid.uuid5(uuid.NAMESPACE_DNS, seed))
        data['landscapeId'] = generated_id
        modified = True
        print(f"  Added landscapeId: {generated_id}")

    # Remove legacy 'id' from root if it's separate
    if 'id' in data and 'landscapeId' in data:
        del data['id']
        modified = True

    goals = data.get('goals', [])
    
    for g in goals:
        # 2. Remove top-level fields
        for field in FIELDS_TO_REMOVE:
            if field in g:
                del g[field]
                modified = True
        
        # 3. Migrate 'phase' to dimensionTags or inject default
        if 'phase' in g:
            phase_val = g.pop('phase')
            if 'dimensionTags' not in g:
                g['dimensionTags'] = {}
            if 'phase' not in g['dimensionTags']:
                g['dimensionTags']['phase'] = phase_val
            modified = True
        
        # Ensure dimensionTags exists with at least 'phase'
        if 'dimensionTags' not in g:
            g['dimensionTags'] = {'phase': 'GLOBAL'}
            modified = True
        elif 'phase' not in g['dimensionTags']:
             g['dimensionTags']['phase'] = 'GLOBAL'
             modified = True
        
        # Ensure required fields exist
        if 'requires' not in g:
            g['requires'] = []
            modified = True
        if 'contains' not in g:
            g['contains'] = []
            modified = True
        if 'weight' not in g:
            g['weight'] = 0.0
            modified = True
        
        # Ensure title/description exist
        if 'title' not in g:
            g['title'] = ""
            modified = True
        if 'description' not in g:
            g['description'] = ""
            modified = True

        # 4. Remove dimensionTags fields
        if 'dimensionTags' in g:
            dt = g['dimensionTags']
            for field in DIMENSION_FIELDS_TO_REMOVE:
                if field in dt:
                    del dt[field]
                    modified = True

    if modified:
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        return 1
    return 0

def main():
    if not os.path.exists(CURRICULA_DIR):
        print(f"Directory not found: {CURRICULA_DIR}")
        sys.exit(1)

    total_files = 0
    cleaned_files = 0

    for root, dirs, files in os.walk(CURRICULA_DIR):
        for file in files:
            if file.endswith(".json"):
                total_files += 1
                full_path = os.path.join(root, file)
                if clean_file(full_path):
                    cleaned_files += 1
                    print(f"Cleaned: {full_path}")

    print(f"Scan complete. Checked {total_files} files. Cleaned {cleaned_files} files.")

if __name__ == "__main__":
    main()
