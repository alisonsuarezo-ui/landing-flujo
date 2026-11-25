package co.campuslands.aiacademy.leads.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

import java.time.Instant;

/** Usuario del panel administrativo. Solo se guarda el hash BCrypt de la contraseña. */
@Entity
@Table(name = "usuarios_admin")
public class UsuarioAdmin {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 160)
    private String correo;

    @Column(nullable = false, length = 120)
    private String nombre;

    @Column(name = "password_hash", nullable = false, length = 100)
    private String passwordHash;

    @Column(nullable = false)
    private boolean activo = true;

    @Column(name = "fecha_creacion", nullable = false, updatable = false)
    private Instant fechaCreacion;

    protected UsuarioAdmin() {
    }

    public UsuarioAdmin(String correo, String nombre, String passwordHash) {
        this.correo = correo;
        this.nombre = nombre;
        this.passwordHash = passwordHash;
    }

    @PrePersist
    void alCrear() {
        if (fechaCreacion == null) fechaCreacion = Instant.now();
    }

    /** Reemplaza el hash BCrypt (nunca recibe la contraseña en texto plano). */
    public void actualizarPasswordHash(String nuevoHash) {
        this.passwordHash = nuevoHash;
    }

    public Long getId() { return id; }
    public String getCorreo() { return correo; }
    public String getNombre() { return nombre; }
    public String getPasswordHash() { return passwordHash; }
    public boolean isActivo() { return activo; }
    public Instant getFechaCreacion() { return fechaCreacion; }
}
