package co.campuslands.aiacademy.leads.service;

import co.campuslands.aiacademy.leads.dto.AdminCreateRequest;
import co.campuslands.aiacademy.leads.dto.AdminResponse;
import co.campuslands.aiacademy.leads.entity.UsuarioAdmin;
import co.campuslands.aiacademy.leads.exception.DuplicateAdminException;
import co.campuslands.aiacademy.leads.repository.UsuarioAdminRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Locale;

/**
 * Equipo administrador: permite que otra persona del equipo tenga su propia cuenta
 * y continúe el seguimiento. Cada acción queda firmada con su nombre en el historial.
 */
@Service
public class AdminUserService {

    private static final Logger log = LoggerFactory.getLogger(AdminUserService.class);

    private final UsuarioAdminRepository repo;
    private final PasswordEncoder encoder;

    public AdminUserService(UsuarioAdminRepository repo, PasswordEncoder encoder) {
        this.repo = repo;
        this.encoder = encoder;
    }

    @Transactional(readOnly = true)
    public List<AdminResponse> listar() {
        return repo.findAll(Sort.by("fechaCreacion", "id")).stream().map(AdminResponse::from).toList();
    }

    @Transactional
    public AdminResponse crear(AdminCreateRequest req, String creadoPor) {
        String correo = req.correo().trim().toLowerCase(Locale.ROOT);
        if (repo.existsByCorreoIgnoreCase(correo)) {
            throw new DuplicateAdminException("Ya existe un administrador con ese correo");
        }
        UsuarioAdmin nuevo = repo.save(new UsuarioAdmin(correo, req.nombre().trim().replaceAll("\\s+", " "),
                encoder.encode(req.password())));
        log.info("Administrador {} creado por {}", correo, creadoPor);
        return AdminResponse.from(nuevo);
    }
}
