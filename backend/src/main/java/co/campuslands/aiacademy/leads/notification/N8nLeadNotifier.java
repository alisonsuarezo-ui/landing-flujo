package co.campuslands.aiacademy.leads.notification;

import co.campuslands.aiacademy.leads.service.SeguimientoService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

/**
 * Activa el webhook de n8n cuando un interesado queda guardado en PostgreSQL.
 *
 * - Escucha después del commit: si la transacción falla, no se notifica nada.
 * - Es asíncrono: el formulario responde de inmediato aunque n8n o Telegram tarden.
 * - Deja constancia del resultado en el historial del interesado (responsable «Sistema · n8n»).
 */
@Component
public class N8nLeadNotifier {

    private static final Logger log = LoggerFactory.getLogger(N8nLeadNotifier.class);
    public static final String RESPONSABLE = "Sistema · n8n";

    private final N8nWebhookClient client;
    private final SeguimientoService seguimientoService;

    public N8nLeadNotifier(N8nWebhookClient client, SeguimientoService seguimientoService) {
        this.client = client;
        this.seguimientoService = seguimientoService;
    }

    @Async
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void alRegistrarLead(LeadRegisteredEvent evento) {
        if (!client.habilitado()) {
            log.warn("N8N_WEBHOOK_URL no está configurada: el lead {} no se notificó a n8n.", evento.id());
            registrar(evento.id(), "Notificación omitida: N8N_WEBHOOK_URL no está configurada en el backend.");
            return;
        }
        N8nWebhookClient.Resultado r = client.enviar(evento);
        String nota = describir(r);
        if (r.exitoso()) log.info("Lead {} notificado a n8n (HTTP {}).", evento.id(), r.status());
        else log.warn("Lead {}: {} Detalle: {}", evento.id(), nota, r.detalle());
        registrar(evento.id(), nota);
    }

    static String describir(N8nWebhookClient.Resultado r) {
        if (r.exitoso()) return "Notificación enviada: n8n recibió el registro y lo reenvió a Telegram.";
        return switch (r.status()) {
            case -1 -> "No se pudo contactar el webhook de n8n (" + r.detalle() + ").";
            case 401, 403 -> "n8n rechazó la notificación: el secreto N8N_WEBHOOK_SECRET no coincide.";
            case 404 -> "n8n no encontró el webhook: verifica que el workflow esté activo y que N8N_WEBHOOK_URL sea correcta.";
            case 502 -> "n8n recibió el registro, pero Telegram no aceptó el mensaje. Revisa TELEGRAM_BOT_TOKEN y TELEGRAM_CHAT_ID.";
            default -> "n8n respondió con HTTP " + r.status() + " al notificar el registro.";
        };
    }

    private void registrar(Long leadId, String nota) {
        try {
            seguimientoService.registrarEventoSistema(leadId, nota, RESPONSABLE);
        } catch (RuntimeException ex) {
            log.warn("No se pudo guardar el resultado de la notificación del lead {}: {}", leadId, ex.getMessage());
        }
    }
}
