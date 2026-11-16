package com.skillpilot.backend.curriculumpackage;

import java.io.StringReader;
import java.nio.ByteBuffer;
import java.nio.charset.CodingErrorAction;
import java.nio.charset.StandardCharsets;
import java.util.ArrayDeque;
import java.util.Locale;
import java.util.Set;
import java.util.regex.Pattern;
import javax.xml.XMLConstants;
import javax.xml.parsers.DocumentBuilderFactory;
import org.w3c.dom.Element;
import org.w3c.dom.Node;
import org.xml.sax.InputSource;

/** Validates a static assessment stimulus without rewriting its delivered bytes or resolving URLs. */
final class StaticAssessmentSvg {
    static final long MAX_BYTES = 4L * 1024L * 1024L;
    private static final String SVG = "http://www.w3.org/2000/svg";
    private static final Pattern DOCTYPE = Pattern.compile(
            "<!DOCTYPE\\s+svg\\s+PUBLIC\\s+['\"]-//W3C//DTD SVG 1\\.1//EN['\"]\\s+"
            + "['\"]http://www\\.w3\\.org/Graphics/SVG/1\\.1/DTD/svg11\\.dtd['\"]\\s*>");
    private static final Pattern DECLARATION = Pattern.compile("<!\\s*(?:DOCTYPE|ENTITY)\\b", Pattern.CASE_INSENSITIVE);
    private static final Pattern INSTRUCTION = Pattern.compile("<\\?(?!xml\\s)", Pattern.CASE_INSENSITIVE);
    private static final Pattern FRAGMENT = Pattern.compile("#[A-Za-z_][A-Za-z0-9_.:-]*");
    private static final Pattern URL = Pattern.compile("url\\s*\\((.*?)\\)", Pattern.CASE_INSENSITIVE | Pattern.DOTALL);
    private static final Pattern ACTIVE_CSS = Pattern.compile("(?:expression|javascript|data|behavior)\\s*:", Pattern.CASE_INSENSITIVE);
    private static final Pattern CSS_FUNCTION = Pattern.compile(
            "\\b(?!rgba?\\b|hsla?\\b)[A-Za-z_-][A-Za-z0-9_-]*\\s*\\(", Pattern.CASE_INSENSITIVE);
    private static final Set<String> BLOCKED = Set.of("script", "foreignobject", "iframe", "object", "embed",
            "audio", "video", "animate", "animatetransform", "animatemotion", "set");
    private static final Set<String> STATIC_ELEMENTS = Set.of("svg", "g", "defs", "path", "rect", "circle",
            "ellipse", "line", "polyline", "polygon", "text", "tspan", "textpath", "use", "clippath",
            "mask", "pattern", "lineargradient", "radialgradient", "stop", "marker", "symbol", "title",
            "desc", "style", "metadata", "image");
    private static final Set<String> METADATA_NAMESPACES = Set.of(
            "http://www.w3.org/1999/02/22-rdf-syntax-ns#", "http://purl.org/dc/elements/1.1/",
            "http://creativecommons.org/ns#");

    private StaticAssessmentSvg() { }

