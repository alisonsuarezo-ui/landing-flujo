package co.campuslands.aiacademy.leads.entity;

/**
 * Programas (misiones) de AI Academy. Coinciden con las cinco misiones de la landing
 * (src/data/content.ts → MISIONES).
 */
public enum Programa {
    IGNITION("Ignition", "4 h · En vivo"),
    BOOSTER("Booster", "8 h · En vivo"),
    LIFTOFF("Liftoff", "12 h · En vivo"),
    ODYSSEY("Odyssey", "Personalizado · A la medida"),
    NEBULA("Nebula", "Pregrabado · A tu ritmo");

    private final String nombre;
    private final String detalle;

    Programa(String nombre, String detalle) {
        this.nombre = nombre;
        this.detalle = detalle;
    }

    public String getNombre() {
        return nombre;
    }

    public String getDetalle() {
        return detalle;
    }
}
