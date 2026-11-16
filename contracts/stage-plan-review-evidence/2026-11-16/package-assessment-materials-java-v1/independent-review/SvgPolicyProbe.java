package com.skillpilot.backend.curriculumpackage;
import java.nio.charset.StandardCharsets;
public final class SvgPolicyProbe {
  private static void test(String name,String body) {
    String svg="<svg xmlns=\"http://www.w3.org/2000/svg\">"+body+"</svg>";
    try { StaticAssessmentSvg.validate(svg.getBytes(StandardCharsets.UTF_8)); System.out.println(name+" ACCEPTED"); }
    catch (CurriculumPackageException ex) { System.out.println(name+" REJECTED: "+ex.getMessage()); }
  }
  public static void main(String[] args) {
    test("literal-external-fill", "<rect fill=\"url(https://example.invalid/payload.svg#x)\"/>");
    test("escaped-external-fill", "<rect fill=\"u\\72l(https://example.invalid/payload.svg#x)\"/>");
    test("escaped-external-filter", "<g filter=\"\\75rl(https://example.invalid/payload.svg#x)\"/>");
    test("foreign-xhtml-meta-refresh", "<meta xmlns=\"http://www.w3.org/1999/xhtml\" http-equiv=\"refresh\" content=\"0;url=https://example.invalid/\"/>");
    test("svg-tiny-handler", "<handler type=\"application/ecmascript\" xmlns:ev=\"http://www.w3.org/2001/xml-events\" ev:event=\"load\">alert(1)</handler>");
    test("local-fragment-fill", "<defs><linearGradient id=\"g\"/></defs><rect fill=\"url(#g)\"/>");
  }
}
