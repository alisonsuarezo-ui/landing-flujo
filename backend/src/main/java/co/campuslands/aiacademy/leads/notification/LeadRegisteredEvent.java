package co.campuslands.aiacademy.leads.notification;

import co.campuslands.aiacademy.leads.entity.Lead;
import co.campuslands.aiacademy.leads.entity.Programa;

import java.time.Instant;

/**
 * Evento de dominio: se registró un interesado. Lleva una copia de los datos para que
 * el envío a n8n (asíncrono, después del commit) no dependa de la sesión de JPA.
 */
public record LeadRegisteredEvent(
        Long id,
        String nombre,
        String correo,
        String telefono,
        Programa programa,
        Instant fechaRegistro
) {
    public static LeadRegisteredEvent from(Lead l) {
        return new LeadRegisteredEvent(l.getId(), l.getNombre(), l.getCorreo(), l.getTelefono(),
                l.getProgramaInteres(), l.getFechaRegistro());
    }
}
