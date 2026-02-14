package com.budgetwise.service;

import com.budgetwise.model.entity.Transaction;
import com.budgetwise.model.entity.User;
import com.budgetwise.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ChatService {

    private final TransactionService transactionService;
    private final BudgetService budgetService;
    private final UserRepository userRepository;
    private final LLMService llmService;

    public ChatService(TransactionService transactionService, BudgetService budgetService,
            UserRepository userRepository, LLMService llmService) {
        this.transactionService = transactionService;
        this.budgetService = budgetService;
        this.userRepository = userRepository;
        this.llmService = llmService;
    }

    public String processMessage(String message, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Long userId = user.getId();

        // 1. Build Context
        String financialContext = buildFinancialContext(userId, email);

        // 2. Construct System Prompt
        String systemPrompt = "You are BudgetWise AI, a helpful and friendly financial advisor. " +
                "You have access to the user's financial data below. " +
                "Answer the user's questions based ONLY on this data. " +
                "If the user asks about something not in the data, say you don't know but can help with their balance, expenses, or budgets. "
                +
                "Keep your answers concise and supportive.\n\n" +
                "User Financial Data:\n" + financialContext;

        // 3. Call LLM
        String aiResponse = llmService.getChatResponse(systemPrompt, message);

        // 4. Fallback if AI fails (e.g. invalid key)
        if (aiResponse.startsWith("Error") || aiResponse.contains("Configuration Error")) {
            return processMessageFallback(message, userId, email) + "\n\n(AI Request Failed: " + aiResponse + ")";
        }

        return aiResponse;
    }

    public String generateInsights(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Long userId = user.getId();

        String financialContext = buildFinancialContext(userId, email);

        String systemPrompt = "You are an AI financial analyst. Analyze the user's financial data below and provide 4-6 short, actionable insights. "
                +
                "Return the response strictly as a valid JSON array of objects. Do not include markdown formatting. " +
                "Each object must have the following fields:\n" +
                "- type: One of ['Spending Alert', 'Savings Opportunity', 'Positive Trend', 'Investment Tip', 'Goal Progress', 'Smart Suggestion']\n"
                +
                "- title: A short, catchy title (max 5 words)\n" +
                "- description: A clear 1-2 sentence explanation\n" +
                "- sentiment: One of ['positive', 'negative', 'neutral'] (used for UI coloring)\n\n" +
                "User Data:\n" + financialContext;

        String response = llmService.getChatResponse(systemPrompt, "Generate financial insights JSON.");

        // Clean up markdown code blocks if present
        if (response.startsWith("```json")) {
            response = response.replace("```json", "").replace("```", "");
        } else if (response.startsWith("```")) {
            response = response.replace("```", "");
        }

        return response.trim();
    }

    private String buildFinancialContext(Long userId, String email) {
        BigDecimal income = transactionService.getTotalIncome(userId);
        BigDecimal expenses = transactionService.getTotalExpenses(userId);
        income = income != null ? income : BigDecimal.ZERO;
        expenses = expenses != null ? expenses : BigDecimal.ZERO;
        BigDecimal balance = income.subtract(expenses);

        StringBuilder sb = new StringBuilder();
        sb.append("- Total Income: ").append(income).append("\n");
        sb.append("- Total Expenses: ").append(expenses).append("\n");
        sb.append("- Current Balance: ").append(balance).append("\n");

        // Add Budgets
        List<Map<String, Object>> budgets = budgetService.getBudgetStatus(email);
        if (!budgets.isEmpty()) {
            sb.append("- Budgets:\n");
            for (Map<String, Object> b : budgets) {
                sb.append("  * ").append(b.get("categoryName")).append(": ")
                        .append(b.get("spent")).append("/").append(b.get("limitAmount"))
                        .append(" (Status: ").append(b.get("status")).append(")\n");
            }
        } else {
            sb.append("- Budgets: None set for this month.\n");
        }

        // Add Recent Transactions (last 5)
        List<Transaction> transactions = transactionService.getUserTransactions(userId);
        if (!transactions.isEmpty()) {
            sb.append("- Recent Transactions:\n");
            transactions.stream().limit(5).forEach(tx -> {
                sb.append("  * ").append(tx.getTransactionDate().toLocalDate()).append(": ")
                        .append(tx.getDescription()).append(" - ").append(tx.getAmount())
                        .append(" (").append(tx.getType()).append(")\n");
            });
        }

        return sb.toString();
    }

    // Original rule-based logic as fallback
    private String processMessageFallback(String message, Long userId, String email) {
        String lowerCaseMessage = message.toLowerCase();

        if (lowerCaseMessage.contains("balance")) {
            BigDecimal income = transactionService.getTotalIncome(userId);
            BigDecimal expenses = transactionService.getTotalExpenses(userId);
            income = income != null ? income : BigDecimal.ZERO;
            expenses = expenses != null ? expenses : BigDecimal.ZERO;
            return "Your current balance is " + income.subtract(expenses);
        }
        // ... (simplified fallback)
        return "I'm having trouble connecting to my brain right now. Please check your API key.";
    }
}
