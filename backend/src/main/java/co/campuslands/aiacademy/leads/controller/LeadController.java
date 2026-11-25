package co.campuslands.aiacademy.leads.controller;

import co.campuslands.aiacademy.leads.dto.LeadCreatedResponse;
import co.campuslands.aiacademy.leads.dto.LeadRequest;
import co.campuslands.aiacademy.leads.dto.LeadResponse;
import co.campuslands.aiacademy.leads.dto.NoteRequest;
import co.campuslands.aiacademy.leads.dto.PageResponse;
import co.campuslands.aiacademy.leads.dto.SeguimientoResponse;
import co.campuslands.aiacademy.leads.dto.StatusUpdateRequest;
import co.campuslands.aiacademy.leads.entity.EstadoLead;
import co.campuslands.aiacademy.leads.entity.Programa;
import co.campuslands.aiacademy.leads.security.TokenService;
import co.campuslands.aiacademy.leads.service.LeadService;
import co.campuslands.aiacademy.leads.service.SeguimientoService;
import jakarta.validation.Valid;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/api/leads")
public class LeadController {

    private static final Set<String> ORDEN_PERMITIDO = Set.of("fechaRegistro", "fechaActualizacion", "nombre", "estado", "programaInteres");

    private final LeadService leadService;
    private final SeguimientoService seguimientoService;

    public LeadController(LeadService leadService, SeguimientoService seguimientoService) {
        this.leadService = leadService;
        this.seguimientoService = seguimientoService;
    }

    /** Público: registro desde el formulario de la landing. */
    @PostMapping
    public ResponseEntity<LeadCreatedResponse> registrar(@Valid @RequestBody LeadRequest req) {
        LeadCreatedResponse creado = leadService.registrar(req);
        URI location = ServletUriComponentsBuilder.fromCurrentRequest().path("/{id}").buildAndExpand(creado.id()).toUri();
        return ResponseEntity.created(location).body(creado);
    }

    /** Listado con búsqueda (q), filtros (estado, programa), paginación y orden (sort=campo,asc|desc). */
    @GetMapping
    public PageResponse<LeadResponse> listar(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) EstadoLead estado,
            @RequestParam(required = false) Programa programa,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "fechaRegistro,desc") String sort) {
        return leadService.listar(q, estado, programa, paginacion(page, size, sort));
    }

    @GetMapping("/{id}")
    public LeadResponse obtener(@PathVariable Long id) {
        return leadService.obtener(id);
    }

    @PutMapping("/{id}")
    public LeadResponse actualizar(@PathVariable Long id, @Valid @RequestBody LeadRequest req, @AuthenticationPrincipal Jwt jwt) {
        return leadService.actualizar(id, req, TokenService.responsable(jwt));
    }

    @PatchMapping("/{id}/status")
    public LeadResponse cambiarEstado(@PathVariable Long id, @Valid @RequestBody StatusUpdateRequest req, @AuthenticationPrincipal Jwt jwt) {
        return leadService.cambiarEstado(id, req, TokenService.responsable(jwt));
    }

    @PostMapping("/{id}/notes")
    public ResponseEntity<SeguimientoResponse> agregarNota(@PathVariable Long id, @Valid @RequestBody NoteRequest req, @AuthenticationPrincipal Jwt jwt) {
        SeguimientoResponse nota = leadService.agregarNota(id, req, TokenService.responsable(jwt));
        return ResponseEntity.status(201).body(nota);
    }

    @GetMapping("/{id}/history")
    public List<SeguimientoResponse> historial(@PathVariable Long id) {
        return seguimientoService.historial(id);
    }

    private static Pageable paginacion(int page, int size, String sort) {
        String[] partes = sort.split(",");
        String campo = ORDEN_PERMITIDO.contains(partes[0].trim()) ? partes[0].trim() : "fechaRegistro";
        Sort.Direction dir = partes.length > 1 && partes[1].trim().equalsIgnoreCase("asc") ? Sort.Direction.ASC : Sort.Direction.DESC;
        return PageRequest.of(Math.max(0, page), Math.min(Math.max(1, size), 100), Sort.by(dir, campo).and(Sort.by(Sort.Direction.DESC, "id")));
    }
}
