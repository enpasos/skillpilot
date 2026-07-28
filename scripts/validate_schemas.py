import copy
import json
import jsonschema
import os
import sys

# Configuration
CURRICULA_DIR = "curricula"
SCHEMA_PATH = "docs/landscape-runtime.schema.json"
COMPILED_SCHEMA_PATH = "contracts/curriculum-package/v1/compiled-landscape.schema.json"


def validate_personalization_flow_contract(schema_path, schema):
    """Exercise the provider-neutral personalization-flow schema fragment."""
    fragment = {
        "$schema": schema.get("$schema", "https://json-schema.org/draft/2020-12/schema"),
        "$defs": schema.get("$defs", {}),
        "$ref": "#/$defs/personalizationFlow",
    }
    try:
        jsonschema.Draft202012Validator.check_schema(fragment)
        validator = jsonschema.Draft202012Validator(fragment)
    except Exception as exc:
        print(f"❌ {schema_path}: Invalid personalizationFlow schema fragment: {exc}")
        return False

    valid_flow = {
        "version": "1",
        "stages": [
            {
                "id": "scope",
                "order": 10,
                "label": "Choose scope",
                "groups": [
                    {
                        "id": "scope-options",
                        "order": 10,
                        "label": "Which scopes apply?",
                        "minSelections": 1,
                        "maxSelections": 2,
                        "source": {
                            "kind": "landscapes",
                            "landscapeIds": ["scope-a", "scope-b"],
                        },
                    }
                ],
            },
            {
                "id": "profile",
                "order": 20,
                "label": "Choose profile",
                "groups": [
                    {
                        "id": "profile-options",
                        "order": 10,
                        "label": "Which profile applies?",
                        "minSelections": 0,
                        "maxSelections": 1,
                        "source": {
                            "kind": "filtersForSelectedLandscapes",
                            "selectedLandscapesFromGroupId": "scope-options",
                            "filterIds": ["profile-a", "profile-b"],
                        },
                    }
                ],
            }
        ],
    }
    if list(validator.iter_errors(valid_flow)):
        print(f"❌ {schema_path}: Neutral valid personalizationFlow was rejected")
        return False

    invalid_flows = {}

    empty_stages = copy.deepcopy(valid_flow)
    empty_stages["stages"] = []
    invalid_flows["empty stages"] = empty_stages

    missing_stage_label = copy.deepcopy(valid_flow)
    del missing_stage_label["stages"][0]["label"]
    invalid_flows["missing stage label"] = missing_stage_label

    blank_stage_label = copy.deepcopy(valid_flow)
    blank_stage_label["stages"][0]["label"] = " \t"
    invalid_flows["blank stage label"] = blank_stage_label

    blank_stage_label_en = copy.deepcopy(valid_flow)
    blank_stage_label_en["stages"][0]["labelEn"] = " \t"
    invalid_flows["blank stage labelEn"] = blank_stage_label_en

    missing_group_label = copy.deepcopy(valid_flow)
    del missing_group_label["stages"][0]["groups"][0]["label"]
    invalid_flows["missing group label"] = missing_group_label

    blank_group_label = copy.deepcopy(valid_flow)
    blank_group_label["stages"][0]["groups"][0]["label"] = "\n "
    invalid_flows["blank group label"] = blank_group_label

    blank_group_label_en = copy.deepcopy(valid_flow)
    blank_group_label_en["stages"][0]["groups"][0]["labelEn"] = "\n "
    invalid_flows["blank group labelEn"] = blank_group_label_en

    duplicate_filter_ids = copy.deepcopy(valid_flow)
    duplicate_filter_ids["stages"][1]["groups"][0]["source"]["filterIds"] = [
        "mode-a",
        "mode-a",
    ]
    invalid_flows["duplicate filterIds"] = duplicate_filter_ids

    duplicate_landscape_ids = copy.deepcopy(valid_flow)
    duplicate_landscape_ids["stages"][0]["groups"][0]["source"] = {
        "kind": "landscapes",
        "landscapeIds": ["landscape-neutral", "landscape-neutral"],
    }
    invalid_flows["duplicate landscapeIds"] = duplicate_landscape_ids

    landscape_filters_missing_landscape = copy.deepcopy(valid_flow)
    landscape_filters_missing_landscape["stages"][0]["groups"][0]["source"] = {
        "kind": "landscapeFilters",
        "filterIds": ["profile-a"],
    }
    invalid_flows["landscapeFilters without landscapeId"] = (
        landscape_filters_missing_landscape
    )

    landscape_filters_with_foreign_field = copy.deepcopy(valid_flow)
    landscape_filters_with_foreign_field["stages"][0]["groups"][0]["source"] = {
        "kind": "landscapeFilters",
        "landscapeId": "scope-a",
        "landscapeIds": ["scope-a"],
    }
    invalid_flows["landscapeFilters with landscapeIds"] = (
        landscape_filters_with_foreign_field
    )

    landscapes_with_filter_ids = copy.deepcopy(valid_flow)
    landscapes_with_filter_ids["stages"][0]["groups"][0]["source"]["filterIds"] = [
        "profile-a"
    ]
    invalid_flows["landscapes with filterIds"] = landscapes_with_filter_ids

    dynamic_filters_missing_reference = copy.deepcopy(valid_flow)
    dynamic_filters_missing_reference["stages"][1]["groups"][0]["source"] = {
        "kind": "filtersForSelectedLandscapes",
        "filterIds": ["profile-a"],
    }
    invalid_flows["filtersForSelectedLandscapes without reference"] = (
        dynamic_filters_missing_reference
    )

    dynamic_filters_with_foreign_field = copy.deepcopy(valid_flow)
    dynamic_filters_with_foreign_field["stages"][1]["groups"][0]["source"][
        "landscapeId"
    ] = "scope-a"
    invalid_flows["filtersForSelectedLandscapes with landscapeId"] = (
        dynamic_filters_with_foreign_field
    )

    unknown_source_kind = copy.deepcopy(valid_flow)
    unknown_source_kind["stages"][0]["groups"][0]["source"] = {
        "kind": "externalCatalog",
        "landscapeIds": ["scope-a"],
    }
    invalid_flows["unknown source kind"] = unknown_source_kind

    # The scopeValues source kind is authored per schema. Only schemas that
    # declare the variant are held to its contract; the runtime schema declares
    # it, the compiled-package schema does not yet.
    source_variants = (
        schema.get("$defs", {}).get("personalizationOptionSource", {}).get("oneOf", [])
    )
    declares_scope_values = any(
        variant.get("properties", {}).get("kind", {}).get("const") == "scopeValues"
        for variant in source_variants
    )

    valid_scope_values_source = {
        "kind": "scopeValues",
        "landscapeId": "landscape-neutral",
        "scopeKey": "durationModel",
        "values": [
            {"value": "value-a", "label": "Wert A", "labelEn": "Value A"},
            {"value": "value-b", "label": "Wert B"},
        ],
    }
    if declares_scope_values:
        valid_scope_values = copy.deepcopy(valid_flow)
        valid_scope_values["stages"][0]["groups"][0]["source"] = copy.deepcopy(
            valid_scope_values_source
        )
        if list(validator.iter_errors(valid_scope_values)):
            print(
                f"❌ {schema_path}: personalizationFlow rejected a valid scopeValues source"
            )
            return False

    def scope_values_case(mutate) -> dict:
        flow = copy.deepcopy(valid_flow)
        source = copy.deepcopy(valid_scope_values_source)
        mutate(source)
        flow["stages"][0]["groups"][0]["source"] = source
        return flow

    def _drop_scope_key(source: dict) -> None:
        del source["scopeKey"]

    def _blank_scope_key(source: dict) -> None:
        source["scopeKey"] = " \t"

    def _empty_values(source: dict) -> None:
        source["values"] = []

    def _drop_label(source: dict) -> None:
        del source["values"][0]["label"]

    def _blank_label_en(source: dict) -> None:
        source["values"][0]["labelEn"] = " "

    def _foreign_filter_ids(source: dict) -> None:
        source["filterIds"] = ["profile-a"]

    def _foreign_landscape_ids(source: dict) -> None:
        source["landscapeIds"] = ["landscape-neutral"]

    if declares_scope_values:
        invalid_flows["scopeValues without scopeKey"] = scope_values_case(_drop_scope_key)
        invalid_flows["scopeValues with blank scopeKey"] = scope_values_case(_blank_scope_key)
        invalid_flows["scopeValues without values"] = scope_values_case(_empty_values)
        invalid_flows["scopeValues value without label"] = scope_values_case(_drop_label)
        invalid_flows["scopeValues value with blank labelEn"] = scope_values_case(
            _blank_label_en
        )
        invalid_flows["scopeValues with filterIds"] = scope_values_case(_foreign_filter_ids)
        invalid_flows["scopeValues with landscapeIds"] = scope_values_case(
            _foreign_landscape_ids
        )

    for label, invalid_flow in invalid_flows.items():
        if not list(validator.iter_errors(invalid_flow)):
            print(f"❌ {schema_path}: personalizationFlow accepted {label}")
            return False

    filter_ids_schema = schema.get("$defs", {}).get("personalizationFilterIds", {})
    if filter_ids_schema.get("x-skillpilot-caseInsensitiveUniqueItems") is not True:
        print(
            f"❌ {schema_path}: filterIds lacks the case-insensitive uniqueness contract"
        )
        return False
    filter_ids_description = filter_ids_schema.get("description", "")
    if (
        "version 1" not in filter_ids_description
        or "every landscape" not in filter_ids_description
        or "omit filterIds" not in filter_ids_description
    ):
        print(
            f"❌ {schema_path}: filterIds does not document the shared-vocabulary v1 limit"
        )
        return False

    return True


