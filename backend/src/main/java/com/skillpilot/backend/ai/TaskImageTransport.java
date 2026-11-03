package com.skillpilot.backend.ai;

import java.net.URI;
import java.util.LinkedHashSet;
import java.util.function.UnaryOperator;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/** Preserves task images in the existing string transport and consumes its leading header. */
public final class TaskImageTransport {

    private static final String PREFIX = "IMAGE_PATH: ";
    private static final Pattern MARKDOWN_IMAGE = Pattern.compile("!\\[[^\\]]*\\]\\(([^)]+)\\)");
    private static final Pattern HEADER = Pattern.compile(
            "\\A(?:IMAGE_PATH: [^\\r\\n]+(?:\\r?\\n|\\z))+(?:\\r?\\n)?");

    private TaskImageTransport() {
    }

    public static String normalize(String goalId, String content, UnaryOperator<String> normalizeBody) {
        if (content == null || content.isBlank()) {
            return content;
        }
        var paths = new LinkedHashSet<String>();
        Matcher existingHeader = HEADER.matcher(content);
        boolean alreadyTransported = existingHeader.find();
        if (alreadyTransported) {
            for (String line : content.substring(0, existingHeader.end()).split("\\r?\\n")) {
                if (line.startsWith(PREFIX)) {
                    addPath(paths, line.substring(PREFIX.length()));
                }
            }
            content = content.substring(existingHeader.end());
        }
        Matcher matcher = MARKDOWN_IMAGE.matcher(content);
        StringBuffer result = new StringBuffer();
        while (matcher.find()) {
            addPath(paths, matcher.group(1));
            matcher.appendReplacement(result, "");
        }
        matcher.appendTail(result);
        String body = normalizeBody.apply((alreadyTransported ? result.toString()
                : result.toString().replaceAll("(?m)^\\s*$\\n?", "")).trim());
        if (paths.isEmpty()) {
            return body;
        }
        String header = String.join("\n", paths.stream().map(path -> PREFIX + path).toList()) + "\n\n";
        if (!alreadyTransported && ("bc60e300-96be-599a-89b6-8fcca380803d".equals(goalId)
                || "68a262fc-43f4-5d23-af30-853870bfd45b".equals(goalId))) {
            body = packageExam(body);
        }
        return header + body;
    }

    public static VisibleTask readHeader(String content) {
        if (content == null) {
            return new VisibleTask(null, false);
        }
        Matcher matcher = HEADER.matcher(content);
        return matcher.find()
                ? new VisibleTask(content.substring(matcher.end()), true)
                : new VisibleTask(content, false);
    }

    public record VisibleTask(String body, boolean hasImage) {
    }

    private static void addPath(LinkedHashSet<String> paths, String url) {
        String path = toRelativeAssetPath(url);
        if (path != null && !path.isBlank() && path.indexOf('\r') < 0 && path.indexOf('\n') < 0) {
            paths.add(path);
        }
    }

    private static String toRelativeAssetPath(String url) {
        if (url == null || url.isBlank()) {
            return null;
        }
        String trimmed = url.trim();
        if (trimmed.indexOf('\r') >= 0 || trimmed.indexOf('\n') >= 0) {
            return null;
        }
        if (trimmed.startsWith("/")) {
            return trimmed;
        }
        try {
            URI uri = URI.create(trimmed);
            String path = uri.getPath();
            if (path == null || path.isBlank()) {
                return null;
            }
            return uri.getQuery() == null || uri.getQuery().isBlank()
                    ? path
                    : path + "?" + uri.getQuery();
        } catch (IllegalArgumentException exception) {
            return null;
        }
    }

    private static String packageExam(String body) {
        String safeBody = body == null ? "" : body.trim();
        return "**Prüfungsmodus – Mathematik LK (Analysis)**\n\n"
                + "Hinweis: Du bearbeitest jetzt eine prüfungsnahe Abituraufgabe.\n\n"
                + "Arbeite selbstständig, strukturiert und rechne sauber.\n"
                + "Ich gebe keine Hinweise während der Bearbeitung.\n\n"
                + "---\n\n"
                + safeBody + "\n\n"
                + "---\n\n"
                + "Bitte reiche deine vollständige Lösung in einer Nachricht ein (Text reicht, Skizze gern beschrieben).\n"
                + "Wenn du abbrechen möchtest, sag einfach Bescheid.";
    }
}
