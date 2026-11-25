package co.campuslands.aiacademy.leads.exception;

/** Ya existe un administrador con ese correo. */
public class DuplicateAdminException extends RuntimeException {
    public DuplicateAdminException(String message) {
        super(message);
    }
}
