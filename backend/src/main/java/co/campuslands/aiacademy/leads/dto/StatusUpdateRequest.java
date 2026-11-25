package co.campuslands.aiacademy.leads.dto;

import co.campuslands.aiacademy.leads.entity.EstadoLead;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/** PATCH /api/leads/{id}/status — cambio de estado con nota opcional. */
public record StatusUpdateRequest(
        @NotNull(message = "El estado es obligatorio")
        EstadoLead estado,

        @Size(max = 2000, message = "La nota no puede superar 2000 caracteres")
        String nota
) {
}
