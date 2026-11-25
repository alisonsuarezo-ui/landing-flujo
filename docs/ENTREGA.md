# Entrega · Reto 4 · Campuslands AI Academy

**Automatización de interesados, notificación por Telegram y seguimiento administrativo.**
Landing → Formulario → Spring Boot → PostgreSQL → n8n → Telegram → Panel `/admin/` → Seguimiento.

Este documento resume lo que va en la carpeta de Drive: enlaces, acceso al panel de prueba y cómo ejecutar y verificar el proyecto.

---

## 1. Enlaces

| Qué | Dónde |
|---|---|
| Código del proyecto | https://github.com/alisonsuarezo-ui/landing-flujo |
| Demo en video (77 s) | [`docs/demo/demo-reto4.mp4`](demo/demo-reto4.mp4). Súbelo también a la carpeta de Drive |
| Flujo de n8n exportado (JSON) | [`n8n/workflows/campuslands-nuevo-interesado.json`](../n8n/workflows/campuslands-nuevo-interesado.json) |
| Capturas | [`docs/capturas/`](capturas/) |
| Documentación técnica completa | [`README.md`](../README.md) |

> **Demo en vivo:** el proyecto corre en local con Docker (sección 3), y en unos 5 minutos queda disponible en `http://localhost:8080`. Si lo publicas en un servidor, reemplaza esta línea por su URL.

---

## 2. Acceso al panel de prueba

| | |
|---|---|
| URL | `http://localhost:8080/admin/` |
| Usuario | `admin@campuslands.com` (variable `ADMIN_EMAIL`) |
| Contraseña | **No está en ningún archivo compartido.** La defines tú en `.env` (`ADMIN_PASSWORD=…`). Si la dejas vacía, el sistema genera una en el primer arranque y la muestra con `docker compose logs backend \| grep -A3 CONTRASE` |
| Segundo administrador | `coordinacion@example.com`. Lo crea `scripts/cargar-datos-demo.sh`, que imprime su contraseña solo en la consola. También se puede crear desde el panel, en la sección **Equipo** |

Si las credenciales de prueba se entregan al equipo evaluador, se comparten por un canal privado, no dentro de la carpeta.

---

## 3. Cómo ejecutarlo (≈ 5 minutos)

Requisitos: Docker. En Linux, Docker Engine (`curl -fsSL https://get.docker.com | sudo sh`). En Windows o macOS, Docker Desktop.

```bash
git clone https://github.com/alisonsuarezo-ui/landing-flujo.git
cd landing-flujo

# Credenciales FUERA de los archivos compartidos: van en .env, que nunca se sube al repositorio
cp .env.example .env
#   ADMIN_PASSWORD=     → contraseña del panel
#   TELEGRAM_BOT_TOKEN= → token de @BotFather
#   TELEGRAM_CHAT_ID=   → chat o grupo que recibe los avisos

docker compose up -d --build     # la primera vez tarda de 3 a 8 minutos
docker compose ps                # los 4 servicios deben quedar "healthy"

./scripts/cargar-datos-demo.sh   # opcional: interesados ficticios + seguimiento hecho por dos administradores
```

| Servicio | URL |
|---|---|
| Landing con el formulario | http://localhost:8080 (sección «Inscripción») |
| Panel administrativo | http://localhost:8080/admin/ |
| n8n (editor y ejecuciones) | http://localhost:5678 |

---

## 4. Cómo verificarlo (los tres criterios de evaluación)

### 4.1 «Que el registro se guarde»
1. En la landing, pulsa **Elegir Booster** (o **Inscríbete**) y completa el formulario con datos ficticios.
2. Aparece la confirmación «¡Listo, …! Registro confirmado».
3. En el panel aparece en la tabla con estado **Nuevo**. También se puede comprobar directamente en PostgreSQL:
   ```bash
   docker compose exec postgres psql -U campuslands -d campuslands_leads \
     -c "select id, nombre, correo, programa_interes, estado, fecha_registro from leads order by id desc limit 5;"
   ```
