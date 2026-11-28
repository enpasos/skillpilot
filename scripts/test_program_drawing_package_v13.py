#!/usr/bin/env python3
"""A different, valid PNG cannot occupy the position of an own Pillow drawing."""
from pathlib import Path
import json
import shutil
import tempfile
import unittest

from PIL import Image

import curriculum_package_pillow_provenance as pillow

ROOT = Path(__file__).resolve().parents[1]


class ProgramDrawingV13(unittest.TestCase):
    def test_changed_pixel_is_rejected_by_the_original_renderer(self):
        manifest = json.loads((ROOT / pillow.MANIFEST_PATH).read_bytes())
        needed = [pillow.MANIFEST_PATH, pillow.DIRECTORY + "/verify_pillow.py", manifest["renderer"]["path"]]
        for row in manifest["images"]:
            needed.extend([row["prompt"]["path"], row["output"]["path"]])
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            for relative in needed:
                target = root / relative
                target.parent.mkdir(parents=True, exist_ok=True)
                shutil.copyfile(ROOT / relative, target)
            self.assertEqual(len(pillow.drawing_rows(root, replay=True)), 4)
            png = root / manifest["images"][0]["output"]["path"]
            with Image.open(png) as original:
                changed = original.convert("RGB")
            red, green, blue = changed.getpixel((0, 0))
            changed.putpixel((0, 0), (red ^ 1, green, blue))
            changed.save(png)
            with self.assertRaisesRegex(ValueError, "PNG differs from the original Pillow output"):
                pillow.drawing_rows(root, replay=True)


if __name__ == "__main__":
    unittest.main(verbosity=2)
