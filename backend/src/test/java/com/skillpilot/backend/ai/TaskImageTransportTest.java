package com.skillpilot.backend.ai;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.function.UnaryOperator;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.NullAndEmptySource;
import org.junit.jupiter.params.provider.ValueSource;

class TaskImageTransportTest {

    @ParameterizedTest
    @NullAndEmptySource
    @ValueSource(strings = {" ", "\n"})
    void emptyContentIsPreserved(String content) {
        assertThat(TaskImageTransport.normalize("task", content, UnaryOperator.identity())).isEqualTo(content);
        assertThat(TaskImageTransport.readHeader(content).body()).isEqualTo(content);
        assertThat(TaskImageTransport.readHeader(content).hasImage()).isFalse();
    }

    @Test
    void noImageKeepsTheBodyNormalizerAndDoesNotPackageAnExam() {
        String body = "  Task $x$\n\nContinue.  ";
        assertThat(TaskImageTransport.normalize("bc60e300-96be-599a-89b6-8fcca380803d", body,
                value -> value.replace("$x$", "\\(x\\)")))
                .isEqualTo("Task \\(x\\)\nContinue.");
    }

    @Test
    void preservesEveryUniqueUsableImageInFirstAppearanceOrder() {
        String content = "![bad](http://[)\n![one](https://skillpilot.test/ai-assets/a.svg?v=2)\n"
                + "![repeat](/ai-assets/a.svg?v=2)\n![two](/ai-assets/b.png)\nAufgabe / Task.";

        String normalized = TaskImageTransport.normalize("task", content, UnaryOperator.identity());

        assertThat(normalized).isEqualTo("IMAGE_PATH: /ai-assets/a.svg?v=2\n"
                + "IMAGE_PATH: /ai-assets/b.png\n\nAufgabe / Task.");
        assertThat(TaskImageTransport.readHeader(normalized))
                .isEqualTo(new TaskImageTransport.VisibleTask("Aufgabe / Task.", true));
    }

    @Test
    void oldSingleImageContractIsByteForByteUnchanged() {
        String normalized = TaskImageTransport.normalize("task", "![Given](/assets/exam.png)\n\nTask.",
                UnaryOperator.identity());
        assertThat(normalized).isEqualTo("IMAGE_PATH: /assets/exam.png\n\nTask.");
        assertThat(TaskImageTransport.normalize("task", normalized, UnaryOperator.identity())).isEqualTo(normalized);
        assertThat(TaskImageTransport.readHeader(normalized).body()).isEqualTo("Task.");
    }

    @Test
    void unusableNewlineReferencesDoNotInjectHeaderLinesOrHideALaterValidImage() {
        String content = "![bad](/bad\npath)![encoded](https://skillpilot.test/a%0Apath)![ok](/ok.png)Task.";
        assertThat(TaskImageTransport.normalize("task", content, UnaryOperator.identity()))
                .isEqualTo("IMAGE_PATH: /ok.png\n\nTask.");
    }

    @ParameterizedTest
    @ValueSource(strings = {"bc60e300-96be-599a-89b6-8fcca380803d", "68a262fc-43f4-5d23-af30-853870bfd45b"})
    void bothExistingExamWrappersKeepEveryImageAndTheUnchangedPackaging(String id) {
        String normalized = TaskImageTransport.normalize(id,
                "![one](/a.svg)\n![two](/b.svg)\nTask.", UnaryOperator.identity());
        assertThat(normalized).isEqualTo("IMAGE_PATH: /a.svg\nIMAGE_PATH: /b.svg\n\n"
                + "**Prüfungsmodus – Mathematik LK (Analysis)**\n\n"
                + "Hinweis: Du bearbeitest jetzt eine prüfungsnahe Abituraufgabe.\n\n"
                + "Arbeite selbstständig, strukturiert und rechne sauber.\n"
                + "Ich gebe keine Hinweise während der Bearbeitung.\n\n---\n\nTask.\n\n---\n\n"
                + "Bitte reiche deine vollständige Lösung in einer Nachricht ein (Text reicht, Skizze gern beschrieben).\n"
                + "Wenn du abbrechen möchtest, sag einfach Bescheid.");
        assertThat(TaskImageTransport.readHeader(normalized).body()).doesNotContain("IMAGE_PATH:");
        assertThat(TaskImageTransport.normalize(id, normalized, UnaryOperator.identity())).isEqualTo(normalized);
    }

    @ParameterizedTest
    @ValueSource(strings = {"IMAGE_PATH: /a\nIMAGE_PATH: /b\n\nBody\nNext.",
            "IMAGE_PATH: /a\r\nIMAGE_PATH: /b\r\n\r\nBody\nNext.",
            "IMAGE_PATH: /a\nBody\nNext."})
    void readerConsumesTheWholeLeadingHeaderOnly(String task) {
        assertThat(TaskImageTransport.readHeader(task))
                .isEqualTo(new TaskImageTransport.VisibleTask("Body\nNext.", true));
        assertThat(TaskImageTransport.readHeader("Body\nIMAGE_PATH: example"))
                .isEqualTo(new TaskImageTransport.VisibleTask("Body\nIMAGE_PATH: example", false));
    }

    @Test
    void imageOnlyTaskLeavesAnEmptyBody() {
        assertThat(TaskImageTransport.readHeader("IMAGE_PATH: /a\nIMAGE_PATH: /b"))
                .isEqualTo(new TaskImageTransport.VisibleTask("", true));
    }

    @Test
    void existingHeaderAndLaterInlineImagesMergeWithoutLosingTheBodyOrDuplicatingPaths() {
        String task = "IMAGE_PATH: /a.svg\n\nFirst paragraph.\n\n![repeat](/a.svg)![new](/b.png)Last paragraph.";
        assertThat(TaskImageTransport.normalize("task", task, UnaryOperator.identity()))
                .isEqualTo("IMAGE_PATH: /a.svg\nIMAGE_PATH: /b.png\n\nFirst paragraph.\n\nLast paragraph.");
    }
}
