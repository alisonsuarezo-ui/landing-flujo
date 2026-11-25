package co.campuslands.aiacademy.leads.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/** POST /api/leads/{id}/notes — nota de seguimiento. */
public record NoteRequest(
        @NotBlank(message = "La nota no puede estar vacía")
        @Size(max = 2000, message = "La nota no puede superar 2000 caracteres")
        String nota
) {
}
