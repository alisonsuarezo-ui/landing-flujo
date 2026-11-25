package co.campuslands.aiacademy.leads;

import co.campuslands.aiacademy.leads.config.AppProperties;
import co.campuslands.aiacademy.leads.security.LoginAttemptService;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class LoginAttemptServiceTest {

    private final LoginAttemptService servicio = new LoginAttemptService(new AppProperties(null, null,
            new AppProperties.Security("x".repeat(32), 60, 3, 5), null, null));

    @Test
    void bloqueaTrasVariosIntentosFallidosYSeReiniciaConExito() {
        servicio.fallido("Admin@Test.com");
        servicio.fallido("admin@test.com");
        assertThat(servicio.bloqueado("admin@test.com")).isFalse();
        servicio.fallido("admin@test.com");
        assertThat(servicio.bloqueado("ADMIN@test.com")).isTrue();
        servicio.exitoso("admin@test.com");
        assertThat(servicio.bloqueado("admin@test.com")).isFalse();
    }
}
