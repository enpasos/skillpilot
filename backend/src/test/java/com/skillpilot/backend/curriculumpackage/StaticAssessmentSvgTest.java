package com.skillpilot.backend.curriculumpackage;

import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.stream.Stream;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.MethodSource;

class StaticAssessmentSvgTest {
    private static final String OPEN = "<svg xmlns=\"http://www.w3.org/2000/svg\">";
    private static final String DOCTYPE = "<!DOCTYPE svg PUBLIC \"-//W3C//DTD SVG 1.1//EN\" "
            + "\"http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd\">";

    @Test void acceptsTheActualUnchangedAssessmentStimulusAndLocalReferences() throws Exception {
        Path repo = Path.of("").toAbsolutePath();
        if (!Files.isDirectory(repo.resolve("app"))) repo = repo.getParent();
        byte[] actual = Files.readAllBytes(repo.resolve("app/public/assets/assessment-materials/mathematik/"
                + "sine-cosine-basic-functions-20261115-v1/basic-functions-unlabelled.svg"));
        byte[] original = actual.clone();
        assertThatCode(() -> StaticAssessmentSvg.validate(actual)).doesNotThrowAnyException();
        org.assertj.core.api.Assertions.assertThat(actual).isEqualTo(original);
        validate(DOCTYPE + OPEN + "<defs><path id=\"shape\"/></defs><use href=\"#shape\"/>"
                + "<style>path { fill:rgb(0,0,0); clip-path:url(#shape) }</style></svg>");
    }

    @ParameterizedTest @MethodSource("unsafeDocuments")
    void rejectsActiveOrExternalContent(String source) {
        assertThatThrownBy(() -> validate(source)).isInstanceOf(CurriculumPackageException.class);
    }

    static Stream<String> unsafeDocuments() {
        return Stream.of(
                OPEN + "<script>alert(1)</script></svg>",
                OPEN + "<foreignObject><div>html</div></foreignObject></svg>",
                OPEN + "<path onclick=\"x()\"/></svg>",
                OPEN + "<image href=\"https://example.org/x.svg\"/></svg>",
                OPEN + "<image href=\"data:image/svg+xml;base64,abc\"/></svg>",
                OPEN + "<use href=\"../local.svg#x\"/></svg>",
                OPEN + "<g xml:base=\"https://example.org/\"/></svg>",
                OPEN + "<style>@import 'https://example.org/style.css';</style></svg>",
                OPEN + "<style>path { fill:url(https://example.org/x); }</style></svg>",
                OPEN + "<path style=\"fill:u\\72l(https://example.org/x)\"/></svg>",
                OPEN + "<path fill=\"u\\72l(https://example.org/x)\"/></svg>",
                OPEN + "<path filter=\"u\\72l(https://example.org/x)\"/></svg>",
                OPEN + "<meta xmlns=\"http://www.w3.org/1999/xhtml\" http-equiv=\"refresh\" content=\"0;url=https://example.org\"/></svg>",
                OPEN + "<metadata><meta xmlns=\"http://www.w3.org/1999/xhtml\" http-equiv=\"refresh\" content=\"0;url=https://example.org\"/></metadata></svg>",
                OPEN + "<handler type=\"application/ecmascript\">alert(1)</handler></svg>",
                OPEN + "<animate attributeName=\"href\" to=\"https://example.org/\"/></svg>",
                "<?xml-stylesheet href=\"https://example.org/\"?>" + OPEN + "</svg>",
                "<!DOCTYPE svg [<!ENTITY x SYSTEM 'file:///etc/passwd'>]>" + OPEN + "&x;</svg>",
                "<!DOCTYPE svg SYSTEM 'https://example.org/evil.dtd'>" + OPEN + "</svg>",
                DOCTYPE + DOCTYPE + OPEN + "</svg>",
                "<html/>",
                OPEN + "<g>".repeat(130) + "</g>".repeat(130) + "</svg>");
    }

    @Test void rejectsOversizedAndMalformedUtf8Bytes() {
        assertThatThrownBy(() -> StaticAssessmentSvg.validate(new byte[(int) StaticAssessmentSvg.MAX_BYTES + 1]))
                .isInstanceOf(CurriculumPackageException.class);
        assertThatThrownBy(() -> StaticAssessmentSvg.validate(new byte[] {(byte) 0xc0, (byte) 0x80}))
                .isInstanceOf(CurriculumPackageException.class);
    }

    private static void validate(String source) { StaticAssessmentSvg.validate(source.getBytes(StandardCharsets.UTF_8)); }
}