def personalization_flow_semantic_errors(flow):
    """Return provider-neutral invariants intentionally kept out of JSON Schema."""
    errors = []
    if not isinstance(flow, dict):
        return ["personalizationFlow must be an object"]

    stages = flow.get("stages")
    if not isinstance(stages, list):
        return ["personalizationFlow.stages must be an array"]

    def normalized_id(value):
        return value.strip().casefold() if isinstance(value, str) else ""

    stage_ids = set()
    stage_orders = set()
    group_ids = set()
    ordered_stages = sorted(
        stages,
        key=lambda stage: (
            stage.get("order", 0),
            normalized_id(stage.get("id")),
        ),
    )
    earlier_groups = {}

    for stage in ordered_stages:
        stage_id = normalized_id(stage.get("id"))
        stage_order = stage.get("order")
        if stage_id in stage_ids:
            errors.append(
                f"stage id is not case-insensitively unique: {stage.get('id')!r}"
            )
        stage_ids.add(stage_id)
        if stage_order in stage_orders:
            errors.append(f"stage order is not unique: {stage_order!r}")
        stage_orders.add(stage_order)

        groups = stage.get("groups", [])
        group_orders = set()
        ordered_groups = sorted(
            groups,
            key=lambda group: (
                group.get("order", 0),
                normalized_id(group.get("id")),
            ),
        )
        for group in ordered_groups:
            group_id = normalized_id(group.get("id"))
            group_order = group.get("order")
            if group_id in group_ids:
                errors.append(
                    f"group id is not case-insensitively unique: {group.get('id')!r}"
                )
            group_ids.add(group_id)
            if group_order in group_orders:
                errors.append(
                    f"group order is not unique within stage {stage.get('id')!r}: "
                    f"{group_order!r}"
                )
            group_orders.add(group_order)

            minimum = group.get("minSelections")
            maximum = group.get("maxSelections")
            if (
                isinstance(minimum, int)
                and isinstance(maximum, int)
                and minimum > maximum
            ):
                errors.append(
                    f"group {group.get('id')!r} has minSelections > maxSelections"
                )

            source = group.get("source", {})
            filter_ids = source.get("filterIds")
            if isinstance(filter_ids, list):
                normalized_filter_ids = [normalized_id(value) for value in filter_ids]
                if len(normalized_filter_ids) != len(set(normalized_filter_ids)):
                    errors.append(
                        f"group {group.get('id')!r} has case-insensitively "
                        "duplicate filterIds"
                    )

            landscape_ids = source.get("landscapeIds")
            if isinstance(landscape_ids, list):
                normalized_landscape_ids = [
                    normalized_id(value) for value in landscape_ids
                ]
                if len(normalized_landscape_ids) != len(
                    set(normalized_landscape_ids)
                ):
                    errors.append(
                        f"group {group.get('id')!r} has case-insensitively "
                        "duplicate landscapeIds"
                    )

            if source.get("kind") == "filtersForSelectedLandscapes":
                reference = normalized_id(
                    source.get("selectedLandscapesFromGroupId")
                )
                if earlier_groups.get(reference) != "landscapes":
                    errors.append(
                        f"group {group.get('id')!r} must reference an earlier "
                        "group whose source kind is landscapes"
                    )

            earlier_groups[group_id] = source.get("kind")

    return errors


