package co.campuslands.aiacademy.leads.repository;

import co.campuslands.aiacademy.leads.entity.EstadoLead;
import co.campuslands.aiacademy.leads.entity.Lead;
import co.campuslands.aiacademy.leads.entity.Programa;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;

import java.time.Instant;
import java.util.List;

public interface LeadRepository extends JpaRepository<Lead, Long>, JpaSpecificationExecutor<Lead> {

    boolean existsByCorreoAndProgramaInteres(String correo, Programa programa);

    boolean existsByCorreoAndProgramaInteresAndIdNot(String correo, Programa programa, Long id);

    long countByEstado(EstadoLead estado);

    long countByFechaRegistroGreaterThanEqual(Instant desde);

    @Query("select l.estado as clave, count(l) as total from Lead l group by l.estado")
    List<ConteoPorClave> contarPorEstado();

    @Query("select l.programaInteres as clave, count(l) as total from Lead l group by l.programaInteres")
    List<ConteoPorClave> contarPorPrograma();

    @Query("select l.fechaRegistro from Lead l where l.fechaRegistro >= :desde")
    List<Instant> fechasRegistroDesde(Instant desde);

    /** Proyección para los agrupamientos del dashboard. */
    interface ConteoPorClave {
        Object getClave();

        long getTotal();
    }
}
