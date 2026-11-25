package co.campuslands.aiacademy.leads.dto;

import co.campuslands.aiacademy.leads.entity.Lead;
import co.campuslands.aiacademy.leads.entity.Programa;

import java.time.Instant;

/**
 * Respuesta pública del registro. No devuelve datos internos (estado, historial):
 * solo lo necesario para la confirmación en la landing.
 */
public record LeadCreatedResponse(
        Long id,
        String nombre,
        Programa programaInteres,
        String programaNombre,
        Instant fechaRegistro,
        String mensaje
) {
    public static LeadCreatedResponse from(Lead l) {
        return new LeadCreatedResponse(l.getId(), l.getNombre(), l.getProgramaInteres(),
                l.getProgramaInteres().getNombre(), l.getFechaRegistro(),
                "Registro recibido. Un asesor de AI Academy te contactará pronto.");
    }
}
