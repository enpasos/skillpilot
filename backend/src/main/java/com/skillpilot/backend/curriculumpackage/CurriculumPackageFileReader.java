package com.skillpilot.backend.curriculumpackage;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.ByteBuffer;
import java.nio.channels.SeekableByteChannel;
import java.nio.file.DirectoryStream;
import java.nio.file.Files;
import java.nio.file.LinkOption;
import java.nio.file.OpenOption;
import java.nio.file.Path;
import java.nio.file.SecureDirectoryStream;
import java.nio.file.StandardOpenOption;
import java.nio.file.attribute.BasicFileAttributeView;
import java.nio.file.attribute.BasicFileAttributes;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.regex.Pattern;

/**
 * Central fail-closed reader for package-store control files and package artifacts.
 * Production objects are expected to be atomically promoted and non-writable by
 * the backend identity; every inventoried file is nevertheless rehashed on load.
 */
public final class CurriculumPackageFileReader {

    static final long MAX_CONTROL_BYTES = 64L * 1024L * 1024L;
    private static final int BUFFER_BYTES = 64 * 1024;
    private static final Pattern RELATIVE_PATH = Pattern.compile(
            "^[A-Za-z0-9._-]+(?:/[A-Za-z0-9._-]+)*$");
    private static final Set<OpenOption> READ_NOFOLLOW = Set.of(
            StandardOpenOption.READ,
            LinkOption.NOFOLLOW_LINKS);

    public byte[] readStoreControlFile(Path storeRoot, String relativePath, long maxBytes) {
        return readBounded(storeRoot, relativePath, maxBytes, null, null, "store control file");
    }

    public byte[] readVerifiedArtifact(
            InstalledCurriculumPackage installedPackage,
            String relativePath,
            long expectedBytes,
            String expectedSha256,
            long maxBytes) {
        return readBounded(
                installedPackage.packageRoot(),
                relativePath,
                maxBytes,
                expectedBytes,
                expectedSha256,
                "package artifact");
    }

    public void verifyArtifact(
            InstalledCurriculumPackage installedPackage,
            String relativePath,
            long expectedBytes,
            String expectedSha256) {
        String actualSha256 = withSecureFile(
                installedPackage.packageRoot(),
                relativePath,
                "package artifact",
                (channel, before) -> {
                    if (before.size() != expectedBytes) {
                        throw failure("Package artifact byte length drift for " + relativePath);
                    }
                    return digestChannel(channel);
                });
        if (!actualSha256.equals(expectedSha256)) {
            throw failure("Package artifact SHA-256 drift for " + relativePath);
        }
    }

    public static String sha256(byte[] bytes) {
        MessageDigest digest = sha256Digest();
        digest.update(bytes);
        return HexFormat.of().formatHex(digest.digest());
    }

    static void validateRelativePath(String relativePath, String description) {
        if (relativePath == null
                || relativePath.isBlank()
                || relativePath.length() > 512
                || relativePath.startsWith("/")
                || relativePath.contains("\\")
                || relativePath.contains("//")
                || !RELATIVE_PATH.matcher(relativePath).matches()) {
            throw failure(description + " is not a safe relative path: " + relativePath);
        }
        for (String segment : relativePath.split("/")) {
            if (segment.equals(".") || segment.equals("..")) {
                throw failure(description + " contains a traversal segment: " + relativePath);
            }
        }
    }

    private byte[] readBounded(
            Path rootCandidate,
            String relativePath,
            long maxBytes,
            Long expectedBytes,
            String expectedSha256,
            String description) {
        if (maxBytes < 0) {
            throw new IllegalArgumentException("maxBytes must be non-negative");
        }
        byte[] bytes = withSecureFile(rootCandidate, relativePath, description, (channel, before) -> {
            if (before.size() > maxBytes) {
                throw failure(description + " exceeds byte limit: " + relativePath);
            }
            if (expectedBytes != null && before.size() != expectedBytes) {
                throw failure(description + " byte length drift for " + relativePath);
            }
            ByteArrayOutputStream output = new ByteArrayOutputStream((int) Math.min(before.size(), 1024 * 1024));
            ByteBuffer buffer = ByteBuffer.allocate(BUFFER_BYTES);
            long total = 0;
            int consecutiveZeroReads = 0;
            while (true) {
                int read = channel.read(buffer);
                if (read < 0) {
                    break;
                }
                if (read == 0) {
                    consecutiveZeroReads += 1;
                    if (consecutiveZeroReads > 16) {
                        throw new IOException("Repeated zero-byte reads from regular file");
                    }
                    Thread.onSpinWait();
                    continue;
                }
                consecutiveZeroReads = 0;
                buffer.flip();
                int count = buffer.remaining();
                total += count;
                if (total > maxBytes) {
                    throw failure(description + " grew beyond byte limit while reading: " + relativePath);
                }
                output.write(buffer.array(), buffer.arrayOffset() + buffer.position(), count);
                buffer.clear();
            }
            return output.toByteArray();
        });
        if (expectedBytes != null && bytes.length != expectedBytes) {
            throw failure(description + " byte length changed while reading: " + relativePath);
        }
        if (expectedSha256 != null && !sha256(bytes).equals(expectedSha256)) {
            throw failure(description + " SHA-256 drift for " + relativePath);
        }
        return bytes;
    }

    private static Path checkedRoot(Path candidate, String description) {
        if (candidate == null) {
            throw failure(description + " is not configured");
        }
        Path root = candidate.toAbsolutePath().normalize();
        Path cursor = root.getRoot();
        if (cursor == null) {
            throw failure(description + " must be absolute: " + root);
        }
        for (Path segment : root) {
            cursor = cursor.resolve(segment);
            if (Files.isSymbolicLink(cursor)) {
                throw failure(description + " traverses a symbolic link: " + cursor);
            }
        }
        if (!Files.isDirectory(root, LinkOption.NOFOLLOW_LINKS)) {
            throw failure(description + " must be a real directory: " + root);
        }
        return root;
    }

