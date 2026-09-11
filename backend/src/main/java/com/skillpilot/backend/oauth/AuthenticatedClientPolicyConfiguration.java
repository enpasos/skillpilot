package com.skillpilot.backend.oauth;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.sql.init.dependency.DependsOnDatabaseInitialization;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.JdbcOperations;
import org.springframework.transaction.PlatformTransactionManager;

@Configuration(proxyBeanMethods = false)
@DependsOnDatabaseInitialization
public class AuthenticatedClientPolicyConfiguration {
    @Bean
    AuthenticatedClientPolicy authenticatedClientPolicy(JdbcOperations jdbc, PlatformTransactionManager manager,
            @Value("${skillpilot.oauth.authenticated-clients-required:false}") boolean required) {
        if (required) {
            throw new IllegalStateException("The global authenticated-clients-required switch is retired. "
                    + "Configure each OAuth client profile explicitly and remove the global override before restarting.");
        }
        AuthenticatedClientPolicy policy = AuthenticatedClientPolicy.independentProfiles(jdbc, manager);
        policy.assertCompatible();
        return policy;
    }

    @Bean
    JdbcOAuthClientAssertionReplayStore oauthClientAssertionReplayStore(
            JdbcOperations jdbc, PlatformTransactionManager manager) {
        return new JdbcOAuthClientAssertionReplayStore(jdbc, manager);
    }
}
