package co.campuslands.aiacademy.leads.notification;

import co.campuslands.aiacademy.leads.config.AppProperties;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.MediaType;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClient;

import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.LinkedHashMap;
import java.util.Locale;
import java.util.Map;

/**
 * Cliente HTTP del webhook de n8n. Envía el interesado en JSON con el encabezado
 * {@code X-Webhook-Secret} y reintenta ante fallos de red o mientras n8n arranca.
 */
@Component
public class N8nWebhookClient {

    private static final Logger log = LoggerFactory.getLogger(N8nWebhookClient.class);
    static final String SECRET_HEADER = "X-Webhook-Secret";

    private final AppProperties.N8n config;
    private final String publicBaseUrl;
    private final RestClient restClient;
    private final DateTimeFormatter formatoFecha;

    public N8nWebhookClient(AppProperties props, RestClient.Builder builder) {
        this.config = props.n8n();
        this.publicBaseUrl = props.publicBaseUrl() == null ? "" : props.publicBaseUrl().replaceAll("/+$", "");
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(config.connectTimeoutMs());
        factory.setReadTimeout(config.readTimeoutMs());
        this.restClient = builder.requestFactory(factory).build();
        this.formatoFecha = DateTimeFormatter.ofPattern("dd/MM/yyyy hh:mm a", Locale.forLanguageTag("es-CO"))
                .withZone(ZoneId.of(config.zoneId()));
    }

    public boolean habilitado() {
        return config.habilitado();
    }

    /** Cuerpo que recibe el nodo Webhook de n8n ({@code $json.body}). */
    public Map<String, Object> payload(LeadRegisteredEvent e) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("evento", "lead.registrado");
        body.put("id", e.id());
        body.put("nombre", e.nombre());
        body.put("correo", e.correo());
        body.put("telefono", e.telefono());
        body.put("programa", e.programa().name());
        body.put("programaNombre", e.programa().getNombre() + " (" + e.programa().getDetalle() + ")");
        body.put("fechaRegistro", e.fechaRegistro().toString());
        body.put("fechaRegistroTexto", formatoFecha.format(e.fechaRegistro()));
        body.put("panelUrl", publicBaseUrl + "/admin/#lead-" + e.id());
        return body;
    }

    /** Envía el evento y devuelve el resultado (nunca lanza excepción). */
    public Resultado enviar(LeadRegisteredEvent e) {
        Map<String, Object> body = payload(e);
        int intentos = Math.max(1, config.maxAttempts());
        Resultado ultimo = null;
        for (int i = 1; i <= intentos; i++) {
            ultimo = intentoUnico(body);
            if (!ultimo.reintentable() || i == intentos) break;
            log.info("Webhook n8n: intento {} falló ({}). Reintentando…", i, ultimo.detalle());
            dormir(1000L * i);
        }
        return ultimo;
    }

    private Resultado intentoUnico(Map<String, Object> body) {
        try {
            var spec = restClient.post()
                    .uri(config.webhookUrl())
                    .contentType(MediaType.APPLICATION_JSON)
                    .accept(MediaType.APPLICATION_JSON);
            if (config.webhookSecret() != null && !config.webhookSecret().isBlank()) {
                spec = spec.header(SECRET_HEADER, config.webhookSecret());
            }
            return spec.body(body).exchange((req, res) -> {
                HttpStatusCode status = res.getStatusCode();
                String respuesta = new String(res.getBody().readAllBytes());
                return Resultado.http(status.value(), recortar(respuesta));
            });
        } catch (ResourceAccessException ex) {
            return Resultado.red(ex.getMostSpecificCause().getMessage());
        } catch (RuntimeException ex) {
            return Resultado.red(ex.getMessage());
        }
    }

    private static String recortar(String s) {
        if (s == null) return "";
        String limpio = s.replaceAll("\\s+", " ").trim();
        return limpio.length() > 300 ? limpio.substring(0, 300) + "…" : limpio;
    }

    private static void dormir(long ms) {
        try {
            Thread.sleep(ms);
        } catch (InterruptedException ie) {
            Thread.currentThread().interrupt();
        }
    }

    /** Resultado de la llamada al webhook. {@code status} = -1 si no hubo respuesta HTTP. */
    public record Resultado(int status, String detalle) {
        static Resultado http(int status, String detalle) {
            return new Resultado(status, detalle);
        }

        static Resultado red(String detalle) {
            return new Resultado(-1, detalle);
        }

        public boolean exitoso() {
            return status >= 200 && status < 300;
        }

        /** Red caída, n8n arrancando (404 mientras registra el webhook) o error 5xx genérico. */
        boolean reintentable() {
            return status == -1 || status == 404 || status == 500 || status == 503;
        }
    }
}
