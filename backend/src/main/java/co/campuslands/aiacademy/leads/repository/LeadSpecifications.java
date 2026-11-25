package co.campuslands.aiacademy.leads.repository;

import co.campuslands.aiacademy.leads.entity.EstadoLead;
import co.campuslands.aiacademy.leads.entity.Lead;
import co.campuslands.aiacademy.leads.entity.Programa;
import org.springframework.data.jpa.domain.Specification;

import java.util.Locale;

/** Filtros dinámicos del listado de interesados (búsqueda, estado y programa). */
public final class LeadSpecifications {

    private LeadSpecifications() {
    }

    public static Specification<Lead> filtrar(String texto, EstadoLead estado, Programa programa) {
        Specification<Lead> spec = (root, query, cb) -> cb.conjunction();
        if (texto != null && !texto.isBlank()) spec = spec.and(buscar(texto.trim()));
        if (estado != null) spec = spec.and((root, query, cb) -> cb.equal(root.get("estado"), estado));
        if (programa != null) spec = spec.and((root, query, cb) -> cb.equal(root.get("programaInteres"), programa));
        return spec;
    }

    /** Coincidencia parcial, sin distinguir mayúsculas, en nombre, correo o teléfono. */
    private static Specification<Lead> buscar(String texto) {
        String patron = "%" + texto.toLowerCase(Locale.ROOT).replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_") + "%";
        return (root, query, cb) -> cb.or(
                cb.like(cb.lower(root.get("nombre")), patron, '\\'),
                cb.like(cb.lower(root.get("correo")), patron, '\\'),
                cb.like(cb.coalesce(root.get("telefono"), ""), patron, '\\'));
    }
}
