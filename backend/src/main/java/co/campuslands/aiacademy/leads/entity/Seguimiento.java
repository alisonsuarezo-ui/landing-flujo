package co.campuslands.aiacademy.leads.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

import java.time.Instant;

/**
 * Registro del historial de un interesado (tabla {@code seguimiento}).
 * Puede ser un cambio de estado, una nota o ambos.
 */
@Entity
@Table(name = "seguimiento")
public class Seguimiento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "lead_id", nullable = false)
    private Lead lead;

    @Column(length = 2000)
    private String nota;

    @Enumerated(EnumType.STRING)
    @Column(name = "estado_anterior", length = 20)
    private EstadoLead estadoAnterior;

    @Enumerated(EnumType.STRING)
    @Column(name = "estado_nuevo", length = 20)
    private EstadoLead estadoNuevo;

    @Column(nullable = false, updatable = false)
    private Instant fecha;

    @Column(nullable = false, length = 160)
    private String responsable;

    protected Seguimiento() {
    }

    public Seguimiento(Lead lead, String nota, EstadoLead estadoAnterior, EstadoLead estadoNuevo, String responsable) {
        this.lead = lead;
        this.nota = nota;
        this.estadoAnterior = estadoAnterior;
        this.estadoNuevo = estadoNuevo;
        this.responsable = responsable;
    }

    @PrePersist
    void alCrear() {
        if (fecha == null) fecha = Instant.now();
    }

    public Long getId() { return id; }
    public Lead getLead() { return lead; }
    public String getNota() { return nota; }
    public EstadoLead getEstadoAnterior() { return estadoAnterior; }
    public EstadoLead getEstadoNuevo() { return estadoNuevo; }
    public Instant getFecha() { return fecha; }
    public String getResponsable() { return responsable; }
}
