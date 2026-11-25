package co.campuslands.aiacademy.leads.dto;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

/** GET /api/dashboard/metrics */
public record DashboardMetricsResponse(
        long total,
        long nuevos,
        long contactados,
        long interesados,
        long inscritos,
        long descartados,
        long registrosUltimos7Dias,
        double tasaConversion,
        Map<String, Long> porEstado,
        List<ProgramaConteo> porPrograma,
        List<DiaConteo> registrosPorDia
) {
    public record ProgramaConteo(String programa, String nombre, long total) {
    }

    public record DiaConteo(LocalDate fecha, long total) {
    }
}
