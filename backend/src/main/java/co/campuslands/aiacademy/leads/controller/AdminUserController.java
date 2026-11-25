package co.campuslands.aiacademy.leads.controller;

import co.campuslands.aiacademy.leads.dto.AdminCreateRequest;
import co.campuslands.aiacademy.leads.dto.AdminResponse;
import co.campuslands.aiacademy.leads.security.TokenService;
import co.campuslands.aiacademy.leads.service.AdminUserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/** Equipo administrador del panel (solo accesible con sesión de administrador). */
@RestController
@RequestMapping("/api/admins")
public class AdminUserController {

    private final AdminUserService service;

    public AdminUserController(AdminUserService service) {
        this.service = service;
    }

    @GetMapping
    public List<AdminResponse> listar() {
        return service.listar();
    }

    @PostMapping
    public ResponseEntity<AdminResponse> crear(@Valid @RequestBody AdminCreateRequest req, @AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.status(201).body(service.crear(req, TokenService.responsable(jwt)));
    }
}
