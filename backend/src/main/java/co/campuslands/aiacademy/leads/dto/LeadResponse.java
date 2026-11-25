package co.campuslands.aiacademy.leads.dto;

import co.campuslands.aiacademy.leads.entity.EstadoLead;
import co.campuslands.aiacademy.leads.entity.Lead;
import co.campuslands.aiacademy.leads.entity.Programa;

import java.time.Instant;

public record LeadResponse(
        Long id,
        String nombre,
        String correo,
        String telefono,
        Programa programaInteres,
        String programaNombre,
        EstadoLead estado,
        Instant fechaRegistro,
        Instant fechaActualizacion
) {
    public static LeadResponse from(Lead l) {
        return new LeadResponse(
                l.getId(), l.getNombre(), l.getCorreo(), l.getTelefono(),
                l.getProgramaInteres(), l.getProgramaInteres().getNombre(),
                l.getEstado(), l.getFechaRegistro(), l.getFechaActualizacion());
    }
}
