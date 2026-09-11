package com.skillpilot.backend.oauth;

import java.util.UUID;
import javax.sql.DataSource;
import liquibase.integration.spring.SpringLiquibase;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.datasource.DataSourceTransactionManager;
import org.springframework.jdbc.datasource.DriverManagerDataSource;

/** Isolated synthetic database using the actual security migration. */
public record OAuthClientSecurityTestDatabase(JdbcTemplate jdbc, DataSourceTransactionManager transactions) {
    public static OAuthClientSecurityTestDatabase create() throws Exception {
        return migrate(new DriverManagerDataSource(
                "jdbc:h2:mem:oauth_security_" + UUID.randomUUID() + ";MODE=PostgreSQL;DB_CLOSE_DELAY=-1", "sa", ""));
    }

    public static OAuthClientSecurityTestDatabase migrate(DataSource dataSource) throws Exception {
        for (String file : java.util.List.of("030-add-oauth-client-security.yaml", "032-add-claude-refresh-token-families.yaml")) {
            SpringLiquibase migration = new SpringLiquibase();
            migration.setDataSource(dataSource);
            migration.setChangeLog("classpath:db/changelog/changes/" + file);
            migration.afterPropertiesSet();
        }
        return new OAuthClientSecurityTestDatabase(new JdbcTemplate(dataSource), new DataSourceTransactionManager(dataSource));
    }
}
