package co.campuslands.aiacademy.leads.dto;

import java.time.Instant;

public record LoginResponse(String token, String tipo, Instant expiraEn, AdminInfo admin) {

    public record AdminInfo(String correo, String nombre) {
    }
}
