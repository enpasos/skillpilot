package com.skillpilot.backend.completion;

import java.time.Instant;
import java.util.Objects;
import java.util.function.Supplier;

/** Created only after a transport has authenticated and locked its session. */
public record CompletionCallContext(String provider, String sessionBinding, Instant expiresAt,
                                    boolean supported) {
    private static final ThreadLocal<CompletionCallContext> CURRENT = new ThreadLocal<>();

    public static CompletionCallContext current() {
        return CURRENT.get();
    }

    public static <T> T with(CompletionCallContext context, Supplier<T> operation) {
        Objects.requireNonNull(context);
        CompletionCallContext previous = CURRENT.get();
        if (previous != null && (!previous.provider().equals(context.provider())
                || !previous.sessionBinding().equals(context.sessionBinding()))) {
            throw new IllegalStateException("Completion requests cannot change session ownership");
        }
        CURRENT.set(context);
        try {
            return operation.get();
        } finally {
            if (previous == null) CURRENT.remove(); else CURRENT.set(previous);
        }
    }
}
