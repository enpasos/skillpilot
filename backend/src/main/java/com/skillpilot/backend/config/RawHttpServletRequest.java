package com.skillpilot.backend.config;

import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletRequestWrapper;
import jakarta.servlet.http.HttpServletRequest;

/** Resolves the container request beneath framework forwarding wrappers. */
public final class RawHttpServletRequest {

    private static final int MAXIMUM_WRAPPER_DEPTH = 16;

    public static HttpServletRequest unwrap(HttpServletRequest request) {
        ServletRequest current = request;
        for (int depth = 0;
                depth < MAXIMUM_WRAPPER_DEPTH && current instanceof ServletRequestWrapper wrapper;
                depth++) {
            ServletRequest next = wrapper.getRequest();
            if (next == current) {
                return null;
            }
            current = next;
        }
        if (current instanceof ServletRequestWrapper) {
            return null;
        }
        return current instanceof HttpServletRequest httpRequest ? httpRequest : null;
    }

    public static String requestUri(HttpServletRequest request) {
        HttpServletRequest rawRequest = unwrap(request);
        return rawRequest == null ? null : rawRequest.getRequestURI();
    }

    private RawHttpServletRequest() {
    }
}
