package co.campuslands.aiacademy.leads.service;

import co.campuslands.aiacademy.leads.dto.LoginRequest;
import co.campuslands.aiacademy.leads.dto.LoginResponse;
import co.campuslands.aiacademy.leads.entity.UsuarioAdmin;
import co.campuslands.aiacademy.leads.exception.TooManyAttemptsException;
import co.campuslands.aiacademy.leads.repository.UsuarioAdminRepository;
import co.campuslands.aiacademy.leads.security.LoginAttemptService;
import co.campuslands.aiacademy.leads.security.TokenService;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.UUID;

/** Inicio de sesión del panel: verifica el hash BCrypt y emite un JWT. */
@Service
public class AuthService {

    private final UsuarioAdminRepository repo;
    private final PasswordEncoder encoder;
    private final TokenService tokens;
    private final LoginAttemptService intentos;
    /** Hash de relleno: un correo inexistente tarda lo mismo que uno válido (evita enumerar usuarios). */
    private final String hashFicticio;

    public AuthService(UsuarioAdminRepository repo, PasswordEncoder encoder, TokenService tokens, LoginAttemptService intentos) {
        this.repo = repo;
        this.encoder = encoder;
        this.tokens = tokens;
        this.intentos = intentos;
        this.hashFicticio = encoder.encode(UUID.randomUUID().toString());
    }

    @Transactional(readOnly = true)
    public LoginResponse login(LoginRequest req) {
        String correo = req.correo().trim();
        if (intentos.bloqueado(correo)) {
            throw new TooManyAttemptsException("Demasiados intentos fallidos. Espera "
                    + intentos.minutosBloqueo() + " minutos e inténtalo de nuevo.");
        }
        Optional<UsuarioAdmin> admin = repo.findByCorreoIgnoreCase(correo).filter(UsuarioAdmin::isActivo);
        boolean valido = encoder.matches(req.password(), admin.map(UsuarioAdmin::getPasswordHash).orElse(hashFicticio));
        if (admin.isEmpty() || !valido) {
            intentos.fallido(correo);
            throw new BadCredentialsException("Credenciales inválidas");
        }
        intentos.exitoso(correo);
        UsuarioAdmin a = admin.get();
        TokenService.Token t = tokens.emitir(a);
        return new LoginResponse(t.valor(), "Bearer", t.expiraEn(), new LoginResponse.AdminInfo(a.getCorreo(), a.getNombre()));
    }
}
