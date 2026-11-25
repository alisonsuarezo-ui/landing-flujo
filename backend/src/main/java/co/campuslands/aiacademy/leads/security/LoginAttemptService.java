package co.campuslands.aiacademy.leads.security;

import co.campuslands.aiacademy.leads.config.AppProperties;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;
import java.util.Locale;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/** Bloqueo temporal tras varios intentos fallidos de inicio de sesión (protección contra fuerza bruta). */
@Service
public class LoginAttemptService {

    private final int maxIntentos;
    private final Duration bloqueo;
    private final Map<String, Intentos> registro = new ConcurrentHashMap<>();

    public LoginAttemptService(AppProperties props) {
        this.maxIntentos = Math.max(1, props.security().maxLoginAttempts());
        this.bloqueo = Duration.ofMinutes(Math.max(1, props.security().lockMinutes()));
    }

    public boolean bloqueado(String correo) {
        Intentos i = registro.get(clave(correo));
        if (i == null || i.bloqueadoHasta == null) return false;
        if (Instant.now().isAfter(i.bloqueadoHasta)) {
            registro.remove(clave(correo));
            return false;
        }
        return true;
    }

    public void fallido(String correo) {
        registro.compute(clave(correo), (k, i) -> {
            Intentos n = (i == null) ? new Intentos() : i;
            n.fallidos++;
            if (n.fallidos >= maxIntentos) n.bloqueadoHasta = Instant.now().plus(bloqueo);
            return n;
        });
    }

    public void exitoso(String correo) {
        registro.remove(clave(correo));
    }

    public long minutosBloqueo() {
        return bloqueo.toMinutes();
    }

    private static String clave(String correo) {
        return correo == null ? "" : correo.trim().toLowerCase(Locale.ROOT);
    }

    private static final class Intentos {
        int fallidos;
        Instant bloqueadoHasta;
    }
}
