package co.campuslands.aiacademy.leads;

import co.campuslands.aiacademy.leads.repository.LeadRepository;
import co.campuslands.aiacademy.leads.repository.SeguimientoRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.sun.net.httpserver.HttpServer;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;

import java.io.IOException;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.util.concurrent.BlockingQueue;
import java.util.concurrent.LinkedBlockingQueue;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Verifica la integración con n8n contra un servidor HTTP local que imita el webhook:
 * payload, encabezado secreto, ejecución después del commit y nota en el historial.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class N8nWebhookIntegrationTest {

    record Recibido(String secreto, String cuerpo) {
    }

    static final BlockingQueue<Recibido> recibidos = new LinkedBlockingQueue<>();
    static final AtomicInteger estadoRespuesta = new AtomicInteger(200);
    static final HttpServer servidor;

    static {
        try {
            servidor = HttpServer.create(new InetSocketAddress("127.0.0.1", 0), 0);
        } catch (IOException e) {
            throw new IllegalStateException(e);
        }
        servidor.createContext("/webhook/campuslands-nuevo-interesado", ex -> {
            String cuerpo = new String(ex.getRequestBody().readAllBytes(), StandardCharsets.UTF_8);
            recibidos.add(new Recibido(ex.getRequestHeaders().getFirst("X-Webhook-Secret"), cuerpo));
            byte[] resp = "{\"ok\":true}".getBytes(StandardCharsets.UTF_8);
            ex.getResponseHeaders().add("Content-Type", "application/json");
            ex.sendResponseHeaders(estadoRespuesta.get(), resp.length);
            ex.getResponseBody().write(resp);
            ex.close();
        });
        servidor.start();
    }

    @DynamicPropertySource
    static void propiedades(DynamicPropertyRegistry r) {
        r.add("app.n8n.webhook-url", () -> "http://127.0.0.1:" + servidor.getAddress().getPort() + "/webhook/campuslands-nuevo-interesado");
        r.add("app.n8n.webhook-secret", () -> "secreto-compartido");
    }

    @AfterAll
    static void detener() {
        servidor.stop(0);
    }

    @Autowired MockMvc mvc;
    @Autowired ObjectMapper json;
    @Autowired LeadRepository leads;
    @Autowired SeguimientoRepository seguimientos;

    @BeforeEach
    void limpiar() {
        recibidos.clear();
        seguimientos.deleteAll();
        leads.deleteAll();
    }

    private void registrar(String correo) throws Exception {
        mvc.perform(post("/api/leads").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"nombre\":\"Laura Martínez\",\"correo\":\"" + correo + "\",\"telefono\":\"3001234567\",\"programaInteres\":\"ODYSSEY\"}"))
                .andExpect(status().isCreated());
    }

    private String ultimaNotaSistema(long leadId) throws InterruptedException {
        for (int i = 0; i < 50; i++) {
            var notas = seguimientos.findByLeadIdOrderByFechaAscIdAsc(leadId).stream()
                    .filter(s -> "Sistema · n8n".equals(s.getResponsable())).toList();
            if (!notas.isEmpty()) return notas.get(notas.size() - 1).getNota();
            Thread.sleep(100);
        }
        return null;
    }

    @Test
    @DisplayName("Al registrar un interesado, el backend llama al webhook de n8n con los datos y el secreto")
    void notificaAN8n() throws Exception {
        estadoRespuesta.set(200);
        registrar("laura@example.com");

        Recibido r = recibidos.poll(10, TimeUnit.SECONDS);
        assertThat(r).as("n8n debió recibir la notificación").isNotNull();
        assertThat(r.secreto()).isEqualTo("secreto-compartido");
        JsonNode body = json.readTree(r.cuerpo());
        assertThat(body.get("evento").asText()).isEqualTo("lead.registrado");
        assertThat(body.get("nombre").asText()).isEqualTo("Laura Martínez");
        assertThat(body.get("correo").asText()).isEqualTo("laura@example.com");
        assertThat(body.get("telefono").asText()).isEqualTo("3001234567");
        assertThat(body.get("programa").asText()).isEqualTo("ODYSSEY");
        assertThat(body.get("programaNombre").asText()).startsWith("Odyssey");
        assertThat(body.get("fechaRegistro").asText()).isNotBlank();
        assertThat(body.get("fechaRegistroTexto").asText()).isNotBlank();
        assertThat(body.get("panelUrl").asText()).startsWith("http://localhost:8080/admin/#lead-");

        long id = leads.findAll().get(0).getId();
        assertThat(ultimaNotaSistema(id)).startsWith("Notificación enviada");
    }

    @Test
    @DisplayName("Si Telegram falla (n8n responde 502) queda registrado en el historial y el lead se conserva")
    void telegramFalla() throws Exception {
        estadoRespuesta.set(502);
        registrar("falla@example.com");
        assertThat(recibidos.poll(10, TimeUnit.SECONDS)).isNotNull();
        long id = leads.findAll().get(0).getId();
        assertThat(ultimaNotaSistema(id)).contains("Telegram no aceptó el mensaje");
        assertThat(leads.count()).isEqualTo(1);
    }
}
