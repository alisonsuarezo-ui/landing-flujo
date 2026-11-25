package co.campuslands.aiacademy.leads.dto;

import co.campuslands.aiacademy.leads.entity.EstadoLead;
import co.campuslands.aiacademy.leads.entity.Seguimiento;

import java.time.Instant;

public record SeguimientoResponse(
        Long id,
        Long leadId,
        String tipo,
        String nota,
        EstadoLead estadoAnterior,
        EstadoLead estadoNuevo,
        Instant fecha,
        String responsable
) {
    /** REGISTRO (alta del lead), CAMBIO_ESTADO o NOTA. */
    public static String tipoDe(Seguimiento s) {
        if (s.getEstadoNuevo() != null && s.getEstadoAnterior() == null) return "REGISTRO";
        if (s.getEstadoNuevo() != null && s.getEstadoNuevo() != s.getEstadoAnterior()) return "CAMBIO_ESTADO";
        return "NOTA";
    }

    public static SeguimientoResponse from(Seguimiento s) {
        return new SeguimientoResponse(s.getId(), s.getLead().getId(), tipoDe(s), s.getNota(),
                s.getEstadoAnterior(), s.getEstadoNuevo(), s.getFecha(), s.getResponsable());
    }
}
