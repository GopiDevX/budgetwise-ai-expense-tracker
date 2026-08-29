package com.budgetwise.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@Service
public class AiService {

    @Value("${gemini.api.key}")
    private String apiKey;

    @Value("${gemini.api.url}")
    private String apiUrl;

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    public AiService() {
        this.restTemplate = new RestTemplate();
        this.objectMapper = new ObjectMapper();
    }

    public String generateAdvice(String prompt) {
        if (apiKey == null || apiKey.trim().isEmpty() || apiKey.contains("default_placeholder_key")) {
            return "Gemini API key is not configured. Please set GEMINI_API_KEY in backend/.env.";
        }

        String safeUrl = apiUrl.trim();
        String safeKey = apiKey.trim();
        String url = safeUrl.contains("?key=") ? safeUrl : safeUrl + "?key=" + safeKey;
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        
        try {
            // Build Gemini request safely
            Map<String, Object> requestBody = Map.of(
                "contents", List.of(
                    Map.of("parts", List.of(
                        Map.of("text", prompt)
                    ))
                )
            );
            
            String requestJson = objectMapper.writeValueAsString(requestBody);
            HttpEntity<String> request = new HttpEntity<>(requestJson, headers);
            
            ResponseEntity<Map> response = restTemplate.postForEntity(url, request, Map.class);
            Map<String, Object> body = response.getBody();
            
            if (body != null && body.containsKey("candidates")) {
                List<Map<String, Object>> candidates = (List<Map<String, Object>>) body.get("candidates");
                if (!candidates.isEmpty()) {
                    Map<String, Object> content = (Map<String, Object>) candidates.get(0).get("content");
                    List<Map<String, Object>> parts = (List<Map<String, Object>>) content.get("parts");
                    if (!parts.isEmpty()) {
                        return (String) parts.get(0).get("text");
                    }
                }
            }
            return "I am unable to generate advice at the moment.";
        } catch (org.springframework.web.client.HttpStatusCodeException e) {
            System.err.println("Gemini API Error (" + e.getStatusCode() + "): " + e.getResponseBodyAsString());
            return "AI Service Error (" + e.getStatusCode().value() + "): " + e.getStatusText();
        } catch (Exception e) {
            System.err.println("AI Service Error: " + e.getMessage());
            return "Unable to connect to AI Advisor: " + e.getMessage();
        }
    }

    public String extractReceiptData(org.springframework.web.multipart.MultipartFile file) {
        if (apiKey == null || apiKey.trim().isEmpty() || apiKey.contains("default_placeholder_key")) {
            return "{\"error\": \"Gemini API key is not configured.\"}";
        }

        String safeUrl = apiUrl.trim();
        String safeKey = apiKey.trim();
        String url = safeUrl.contains("?key=") ? safeUrl : safeUrl + "?key=" + safeKey;
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        
        try {
            String base64Image = java.util.Base64.getEncoder().encodeToString(file.getBytes());
            String mimeType = file.getContentType() != null ? file.getContentType() : "image/jpeg";
            
            String prompt = "Extract the following details from this receipt image. " +
                "Return ONLY a valid JSON object with no markdown formatting or extra text. " +
                "Keys must be: \"merchant\" (string), \"amount\" (number, no currency symbol), \"date\" (YYYY-MM-DD), \"category\" (string, e.g., Food, Travel, Shopping, Utilities).";

            Map<String, Object> requestBody = Map.of(
                "contents", List.of(
                    Map.of("parts", List.of(
                        Map.of("text", prompt),
                        Map.of("inline_data", Map.of(
                            "mime_type", mimeType,
                            "data", base64Image
                        ))
                    ))
                )
            );
            
            String requestJson = objectMapper.writeValueAsString(requestBody);
            HttpEntity<String> request = new HttpEntity<>(requestJson, headers);
            
            ResponseEntity<Map> response = restTemplate.postForEntity(url, request, Map.class);
            Map<String, Object> body = response.getBody();
            
            if (body != null && body.containsKey("candidates")) {
                List<Map<String, Object>> candidates = (List<Map<String, Object>>) body.get("candidates");
                if (!candidates.isEmpty()) {
                    Map<String, Object> content = (Map<String, Object>) candidates.get(0).get("content");
                    List<Map<String, Object>> parts = (List<Map<String, Object>>) content.get("parts");
                    if (!parts.isEmpty()) {
                        String rawText = (String) parts.get(0).get("text");
                        // Clean up markdown if Gemini returns it
                        if (rawText.startsWith("```json")) {
                            rawText = rawText.substring(7);
                        } else if (rawText.startsWith("```")) {
                            rawText = rawText.substring(3);
                        }
                        if (rawText.endsWith("```")) {
                            rawText = rawText.substring(0, rawText.length() - 3);
                        }
                        return rawText.trim();
                    }
                }
            }
            return "{\"error\": \"Could not parse receipt.\"}";
        } catch (Exception e) {
            System.err.println("Receipt Scan Error: " + e.getMessage());
            return "{\"error\": \"Failed to process image.\"}";
        }
    }
}
