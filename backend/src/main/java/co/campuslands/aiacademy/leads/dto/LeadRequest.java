package co.campuslands.aiacademy.leads.dto;

import co.campuslands.aiacademy.leads.entity.Programa;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/**
 * Datos de un interesado. Se usa en el registro público (POST /api/leads)
 * y en la edición administrativa (PUT /api/leads/{id}).
 */
public record LeadRequest(
        @NotBlank(message = "El nombre completo es obligatorio")
        @Size(min = 3, max = 120, message = "El nombre debe tener entre 3 y 120 caracteres")
        @Pattern(regexp = "^\\s*[\\p{L}][\\p{L} .'\\-]*$", message = "El nombre solo puede contener letras, espacios, puntos, apóstrofos y guiones")
        String nombre,

        @NotBlank(message = "El correo electrónico es obligatorio")
        @Size(max = 160, message = "El correo no puede superar 160 caracteres")
        @Email(regexp = "^[A-Za-z0-9._%+\\-]+@[A-Za-z0-9.\\-]+\\.[A-Za-z]{2,}$", message = "Ingresa un correo electrónico válido")
        String correo,

        @Size(max = 30, message = "El teléfono no puede superar 30 caracteres")
        @Pattern(regexp = "^$|^\\+?[0-9 ()\\-]{7,20}$", message = "Ingresa un teléfono válido (7 a 15 dígitos, puede iniciar con +)")
        String telefono,

        @NotBlank(message = "Selecciona el programa de interés")
        @Pattern(regexp = "(?i)^\\s*(IGNITION|BOOSTER|LIFTOFF|ODYSSEY|NEBULA)\\s*$",
                message = "Programa no válido. Opciones: IGNITION, BOOSTER, LIFTOFF, ODYSSEY, NEBULA")
        String programaInteres
) {
    /** Programa ya validado por @Pattern, convertido al enum. */
    public Programa programa() {
        return Programa.valueOf(programaInteres.trim().toUpperCase(java.util.Locale.ROOT));
    }
}