4. Si se repite el mismo correo y programa, el sistema no duplica el registro: muestra un aviso y la API responde `409`.

### 4.2 «Que el aviso corresponda a esa persona»
El mensaje de Telegram incluye el **número de registro**, el nombre, el correo, el teléfono, el programa, la fecha y un enlace directo a esa persona en el panel:

```
🚀 Nuevo interesado registrado
🆔 Registro #11

👤 Nombre: Isabela Correa Nieto
📧 Correo: isabela.correa@example.com
📱 Teléfono: +57 300 000 0112
🎓 Programa: Booster (8 h · En vivo)
🗓️ Fecha de registro: 24/11/2026 11:31 p. m.

🔎 Seguimiento en el panel: http://localhost:8080/admin/#lead-11
```

- El enlace `#lead-11` abre el detalle de **esa misma** persona. Su número (#11) coincide con el del panel.
- En el historial de la persona queda el evento «Notificación enviada: n8n recibió el registro y lo reenvió a Telegram». Si Telegram falla, también queda registrado, con la causa.
- En n8n → *Executions* se ve la ejecución de cada registro.

### 4.3 «Que otro administrador pueda entender y continuar el seguimiento»
1. En el panel, sección **Equipo**, crea una segunda cuenta (o usa la que crea `cargar-datos-demo.sh`).
2. Cierra sesión y entra con esa cuenta.
3. Abre a la persona. Arriba aparece **«Último seguimiento»**: quién lo hizo, cuándo y qué quedó pendiente.
4. El **historial cronológico** muestra cada paso con fecha y responsable: registro, aviso, cambios de estado y notas.
5. Agrega una nota y cambia el estado. El historial muestra a las dos personas, en orden.

Con los datos de demo, el caso de **Mariana Ortiz Vega** muestra este traspaso: el administrador principal hace el primer contacto y Coordinación de admisiones lo retoma.

### 4.4 Pruebas automáticas
```bash
cd backend && mvn test                                 # 15 pruebas (incluida la de un segundo administrador)
ADMIN_PASSWORD='<la tuya>' ./scripts/prueba-e2e.sh     # 33 verificaciones contra el stack levantado
```

---

## 5. Datos ficticios y credenciales

- Todos los datos de demo son **ficticios**: correos `@example.com` (dominio reservado para ejemplos) y teléfonos `+57 300 000 01xx`.
- **Ninguna credencial está en los archivos compartidos.** `.env` está en `.gitignore`. El token y el chat de Telegram solo se leen de variables de entorno, el JSON del workflow no contiene credenciales y las contraseñas del panel se guardan cifradas con BCrypt.

## 6. Nota sobre las evidencias

El video, las capturas y [`evidencias/avisos-telegram-simulador.txt`](evidencias/avisos-telegram-simulador.txt) se grabaron en un entorno **sin acceso a `api.telegram.org`**. Por eso n8n envió los avisos a un **simulador de la Bot API**: la misma petición `sendMessage`, con el mismo texto. Con un token real, el mismo mensaje llega al chat de Telegram. Para la carpeta de Drive se recomienda agregar una captura del aviso real en Telegram después de configurar el bot (README, §10).

## 7. Qué subir a la carpeta de Drive

- [ ] Este documento (`docs/ENTREGA.md`, o su enlace en GitHub)
- [ ] Enlace al repositorio con el código
- [ ] Video de la demo (`docs/demo/demo-reto4.mp4`) y, si es posible, una grabación propia con el aviso real en Telegram
- [ ] Flujo de n8n en JSON (`n8n/workflows/campuslands-nuevo-interesado.json`)
- [ ] Capturas (`docs/capturas/`)
- [ ] **No** subir `.env` ni ningún archivo con contraseñas o tokens
