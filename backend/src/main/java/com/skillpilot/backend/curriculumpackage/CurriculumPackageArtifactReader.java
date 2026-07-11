package com.skillpilot.backend.curriculumpackage;

import java.nio.ByteBuffer;
import java.nio.charset.CharacterCodingException;
import java.nio.charset.CodingErrorAction;
import java.nio.charset.StandardCharsets;
import java.util.Objects;

/**
 * Reads only artifacts already bound to one immutable runtime snapshot and
 * verifies their size, file identity, and SHA-256 on every access.
 */
public final class CurriculumPackageArtifactReader {

    private final CurriculumPackageFileReader fileReader;

    public CurriculumPackageArtifactReader(CurriculumPackageFileReader fileReader) {
        this.fileReader = Objects.requireNonNull(fileReader, "fileReader");
    }

    public byte[] readVerified(
            CurriculumRuntimeSnapshot snapshot,
            CurriculumRuntimeSnapshot.ArtifactKey key,
            long maxBytes) {
        Objects.requireNonNull(snapshot, "snapshot");
        Objects.requireNonNull(key, "key");
        CurriculumRuntimeSnapshot.Artifact artifact = snapshot.artifactsByKey().get(key);
        if (artifact == null) {
            throw new CurriculumPackageException(
                    "Artifact is not part of the active snapshot: " + key.packageId() + "/" + key.relativePath());
        }
        return readVerified(artifact, maxBytes);
    }

    public byte[] readVerified(CurriculumRuntimeSnapshot.Artifact artifact, long maxBytes) {
        Objects.requireNonNull(artifact, "artifact");
        if (maxBytes < 0) {
            throw new IllegalArgumentException("maxBytes must be non-negative");
        }
        if (artifact.bytes() > maxBytes) {
            throw new CurriculumPackageException(
                    "Package artifact exceeds caller byte limit: " + artifact.relativePath());
        }
        return fileReader.readVerifiedArtifact(
                artifact.installedPackage(),
                artifact.relativePath(),
                artifact.bytes(),
                artifact.sha256(),
                maxBytes);
    }

    public String readVerifiedUtf8(
            CurriculumRuntimeSnapshot snapshot,
            CurriculumRuntimeSnapshot.ArtifactKey key,
            long maxBytes) {
        byte[] bytes = readVerified(snapshot, key, maxBytes);
        try {
            return StandardCharsets.UTF_8.newDecoder()
                    .onMalformedInput(CodingErrorAction.REPORT)
                    .onUnmappableCharacter(CodingErrorAction.REPORT)
                    .decode(ByteBuffer.wrap(bytes))
                    .toString();
        } catch (CharacterCodingException e) {
            throw new CurriculumPackageException(
                    "Package artifact is not valid UTF-8: " + key.relativePath(), e);
        }
    }
}
