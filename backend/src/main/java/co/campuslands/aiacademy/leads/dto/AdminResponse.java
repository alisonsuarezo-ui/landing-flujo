package co.campuslands.aiacademy.leads.dto;

import co.campuslands.aiacademy.leads.entity.UsuarioAdmin;

import java.time.Instant;

/** Administrador del panel (nunca incluye el hash de la contraseña). */
public record AdminResponse(Long id, String correo, String nombre, boolean activo, Instant fechaCreacion) {

    public static AdminResponse from(UsuarioAdmin a) {
        return new AdminResponse(a.getId(), a.getCorreo(), a.getNombre(), a.isActivo(), a.getFechaCreacion());
    }
}
