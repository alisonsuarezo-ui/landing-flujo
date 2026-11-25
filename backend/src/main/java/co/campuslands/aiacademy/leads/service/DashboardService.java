package co.campuslands.aiacademy.leads.service;

import co.campuslands.aiacademy.leads.config.AppProperties;
import co.campuslands.aiacademy.leads.dto.DashboardMetricsResponse;
import co.campuslands.aiacademy.leads.dto.DashboardMetricsResponse.DiaConteo;
import co.campuslands.aiacademy.leads.dto.DashboardMetricsResponse.ProgramaConteo;
import co.campuslands.aiacademy.leads.entity.EstadoLead;
import co.campuslands.aiacademy.leads.entity.Programa;
import co.campuslands.aiacademy.leads.repository.LeadRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.EnumMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;

/** Métricas del dashboard calculadas directamente sobre PostgreSQL. */
@Service
public class DashboardService {

    private static final int DIAS_SERIE = 14;

    private final LeadRepository leadRepository;
    private final ZoneId zona;

    public DashboardService(LeadRepository leadRepository, AppProperties props) {
        this.leadRepository = leadRepository;
        this.zona = ZoneId.of(props.n8n().zoneId());
    }

    @Transactional(readOnly = true)
    public DashboardMetricsResponse metricas() {
        Map<EstadoLead, Long> estados = new EnumMap<>(EstadoLead.class);
        for (EstadoLead e : EstadoLead.values()) estados.put(e, 0L);
        leadRepository.contarPorEstado().forEach(c -> estados.put((EstadoLead) c.getClave(), c.getTotal()));

        Map<Programa, Long> programas = new EnumMap<>(Programa.class);
        for (Programa p : Programa.values()) programas.put(p, 0L);
        leadRepository.contarPorPrograma().forEach(c -> programas.put((Programa) c.getClave(), c.getTotal()));

        long total = estados.values().stream().mapToLong(Long::longValue).sum();
        long inscritos = estados.get(EstadoLead.INSCRITO);
        double tasa = total == 0 ? 0 : Math.round(inscritos * 1000.0 / total) / 10.0;

        Instant hace7 = Instant.now().minus(7, ChronoUnit.DAYS);
        long ultimos7 = leadRepository.countByFechaRegistroGreaterThanEqual(hace7);

        Map<String, Long> porEstado = new LinkedHashMap<>();
        estados.forEach((k, v) -> porEstado.put(k.name(), v));

        List<ProgramaConteo> porPrograma = new ArrayList<>();
        programas.forEach((k, v) -> porPrograma.add(new ProgramaConteo(k.name(), k.getNombre(), v)));

        return new DashboardMetricsResponse(total,
                estados.get(EstadoLead.NUEVO), estados.get(EstadoLead.CONTACTADO),
                estados.get(EstadoLead.INTERESADO), inscritos, estados.get(EstadoLead.DESCARTADO),
                ultimos7, tasa, porEstado, porPrograma, serieDiaria());
    }

    /** Registros por día (zona horaria de Colombia) en las últimas dos semanas, incluidos los días en cero. */
    private List<DiaConteo> serieDiaria() {
        LocalDate hoy = LocalDate.now(zona);
        LocalDate inicio = hoy.minusDays(DIAS_SERIE - 1L);
        Map<LocalDate, Long> conteo = new TreeMap<>();
        for (LocalDate d = inicio; !d.isAfter(hoy); d = d.plusDays(1)) conteo.put(d, 0L);
        leadRepository.fechasRegistroDesde(inicio.atStartOfDay(zona).toInstant()).forEach(f ->
                conteo.computeIfPresent(f.atZone(zona).toLocalDate(), (k, v) -> v + 1));
        return conteo.entrySet().stream().map(e -> new DiaConteo(e.getKey(), e.getValue())).toList();
    }
}