    static void validate(byte[] bytes) {
        try {
            if (bytes.length == 0 || bytes.length > MAX_BYTES) fail("byte limit");
            String text = StandardCharsets.UTF_8.newDecoder()
                    .onMalformedInput(CodingErrorAction.REPORT).onUnmappableCharacter(CodingErrorAction.REPORT)
                    .decode(ByteBuffer.wrap(bytes)).toString();
            if (DOCTYPE.matcher(text).results().count() > 1) fail("duplicate DTD");
            String parseText = DOCTYPE.matcher(text).replaceAll("");
            if (DECLARATION.matcher(parseText).find() || INSTRUCTION.matcher(parseText).find()) {
                fail("unsupported DTD, entity or processing instruction");
            }
            DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
            factory.setNamespaceAware(true);
            factory.setXIncludeAware(false);
            factory.setExpandEntityReferences(false);
            factory.setFeature(XMLConstants.FEATURE_SECURE_PROCESSING, true);
            factory.setFeature("http://apache.org/xml/features/disallow-doctype-decl", true);
            factory.setFeature("http://xml.org/sax/features/external-general-entities", false);
            factory.setFeature("http://xml.org/sax/features/external-parameter-entities", false);
            factory.setAttribute(XMLConstants.ACCESS_EXTERNAL_DTD, "");
            factory.setAttribute(XMLConstants.ACCESS_EXTERNAL_SCHEMA, "");
            var builder = factory.newDocumentBuilder();
            builder.setEntityResolver((publicId, systemId) -> { throw new org.xml.sax.SAXException("External entity forbidden"); });
            Element root = builder.parse(new InputSource(new StringReader(parseText))).getDocumentElement();
            if (!SVG.equals(root.getNamespaceURI()) || !"svg".equals(root.getLocalName())) fail("non-SVG root");
            record Visit(Element element, int depth, boolean inMetadata) { }
            var pending = new ArrayDeque<Visit>();
            pending.push(new Visit(root, 0, false));
            int count = 0;
            while (!pending.isEmpty()) {
                Visit visit = pending.pop();
                if (++count > 100_000 || visit.depth() > 128) fail("tree limit");
                Element node = visit.element();
                String name = node.getLocalName().toLowerCase(Locale.ROOT);
                if (BLOCKED.contains(name)) fail("active element");
                if (SVG.equals(node.getNamespaceURI())) {
                    if (!STATIC_ELEMENTS.contains(name)) fail("unsupported SVG element");
                } else if (!visit.inMetadata() || !METADATA_NAMESPACES.contains(node.getNamespaceURI())) {
                    fail("unsupported element namespace");
                }
                var attributes = node.getAttributes();
                for (int i = 0; i < attributes.getLength(); i++) {
                    Node attribute = attributes.item(i);
                    String local = attribute.getLocalName().toLowerCase(Locale.ROOT);
                    String value = attribute.getNodeValue();
                    if (value.contains("\\")) fail("escaped attribute value");
                    if (local.startsWith("on") || ("base".equals(local)
                            && XMLConstants.XML_NS_URI.equals(attribute.getNamespaceURI()))) fail("event or base URL");
                    if (("href".equals(local) || "src".equals(local)) && !FRAGMENT.matcher(value).matches()) {
                        fail("external reference");
                    }
                    if ("style".equals(local) || value.toLowerCase(Locale.ROOT).contains("url")) validateCss(value);
                }
                if ("style".equals(name)) validateCss(node.getTextContent());
                for (Node child = node.getFirstChild(); child != null; child = child.getNextSibling()) {
                    if (child instanceof Element element) pending.push(new Visit(element, visit.depth() + 1,
                            visit.inMetadata() || (SVG.equals(node.getNamespaceURI()) && "metadata".equals(name))));
                }
            }
        } catch (CurriculumPackageException error) {
            throw error;
        } catch (Exception error) {
            throw new CurriculumPackageException("Invalid static assessment SVG", error);
        }
    }

    private static void validateCss(String value) {
        if (value.contains("\\") || value.contains("@") || ACTIVE_CSS.matcher(value).find()) fail("active CSS");
        var urls = URL.matcher(value);
        while (urls.find()) {
            String target = urls.group(1).strip();
            if (target.length() >= 2 && ((target.startsWith("\"") && target.endsWith("\""))
                    || (target.startsWith("'") && target.endsWith("'")))) target = target.substring(1, target.length() - 1);
            if (!FRAGMENT.matcher(target).matches()) fail("external CSS reference");
        }
        if (CSS_FUNCTION.matcher(URL.matcher(value).replaceAll("")).find()) fail("unsupported CSS function");
    }

    private static void fail(String detail) {
        throw new CurriculumPackageException("Invalid static assessment SVG: " + detail);
    }
}
