package com.bnqaccesorios.controller;

import com.bnqaccesorios.model.Producto;
import com.bnqaccesorios.service.ProductoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

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
            @RequestParam("producto") String productoJson,
            @RequestParam("categoriaId") Long categoriaId,
            @RequestParam(value = "imagenes", required = false) List<MultipartFile> imagenes
    ) throws IOException {
        ObjectMapper mapper = new ObjectMapper();
        Producto producto = mapper.readValue(productoJson, Producto.class);
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

    @PatchMapping(value = "/admin/productos/{id}/estado", consumes = {"application/json", "application/x-www-form-urlencoded"})
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Producto> cambiarEstado(@PathVariable Long id, @RequestParam boolean activo) {
        Producto actualizado = productoService.cambiarEstado(id, activo);
        return ResponseEntity.ok(actualizado);
    }

    // Servir imágenes de productos
    @GetMapping("/imagenes_productos/{filename:.+}")
    public ResponseEntity<Resource> getImagen(@PathVariable String filename) throws Exception {
        Path file = Paths.get(System.getProperty("user.dir"), "uploads", "imagenes_productos").resolve(filename);
        if (!Files.exists(file)) {
            return ResponseEntity.notFound().build();
        }
        Resource resource = new UrlResource(file.toUri());
        String contentType = Files.probeContentType(file);
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType != null ? contentType : "application/octet-stream"))
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + filename + "\"")
                .body(resource);
    }

    // PUT para edición inline (application/json)
    @PutMapping(value = "/admin/productos/{id}", consumes = MediaType.APPLICATION_JSON_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> editarProductoInline(@PathVariable Long id, @RequestBody Producto datos) {
        // Validar nombre único
        Producto existente = productoService.buscarPorNombre(datos.getNombre());
        if (existente != null && !existente.getId().equals(id)) {
            return ResponseEntity.status(409).body("Ya existe un producto con ese nombre");
        }
        Producto editado = productoService.editarProductoInline(id, datos);
        return ResponseEntity.ok(editado);
    }
} 