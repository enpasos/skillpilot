import json
import jsonschema
import os
import sys

# Configuration
CURRICULA_DIR = "curricula"
SCHEMA_PATH = "docs/landscape-runtime.schema.json"

def validate_file(file_path, schema):
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
    except Exception as e:
        print(f"❌ skipping {file_path}: Failed to load JSON: {e}")
        return False

    if not isinstance(data, dict) or 'goals' not in data:
        # Skip files that don't look like landscapes
        return True

    try:
        jsonschema.validate(instance=data, schema=schema)
        return True
    except jsonschema.exceptions.ValidationError as e:
        print(f"❌ {file_path}: Validation failed!")
        print(f"  Message: {e.message}")
        print(f"  Path: {e.path}")
        return False
    except Exception as e:
        print(f"❌ {file_path}: Unexpected error: {e}")
        return False

def main():
    if not os.path.exists(SCHEMA_PATH):
        print(f"Schema not found: {SCHEMA_PATH}")
        sys.exit(1)

    with open(SCHEMA_PATH, 'r', encoding='utf-8') as f:
        schema = json.load(f)

    if not os.path.exists(CURRICULA_DIR):
        print(f"Directory not found: {CURRICULA_DIR}")
        sys.exit(1)

    total_files = 0
    failed_files = 0

    print(f"Validating schemas in {CURRICULA_DIR} against {SCHEMA_PATH}...")

    for root, dirs, files in os.walk(CURRICULA_DIR):
        for file in files:
            if file.endswith(".json"):
                total_files += 1
                full_path = os.path.join(root, file)
                if not validate_file(full_path, schema):
                    failed_files += 1

    print("-" * 40)
    print(f"Checked {total_files} files.")
    if failed_files == 0:
        print("✅ All files passed schema validation.")
        sys.exit(0)
    else:
        print(f"❌ {failed_files} files failed validation.")
        sys.exit(1)

if __name__ == "__main__":
    main()
