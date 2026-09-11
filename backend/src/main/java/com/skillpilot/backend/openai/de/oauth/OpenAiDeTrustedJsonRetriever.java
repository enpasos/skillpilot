package com.skillpilot.backend.openai.de.oauth;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.net.InetAddress;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.ByteBuffer;
import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.CompletionStage;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.Flow;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;

/** Only deployment-pinned ChatGPT documents, never a URI supplied in an assertion. */
final class OpenAiDeTrustedJsonRetriever implements OpenAiDeCimdMetadataValidator.MetadataRetriever {
    private final HttpClient client = HttpClient.newBuilder()
            .connectTimeout(OpenAiDeCimdMetadataValidator.CONNECT_TIMEOUT)
            .followRedirects(HttpClient.Redirect.NEVER).build();

    static void requireTrustedUri(URI uri) {
        if (!"https".equals(uri.getScheme()) || !"chatgpt.com".equals(uri.getHost())
                || (uri.getPort() != -1 && uri.getPort() != 443)
                || uri.getRawUserInfo() != null || uri.getRawQuery() != null || uri.getRawFragment() != null
                || uri.getRawPath() == null || !uri.getRawPath().startsWith("/oauth/")
                || !uri.normalize().equals(uri)) {
            throw new IllegalStateException("OpenAI client documents must use an exact HTTPS chatgpt.com/oauth/ pin.");
        }
    }

    @Override
    public OpenAiDeCimdMetadataValidator.MetadataResponse retrieve(URI uri)
            throws IOException, InterruptedException {
        requireTrustedUri(uri);
        // Fixed official host + TLS hostname verification prevent arbitrary-host SSRF;
        // additionally refuse DNS answers pointing into local/non-public networks.
        for (InetAddress address : InetAddress.getAllByName(uri.getHost())) {
            if (!isPublicAddress(address)) {
                throw new IOException("OpenAI client document DNS resolved to a non-public address.");
            }
        }
        HttpRequest request = HttpRequest.newBuilder(uri)
                .timeout(OpenAiDeCimdMetadataValidator.REQUEST_TIMEOUT)
                .header("Accept", "application/json").GET().build();
        var pending = client.sendAsync(request, ignored -> new BoundedBodySubscriber());
        try {
            HttpResponse<byte[]> response = pending.get(
                    OpenAiDeCimdMetadataValidator.REQUEST_TIMEOUT.toMillis(), TimeUnit.MILLISECONDS);
            return new OpenAiDeCimdMetadataValidator.MetadataResponse(uri, response.uri(),
                    response.statusCode(), response.headers().firstValue("Content-Type").orElse(""),
                    response.body());
        } catch (ExecutionException exception) {
            pending.cancel(true);
            throw new IOException("OpenAI client document retrieval failed or timed out.", exception.getCause());
        } catch (TimeoutException exception) {
            pending.cancel(true);
            throw new IOException("OpenAI client document retrieval timed out.", exception);
        } catch (InterruptedException exception) {
            pending.cancel(true);
            throw exception;
        }
    }

    static boolean isPublicAddress(InetAddress address) {
        if (address.isAnyLocalAddress() || address.isLoopbackAddress() || address.isLinkLocalAddress()
                || address.isSiteLocalAddress() || address.isMulticastAddress()) {
            return false;
        }
        byte[] bytes = address.getAddress();
        if (bytes.length == 4) {
            int first = bytes[0] & 255;
            int second = bytes[1] & 255;
            return first != 0 && first < 224 && !(first == 100 && second >= 64 && second <= 127)
                    && !(first == 198 && (second == 18 || second == 19));
        }
        // IPv6 global unicast only; denies ULA, mapped private, discard-only and special ranges.
        return (bytes[0] & 0xe0) == 0x20;
    }

    private static final class BoundedBodySubscriber implements HttpResponse.BodySubscriber<byte[]> {
        private final CompletableFuture<byte[]> result = new CompletableFuture<>();
        private final ByteArrayOutputStream bytes = new ByteArrayOutputStream();
        private Flow.Subscription subscription;

        @Override public CompletionStage<byte[]> getBody() { return result; }
        @Override public void onSubscribe(Flow.Subscription subscription) {
            this.subscription = subscription;
            subscription.request(1);
        }
        @Override public void onNext(List<ByteBuffer> buffers) {
            for (ByteBuffer buffer : buffers) {
                if (buffer.remaining() > OpenAiDeCimdMetadataValidator.MAX_DOCUMENT_BYTES - bytes.size()) {
                    subscription.cancel();
                    result.completeExceptionally(new IOException("OpenAI client document exceeds the size limit."));
                    return;
                }
                byte[] chunk = new byte[buffer.remaining()];
                buffer.get(chunk);
                bytes.writeBytes(chunk);
            }
            subscription.request(1);
        }
        @Override public void onError(Throwable throwable) { result.completeExceptionally(throwable); }
        @Override public void onComplete() { result.complete(bytes.toByteArray()); }
    }
}
