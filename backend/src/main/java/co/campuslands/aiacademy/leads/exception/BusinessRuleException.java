package co.campuslands.aiacademy.leads.exception;

/** Regla de negocio incumplida (p. ej. cambiar al mismo estado). */
public class BusinessRuleException extends RuntimeException {
    public BusinessRuleException(String message) {
        super(message);
    }
}
