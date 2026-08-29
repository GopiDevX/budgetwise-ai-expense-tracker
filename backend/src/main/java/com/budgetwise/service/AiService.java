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
        if (apiKey == null || apiKey.isBlank() || apiKey.equals("default_placeholder_key")) {
            return "Gemini API key is not configured. Please set GEMINI_API_KEY in backend/.env.";
        }

        String url = apiUrl.contains("?key=") ? apiUrl : apiUrl + "?key=" + apiKey;
        
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
}
