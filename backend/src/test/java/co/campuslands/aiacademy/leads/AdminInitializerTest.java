package co.campuslands.aiacademy.leads;

import co.campuslands.aiacademy.leads.config.AdminInitializer;
import co.campuslands.aiacademy.leads.config.AppProperties;
import co.campuslands.aiacademy.leads.entity.UsuarioAdmin;
import co.campuslands.aiacademy.leads.repository.UsuarioAdminRepository;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/** El administrador inicial se crea, se genera o se actualiza según ADMIN_PASSWORD. */
class AdminInitializerTest {

    private final PasswordEncoder encoder = new BCryptPasswordEncoder(4);
    private final UsuarioAdminRepository repo = mock(UsuarioAdminRepository.class);

    private AdminInitializer inicializador(String password) {
        AppProperties props = new AppProperties(null, null, null,
                new AppProperties.Admin("Admin@Test.com", "Admin", password), null);
        return new AdminInitializer(repo, encoder, props);
    }

    @Test
    void sinPasswordGeneraUnaAleatoriaYGuardaSoloElHash() {
        when(repo.findByCorreoIgnoreCase("admin@test.com")).thenReturn(Optional.empty());
        inicializador("").run(null);

        ArgumentCaptor<UsuarioAdmin> guardado = ArgumentCaptor.forClass(UsuarioAdmin.class);
        verify(repo).save(guardado.capture());
        assertThat(guardado.getValue().getCorreo()).isEqualTo("admin@test.com");
        assertThat(guardado.getValue().getPasswordHash()).startsWith("$2a$");
    }

    @Test
    void conPasswordDefinidaCreaElAdminConEsaClave() {
        when(repo.findByCorreoIgnoreCase("admin@test.com")).thenReturn(Optional.empty());
        inicializador("ClaveSegura123").run(null);

        ArgumentCaptor<UsuarioAdmin> guardado = ArgumentCaptor.forClass(UsuarioAdmin.class);
        verify(repo).save(guardado.capture());
        assertThat(encoder.matches("ClaveSegura123", guardado.getValue().getPasswordHash())).isTrue();
    }

    @Test
    void siAdminPasswordCambiaSeActualizaElHashDelAdminExistente() {
        UsuarioAdmin existente = new UsuarioAdmin("admin@test.com", "Admin", encoder.encode("ClaveAnterior1"));
        when(repo.findByCorreoIgnoreCase("admin@test.com")).thenReturn(Optional.of(existente));

        inicializador("ClaveNueva2026").run(null);

        assertThat(encoder.matches("ClaveNueva2026", existente.getPasswordHash())).isTrue();
        verify(repo, never()).save(any());
    }

    @Test
    void sinPasswordNoTocaAlAdminExistente() {
        String hash = encoder.encode("ClaveAnterior1");
        UsuarioAdmin existente = new UsuarioAdmin("admin@test.com", "Admin", hash);
        when(repo.findByCorreoIgnoreCase("admin@test.com")).thenReturn(Optional.of(existente));

        inicializador("").run(null);

        assertThat(existente.getPasswordHash()).isEqualTo(hash);
    }
}
