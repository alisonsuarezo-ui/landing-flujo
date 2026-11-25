package co.campuslands.aiacademy.leads.controller;

import co.campuslands.aiacademy.leads.dto.LoginRequest;
import co.campuslands.aiacademy.leads.dto.LoginResponse;
import co.campuslands.aiacademy.leads.security.TokenService;
import co.campuslands.aiacademy.leads.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    /** Público: devuelve un JWT para el panel. */
    @PostMapping("/login")
    public LoginResponse login(@Valid @RequestBody LoginRequest req) {
        return authService.login(req);
    }

    /** Valida la sesión actual del panel. */
    @GetMapping("/me")
    public Map<String, Object> me(@AuthenticationPrincipal Jwt jwt) {
        return Map.of(
                "correo", jwt.getSubject(),
                "nombre", String.valueOf(jwt.getClaimAsString(TokenService.CLAIM_NOMBRE)),
                "expiraEn", String.valueOf(jwt.getExpiresAt()));
    }
}
