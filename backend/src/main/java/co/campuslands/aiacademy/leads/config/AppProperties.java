package co.campuslands.aiacademy.leads.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

import java.util.List;

/** Propiedades propias de la aplicación (prefijo {@code app} en application.yml). */
@ConfigurationProperties(prefix = "app")
public record AppProperties(
        String publicBaseUrl,
        Cors cors,
        Security security,
        Admin admin,
        N8n n8n
) {
    public record Cors(List<String> allowedOrigins) {
    }

    public record Security(String jwtSecret, long jwtExpirationMinutes, int maxLoginAttempts, long lockMinutes) {
    }

    public record Admin(String email, String name, String password) {
    }

    public record N8n(String webhookUrl, String webhookSecret, int connectTimeoutMs, int readTimeoutMs,
                      int maxAttempts, String zoneId) {
        public boolean habilitado() {
            return webhookUrl != null && !webhookUrl.isBlank();
        }
    }
}
