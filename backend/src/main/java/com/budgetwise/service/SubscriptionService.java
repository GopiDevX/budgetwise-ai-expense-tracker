package com.budgetwise.service;

import com.budgetwise.model.entity.Category;
import com.budgetwise.model.entity.Subscription;
import com.budgetwise.model.entity.Transaction;
import com.budgetwise.model.entity.User;
import com.budgetwise.repository.CategoryRepository;
import com.budgetwise.repository.SubscriptionRepository;
import com.budgetwise.repository.TransactionRepository;
import com.budgetwise.repository.UserRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
public class SubscriptionService {

    private final SubscriptionRepository subscriptionRepository;
    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;

    public SubscriptionService(SubscriptionRepository subscriptionRepository, 
                             TransactionRepository transactionRepository,
                             UserRepository userRepository,
                             CategoryRepository categoryRepository) {
        this.subscriptionRepository = subscriptionRepository;
        this.transactionRepository = transactionRepository;
        this.userRepository = userRepository;
        this.categoryRepository = categoryRepository;
    }

    public List<Subscription> getUserSubscriptions(Long userId) {
        return subscriptionRepository.findByUserId(userId);
    }

    @Transactional
    public Subscription createSubscription(Long userId, Subscription subscription, Long categoryId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new RuntimeException("Category not found"));

        subscription.setUser(user);
        subscription.setCategory(category);
        return subscriptionRepository.save(subscription);
    }

    @Transactional
    public Subscription updateSubscription(Long userId, Long subscriptionId, Subscription updatedSub, Long categoryId) {
        Subscription existing = subscriptionRepository.findById(subscriptionId)
                .orElseThrow(() -> new RuntimeException("Subscription not found"));

        if (!existing.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized");
        }

        if (categoryId != null && !existing.getCategory().getId().equals(categoryId)) {
            Category category = categoryRepository.findById(categoryId)
                    .orElseThrow(() -> new RuntimeException("Category not found"));
            existing.setCategory(category);
        }

        existing.setName(updatedSub.getName());
        existing.setAmount(updatedSub.getAmount());
        existing.setBillingCycle(updatedSub.getBillingCycle());
        existing.setNextBillingDate(updatedSub.getNextBillingDate());
        existing.setActive(updatedSub.isActive());

        return subscriptionRepository.save(existing);
    }

    @Transactional
    public void deleteSubscription(Long userId, Long subscriptionId) {
        Subscription existing = subscriptionRepository.findById(subscriptionId)
                .orElseThrow(() -> new RuntimeException("Subscription not found"));

        if (!existing.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized");
        }
        subscriptionRepository.delete(existing);
    }

    // Runs every day at midnight to process due subscriptions
    @Scheduled(cron = "0 0 0 * * ?")
    @Transactional
    public void processDueSubscriptions() {
        LocalDate today = LocalDate.now();
        List<Subscription> dueSubscriptions = subscriptionRepository.findByActiveTrueAndNextBillingDateLessThanEqual(today);

        for (Subscription sub : dueSubscriptions) {
            // Log a new transaction for the subscription
            Transaction transaction = new Transaction();
            transaction.setUser(sub.getUser());
            transaction.setCategory(sub.getCategory());
            transaction.setDescription(sub.getName() + " (Auto-Renewal)");
            transaction.setAmount(sub.getAmount());
            transaction.setType(Transaction.TransactionType.EXPENSE);
            transaction.setTransactionDate(sub.getNextBillingDate().atStartOfDay());
            
            transactionRepository.save(transaction);

            // Calculate next billing date
            LocalDate nextDate = sub.getNextBillingDate();
            if (sub.getBillingCycle() == Subscription.BillingCycle.MONTHLY) {
                nextDate = nextDate.plusMonths(1);
            } else if (sub.getBillingCycle() == Subscription.BillingCycle.YEARLY) {
                nextDate = nextDate.plusYears(1);
            }
            
            // If the next date is STILL in the past (e.g. system was down), catch it up to the future
            while (nextDate.isBefore(today) || nextDate.isEqual(today)) {
                if (sub.getBillingCycle() == Subscription.BillingCycle.MONTHLY) {
                    nextDate = nextDate.plusMonths(1);
                } else {
                    nextDate = nextDate.plusYears(1);
                }
            }

            sub.setNextBillingDate(nextDate);
            subscriptionRepository.save(sub);
        }
    }
}
