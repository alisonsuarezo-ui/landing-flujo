package co.campuslands.aiacademy.leads.config;

import co.campuslands.aiacademy.leads.entity.UsuarioAdmin;
import co.campuslands.aiacademy.leads.repository.UsuarioAdminRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.util.Locale;
import java.util.Optional;

/**
 * Administrador inicial del panel (ADMIN_EMAIL / ADMIN_PASSWORD). La contraseña se guarda
 * únicamente como hash BCrypt.
 *
 * - Si el administrador no existe, se crea. Sin ADMIN_PASSWORD (o con menos de 8 caracteres)
 *   se genera una contraseña aleatoria y se muestra UNA sola vez en el log.
 * - Si ya existe y ADMIN_PASSWORD está definida con otro valor, se actualiza su hash:
 *   así cambiar la contraseña en .env y reiniciar el backend siempre tiene efecto.
 */
@Component
public class AdminInitializer implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(AdminInitializer.class);
    static final int MIN_PASSWORD = 8;
    private static final String ALFABETO = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";

    private final UsuarioAdminRepository repo;
    private final PasswordEncoder encoder;
    private final AppProperties.Admin admin;
    private final SecureRandom random = new SecureRandom();

    public AdminInitializer(UsuarioAdminRepository repo, PasswordEncoder encoder, AppProperties props) {
        this.repo = repo;
        this.encoder = encoder;
        this.admin = props.admin();
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (admin == null || admin.email() == null || admin.email().isBlank()) return;
        String correo = admin.email().trim().toLowerCase(Locale.ROOT);
        String password = admin.password() == null ? "" : admin.password();
        boolean definida = !password.isBlank();
        if (definida && password.length() < MIN_PASSWORD) {
            log.error("ADMIN_PASSWORD tiene menos de {} caracteres: se ignora.", MIN_PASSWORD);
            definida = false;
        }

        Optional<UsuarioAdmin> existente = repo.findByCorreoIgnoreCase(correo);
        if (existente.isPresent()) {
            UsuarioAdmin a = existente.get();
            if (definida && !encoder.matches(password, a.getPasswordHash())) {
                a.actualizarPasswordHash(encoder.encode(password));
                log.info("Contraseña del administrador {} actualizada desde ADMIN_PASSWORD.", correo);
            } else {
                log.info("Administrador {} listo.", correo);
            }
            return;
        }

        if (!definida) password = generar(16);
        String nombre = admin.name() == null || admin.name().isBlank() ? "Administrador" : admin.name().trim();
        repo.save(new UsuarioAdmin(correo, nombre, encoder.encode(password)));
        if (definida) {
            log.info("Administrador inicial creado: {}", correo);
        } else {
            log.warn("""

                    ==================================================================
                     ADMINISTRADOR INICIAL DEL PANEL (/admin/)
                       Correo:     {}
                       CONTRASEÑA: {}
                     Se muestra solo esta vez. Para elegir la tuya, define
                     ADMIN_PASSWORD en .env y reinicia:  docker compose up -d backend
                    ==================================================================""", correo, password);
        }
    }

    private String generar(int largo) {
        StringBuilder sb = new StringBuilder(largo);
        for (int i = 0; i < largo; i++) sb.append(ALFABETO.charAt(random.nextInt(ALFABETO.length())));
        return sb.toString();
    }
}
