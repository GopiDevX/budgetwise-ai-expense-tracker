package com.budgetwise.controller;

import com.budgetwise.dto.BudgetRequest;
import com.budgetwise.model.entity.Budget;
import com.budgetwise.service.BudgetService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/budgets")
@CrossOrigin(origins = { "http://localhost:3000", "http://localhost:3002", "http://localhost:5173" })
public class BudgetController {

    private final BudgetService budgetService;

    public BudgetController(BudgetService budgetService) {
        this.budgetService = budgetService;
    }

    @GetMapping
    public ResponseEntity<?> getBudgets(
            Authentication authentication,
            @RequestParam Integer month,
            @RequestParam Integer year) {
        try {
            String email = authentication.getName();
            List<Budget> budgets = budgetService.getBudgetsForMonth(email, month, year);
            return ResponseEntity.ok(budgets);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/status")
    public ResponseEntity<?> getBudgetStatus(Authentication authentication) {
        try {
            String email = authentication.getName();
            List<Map<String, Object>> status = budgetService.getBudgetStatus(email);
            return ResponseEntity.ok(status);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping
    public ResponseEntity<?> createOrUpdateBudget(
            Authentication authentication,
            @Valid @RequestBody BudgetRequest request) {
        try {
            String email = authentication.getName();
            Budget budget = budgetService.createOrUpdateBudget(email, request);

            Map<String, Object> response = new HashMap<>();
            response.put("id", budget.getId());
            response.put("categoryId", budget.getCategory() != null ? budget.getCategory().getId() : null);
            response.put("categoryName", budget.getCategory() != null ? budget.getCategory().getName() : "Total");
            response.put("limitAmount", budget.getLimitAmount());
            response.put("month", budget.getMonth());
            response.put("year", budget.getYear());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteBudget(
            Authentication authentication,
            @PathVariable Long id) {
        try {
            String email = authentication.getName();
            budgetService.deleteBudget(email, id);
            return ResponseEntity.ok(Map.of("message", "Budget deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
