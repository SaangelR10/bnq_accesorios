package com.bnqaccesorios.controller;

import com.bnqaccesorios.model.Producto;
import com.bnqaccesorios.service.ProductoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ProductoController {
    private final ProductoService productoService;

    // Endpoints públicos
    @GetMapping("/productos")
    public ResponseEntity<List<Producto>> listarPublicos() {
        return ResponseEntity.ok(productoService.listarPublicos());
    }

    @GetMapping("/productos/{id}")
    public ResponseEntity<Producto> detallePublico(@PathVariable Long id) {
        return productoService.obtenerPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Endpoints admin
    @GetMapping("/admin/productos")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Producto>> listarAdmin() {
        return ResponseEntity.ok(productoService.listarAdmin());
    }

    @PostMapping(value = "/admin/productos", consumes = {"multipart/form-data"})
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Producto> crearProducto(
            @RequestPart("producto") Producto producto,
            @RequestPart("categoriaId") Long categoriaId,
            @RequestPart(value = "imagenes", required = false) List<MultipartFile> imagenes
    ) throws IOException {
        Producto creado = productoService.crearProducto(producto, categoriaId, imagenes);
        return ResponseEntity.ok(creado);
    }

    @PutMapping(value = "/admin/productos/{id}", consumes = {"multipart/form-data"})
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Producto> editarProducto(
            @PathVariable Long id,
            @RequestPart("producto") Producto producto,
            @RequestPart("categoriaId") Long categoriaId,
            @RequestPart(value = "imagenes", required = false) List<MultipartFile> imagenes
    ) throws IOException {
        Producto editado = productoService.editarProducto(id, producto, categoriaId, imagenes);
        return ResponseEntity.ok(editado);
    }

    @DeleteMapping("/admin/productos/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> eliminarProducto(@PathVariable Long id) {
        productoService.eliminarProducto(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/admin/productos/{id}/estado")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Producto> cambiarEstado(@PathVariable Long id, @RequestParam boolean activo) {
        Producto actualizado = productoService.cambiarEstado(id, activo);
        return ResponseEntity.ok(actualizado);
    }
} 