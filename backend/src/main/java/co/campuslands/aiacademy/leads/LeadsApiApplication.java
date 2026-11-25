package co.campuslands.aiacademy.leads;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;
import org.springframework.scheduling.annotation.EnableAsync;

/**
 * API de interesados de Campuslands AI Academy (Reto 4).
 *
 * Landing → POST /api/leads → PostgreSQL → webhook n8n → Telegram → panel /admin/.
 */
@SpringBootApplication
@ConfigurationPropertiesScan
@EnableAsync
public class LeadsApiApplication {

    public static void main(String[] args) {
        SpringApplication.run(LeadsApiApplication.class, args);
    }
}
