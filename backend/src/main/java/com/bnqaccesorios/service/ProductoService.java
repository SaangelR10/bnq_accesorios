package com.bnqaccesorios.service;

import com.bnqaccesorios.model.Categoria;
import com.bnqaccesorios.model.ImagenProducto;
import com.bnqaccesorios.model.Producto;
import com.bnqaccesorios.repository.CategoriaRepository;
import com.bnqaccesorios.repository.ImagenProductoRepository;
import com.bnqaccesorios.repository.ProductoRepository;
import lombok.RequiredArgsConstructor;
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

    private final String uploadDir = "uploads/imagenes_productos/";

    public List<Producto> listarPublicos() {
        return productoRepository.findAll().stream()
                .filter(Producto::getActivo)
                .toList();
    }

    public Optional<Producto> obtenerPorId(Long id) {
        return productoRepository.findById(id).filter(Producto::getActivo);
    }

    public List<Producto> listarAdmin() {
        return productoRepository.findAll();
    }

    @Transactional
    public Producto crearProducto(Producto producto, Long categoriaId, List<MultipartFile> imagenes) throws IOException {
        Categoria categoria = categoriaRepository.findById(categoriaId)
                .orElseThrow(() -> new RuntimeException("Categoría no encontrada"));
        producto.setCategoria(categoria);
        producto.setActivo(true);
        Producto guardado = productoRepository.save(producto);
        guardarImagenes(guardado, imagenes);
        return guardado;
    }

    @Transactional
    public Producto editarProducto(Long id, Producto datos, Long categoriaId, List<MultipartFile> nuevasImagenes) throws IOException {
        Producto producto = productoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));
        Categoria categoria = categoriaRepository.findById(categoriaId)
                .orElseThrow(() -> new RuntimeException("Categoría no encontrada"));
        producto.setNombre(datos.getNombre());
        producto.setPrecio(datos.getPrecio());
        producto.setDescripcion(datos.getDescripcion());
        producto.setMateriales(datos.getMateriales());
        producto.setStock(datos.getStock());
        producto.setCategoria(categoria);
        producto.setActivo(datos.getActivo());
        productoRepository.save(producto);
        if (nuevasImagenes != null && !nuevasImagenes.isEmpty()) {
            guardarImagenes(producto, nuevasImagenes);
        }
        return producto;
    }

    @Transactional
    public void eliminarProducto(Long id) {
        Producto producto = productoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));
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
        Files.createDirectories(Paths.get(uploadDir));
        List<ImagenProducto> imagenesGuardadas = new ArrayList<>();
        for (MultipartFile file : imagenes) {
            String nombreArchivo = System.currentTimeMillis() + "_" + file.getOriginalFilename();
            Path ruta = Paths.get(uploadDir + nombreArchivo);
            Files.write(ruta, file.getBytes());
            ImagenProducto img = new ImagenProducto();
            img.setUrl(nombreArchivo);
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