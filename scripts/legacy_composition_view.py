"""Format boundary for legacy composition-view authoring tools."""
import json


EXTENSION_VIEW_SCHEMA = "https://skillpilot.com/schemas/composition-view/v1.3/composition-view.schema.json"


def _includes_extension(nodes):
    return isinstance(nodes, list) and any(
        isinstance(node, dict) and node.get("kind") == "structure"
        and ("extension" in node or _includes_extension(node.get("children")))
        for node in nodes
    )


def assert_supported_composition_view(view, context=None):
    if isinstance(view, dict) and (
        view.get("viewFormatVersion") == "1.3"
        or view.get("$schema") == EXTENSION_VIEW_SCHEMA
        or "electionGroups" in view
        or _includes_extension(view.get("rootNodes"))
    ):
        raise ValueError(f"{context or view.get('viewId') or 'View'}: composition view format 1.3 is unsupported")


def read_composition_view(path):
    view = json.loads(path.read_text())
    assert_supported_composition_view(view, path)
    return view
