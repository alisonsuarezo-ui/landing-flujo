package co.campuslands.aiacademy.leads.repository;

import co.campuslands.aiacademy.leads.entity.Seguimiento;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SeguimientoRepository extends JpaRepository<Seguimiento, Long> {

    /** Historial cronológico (más antiguo primero; el id desempata registros del mismo instante). */
    List<Seguimiento> findByLeadIdOrderByFechaAscIdAsc(Long leadId);

    long countByLeadId(Long leadId);
}
