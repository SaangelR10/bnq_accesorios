package com.bnqaccesorios.service;

import com.bnqaccesorios.model.Categoria;
import com.bnqaccesorios.model.ImagenProducto;
import com.bnqaccesorios.model.Producto;
import com.bnqaccesorios.repository.CategoriaRepository;
import com.bnqaccesorios.repository.ImagenProductoRepository;
import com.bnqaccesorios.repository.ProductoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ProductoService {
    private final ProductoRepository productoRepository;
    private final CategoriaRepository categoriaRepository;
    private final ImagenProductoRepository imagenProductoRepository;
    @Autowired
    private S3Service s3Service;

    private final String uploadDir = "uploads/imagenes_productos/";

    public List<Producto> listarPublicos() {
        return productoRepository.findAllActivosWithCategoria();
    }

    public Optional<Producto> obtenerPorId(Long id) {
        return productoRepository.findByIdWithCategoria(id).filter(Producto::getActivo);
    }

    public List<Producto> listarAdmin() {
        System.out.println("=== SERVICIO: LISTAR ADMIN ===");
        List<Producto> productos = productoRepository.findAllWithCategoria();
        System.out.println("Productos encontrados: " + productos.size());
        
        for (Producto p : productos) {
            System.out.println("Producto: " + p.getNombre() + " - Categoría: " + 
                (p.getCategoria() != null ? p.getCategoria().getNombre() + " (ID: " + p.getCategoria().getId() + ")" : "null"));
        }
        
        return productos;
    }

    @Transactional
    public Producto crearProducto(Producto producto, Long categoriaId, List<MultipartFile> imagenes) throws IOException {
        System.out.println("=== SERVICIO: CREAR PRODUCTO ===");
        System.out.println("Categoría ID recibido: " + categoriaId);
        
        Categoria categoria = categoriaRepository.findById(categoriaId)
                .orElseThrow(() -> new RuntimeException("Categoría no encontrada"));
        System.out.println("Categoría encontrada: " + categoria.getNombre() + " (ID: " + categoria.getId() + ")");
        
        producto.setCategoria(categoria);
        producto.setActivo(true);
        Producto guardado = productoRepository.save(producto);
        System.out.println("Producto guardado con categoría: " + (guardado.getCategoria() != null ? guardado.getCategoria().getNombre() : "null"));
        
        if (imagenes == null) {
            imagenes = new ArrayList<>();
        }
        guardarImagenes(guardado, imagenes);
        return guardado;
    }

    @Transactional
    public Producto editarProducto(Long id, Producto datos, Long categoriaId, List<MultipartFile> nuevasImagenes) throws IOException {
        System.out.println("=== SERVICIO: EDITAR PRODUCTO ===");
        System.out.println("ID del producto: " + id);
        System.out.println("Categoría ID recibido: " + categoriaId);
        
        Producto producto = productoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));
        System.out.println("Producto encontrado: " + producto.getNombre());
        System.out.println("Categoría actual: " + (producto.getCategoria() != null ? producto.getCategoria().getNombre() : "null"));
        
        Categoria categoria = categoriaRepository.findById(categoriaId)
                .orElseThrow(() -> new RuntimeException("Categoría no encontrada"));
        System.out.println("Nueva categoría encontrada: " + categoria.getNombre() + " (ID: " + categoria.getId() + ")");
        
        producto.setNombre(datos.getNombre());
        producto.setPrecio(datos.getPrecio());
        producto.setDescripcion(datos.getDescripcion());
        producto.setMateriales(datos.getMateriales());
        producto.setStock(datos.getStock());
        producto.setCategoria(categoria);
        producto.setActivo(datos.getActivo());
        
        Producto guardado = productoRepository.save(producto);
        System.out.println("Producto actualizado con categoría: " + (guardado.getCategoria() != null ? guardado.getCategoria().getNombre() : "null"));
        
        if (nuevasImagenes == null) {
            nuevasImagenes = new ArrayList<>();
        }
        if (!nuevasImagenes.isEmpty()) {
            guardarImagenes(producto, nuevasImagenes);
        }
        return guardado;
    }

    @Transactional
    public void eliminarProducto(Long id) {
        Producto producto = productoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));
        // Borrar imágenes de S3 antes de eliminar el producto
        List<ImagenProducto> imagenes = imagenProductoRepository.findByProductoId(id);
        for (ImagenProducto img : imagenes) {
            s3Service.deleteFile(img.getUrl());
        }
        productoRepository.delete(producto);
    }

    @Transactional
    public Producto cambiarEstado(Long id, boolean activo) {
        Producto producto = productoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));
        producto.setActivo(activo);
        return productoRepository.save(producto);
    }

    private void guardarImagenes(Producto producto, List<MultipartFile> imagenes) throws IOException {
        if (imagenes == null || imagenes.isEmpty()) return;
        List<ImagenProducto> imagenesGuardadas = new ArrayList<>();
        for (MultipartFile file : imagenes) {
            // Subir a S3 y obtener URL pública
            String url = s3Service.uploadFile(file);
            ImagenProducto img = new ImagenProducto();
            img.setUrl(url);
            img.setProducto(producto);
            imagenProductoRepository.save(img);
            imagenesGuardadas.add(img);
        }
        producto.getImagenes().addAll(imagenesGuardadas);
        productoRepository.save(producto);
    }

    public Producto buscarPorNombre(String nombre) {
        return productoRepository.findByNombre(nombre).orElse(null);
    }

    public Producto editarProductoInline(Long id, Producto datos) {
        Producto producto = productoRepository.findById(id).orElseThrow();
        producto.setNombre(datos.getNombre());
        producto.setDescripcion(datos.getDescripcion());
        producto.setPrecio(datos.getPrecio());
        producto.setStock(datos.getStock());
        // Puedes agregar más campos si lo deseas
        return productoRepository.save(producto);
    }
} 