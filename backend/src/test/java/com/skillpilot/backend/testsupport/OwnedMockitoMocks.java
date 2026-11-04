package com.skillpilot.backend.testsupport;

import java.util.ArrayList;
import java.util.List;
import org.junit.jupiter.api.extension.AfterEachCallback;
import org.junit.jupiter.api.extension.BeforeEachCallback;
import org.junit.jupiter.api.extension.ExtensionContext;
import org.mockito.Mockito;
import org.mockito.listeners.MockCreationListener;
import org.mockito.mock.MockCreationSettings;

/**
 * Owns mocks created in a plain JUnit test's BeforeEach callbacks and test method.
 * Opt in explicitly: Spring context mocks and class-shared mocks have separate owners.
 * Mockito listeners are thread local; these fixtures create and release mocks on the test thread.
 */
public final class OwnedMockitoMocks implements BeforeEachCallback, AfterEachCallback {
    private static final ExtensionContext.Namespace NAMESPACE =
            ExtensionContext.Namespace.create(OwnedMockitoMocks.class);

    @Override
    public void beforeEach(ExtensionContext context) {
        Scope scope = new Scope();
        Mockito.framework().addListener(scope);
        context.getStore(NAMESPACE).put("scope", scope);
    }

    @Override
    public void afterEach(ExtensionContext context) {
        Scope scope = context.getStore(NAMESPACE).remove("scope", Scope.class);
        if (scope != null) scope.close();
    }

    private static final class Scope implements MockCreationListener {
        private final List<Object> mocks = new ArrayList<>();

        @Override
        public void onMockCreated(Object mock, MockCreationSettings settings) {
            mocks.add(mock);
        }

        void close() {
            Mockito.framework().removeListener(this);
            try {
                mocks.forEach(Mockito.framework()::clearInlineMock);
            } finally {
                mocks.clear();
            }
        }
    }
}
