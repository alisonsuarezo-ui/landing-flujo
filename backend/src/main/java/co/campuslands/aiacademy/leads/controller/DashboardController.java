package co.campuslands.aiacademy.leads.controller;

import co.campuslands.aiacademy.leads.dto.DashboardMetricsResponse;
import co.campuslands.aiacademy.leads.service.DashboardService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/metrics")
    public DashboardMetricsResponse metricas() {
        return dashboardService.metricas();
    }
}
