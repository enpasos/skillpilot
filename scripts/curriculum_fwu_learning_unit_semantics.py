"""Shared declarations for the runtime-1.2 learning-unit RDF assertions.

The implementation lives in the single reverse-compiler entrypoint, which is
the only application file mounted by the existing isolated reverse runner.
"""
try:
    from reconstruct_json_curriculum_package_from_fwu_owl import (
        LEARNING_UNIT_CLASSES, LEARNING_UNIT_DATA_PROPERTIES, LEARNING_UNIT_OBJECT_PROPERTIES,
        LEARNING_UNIT_REVIEW_ROLE, SP, learning_unit_assertions, validate_learning_unit_assertions,
    )
except ImportError:
    from scripts.reconstruct_json_curriculum_package_from_fwu_owl import (
        LEARNING_UNIT_CLASSES, LEARNING_UNIT_DATA_PROPERTIES, LEARNING_UNIT_OBJECT_PROPERTIES,
        LEARNING_UNIT_REVIEW_ROLE, SP, learning_unit_assertions, validate_learning_unit_assertions,
    )
