package co.campuslands.aiacademy.leads.service;

import co.campuslands.aiacademy.leads.dto.LeadCreatedResponse;
import co.campuslands.aiacademy.leads.dto.LeadRequest;
import co.campuslands.aiacademy.leads.dto.LeadResponse;
import co.campuslands.aiacademy.leads.dto.NoteRequest;
import co.campuslands.aiacademy.leads.dto.PageResponse;
import co.campuslands.aiacademy.leads.dto.SeguimientoResponse;
import co.campuslands.aiacademy.leads.dto.StatusUpdateRequest;
import co.campuslands.aiacademy.leads.entity.EstadoLead;
import co.campuslands.aiacademy.leads.entity.Lead;
import co.campuslands.aiacademy.leads.entity.Programa;
import co.campuslands.aiacademy.leads.entity.Seguimiento;
import co.campuslands.aiacademy.leads.exception.BusinessRuleException;
import co.campuslands.aiacademy.leads.exception.DuplicateLeadException;
import co.campuslands.aiacademy.leads.exception.ResourceNotFoundException;
import co.campuslands.aiacademy.leads.notification.LeadRegisteredEvent;
import co.campuslands.aiacademy.leads.repository.LeadRepository;
import co.campuslands.aiacademy.leads.repository.LeadSpecifications;
import co.campuslands.aiacademy.leads.repository.SeguimientoRepository;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Objects;

/** Casos de uso de los interesados: registro público y gestión administrativa. */
@Service
public class LeadService {

    public static final String RESPONSABLE_LANDING = "Landing · formulario público";
    private static final String MSG_DUPLICADO = "Este correo ya está registrado para el programa seleccionado";

    private final LeadRepository leadRepository;
    private final SeguimientoRepository seguimientoRepository;
    private final ApplicationEventPublisher events;

    public LeadService(LeadRepository leadRepository, SeguimientoRepository seguimientoRepository,
                       ApplicationEventPublisher events) {
        this.leadRepository = leadRepository;
        this.seguimientoRepository = seguimientoRepository;
        this.events = events;
    }

    /** Registro desde la landing: guarda, abre el historial y dispara la notificación a n8n. */
    @Transactional
    public LeadCreatedResponse registrar(LeadRequest req) {
        Datos d = normalizar(req);
        if (leadRepository.existsByCorreoAndProgramaInteres(d.correo(), d.programa())) {
            throw new DuplicateLeadException(MSG_DUPLICADO);
        }
        Lead lead = new Lead();
        aplicar(lead, d);
        lead.setEstado(EstadoLead.NUEVO);
        lead = leadRepository.saveAndFlush(lead);

        seguimientoRepository.save(new Seguimiento(lead,
                "Registro recibido desde la landing (programa " + d.programa().getNombre() + ").",
                null, EstadoLead.NUEVO, RESPONSABLE_LANDING));

        // Se publica dentro de la transacción; el listener actúa solo si el commit tiene éxito.
        events.publishEvent(LeadRegisteredEvent.from(lead));
        return LeadCreatedResponse.from(lead);
    }

    @Transactional(readOnly = true)
    public PageResponse<LeadResponse> listar(String q, EstadoLead estado, Programa programa, Pageable pageable) {
        return PageResponse.from(
                leadRepository.findAll(LeadSpecifications.filtrar(q, estado, programa), pageable),
                LeadResponse::from);
    }

    @Transactional(readOnly = true)
    public LeadResponse obtener(Long id) {
        return LeadResponse.from(buscar(id));
    }

    /** Edición de los datos de contacto. Deja constancia de los campos modificados. */
    @Transactional
    public LeadResponse actualizar(Long id, LeadRequest req, String responsable) {
        Lead lead = buscar(id);
        Datos d = normalizar(req);
        if (leadRepository.existsByCorreoAndProgramaInteresAndIdNot(d.correo(), d.programa(), id)) {
            throw new DuplicateLeadException(MSG_DUPLICADO);
        }
        List<String> cambios = new ArrayList<>();
        if (!Objects.equals(lead.getNombre(), d.nombre())) cambios.add("nombre");
        if (!Objects.equals(lead.getCorreo(), d.correo())) cambios.add("correo");
        if (!Objects.equals(lead.getTelefono(), d.telefono())) cambios.add("teléfono");
        if (lead.getProgramaInteres() != d.programa()) {
            cambios.add("programa (" + lead.getProgramaInteres().getNombre() + " → " + d.programa().getNombre() + ")");
        }
        if (cambios.isEmpty()) return LeadResponse.from(lead);

        aplicar(lead, d);
        lead = leadRepository.saveAndFlush(lead);
        seguimientoRepository.save(new Seguimiento(lead,
                "Datos actualizados: " + String.join(", ", cambios) + ".", null, null, responsable));
        return LeadResponse.from(lead);
    }

    @Transactional
    public LeadResponse cambiarEstado(Long id, StatusUpdateRequest req, String responsable) {
        Lead lead = buscar(id);
        EstadoLead anterior = lead.getEstado();
        if (anterior == req.estado()) {
            throw new BusinessRuleException("El interesado ya está en estado " + anterior);
        }
        lead.setEstado(req.estado());
        lead = leadRepository.saveAndFlush(lead);
        seguimientoRepository.save(new Seguimiento(lead, textoOpcional(req.nota()), anterior, req.estado(), responsable));
        return LeadResponse.from(lead);
    }

    @Transactional
    public SeguimientoResponse agregarNota(Long id, NoteRequest req, String responsable) {
        Lead lead = buscar(id);
        lead.setFechaActualizacion(Instant.now());
        Seguimiento s = seguimientoRepository.save(new Seguimiento(lead, req.nota().trim(), null, null, responsable));
        return SeguimientoResponse.from(s);
    }

    private Lead buscar(Long id) {
        return leadRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("No existe un interesado con id " + id));
    }

    private static void aplicar(Lead lead, Datos d) {
        lead.setNombre(d.nombre());
        lead.setCorreo(d.correo());
        lead.setTelefono(d.telefono());
        lead.setProgramaInteres(d.programa());
    }

    /** Limpia espacios, normaliza el correo a minúsculas y convierte el teléfono vacío en null. */
    static Datos normalizar(LeadRequest req) {
        String nombre = req.nombre().trim().replaceAll("\\s+", " ");
        String correo = req.correo().trim().toLowerCase(Locale.ROOT);
        String telefono = textoOpcional(req.telefono());
        if (telefono != null) telefono = telefono.replaceAll("\\s+", " ");
        return new Datos(nombre, correo, telefono, req.programa());
    }

    private static String textoOpcional(String s) {
        return s == null || s.isBlank() ? null : s.trim();
    }

    record Datos(String nombre, String correo, String telefono, Programa programa) {
    }
}
