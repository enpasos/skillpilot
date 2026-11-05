#!/usr/bin/env python3
"""Check explicit producer binding using the real versioned profile and sources."""

# SPDX-License-Identifier: Apache-2.0
import copy
import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

from jsonschema import Draft202012Validator

import generate_curriculum_package_redistribution_review as review
import curriculum_learning_unit_artifacts as unit_artifacts


class ProducerProfileBindingTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.profile_path = review.REPO_ROOT / 'contracts/curriculum-package/v1.2/profiles/de-gymnasium-mathematik-learning-unit-offers-release-model-v2.profile.json'
        cls.profile = json.loads(cls.profile_path.read_bytes())
        _, cls.expected_inputs = unit_artifacts.compile_documents(review.REPO_ROOT, cls.profile['learningUnits'],
                review.read_json(review.REPO_ROOT / cls.profile['canonicalLandscape']['sourcePath']))

    def setUp(self):
        self.directory = tempfile.TemporaryDirectory(prefix='producer-profile-binding-')
        self.addCleanup(self.directory.cleanup)
        self.root = Path(self.directory.name)
        self.conformance = {**self.profile['package'], 'profileId': self.profile['profileId'],
                            'counts': self.profile['expectedCounts'], 'contentDigest': 'sha256:' + 'a' * 64}
        self.inputs = {'profilePath': self.profile_path.relative_to(review.REPO_ROOT).as_posix(),
                       'profileSha256': review.sha256_file(self.profile_path),
                       'learningUnitInputs': copy.deepcopy(self.expected_inputs)}
        roots = [self.profile['canonicalLandscape'], self.profile['entryLandscape']]
        self.catalog = {'rootLandscapeIds': [item['landscapeId'] for item in roots],
                        'landscapes': [{'landscapeId': item['landscapeId'], 'artifactPath': item['outputPath'],
                                        'locale': self.profile['package']['locale'], 'subject': self.profile['package']['subject']}
                                       for item in roots],
                        'releaseBinding': {'releaseId': self.conformance['releaseId'],
                                           'contentDigest': self.conformance['contentDigest']}}
        self.target = patch.object(review, 'TARGET_PROFILE_ID', 'full-standalone-learning-unit-offers-v1')
        self.target.start()
        self.addCleanup(self.target.stop)

    def check(self, profile=None):
        catalog_path = self.root / 'data/runtime/catalog.json'
        catalog_path.parent.mkdir(parents=True, exist_ok=True)
        catalog_path.write_text(json.dumps(self.catalog))
        return review.producer_profile_id(self.root, self.conformance, self.inputs, profile or self.profile_path)

    def test_old_default_profile_id_is_unchanged_and_needs_no_new_binding(self):
        with patch.object(review, 'PROFILE_ID', 'de-gymnasium-mathematik-learning-unit-offers-release-model-v1'):
            self.assertEqual(review.producer_profile_id(self.root, {}, {}),
                             'de-gymnasium-mathematik-learning-unit-offers-release-model-v1')

    def test_actual_new_profile_schema_contracts_and_sources_are_accepted(self):
        self.assertEqual(self.check(), self.profile['profileId'])

    def test_review_schema_accepts_only_the_two_reviewed_producer_ids(self):
        schema = json.loads((review.REPO_ROOT / 'contracts/curriculum-package/v1.2/offer-package-redistribution-review.schema.json').read_bytes())
        validator = Draft202012Validator(schema['properties']['sourceReleaseModel']['properties']['profileId'])
        for revision in ('v1', 'v2'):
            self.assertFalse(list(validator.iter_errors('de-gymnasium-mathematik-learning-unit-offers-release-model-' + revision)))
        self.assertTrue(list(validator.iter_errors('de-gymnasium-mathematik-learning-unit-offers-release-model-unknown')))

    def test_unknown_or_old_mismatched_profile_is_rejected(self):
        for profile in (self.root / 'unknown.profile.json',
                        self.profile_path.with_name('de-gymnasium-mathematik-learning-unit-offers-release-model-v1.profile.json')):
            with self.subTest(profile=profile), self.assertRaises(review.ReviewError):
                self.check(profile)

    def test_model_profile_hash_or_path_drift_is_rejected(self):
        for key, value in (('profileSha256', '0' * 64), ('profilePath', 'unknown.profile.json')):
            original = copy.deepcopy(self.inputs)
            self.inputs[key] = value
            with self.subTest(key=key), self.assertRaisesRegex(review.ReviewError, 'path/hash'):
                self.check()
            self.inputs = original

    def test_model_identity_metadata_and_counts_must_match(self):
        for key in ('profileId', 'packageVersion', 'releaseId', 'curriculumEdition', 'counts'):
            original = copy.deepcopy(self.conformance)
            self.conformance[key] = {} if key == 'counts' else 'mismatch'
            with self.subTest(key=key), self.assertRaises(review.ReviewError):
                self.check()
            self.conformance = original

    def test_complete_actual_source_hash_and_artifact_bindings_are_required(self):
        for mutation in ('hash', 'artifact', 'missing', 'duplicate'):
            original = copy.deepcopy(self.inputs)
            if mutation == 'hash':
                self.inputs['learningUnitInputs'][0]['sourceSha256'] = '0' * 64
            elif mutation == 'artifact':
                self.inputs['learningUnitInputs'][0]['artifactPath'] = 'wrong-artifact.json'
            elif mutation == 'missing':
                self.inputs['learningUnitInputs'].pop()
            else:
                self.inputs['learningUnitInputs'].append(copy.deepcopy(self.inputs['learningUnitInputs'][0]))
            with self.subTest(mutation=mutation), self.assertRaisesRegex(review.ReviewError, 'complete.*source bindings'):
                self.check()
            self.inputs = original

    def test_runtime_root_or_metadata_drift_is_rejected(self):
        for mutation in ('root', 'locale', 'release', 'duplicate-landscape'):
            original = copy.deepcopy(self.catalog)
            if mutation == 'root':
                self.catalog['rootLandscapeIds'] = ['wrong-root']
            elif mutation == 'locale':
                self.catalog['landscapes'][0]['locale'] = 'en'
            elif mutation == 'release':
                self.catalog['releaseBinding']['releaseId'] = 'wrong-release'
            else:
                self.catalog['landscapes'][1] = copy.deepcopy(self.catalog['landscapes'][0])
            with self.subTest(mutation=mutation), self.assertRaisesRegex(review.ReviewError, 'scope/metadata'):
                self.check()
            self.catalog = original


if __name__ == '__main__':
    unittest.main()
