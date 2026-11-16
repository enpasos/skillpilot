"""Static SVG policy for byte-exact, package-owned assessment stimuli.

Validation never rewrites the stored bytes and never resolves a DTD or URL.
Matplotlib's fixed SVG 1.1 declaration is allowed as inert syntax; internal
subsets, entities, processing instructions and active/external content are not.
"""
from __future__ import annotations

import re
import xml.etree.ElementTree as ET

MAX_SVG_BYTES = 4 * 1024 * 1024
SVG_NAMESPACE = "http://www.w3.org/2000/svg"
STATIC_DOCTYPE = re.compile(
    r'<!DOCTYPE\s+svg\s+PUBLIC\s+[\'"]-//W3C//DTD SVG 1\.1//EN[\'"]\s+'
    r'[\'"]http://www\.w3\.org/Graphics/SVG/1\.1/DTD/svg11\.dtd[\'"]\s*>', re.ASCII)
FRAGMENT = re.compile(r"#[A-Za-z_][A-Za-z0-9_.:-]*\Z", re.ASCII)
URL = re.compile(r"url\s*\((.*?)\)", re.IGNORECASE | re.DOTALL)
STATIC_ELEMENTS = frozenset({"svg", "g", "defs", "path", "line", "polyline", "polygon", "circle", "ellipse",
                             "rect", "text", "tspan", "use", "clippath", "mask", "pattern", "lineargradient",
                             "radialgradient", "stop", "title", "desc", "metadata", "style", "symbol"})
METADATA_NAMESPACES = frozenset({"http://www.w3.org/1999/02/22-rdf-syntax-ns#",
                               "http://purl.org/dc/elements/1.1/", "http://creativecommons.org/ns#"})


def validate_static_assessment_svg(content: bytes) -> None:
    if not content or len(content) > MAX_SVG_BYTES:
        raise ValueError("Assessment SVG exceeds the closed byte limit")
    text = content.decode("utf-8", errors="strict")
    parsing_text, declarations = STATIC_DOCTYPE.subn("", text)
    if declarations > 1 or re.search(r"<!\s*(?:DOCTYPE|ENTITY)\b", parsing_text, re.IGNORECASE):
        raise ValueError("Assessment SVG has an unsupported DTD or entity declaration")
    if re.search(r"<\?(?!xml\s)", parsing_text, re.IGNORECASE):
        raise ValueError("Assessment SVG processing instructions are forbidden")
    try:
        root = ET.fromstring(parsing_text)
    except ET.ParseError as error:
        raise ValueError("Assessment SVG is not well-formed XML") from error
    if root.tag != "{" + SVG_NAMESPACE + "}svg":
        raise ValueError("Assessment material is not an SVG document")

    def css(value: str) -> None:
        if "\\" in value or "@" in value or re.search(r"(?:expression|javascript|data|behavior)\s*:", value, re.IGNORECASE):
            raise ValueError("Assessment SVG contains active or escaped CSS")
        for match in URL.finditer(value):
            if not FRAGMENT.fullmatch(match.group(1).strip().strip("\"'")):
                raise ValueError("Assessment SVG has an external CSS resource")
        without_urls = URL.sub("", value)
        if re.search(r"\b(?!rgba?\b|hsla?\b)[A-Za-z_-][A-Za-z0-9_-]*\s*\(", without_urls, re.IGNORECASE):
            raise ValueError("Assessment SVG contains an unsupported CSS function")

    pending = [(root, 0, False)]
    count = 0
    while pending:
        node, depth, in_metadata = pending.pop()
        count += 1
        if count > 100000 or depth > 128:
            raise ValueError("Assessment SVG exceeds the closed tree limit")
        local = node.tag.rsplit("}", 1)[-1].lower()
        namespace = node.tag[1:].split("}", 1)[0] if node.tag.startswith("{") else ""
        if namespace == SVG_NAMESPACE:
            if local not in STATIC_ELEMENTS:
                raise ValueError("Assessment SVG contains a non-static element")
        elif not in_metadata or namespace not in METADATA_NAMESPACES:
            raise ValueError("Assessment SVG has a foreign element outside permitted metadata")
        for name, value in node.attrib.items():
            attribute = name.rsplit("}", 1)[-1].lower()
            if "\\" in value or attribute.startswith("on") or name == "{http://www.w3.org/XML/1998/namespace}base":
                raise ValueError("Assessment SVG contains an event or base URL")
            if attribute in {"href", "src"} and not FRAGMENT.fullmatch(value):
                raise ValueError("Assessment SVG contains an external reference")
            if attribute == "style" or "url" in value.lower():
                css(value)
        if local == "style":
            css("".join(node.itertext()))
        pending.extend((child, depth + 1, in_metadata or namespace == SVG_NAMESPACE and local == "metadata") for child in node)
