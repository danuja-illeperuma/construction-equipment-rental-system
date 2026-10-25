package com.constructionrental.system.payment.controller;

import com.constructionrental.system.payment.service.PaymentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/payhere")
public class PayHereWebhookController {

    private final PaymentService paymentService;

    public PayHereWebhookController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @PostMapping("/notify")
    public ResponseEntity<String> handlePayHereNotification(@RequestParam Map<String, String> allParams) {
        paymentService.processPayHereNotification(allParams);
        return ResponseEntity.ok("OK");
    }
}
