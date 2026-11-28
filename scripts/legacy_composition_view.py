"""Recognize source composition declarations that published package profiles cannot transport."""
from collections.abc import Mapping


EXTENSION_VIEW_SCHEMA = "https://skillpilot.com/schemas/composition-view/v1.3/composition-view.schema.json"


def has_extension_declarations(view):
    if not isinstance(view, Mapping):
        return False
    if (view.get("viewFormatVersion") == "1.3"
            or view.get("$schema") == EXTENSION_VIEW_SCHEMA
            or "electionGroups" in view
            or "historicalAssessmentPlacements" in view):
        return True
    pending = [view.get("rootNodes")]
    while pending:
        nodes = pending.pop()
        if isinstance(nodes, list):
            for node in nodes:
                if isinstance(node, Mapping):
                    if "extension" in node:
                        return True
                    pending.append(node.get("children"))
    return False
