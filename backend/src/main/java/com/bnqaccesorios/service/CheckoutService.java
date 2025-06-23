package com.bnqaccesorios.service;

import com.bnqaccesorios.model.Producto;
import com.bnqaccesorios.repository.ProductoRepository;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CheckoutService {
    private final ProductoRepository productoRepository;

    @Value("${whatsapp.phone}")
    private String whatsappPhone;
    @Value("${whatsapp.api.url}")
    private String whatsappApiUrl;

    @Transactional(readOnly = true)
    public String generarEnlaceWhatsapp(CheckoutRequest request) {
        StringBuilder mensaje = new StringBuilder();
        mensaje.append("Hola, quiero hacer un pedido:%0A");
        double total = 0;
        for (ProductoCantidad pc : request.getProductos()) {
            Producto producto = productoRepository.findById(pc.getProductoId())
                    .orElseThrow(() -> new RuntimeException("Producto no encontrado: " + pc.getProductoId()));
            if (!producto.getActivo() || producto.getStock() < pc.getCantidad()) {
                throw new RuntimeException("Stock insuficiente o producto inactivo: " + producto.getNombre());
            }
            double subtotal = producto.getPrecio() * pc.getCantidad();
            total += subtotal;
            mensaje.append(String.format("- %s x%d ($%.2f)%s", producto.getNombre(), pc.getCantidad(), subtotal, "%0A"));
        }
        mensaje.append(String.format("Total: $%.2f%%0A", total));
        mensaje.append("Nombre: ").append(request.getNombre()).append("%0A");
        mensaje.append("Dirección: ").append(request.getDireccion()).append("%0A");
        mensaje.append("Teléfono: ").append(request.getTelefono()).append("%0A");
        String mensajeEncoded = mensaje.toString();
        String url = String.format("%s?phone=%s&text=%s", whatsappApiUrl, whatsappPhone, mensajeEncoded);
        return url;
    }

    @Data
    public static class CheckoutRequest {
        private List<ProductoCantidad> productos;
        private String direccion;
        private String telefono;
        private String nombre;
    }

    @Data
    public static class ProductoCantidad {
        private Long productoId;
        private Integer cantidad;
    }
} 