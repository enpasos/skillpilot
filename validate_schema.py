import json
import jsonschema
import os
import sys

# Paths
json_path = "curricula/DE/HE/Kultusministerium/Gymnasiale_Oberstufe/json/DE_HES_S_GYM_2_MATHEMATIK.de.json"
schema_path = "docs/landscape-runtime.schema.json"

if not os.path.exists(json_path):
    print(f"Error: Data file not found: {json_path}")
    sys.exit(1)

if not os.path.exists(schema_path):
    print(f"Error: Schema file not found: {schema_path}")
    sys.exit(1)

# Load Schema
with open(schema_path, 'r', encoding='utf-8') as f:
    schema = json.load(f)

# Load Data
with open(json_path, 'r', encoding='utf-8') as f:
    data = json.load(f)

# Validate
try:
    jsonschema.validate(instance=data, schema=schema)
    print(f"SUCCESS: {json_path} is valid against {schema_path}")
except jsonschema.exceptions.ValidationError as e:
    print(f"FAILURE: Validation failed!")
    print(f"Message: {e.message}")
    print(f"Path: {e.path}")
    sys.exit(1)
except Exception as e:
    print(f"An error occurred: {e}")
    sys.exit(1)
