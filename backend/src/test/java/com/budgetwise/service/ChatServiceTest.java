package com.budgetwise.service;

import com.budgetwise.model.entity.User;
import com.budgetwise.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class ChatServiceTest {

    @Mock
    private TransactionService transactionService;

    @Mock
    private BudgetService budgetService;

    @Mock
    private UserRepository userRepository;

    @Mock
    private LLMService llmService; // Added Mock

    private ChatService chatService;

    @BeforeEach
    void setUp() {
        chatService = new ChatService(transactionService, budgetService, userRepository, llmService); // Updated
                                                                                                      // Constructor
    }

    @Test
    void testBalanceInquiry() {
        User user = new User();
        user.setId(1L);
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(user));

        // Mock fallback/LLM behavior
        // Since we are mocking, we can either simulate LLM response or fallback.
        // For simple tests, we can mock LLM to return specific strings or fail to
        // trigger fallback

        when(transactionService.getTotalIncome(1L)).thenReturn(new BigDecimal("5000"));
        when(transactionService.getTotalExpenses(1L)).thenReturn(new BigDecimal("2000"));

        // Mock LLM to fail so it uses fallback logic for this specific test case (or we
        // can test LLM path separately)
        when(llmService.getChatResponse(anyString(), anyString())).thenReturn("Error: API Key missing");

        String response = chatService.processMessage("What is my balance?", "test@example.com");

        // Fallback logic currently returns: "Your current balance is 3000"
        assertTrue(response.contains("3000"));
        assertTrue(response.contains("current balance"));
    }

    @Test
    void testLLMPath() {
        User user = new User();
        user.setId(1L);
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(user));
        when(transactionService.getTotalIncome(1L)).thenReturn(BigDecimal.ZERO);
        when(transactionService.getTotalExpenses(1L)).thenReturn(BigDecimal.ZERO);

        when(llmService.getChatResponse(anyString(), anyString())).thenReturn("This is an AI response.");

        String response = chatService.processMessage("Hello AI", "test@example.com");

        assertTrue(response.equals("This is an AI response."));
    }
}
