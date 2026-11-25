package co.campuslands.aiacademy.leads.security;

import co.campuslands.aiacademy.leads.config.AppProperties;
import co.campuslands.aiacademy.leads.entity.UsuarioAdmin;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

/** Emite los JWT de sesión del panel administrativo. */
@Service
public class TokenService {

    public static final String ISSUER = "campuslands-leads-api";
    public static final String CLAIM_NOMBRE = "nombre";
    public static final String CLAIM_ROLES = "roles";

    private final JwtEncoder encoder;
    private final long minutos;

    public TokenService(JwtEncoder encoder, AppProperties props) {
        this.encoder = encoder;
        this.minutos = props.security().jwtExpirationMinutes();
    }

    public Token emitir(UsuarioAdmin admin) {
        Instant ahora = Instant.now();
        Instant expira = ahora.plus(minutos, ChronoUnit.MINUTES);
        JwtClaimsSet claims = JwtClaimsSet.builder()
                .issuer(ISSUER)
                .issuedAt(ahora)
                .expiresAt(expira)
                .subject(admin.getCorreo())
                .claim(CLAIM_NOMBRE, admin.getNombre())
                .claim(CLAIM_ROLES, List.of("ADMIN"))
                .build();
        Jwt jwt = encoder.encode(JwtEncoderParameters.from(JwsHeader.with(MacAlgorithm.HS256).build(), claims));
        return new Token(jwt.getTokenValue(), expira);
    }

    /** Texto que se guarda como «responsable» en el historial. */
    public static String responsable(Jwt jwt) {
        String nombre = jwt.getClaimAsString(CLAIM_NOMBRE);
        String texto = (nombre == null || nombre.isBlank()) ? jwt.getSubject() : nombre + " (" + jwt.getSubject() + ")";
        return texto.length() > 160 ? texto.substring(0, 160) : texto;
    }

    public record Token(String valor, Instant expiraEn) {
    }
}