    private static <T> T withSecureFile(
            Path rootCandidate,
            String relativePath,
            String description,
            SecureFileAction<T> action) {
        Path root = checkedRoot(rootCandidate, description + " root");
        validateRelativePath(relativePath, description + " path");
        List<Path> segments = new ArrayList<>();
        Path.of(relativePath).forEach(segments::add);
        List<DirectoryStream<Path>> openedStreams = new ArrayList<>();
        try {
            Path filesystemRoot = root.getRoot();
            if (filesystemRoot == null) {
                throw failure("Cannot anchor secure traversal for " + root);
            }
            DirectoryStream<Path> filesystemRootStream = Files.newDirectoryStream(filesystemRoot);
            openedStreams.add(filesystemRootStream);
            if (!(filesystemRootStream instanceof SecureDirectoryStream<?>)) {
                throw failure("Filesystem does not support secure traversal from " + filesystemRoot);
            }
            @SuppressWarnings("unchecked")
            SecureDirectoryStream<Path> current = (SecureDirectoryStream<Path>) filesystemRootStream;
            for (Path rootSegment : root) {
                DirectoryStream<Path> next = current.newDirectoryStream(
                        rootSegment,
                        LinkOption.NOFOLLOW_LINKS);
                openedStreams.add(next);
                if (!(next instanceof SecureDirectoryStream<?>)) {
                    throw failure("Filesystem lost secure traversal support for " + root);
                }
                @SuppressWarnings("unchecked")
                SecureDirectoryStream<Path> secureNext = (SecureDirectoryStream<Path>) next;
                current = secureNext;
            }
            for (int index = 0; index < segments.size() - 1; index += 1) {
                DirectoryStream<Path> next = current.newDirectoryStream(
                        segments.get(index),
                        LinkOption.NOFOLLOW_LINKS);
                openedStreams.add(next);
                if (!(next instanceof SecureDirectoryStream<?>)) {
                    throw failure("Filesystem lost secure traversal support for " + relativePath);
                }
                @SuppressWarnings("unchecked")
                SecureDirectoryStream<Path> secureNext = (SecureDirectoryStream<Path>) next;
                current = secureNext;
            }
            Path fileName = segments.get(segments.size() - 1);
            BasicFileAttributeView attributeView = current.getFileAttributeView(
                    fileName,
                    BasicFileAttributeView.class,
                    LinkOption.NOFOLLOW_LINKS);
            if (attributeView == null) {
                throw failure("Filesystem cannot bind file attributes securely for " + relativePath);
            }
            FileIdentity before = identity(attributeView, description, relativePath);
            T result;
            try (SeekableByteChannel channel = current.newByteChannel(fileName, READ_NOFOLLOW)) {
                result = action.apply(channel, before);
            }
            FileIdentity after = identity(attributeView, description, relativePath);
            if (before.size() != after.size()
                    || before.lastModifiedMillis() != after.lastModifiedMillis()
                    || (before.fileKey() != null && !Objects.equals(before.fileKey(), after.fileKey()))) {
                throw failure(description + " changed while being read: " + relativePath);
            }
            return result;
        } catch (IOException e) {
            throw failure("Cannot securely read " + description + " " + relativePath, e);
        } finally {
            for (int index = openedStreams.size() - 1; index >= 0; index -= 1) {
                try {
                    openedStreams.get(index).close();
                } catch (IOException ignored) {
                    // The read result is already bound to file identity and content hash.
                }
            }
        }
    }

    private static FileIdentity identity(
            BasicFileAttributeView attributeView,
            String description,
            String relativePath) throws IOException {
        BasicFileAttributes attributes = attributeView.readAttributes();
        if (!attributes.isRegularFile() || attributes.isSymbolicLink()) {
            throw failure(description + " must remain a regular non-symlink file: " + relativePath);
        }
        return new FileIdentity(attributes.fileKey(), attributes.size(), attributes.lastModifiedTime().toMillis());
    }

    private static String digestChannel(SeekableByteChannel channel) throws IOException {
        MessageDigest digest = sha256Digest();
        ByteBuffer buffer = ByteBuffer.allocate(BUFFER_BYTES);
        int consecutiveZeroReads = 0;
        while (true) {
            int read = channel.read(buffer);
            if (read < 0) {
                break;
            }
            if (read == 0) {
                consecutiveZeroReads += 1;
                if (consecutiveZeroReads > 16) {
                    throw new IOException("Repeated zero-byte reads from regular file");
                }
                Thread.onSpinWait();
                continue;
            }
            consecutiveZeroReads = 0;
            buffer.flip();
            digest.update(buffer);
            buffer.clear();
        }
        return HexFormat.of().formatHex(digest.digest());
    }

    private static MessageDigest sha256Digest() {
        try {
            return MessageDigest.getInstance("SHA-256");
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 is unavailable", e);
        }
    }

    private static CurriculumPackageException failure(String message) {
        return new CurriculumPackageException(message);
    }

    private static CurriculumPackageException failure(String message, Throwable cause) {
        return new CurriculumPackageException(message, cause);
    }

    private record FileIdentity(Object fileKey, long size, long lastModifiedMillis) {
    }

    @FunctionalInterface
    private interface SecureFileAction<T> {
        T apply(SeekableByteChannel channel, FileIdentity identity) throws IOException;
    }
}
