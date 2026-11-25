package co.campuslands.aiacademy.leads.dto;

import java.time.Instant;
import java.util.Map;

/** Formato único de error de la API. {@code fieldErrors} trae el mensaje de cada campo inválido. */
public record ApiError(
        Instant timestamp,
        int status,
        String error,
        String message,
        String path,
        Map<String, String> fieldErrors
) {
}
