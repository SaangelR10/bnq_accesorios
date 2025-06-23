package com.bnqaccesorios.controller;

import com.bnqaccesorios.service.CheckoutService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/carrito")
@RequiredArgsConstructor
public class CheckoutController {
    private final CheckoutService checkoutService;

    @PostMapping("/checkout")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<CheckoutResponse> checkout(@RequestBody CheckoutService.CheckoutRequest request) {
        String url = checkoutService.generarEnlaceWhatsapp(request);
        return ResponseEntity.ok(new CheckoutResponse(url));
    }

    public record CheckoutResponse(String whatsappUrl) {}
} 