package com.budgetwise.controller;

import com.budgetwise.dto.AiRequest;
import com.budgetwise.dto.AiResponse;
import com.budgetwise.service.AiService;
import com.budgetwise.service.TransactionService;
import com.budgetwise.model.entity.User;
import com.budgetwise.model.entity.Transaction;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/ai")
@CrossOrigin(origins = { "http://localhost:3000", "http://localhost:3002", "http://localhost:5173" })
public class AiController {

    private final AiService aiService;
    private final TransactionService transactionService;

    public AiController(AiService aiService, TransactionService transactionService) {
        this.aiService = aiService;
        this.transactionService = transactionService;
    }

    @PostMapping("/advisor")
    public ResponseEntity<AiResponse> getAdvisorResponse(@RequestBody AiRequest request, Authentication authentication) {
        String basePrompt = "You are an expert AI financial advisor for BudgetWise. Keep responses concise, helpful, and friendly. User says: ";
        String response = aiService.generateAdvice(basePrompt + request.getPrompt());
        return ResponseEntity.ok(new AiResponse(response));
    }

    @GetMapping("/insights")
    public ResponseEntity<AiResponse> getInsights(Authentication authentication) {
        Long userId = ((User) authentication.getPrincipal()).getId();
        List<Transaction> transactions = transactionService.getUserTransactions(userId);
        
        BigDecimal totalIncome = transactionService.getTotalIncome(userId);
        BigDecimal totalExpenses = transactionService.getTotalExpenses(userId);
        
        String prompt = String.format("Analyze my financial situation. Total Income: %s. Total Expenses: %s. I have %d recent transactions. Give me 3 bullet points of short, actionable financial advice.",
                totalIncome.toString(), totalExpenses.toString(), transactions.size());
                
        String advice = aiService.generateAdvice(prompt);
        return ResponseEntity.ok(new AiResponse(advice));
    }
}
