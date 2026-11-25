package co.campuslands.aiacademy.leads;

import co.campuslands.aiacademy.leads.entity.UsuarioAdmin;
import co.campuslands.aiacademy.leads.repository.LeadRepository;
import co.campuslands.aiacademy.leads.repository.SeguimientoRepository;
import co.campuslands.aiacademy.leads.repository.UsuarioAdminRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.hamcrest.Matchers.startsWith;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class LeadApiIntegrationTest {

    @Autowired MockMvc mvc;
    @Autowired ObjectMapper json;
    @Autowired LeadRepository leads;
    @Autowired SeguimientoRepository seguimientos;
    @Autowired UsuarioAdminRepository admins;
    @Autowired PasswordEncoder encoder;

    @BeforeEach
    void limpiar() {
        seguimientos.deleteAll();
        leads.deleteAll();
    }

    private static String lead(String nombre, String correo, String telefono, String programa) {
        return """
                {"nombre":%s,"correo":%s,"telefono":%s,"programaInteres":%s}
                """.formatted(q(nombre), q(correo), q(telefono), q(programa));
    }

    private static String q(String s) {
        return s == null ? "null" : "\"" + s + "\"";
    }

    private long registrar(String correo, String programa) throws Exception {
        MvcResult r = mvc.perform(post("/api/leads").contentType(MediaType.APPLICATION_JSON)
                        .content(lead("María Fernanda Ruiz", correo, "+57 300 123 4567", programa)))
                .andExpect(status().isCreated())
                .andReturn();
        return json.readTree(r.getResponse().getContentAsString()).get("id").asLong();
    }

    private String token() throws Exception {
        MvcResult r = mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"correo\":\"admin@test.com\",\"password\":\"ClaveSegura123\"}"))
                .andExpect(status().isOk())
                .andReturn();
        return "Bearer " + json.readTree(r.getResponse().getContentAsString()).get("token").asText();
    }

    @Test
    @DisplayName("POST /api/leads es público, guarda en BD y abre el historial con estado NUEVO")
    void registroPublico() throws Exception {
        mvc.perform(post("/api/leads").contentType(MediaType.APPLICATION_JSON)
                        .content(lead("  Juan   Pérez ", "JUAN.Perez@Example.com", "", "BOOSTER")))
                .andExpect(status().isCreated())
                .andExpect(header().string("Location", startsWith("http://localhost/api/leads/")))
                .andExpect(jsonPath("$.nombre").value("Juan Pérez"))
                .andExpect(jsonPath("$.programaNombre").value("Booster"));

        var guardado = leads.findAll().get(0);
        assertThat(guardado.getCorreo()).isEqualTo("juan.perez@example.com");
        assertThat(guardado.getTelefono()).isNull();
        assertThat(guardado.getEstado().name()).isEqualTo("NUEVO");
        assertThat(guardado.getFechaRegistro()).isNotNull();
        var historial = seguimientos.findByLeadIdOrderByFechaAscIdAsc(guardado.getId());
        assertThat(historial.get(0).getEstadoNuevo().name()).isEqualTo("NUEVO");
        assertThat(historial.get(0).getEstadoAnterior()).isNull();
    }

    @Test
    @DisplayName("Validaciones: campos obligatorios, correo inválido y programa inexistente")
    void validaciones() throws Exception {
        mvc.perform(post("/api/leads").contentType(MediaType.APPLICATION_JSON)
                        .content(lead("", "no-es-correo", "abc", "BOOSTER")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors.nombre").exists())
                .andExpect(jsonPath("$.fieldErrors.correo").value("Ingresa un correo electrónico válido"))
                .andExpect(jsonPath("$.fieldErrors.telefono").exists());

        mvc.perform(post("/api/leads").contentType(MediaType.APPLICATION_JSON)
                        .content(lead("Ana Gómez", "ana@example.com", null, "INVENTADO")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors.programaInteres").exists());

        // Todos los errores llegan juntos, también cuando el programa no existe.
        mvc.perform(post("/api/leads").contentType(MediaType.APPLICATION_JSON)
                        .content(lead("", "x@", null, "OTRO")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors.nombre").exists())
                .andExpect(jsonPath("$.fieldErrors.correo").exists())
                .andExpect(jsonPath("$.fieldErrors.programaInteres").exists());

        // El programa se acepta sin distinguir mayúsculas.
        mvc.perform(post("/api/leads").contentType(MediaType.APPLICATION_JSON)
                        .content(lead("Ana Gómez", "ana@example.com", null, "nebula")))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.programaInteres").value("NEBULA"));
        seguimientos.deleteAll();
        leads.deleteAll();

        mvc.perform(post("/api/leads").contentType(MediaType.APPLICATION_JSON)
                        .content(lead("Ana Gómez", "ana@example.com", null, null)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors.programaInteres").value("Selecciona el programa de interés"));

        mvc.perform(post("/api/leads").contentType(MediaType.APPLICATION_JSON).content("{malformado"))
                .andExpect(status().isBadRequest());
        assertThat(leads.count()).isZero();
    }

    @Test
    @DisplayName("Control de envíos repetidos: mismo correo y programa → 409; otro programa sí se permite")
    void duplicados() throws Exception {
        registrar("repetido@example.com", "LIFTOFF");
        mvc.perform(post("/api/leads").contentType(MediaType.APPLICATION_JSON)
                        .content(lead("Otra Persona", "REPETIDO@example.com", null, "LIFTOFF")))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.fieldErrors.correo").exists());
        registrar("repetido@example.com", "NEBULA");
        assertThat(leads.count()).isEqualTo(2);
    }

    @Test
    @DisplayName("Las rutas administrativas exigen JWT; credenciales erróneas → 401")
    void seguridad() throws Exception {
        long id = registrar("seguro@example.com", "IGNITION");
        mvc.perform(get("/api/leads")).andExpect(status().isUnauthorized());
        mvc.perform(get("/api/leads/" + id)).andExpect(status().isUnauthorized());
        mvc.perform(get("/api/dashboard/metrics")).andExpect(status().isUnauthorized());
        mvc.perform(get("/api/leads").header("Authorization", "Bearer token.falso.invalido")).andExpect(status().isUnauthorized());
        mvc.perform(patch("/api/leads/" + id + "/status").contentType(MediaType.APPLICATION_JSON).content("{\"estado\":\"INSCRITO\"}"))
                .andExpect(status().isUnauthorized());
        mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"correo\":\"admin@test.com\",\"password\":\"incorrecta\"}"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("Correo o contraseña incorrectos"));
    }

    @Test
    @DisplayName("La contraseña del administrador se guarda como hash BCrypt")
    void passwordHasheada() {
        UsuarioAdmin admin = admins.findByCorreoIgnoreCase("admin@test.com").orElseThrow();
        assertThat(admin.getPasswordHash()).startsWith("$2a$12$").isNotEqualTo("ClaveSegura123");
        assertThat(encoder.matches("ClaveSegura123", admin.getPasswordHash())).isTrue();
    }

    @Test
    @DisplayName("Flujo administrativo completo: listar, filtrar, detalle, estado, nota, edición, historial y métricas")
    void flujoAdministrativo() throws Exception {
        String auth = token();
        long id = registrar("flujo@example.com", "BOOSTER");
        registrar("otro@example.com", "NEBULA");

        mvc.perform(get("/api/leads").header("Authorization", auth))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElements").value(2));
        mvc.perform(get("/api/leads").param("q", "FLUJO").header("Authorization", auth))
                .andExpect(jsonPath("$.totalElements").value(1))
                .andExpect(jsonPath("$.content[0].correo").value("flujo@example.com"));
        mvc.perform(get("/api/leads").param("programa", "NEBULA").header("Authorization", auth))
                .andExpect(jsonPath("$.totalElements").value(1));
        mvc.perform(get("/api/leads").param("estado", "INSCRITO").header("Authorization", auth))
                .andExpect(jsonPath("$.totalElements").value(0));
        mvc.perform(get("/api/leads").param("estado", "NO_EXISTE").header("Authorization", auth))
                .andExpect(status().isBadRequest());

        mvc.perform(get("/api/leads/" + id).header("Authorization", auth))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.estado").value("NUEVO"));
        mvc.perform(get("/api/leads/999999").header("Authorization", auth))
                .andExpect(status().isNotFound());

        mvc.perform(patch("/api/leads/" + id + "/status").header("Authorization", auth)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"estado\":\"CONTACTADO\",\"nota\":\"Llamada inicial por WhatsApp\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.estado").value("CONTACTADO"));
        mvc.perform(patch("/api/leads/" + id + "/status").header("Authorization", auth)
                        .contentType(MediaType.APPLICATION_JSON).content("{\"estado\":\"CONTACTADO\"}"))
                .andExpect(status().isUnprocessableEntity());

        mvc.perform(post("/api/leads/" + id + "/notes").header("Authorization", auth)
                        .contentType(MediaType.APPLICATION_JSON).content("{\"nota\":\"Pidió propuesta para 8 personas\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.tipo").value("NOTA"))
                .andExpect(jsonPath("$.responsable").value("Admin Pruebas (admin@test.com)"));
        mvc.perform(post("/api/leads/" + id + "/notes").header("Authorization", auth)
                        .contentType(MediaType.APPLICATION_JSON).content("{\"nota\":\"   \"}"))
                .andExpect(status().isBadRequest());

        mvc.perform(put("/api/leads/" + id).header("Authorization", auth).contentType(MediaType.APPLICATION_JSON)
                        .content(lead("María Fernanda Ruiz", "flujo@example.com", "3001112233", "LIFTOFF")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.programaInteres").value("LIFTOFF"))
                .andExpect(jsonPath("$.telefono").value("3001112233"));

        mvc.perform(patch("/api/leads/" + id + "/status").header("Authorization", auth)
                        .contentType(MediaType.APPLICATION_JSON).content("{\"estado\":\"INSCRITO\"}"))
                .andExpect(status().isOk());

        MvcResult h = mvc.perform(get("/api/leads/" + id + "/history").header("Authorization", auth))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].tipo").value("REGISTRO"))
                .andExpect(jsonPath("$[*].tipo", hasItem("CAMBIO_ESTADO")))
                .andExpect(jsonPath("$[*].nota", hasItem("Pidió propuesta para 8 personas")))
                .andReturn();
        JsonNode historial = json.readTree(h.getResponse().getContentAsString());
        // Cronológico: cada fecha es mayor o igual que la anterior.
        for (int i = 1; i < historial.size(); i++) {
            assertThat(historial.get(i).get("fecha").asText()).isGreaterThanOrEqualTo(historial.get(i - 1).get("fecha").asText());
        }

        mvc.perform(get("/api/dashboard/metrics").header("Authorization", auth))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.total").value(2))
                .andExpect(jsonPath("$.nuevos").value(1))
                .andExpect(jsonPath("$.inscritos").value(1))
                .andExpect(jsonPath("$.contactados").value(0))
                .andExpect(jsonPath("$.tasaConversion").value(50.0))
                .andExpect(jsonPath("$.registrosUltimos7Dias").value(2))
                .andExpect(jsonPath("$.registrosPorDia.length()").value(14));

        mvc.perform(get("/api/auth/me").header("Authorization", auth))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.correo").value("admin@test.com"));
    }

    @Test
    @DisplayName("Otro administrador entra con su cuenta y continúa el seguimiento; el historial muestra quién hizo cada cosa")
    void segundoAdministradorContinuaElSeguimiento() throws Exception {
        String auth = token();
        long id = registrar("continuidad@example.com", "IGNITION");
        mvc.perform(patch("/api/leads/" + id + "/status").header("Authorization", auth).contentType(MediaType.APPLICATION_JSON)
                        .content("{\"estado\":\"CONTACTADO\",\"nota\":\"Primera llamada: pide fechas de enero\"}"))
                .andExpect(status().isOk());

        // Alta del segundo administrador (contraseña con BCrypt, sin exponer el hash).
        mvc.perform(post("/api/admins").header("Authorization", auth).contentType(MediaType.APPLICATION_JSON)
                        .content("{\"nombre\":\"Coordinadora de Admisiones\",\"correo\":\"Coordinacion@Test.com\",\"password\":\"OtraClave2026\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.correo").value("coordinacion@test.com"))
                .andExpect(jsonPath("$.passwordHash").doesNotExist());
        mvc.perform(post("/api/admins").header("Authorization", auth).contentType(MediaType.APPLICATION_JSON)
                        .content("{\"nombre\":\"Repetida\",\"correo\":\"coordinacion@test.com\",\"password\":\"OtraClave2026\"}"))
                .andExpect(status().isConflict());
        mvc.perform(post("/api/admins").header("Authorization", auth).contentType(MediaType.APPLICATION_JSON)
                        .content("{\"nombre\":\"Corta\",\"correo\":\"corta@test.com\",\"password\":\"123\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors.password").exists());
        mvc.perform(post("/api/admins").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"nombre\":\"Intruso\",\"correo\":\"x@test.com\",\"password\":\"OtraClave2026\"}"))
                .andExpect(status().isUnauthorized());
        mvc.perform(get("/api/admins").header("Authorization", auth))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[*].correo", hasItem("coordinacion@test.com")));

        // La segunda persona inicia sesión y continúa.
        MvcResult r = mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"correo\":\"coordinacion@test.com\",\"password\":\"OtraClave2026\"}"))
                .andExpect(status().isOk()).andReturn();
        String auth2 = "Bearer " + json.readTree(r.getResponse().getContentAsString()).get("token").asText();
        mvc.perform(post("/api/leads/" + id + "/notes").header("Authorization", auth2).contentType(MediaType.APPLICATION_JSON)
                        .content("{\"nota\":\"Retomo el caso: envié la propuesta de Ignition para enero\"}"))
                .andExpect(status().isCreated());
        mvc.perform(patch("/api/leads/" + id + "/status").header("Authorization", auth2).contentType(MediaType.APPLICATION_JSON)
                        .content("{\"estado\":\"INTERESADO\"}"))
                .andExpect(status().isOk());

        mvc.perform(get("/api/leads/" + id + "/history").header("Authorization", auth2))
                .andExpect(jsonPath("$[*].responsable", hasItem("Admin Pruebas (admin@test.com)")))
                .andExpect(jsonPath("$[*].responsable", hasItem("Coordinadora de Admisiones (coordinacion@test.com)")))
                .andExpect(jsonPath("$[-1].estadoAnterior").value("CONTACTADO"))
                .andExpect(jsonPath("$[-1].estadoNuevo").value("INTERESADO"));
        admins.findByCorreoIgnoreCase("coordinacion@test.com").ifPresent(admins::delete);
    }

    @Test
    @DisplayName("Healthcheck público para Docker")
    void health() throws Exception {
        mvc.perform(get("/actuator/health")).andExpect(status().isOk()).andExpect(jsonPath("$.status").value("UP"));
    }
}
