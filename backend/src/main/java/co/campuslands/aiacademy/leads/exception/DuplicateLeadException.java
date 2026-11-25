package co.campuslands.aiacademy.leads.exception;

/** Mismo correo ya registrado para el mismo programa. */
public class DuplicateLeadException extends RuntimeException {
    public DuplicateLeadException(String message) {
        super(message);
    }
}
