"""Unit tests, and a post-build check: python scripts/test_docs_pdf.py --site site."""
from __future__ import annotations
import hashlib
from html.parser import HTMLParser
import importlib.util
import json
from pathlib import Path
import sys
import tempfile
from types import SimpleNamespace
import unittest
from unittest.mock import patch
from urllib.parse import unquote

try:
    from scripts import docs_pdf as pdf
except ModuleNotFoundError:
    import docs_pdf as pdf


class PdfTests(unittest.TestCase):
    def test_relative_links_become_online_links(self):
        self.assertEqual(pdf.online_link("../../qa-ci/semantic-atomicity-review.md", pdf.SITE_URL),
                         pdf.SITE_URL + "qa-ci/semantic-atomicity-review/")
        self.assertEqual(pdf.online_link("../../qa-ci/index.md#rules", pdf.SITE_URL),
                         pdf.SITE_URL + "qa-ci/#rules")
        self.assertEqual(pdf.online_link("#definition", pdf.SITE_URL), "#definition")
        with self.assertRaises(ValueError):
            pdf.online_link("../../../secret.txt", pdf.SITE_URL)

    def test_code_has_lossless_break_opportunities(self):
        self.assertEqual(pdf.breakable_code("a/b_c"),
                         r"\texttt{a/\allowbreak{}b\_\allowbreak{}c}")
        self.assertIn(r"\%", pdf.breakable_code("10%"))

    def test_display_math_keeps_operators(self):
        expression = (r"F_Q(g)=1\iff\forall d\in D:"
                      r"\bigl(x\bigr)\ \lor\ \bigl(y\bigr)")
        rendered = pdf.print_math(expression)
        self.assertIn(r"\begin{gathered}", rendered)
        self.assertEqual(rendered.count(r"\lor"), 1)
        self.assertIn(r"\bigl(x\bigr)", rendered)
        self.assertIn(r"\bigl(y\bigr)", rendered)

    def test_frontier_math_preserves_membership_and_implication(self):
        expression = r"Frontier(M)=\left\{g\in A\ \middle|\ \forall p\in G:(g,p)\in R^+\Rightarrow Sat(p,M)\right\}"
        rendered = pdf.print_math(expression)
        for token in (r"g\in A", r"\forall p\in G", r"(g,p)\in R^+", r"\Rightarrow Sat(p,M)"):
            self.assertIn(token, rendered)
        self.assertNotIn(r"\middle|", rendered)

    def test_source_images_are_local_and_required(self):
        with tempfile.TemporaryDirectory() as temp:
            docs = Path(temp)
            image = docs / "concept/skill-graph/assets/test.png"
            image.parent.mkdir(parents=True)
            image.write_bytes(b"test")
            self.assertEqual(pdf.resolve_image("assets/test.png", docs), image)
            for bad in ("assets/missing.png", "https://example.org/x.png", "../../../secret.png"):
                with self.assertRaises(ValueError):
                    pdf.resolve_image(bad, docs)

    def test_title_level_and_no_implicit_caption(self):
        heading = {"t": "Header", "c": [2, ["example", [], []], [{"t": "Str", "c": "1. Example"}]]}
        self.assertEqual(pdf.transform(heading, Path("docs"), pdf.SITE_URL, set())["c"][0], 1)

    def test_download_only_on_specification(self):
        source = "# Title\n\nBody stays unchanged.\n"
        page = SimpleNamespace(file=SimpleNamespace(src_uri=pdf.SOURCE))
        result = pdf.on_page_markdown(source, page=page, config=None, files=None)
        self.assertIn("../../" + pdf.DOWNLOAD, result)
        self.assertIn("{ .md-button download }", result)
        self.assertTrue(result.endswith("Body stays unchanged.\n"))
        page.file.src_uri = "index.md"
        self.assertEqual(pdf.on_page_markdown(source, page=page, config=None, files=None), source)

    @unittest.skipUnless(importlib.util.find_spec("mkdocs"), "MkDocs not installed")
    def test_hook_registers_generated_file_and_rebuilds(self):
        from mkdocs.config import load_config
        from mkdocs.structure.files import Files
        with tempfile.TemporaryDirectory() as temp:
            root = Path(temp)
            (root / "docs").mkdir()
            config_file = root / "mkdocs.yml"
            config_file.write_text("site_name: Test\nsite_url: https://example.org/test/\nplugins: []\n")
            config = load_config(config_file=str(config_file))
            def fake_build(repo, docs, output, site_url):
                output.parent.mkdir(parents=True, exist_ok=True)
                output.write_bytes(b"%PDF-fresh-output")
            with patch.object(pdf, "build_pdf", side_effect=fake_build) as build:
                for _ in range(2):
                    files = pdf.on_files(Files([]), config=config)
                    generated = files.get_file_from_path(pdf.DOWNLOAD)
                    self.assertEqual(generated.content_bytes, b"%PDF-fresh-output")
                    self.assertEqual(generated.dest_uri, pdf.DOWNLOAD)
                self.assertEqual(build.call_count, 2)
                with self.assertRaises(RuntimeError):
                    pdf.on_files(files, config=config)


class Links(HTMLParser):
    def __init__(self):
        super().__init__()
        self.downloads = []
    def handle_starttag(self, tag, attrs):
        data = dict(attrs)
        if tag == "a" and "download" in data:
            self.downloads.append(data.get("href", ""))


def check_site(site: Path) -> None:
    site = site.resolve()
    page = site / pdf.SOURCE.replace(".md", "/index.html")
    parser = Links()
    parser.feed(page.read_text(encoding="utf-8"))
    target = site / pdf.DOWNLOAD
    matched = [(page.parent / unquote(href)).resolve() for href in parser.downloads]
    if target not in matched:
        raise AssertionError("Specification does not link to its generated PDF download")
    pages = pdf.verify_pdf(target)
    repo = Path(__file__).resolve().parents[1]
    report = json.loads((repo / "tmp/docs-pdf" / Path(pdf.DOWNLOAD).name).with_suffix(".json").read_text())
    if hashlib.sha256(target.read_bytes()).hexdigest() != report["pdf_sha256"]:
        raise AssertionError("Published PDF differs from the verified build")
    for path, digest in report["sources"].items():
        if hashlib.sha256((repo / path).read_bytes()).hexdigest() != digest:
            raise AssertionError(f"Source changed after PDF build: {path}")
    print(f"PDF download link, {pages} pages, source/image hashes and print boundaries verified")


if __name__ == "__main__":
    if len(sys.argv) == 3 and sys.argv[1] == "--site":
        check_site(Path(sys.argv[2]))
    else:
        unittest.main()
