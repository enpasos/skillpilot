"""Shared declarations for the self-contained hermetic reverse compiler.

The implementation lives in the single compiler entrypoint, which is the only
application file mounted by the existing isolated reverse runner.
"""
try:
    from reconstruct_json_curriculum_package_from_fwu_owl import (
        CLASSES, DATA_PROPERTIES, OBJECT_PROPERTIES, SP, completion_assertions,
        validate_completion_assertions,
    )
except ImportError:
    from scripts.reconstruct_json_curriculum_package_from_fwu_owl import (
        CLASSES, DATA_PROPERTIES, OBJECT_PROPERTIES, SP, completion_assertions,
        validate_completion_assertions,
    )
