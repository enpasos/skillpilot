package com.skillpilot.backend.curriculumpackage;
import java.nio.file.*; import java.security.*; import java.util.*;
public final class SvgCorpusProbe { public static void main(String[] args) throws Exception {
 for(String arg:args){byte[] bytes=Files.readAllBytes(Path.of(arg)); byte[] original=bytes.clone(); StaticAssessmentSvg.validate(bytes);if(!Arrays.equals(original,bytes))throw new AssertionError("rewritten");System.out.println(arg+" ACCEPTED "+HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(bytes)));}
}}
