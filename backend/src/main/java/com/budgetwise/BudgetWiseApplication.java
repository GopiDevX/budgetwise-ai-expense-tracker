package com.budgetwise;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

import java.io.File;
import java.nio.file.Files;
import java.util.List;

@SpringBootApplication
@EnableAsync
public class BudgetWiseApplication {

    public static void main(String[] args) {
        loadDotEnv();
        SpringApplication.run(BudgetWiseApplication.class, args);
    }

    private static void loadDotEnv() {
        try {
            File envFile = new File(".env");
            if (!envFile.exists()) {
                envFile = new File("backend/.env");
            }
            if (envFile.exists()) {
                List<String> lines = Files.readAllLines(envFile.toPath());
                for (String line : lines) {
                    line = line.trim();
                    if (!line.isEmpty() && !line.startsWith("#") && line.contains("=")) {
                        int index = line.indexOf("=");
                        String key = line.substring(0, index).trim();
                        String value = line.substring(index + 1).trim();
                        System.setProperty(key, value);
                    }
                }
                System.out.println("Successfully loaded environment variables from .env file.");
            }
        } catch (Exception e) {
            System.err.println("Notice: Could not load .env file: " + e.getMessage());
        }
    }
}
