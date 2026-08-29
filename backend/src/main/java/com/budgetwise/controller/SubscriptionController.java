package com.budgetwise.controller;

import com.budgetwise.model.entity.Subscription;
import com.budgetwise.model.entity.User;
import com.budgetwise.service.SubscriptionService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/subscriptions")
@CrossOrigin(origins = { "http://localhost:3000", "http://localhost:3002", "http://localhost:5173", "https://budgetwise-ai-expense-tracker-analyser.vercel.app" })
public class SubscriptionController {

    private final SubscriptionService subscriptionService;

    public SubscriptionController(SubscriptionService subscriptionService) {
        this.subscriptionService = subscriptionService;
    }

    @GetMapping
    public ResponseEntity<List<Subscription>> getSubscriptions(Authentication authentication) {
        Long userId = ((User) authentication.getPrincipal()).getId();
        return ResponseEntity.ok(subscriptionService.getUserSubscriptions(userId));
    }

    @PostMapping
    public ResponseEntity<Subscription> createSubscription(@RequestBody Subscription subscription, 
                                                         @RequestParam Long categoryId,
                                                         Authentication authentication) {
        Long userId = ((User) authentication.getPrincipal()).getId();
        return ResponseEntity.ok(subscriptionService.createSubscription(userId, subscription, categoryId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Subscription> updateSubscription(@PathVariable Long id, 
                                                         @RequestBody Subscription subscription,
                                                         @RequestParam(required = false) Long categoryId,
                                                         Authentication authentication) {
        Long userId = ((User) authentication.getPrincipal()).getId();
        return ResponseEntity.ok(subscriptionService.updateSubscription(userId, id, subscription, categoryId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteSubscription(@PathVariable Long id, Authentication authentication) {
        Long userId = ((User) authentication.getPrincipal()).getId();
        subscriptionService.deleteSubscription(userId, id);
        return ResponseEntity.ok().build();
    }
}
