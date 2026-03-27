package com.skillpilot.backend.util;

import java.util.Locale;

public final class BundeslandCodeNormalizer {

    private BundeslandCodeNormalizer() {
    }

    public static String normalize(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        String normalized = value.trim().toUpperCase(Locale.ROOT);
        return switch (normalized) {
            case "HE", "HES", "DE-HE", "DE-HES" -> "DE-HE";
            case "BY", "BAY", "DE-BY", "DE-BAY" -> "DE-BY";
            case "BW", "BAW", "DE-BW", "DE-BAW" -> "DE-BW";
            case "BB", "BRA", "DE-BB", "DE-BRA" -> "DE-BB";
            case "BE", "BER", "DE-BE", "DE-BER" -> "DE-BE";
            case "NI", "NDS", "DE-NI", "DE-NDS" -> "DE-NI";
            case "NW", "NRW", "DE-NW", "DE-NRW" -> "DE-NW";
            case "HB", "BRE", "DE-HB", "DE-BRE" -> "DE-HB";
            case "HH", "HAM", "DE-HH", "DE-HAM" -> "DE-HH";
            case "MV", "DE-MV" -> "DE-MV";
            case "RP", "RLP", "DE-RP", "DE-RLP" -> "DE-RP";
            case "SH", "SHL", "DE-SH", "DE-SHL" -> "DE-SH";
            case "SL", "SAR", "DE-SL", "DE-SAR" -> "DE-SL";
            case "SN", "SAX", "DE-SN", "DE-SAX" -> "DE-SN";
            case "ST", "SAN", "DE-ST", "DE-SAN" -> "DE-ST";
            case "TH", "THU", "DE-TH", "DE-THU" -> "DE-TH";
            default -> null;
        };
    }

    public static boolean isStateFilterId(String value) {
        if (value == null || value.length() != 5 || !value.startsWith("DE-")) {
            return false;
        }
        char first = value.charAt(3);
        char second = value.charAt(4);
        return first >= 'A' && first <= 'Z' && second >= 'A' && second <= 'Z';
    }

    public static String displayNameEn(String value) {
        String normalized = normalize(value);
        if (normalized == null) {
            return null;
        }
        return switch (normalized) {
            case "DE-BB" -> "Brandenburg";
            case "DE-BE" -> "Berlin";
            case "DE-BW" -> "Baden-Wuerttemberg";
            case "DE-BY" -> "Bavaria";
            case "DE-HB" -> "Bremen";
            case "DE-HE" -> "Hesse";
            case "DE-HH" -> "Hamburg";
            case "DE-MV" -> "Mecklenburg-Western Pomerania";
            case "DE-NI" -> "Lower Saxony";
            case "DE-NW" -> "North Rhine-Westphalia";
            case "DE-RP" -> "Rhineland-Palatinate";
            case "DE-SH" -> "Schleswig-Holstein";
            case "DE-SL" -> "Saarland";
            case "DE-SN" -> "Saxony";
            case "DE-ST" -> "Saxony-Anhalt";
            case "DE-TH" -> "Thuringia";
            default -> null;
        };
    }

    public static String formatDisplayLabelEn(String value) {
        String normalized = normalize(value);
        if (normalized == null) {
            return null;
        }
        String displayName = displayNameEn(normalized);
        return displayName != null ? displayName + " (" + normalized + ")" : normalized;
    }
}
