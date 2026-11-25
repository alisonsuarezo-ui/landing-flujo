package co.campuslands.aiacademy.leads.service;

import co.campuslands.aiacademy.leads.dto.SeguimientoResponse;
import co.campuslands.aiacademy.leads.entity.Lead;
import co.campuslands.aiacademy.leads.entity.Seguimiento;
import co.campuslands.aiacademy.leads.exception.ResourceNotFoundException;
import co.campuslands.aiacademy.leads.repository.LeadRepository;
import co.campuslands.aiacademy.leads.repository.SeguimientoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/** Historial de seguimiento de los interesados. */
@Service
public class SeguimientoService {

    private final SeguimientoRepository seguimientoRepository;
    private final LeadRepository leadRepository;

    public SeguimientoService(SeguimientoRepository seguimientoRepository, LeadRepository leadRepository) {
        this.seguimientoRepository = seguimientoRepository;
        this.leadRepository = leadRepository;
    }

    @Transactional(readOnly = true)
    public List<SeguimientoResponse> historial(Long leadId) {
        if (!leadRepository.existsById(leadId)) {
            throw new ResourceNotFoundException("No existe un interesado con id " + leadId);
        }
        return seguimientoRepository.findByLeadIdOrderByFechaAscIdAsc(leadId).stream()
                .map(SeguimientoResponse::from)
                .toList();
    }

    /** Nota automática del sistema (p. ej. resultado de la notificación a n8n). */
    @Transactional
    public void registrarEventoSistema(Long leadId, String nota, String responsable) {
        Lead lead = leadRepository.findById(leadId)
                .orElseThrow(() -> new ResourceNotFoundException("No existe un interesado con id " + leadId));
        seguimientoRepository.save(new Seguimiento(lead, nota, null, null, responsable));
    }
}
