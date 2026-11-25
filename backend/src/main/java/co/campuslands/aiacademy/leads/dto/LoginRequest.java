package co.campuslands.aiacademy.leads.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record LoginRequest(
        @NotBlank(message = "El correo es obligatorio")
        @Email(message = "Ingresa un correo válido")
        String correo,

        @NotBlank(message = "La contraseña es obligatoria")
        @Size(max = 200)
        String password
) {
}
