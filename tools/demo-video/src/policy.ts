export const AI_VOICE_DISCLOSURE =
  "The narration in this video is AI-generated and is not a human voice.";

export const AI_VOICE_DISCLOSURE_DE =
  "Die Sprecherstimme in diesem Video ist KI-generiert und keine menschliche Stimme.";

export const AI_VOICE_VISUAL_DISCLOSURE_DE = "KI-generierte Sprecherstimme";
export const AI_VOICE_VISUAL_DISCLOSURE_EN = "AI-generated voice";
export type VoiceDisclosureMode = "spoken-and-visual" | "visual-only";

/** Omitting the new mode must never silently remove the historic spoken notice. */
export function resolveVoiceDisclosureMode(
  mode: VoiceDisclosureMode = "spoken-and-visual",
  visualDisclosure?: string,
): VoiceDisclosureMode {
  if (mode !== "spoken-and-visual" && mode !== "visual-only") {
    throw new Error("Invalid AI voice disclosureMode");
  }
  if (mode === "visual-only" && visualDisclosure !== AI_VOICE_VISUAL_DISCLOSURE_DE && visualDisclosure !== AI_VOICE_VISUAL_DISCLOSURE_EN) {
    throw new Error("visual-only requires the exact visualDisclosure: KI-generierte Sprecherstimme or AI-generated voice");
  }
  return mode;
}

export function assertNoSpokenDisclosure(texts: readonly string[]): void {
  const labels = [AI_VOICE_DISCLOSURE, AI_VOICE_DISCLOSURE_DE, AI_VOICE_VISUAL_DISCLOSURE_DE, AI_VOICE_VISUAL_DISCLOSURE_EN];
  if (texts.some((text) => labels.some((label) => text.toLowerCase().includes(label.toLowerCase())))) {
    throw new Error("visual-only narration must not speak the AI voice disclosure");
  }
}