def validate_personalization_flow_semantic_contract():
    """Prove that malformed but schema-shaped flows fail semantic validation."""
    valid_flow = {
        "version": "1",
        "stages": [
            {
                "id": "scope",
                "order": 10,
                "label": "Choose scope",
                "groups": [
                    {
                        "id": "scope-options",
                        "order": 10,
                        "label": "Which scopes apply?",
                        "minSelections": 1,
                        "maxSelections": 2,
                        "source": {
                            "kind": "landscapes",
                            "landscapeIds": ["scope-a", "scope-b"],
                        },
                    }
                ],
            },
            {
                "id": "profile",
                "order": 20,
                "label": "Choose profile",
                "groups": [
                    {
                        "id": "profile-options",
                        "order": 10,
                        "label": "Which profile applies?",
                        "minSelections": 0,
                        "maxSelections": 1,
                        "source": {
                            "kind": "filtersForSelectedLandscapes",
                            "selectedLandscapesFromGroupId": "scope-options",
                            "filterIds": ["profile-a", "profile-b"],
                        },
                    }
                ],
            },
        ],
    }
    if personalization_flow_semantic_errors(valid_flow):
        print("❌ Semantic personalizationFlow self-test rejected a valid flow")
        return False

    invalid_flows = {}

    duplicate_stage_id = copy.deepcopy(valid_flow)
    duplicate_stage_id["stages"][1]["id"] = "SCOPE"
    invalid_flows["case-insensitive duplicate stage id"] = duplicate_stage_id

    duplicate_stage_order = copy.deepcopy(valid_flow)
    duplicate_stage_order["stages"][1]["order"] = 10
    invalid_flows["duplicate stage order"] = duplicate_stage_order

    duplicate_group_id = copy.deepcopy(valid_flow)
    duplicate_group_id["stages"][1]["groups"][0]["id"] = "SCOPE-OPTIONS"
    invalid_flows["case-insensitive duplicate group id"] = duplicate_group_id

    duplicate_group_order = copy.deepcopy(valid_flow)
    second_group = copy.deepcopy(valid_flow["stages"][0]["groups"][0])
    second_group["id"] = "scope-options-secondary"
    valid_group_order = valid_flow["stages"][0]["groups"][0]["order"]
    second_group["order"] = valid_group_order
    duplicate_group_order["stages"][0]["groups"].append(second_group)
    invalid_flows["duplicate group order within stage"] = duplicate_group_order

    reversed_cardinality = copy.deepcopy(valid_flow)
    reversed_cardinality["stages"][0]["groups"][0]["minSelections"] = 3
    invalid_flows["minSelections greater than maxSelections"] = reversed_cardinality

    duplicate_filter_ids = copy.deepcopy(valid_flow)
    duplicate_filter_ids["stages"][1]["groups"][0]["source"]["filterIds"] = [
        "profile-a",
        "PROFILE-A",
    ]
    invalid_flows["case-insensitive duplicate filterIds"] = duplicate_filter_ids

    duplicate_landscape_ids = copy.deepcopy(valid_flow)
    duplicate_landscape_ids["stages"][0]["groups"][0]["source"]["landscapeIds"] = [
        "scope-a",
        "SCOPE-A",
    ]
    invalid_flows["case-insensitive duplicate landscapeIds"] = (
        duplicate_landscape_ids
    )

    forward_reference = copy.deepcopy(valid_flow)
    forward_reference["stages"][0]["groups"][0]["source"] = {
        "kind": "filtersForSelectedLandscapes",
        "selectedLandscapesFromGroupId": "profile-options",
    }
    forward_reference["stages"][1]["groups"][0]["source"] = {
        "kind": "landscapes",
        "landscapeIds": ["scope-a"],
    }
    invalid_flows["reference to later landscapes group"] = forward_reference

    non_landscape_reference = copy.deepcopy(valid_flow)
    non_landscape_reference["stages"][0]["groups"][0]["source"] = {
        "kind": "landscapeFilters",
        "landscapeId": "scope-a",
    }
    invalid_flows["reference to earlier non-landscapes group"] = (
        non_landscape_reference
    )

    for label, invalid_flow in invalid_flows.items():
        if not personalization_flow_semantic_errors(invalid_flow):
            print(f"❌ Semantic personalizationFlow self-test accepted {label}")
            return False
    return True

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
    except jsonschema.exceptions.ValidationError as e:
        print(f"❌ {file_path}: Validation failed!")
        print(f"  Message: {e.message}")
        print(f"  Path: {e.path}")
        return False
    except Exception as e:
        print(f"❌ {file_path}: Unexpected error: {e}")
        return False

    personalization_flow = data.get("personalizationFlow")
    if personalization_flow is not None:
        semantic_errors = personalization_flow_semantic_errors(personalization_flow)
        if semantic_errors:
            print(f"❌ {file_path}: Invalid personalizationFlow semantics!")
            for error in semantic_errors:
                print(f"  - {error}")
            return False
    return True

def main():
    if not os.path.exists(SCHEMA_PATH):
        print(f"Schema not found: {SCHEMA_PATH}")
        sys.exit(1)

    with open(SCHEMA_PATH, 'r', encoding='utf-8') as f:
        schema = json.load(f)

    if not os.path.exists(COMPILED_SCHEMA_PATH):
        print(f"Schema not found: {COMPILED_SCHEMA_PATH}")
        sys.exit(1)
    with open(COMPILED_SCHEMA_PATH, 'r', encoding='utf-8') as f:
        compiled_schema = json.load(f)

    if not validate_personalization_flow_contract(SCHEMA_PATH, schema):
        sys.exit(1)
    if not validate_personalization_flow_contract(COMPILED_SCHEMA_PATH, compiled_schema):
        sys.exit(1)
    if not validate_personalization_flow_semantic_contract():
        sys.exit(1)

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
